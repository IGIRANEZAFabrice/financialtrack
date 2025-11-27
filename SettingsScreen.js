import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { getAdminById, updateAdmin } from './database';

const SettingsScreen = ({ user, onSaved }) => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const admin = await getAdminById(user.id);
        if (admin) {
          setFullName(admin.full_name || '');
          setUsername(admin.username || '');
          setEmail(admin.email || '');
        }
      } catch (e) {
        Alert.alert('Error', 'Failed to load user');
      }
    };
    load();
  }, [user.id]);

  const handleSave = async () => {
    if (!fullName || !username || !email) {
      Alert.alert('Missing info', 'Full name, username and email are required');
      return;
    }
    setSaving(true);
    try {
      const admin = await getAdminById(user.id);
      const newPassword = password ? password : admin.password;
      await updateAdmin(user.id, {
        username,
        full_name: fullName,
        email,
        password: newPassword,
      });
      Alert.alert('Saved', 'Profile updated');
      onSaved && onSaved();
    } catch (e) {
      const msg = e?.message || '';
      if (msg.includes('UNIQUE')) {
        Alert.alert('Error', 'Username or email already exists');
      } else {
        Alert.alert('Error', 'Failed to update profile');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <FontAwesome5 name="cog" size={20} color="#6366f1" />
        </View>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <FontAwesome5 name="user" size={16} color="#6366f1" style={styles.inputIcon} />
          <TextInput style={styles.input} placeholder="Full Name" value={fullName} onChangeText={setFullName} />
        </View>
        <View style={styles.inputGroup}>
          <FontAwesome5 name="user-circle" size={16} color="#6366f1" style={styles.inputIcon} />
          <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} autoCapitalize="none" />
        </View>
        <View style={styles.inputGroup}>
          <FontAwesome5 name="envelope" size={16} color="#6366f1" style={styles.inputIcon} />
          <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        </View>
        <View style={styles.inputGroup}>
          <FontAwesome5 name="lock" size={16} color="#6366f1" style={styles.inputIcon} />
          <TextInput style={styles.input} placeholder="New Password (optional)" value={password} onChangeText={setPassword} autoCapitalize="none" secureTextEntry />
        </View>

        <TouchableOpacity style={[styles.saveBtn, saving && styles.saveDisabled]} onPress={handleSave} disabled={saving}>
          <FontAwesome5 name="save" size={16} color="#fff" style={styles.saveIcon} />
          <Text style={styles.saveText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#1e293b',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    borderRadius: 12,
    height: 48,
    marginTop: 8,
  },
  saveDisabled: {
    backgroundColor: '#94a3b8',
  },
  saveIcon: {
    marginRight: 8,
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettingsScreen;
