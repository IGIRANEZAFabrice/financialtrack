import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator, Text, Alert, TouchableOpacity, Platform } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './LoginScreen';
import HomeScreen from './HomeScreen';
import NewFinanceScreen from './NewFinanceScreen';
import SettingsScreen from './SettingsScreen';
import { initDatabase, getAllFinances } from './database';

const TASK_NAME = 'dailyNotificationTask';

function formatAmount(n) {
  try {
    return Number(n).toLocaleString();
  } catch {
    return String(n);
  }
}

async function computeDueMessages() {
  try {
    const adminIdStr = await AsyncStorage.getItem('currentAdminId');
    const adminId = adminIdStr ? Number(adminIdStr) : null;
    if (!adminId) return [];
    const rows = await getAllFinances(adminId);
    const today = new Date();
    today.setHours(0,0,0,0);
    const msPerDay = 24 * 60 * 60 * 1000;
    const messages = [];
    for (const r of rows) {
      if (!r.due_date) continue;
      const parts = String(r.due_date).split('-');
      if (parts.length !== 3) continue;
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      d.setHours(0,0,0,0);
      const delta = Math.round((d.getTime() - today.getTime()) / msPerDay);
      const isPaid = String(r.status_name).toLowerCase() === 'paid';
      const outstanding = Math.max(0, (Number(r.money_provided) || 0) - (Number(r.money_returned) || 0));
      const amountStr = formatAmount(outstanding);
      if (isPaid || outstanding <= 0) continue;
      if (delta === 1) {
        messages.push(`${r.name} will pay tomorrow the ${amountStr} they owe you`);
      } else if (delta === 0) {
        messages.push(`${r.name} is due today to pay ${amountStr}`);
      } else if (delta === 2) {
        messages.push(`${r.name} will pay in 2 days the ${amountStr}`);
      } else if (delta < 0) {
        const daysLate = Math.abs(delta);
        messages.push(`${r.name} exceeded the due date by ${daysLate} day${daysLate>1?'s':''}, owes ${amountStr}`);
      }
    }
    return messages.slice(0, 8);
  } catch {
    return [];
  }
}

TaskManager.defineTask(TASK_NAME, async () => {
  try {
    const messages = await computeDueMessages();
    for (const msg of messages) {
      await Notifications.scheduleNotificationAsync({
        content: { title: 'Loan reminder', body: msg },
        trigger: null,
      });
    }
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [screen, setScreen] = useState('home');
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    // Initialize database on app start
    const setupDatabase = async () => {
      try {
        await initDatabase();
        console.log('Database ready');
      } catch (error) {
        console.error('Failed to initialize database:', error);
        Alert.alert('Database Error', 'Failed to initialize database.');
      } finally {
        setIsLoading(false);
      }
    };

    setupDatabase();
  }, []);

  useEffect(() => {
    const setupNotifications = async () => {
      try {
        Notifications.setNotificationHandler({
          handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: false, shouldSetBadge: true }),
        });
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'Default',
            importance: Notifications.AndroidImportance.DEFAULT,
          });
        }
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') return;

        const isRegistered = await TaskManager.isTaskRegisteredAsync(TASK_NAME);
        if (!isRegistered) {
          await BackgroundFetch.registerTaskAsync(TASK_NAME, {
            minimumInterval: 12 * 60 * 60,
            stopOnTerminate: false,
            startOnBoot: true,
          });
        }

        const nowMessages = await computeDueMessages();
        for (const msg of nowMessages) {
          await Notifications.scheduleNotificationAsync({
            content: { title: 'Loan reminder', body: msg },
            trigger: null,
          });
        }
      } catch {}
    };

    setupNotifications();
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    AsyncStorage.setItem('currentAdminId', String(user.id)).catch(() => {});
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setScreen('home');
    setSelectedId(null);
    AsyncStorage.removeItem('currentAdminId').catch(() => {});
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Initializing database...</Text>
      </View>
    );
  }

  if (!currentUser) {
    return (
      <>
        <StatusBar style="dark" />
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      </>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {screen === 'home' ? (
        <HomeScreen
          user={currentUser}
          onLogout={handleLogout}
          onAddNew={(id) => {
            if (id) {
              setSelectedId(id);
              setScreen('edit');
            } else {
              setSelectedId(null);
              setScreen('new');
            }
          }}
        />
      ) : screen === 'new' ? (
        <NewFinanceScreen
          user={currentUser}
          onCancel={() => setScreen('home')}
          onSaved={() => setScreen('home')}
        />
      ) : screen === 'edit' ? (
        <NewFinanceScreen
          user={currentUser}
          financeId={selectedId}
          onCancel={() => { setSelectedId(null); setScreen('home'); }}
          onSaved={() => { setSelectedId(null); setScreen('home'); }}
        />
      ) : (
        <SettingsScreen
          user={currentUser}
          onSaved={async () => {
            setScreen('home');
          }}
        />
      )}

      <View style={styles.bottomNav}>
        <TouchableOpacity style={[styles.navItem, screen === 'home' && styles.navItemActive]} onPress={() => setScreen('home')}>
          <FontAwesome5 name="home" size={20} color={screen === 'home' ? '#fff' : '#334155'} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, screen === 'new' && styles.navItemActive]} onPress={() => { setSelectedId(null); setScreen('new'); }}>
          <FontAwesome5 name="plus" size={20} color={screen === 'new' ? '#fff' : '#334155'} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, screen === 'settings' && styles.navItemActive]} onPress={() => setScreen('settings')}>
          <FontAwesome5 name="cog" size={20} color={screen === 'settings' ? '#fff' : '#334155'} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6366f1',
    paddingBottom: 80,
  },
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  navItemActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subText: {
    fontSize: 16,
    color: '#e0e7ff',
  },
});
