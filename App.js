import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator, Text, Alert } from 'react-native';
import LoginScreen from './LoginScreen';
import { initDatabase } from './database';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Initialize database on app start
    const setupDatabase = async () => {
      try {
        await initDatabase();
        console.log('Database ready');
      } catch (error) {
        console.error('Failed to initialize database:', error);
      } finally {
        setIsLoading(false);
      }
    };

    setupDatabase();
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
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

  // Main app content after login
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.mainContent}>
        <Text style={styles.welcomeText}>Welcome, {currentUser.full_name}!</Text>
        <Text style={styles.subText}>Your Financial Tracker is ready</Text>
        {/* Add your main app screens here */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6366f1',
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