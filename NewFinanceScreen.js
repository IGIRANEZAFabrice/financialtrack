import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FontAwesome5 } from '@expo/vector-icons';
import { addFinance, getStatuses, getFinanceById, updateFinance } from './database';

const NewFinanceScreen = ({ user, financeId, onCancel, onSaved }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [moneyProvided, setMoneyProvided] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [statusId, setStatusId] = useState(1);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateObj, setDateObj] = useState(new Date());

  useEffect(() => {
    const load = async () => {
      try {
        const s = await getStatuses();
        setStatuses(s || []);
        if (s && s.length && !financeId) setStatusId(s[0].id);
        if (financeId) {
          const f = await getFinanceById(financeId);
          if (f) {
            setName(f.name || '');
            setPhone(f.phone || '');
            setEmail(f.email || '');
            setMoneyProvided(String(f.money_provided ?? ''));
          setDueDate(f.due_date || '');
          if (f.due_date) {
            const parts = f.due_date.split('-');
            if (parts.length === 3) {
              const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
              if (!isNaN(d.getTime())) setDateObj(d);
            }
          }
            setNotes(f.notes || '');
            setStatusId(f.status_id || (s && s[0] ? s[0].id : 1));
          }
        }
      } catch (e) {
        setStatuses([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [financeId]);

  const handleSave = async () => {
    if (!name || !moneyProvided) {
      Alert.alert('Missing info', 'Name and money provided are required');
      return;
    }
    const amount = parseFloat(moneyProvided);
    if (Number.isNaN(amount)) {
      Alert.alert('Invalid amount', 'Money provided must be a number');
      return;
    }
    setSaving(true);
    try {
      if (financeId) {
        await updateFinance(financeId, {
          name,
          phone,
          email,
          money_provided: amount,
          money_returned: undefined,
          due_date: dueDate,
          notes,
          status_id: statusId,
        });
        Alert.alert('Updated', 'Record updated successfully');
      } else {
        await addFinance(user.id, {
          name,
          phone,
          email,
          money_provided: amount,
          money_returned: 0,
          due_date: dueDate,
          notes,
          status_id: statusId,
        });
        Alert.alert('Saved', 'Record added successfully');
      }
      onSaved && onSaved();
    } catch (e) {
      Alert.alert('Error', 'Failed to save record');
    } finally {
      setSaving(false);
    }
  };

  const paidStatusId = useMemo(() => {
    const p = statuses.find(s => s.status_name === 'Paid');
    return p ? p.id : null;
  }, [statuses]);

  const markPaid = async () => {
    if (!financeId || !paidStatusId) return;
    try {
      setSaving(true);
      await updateFinance(financeId, {
        name,
        phone,
        email,
        money_provided: parseFloat(moneyProvided) || 0,
        money_returned: parseFloat(moneyProvided) || 0,
        due_date: dueDate,
        notes,
        status_id: paidStatusId,
      });
      Alert.alert('Marked Paid', 'Record marked as Paid');
      onSaved && onSaved();
    } catch (e) {
      Alert.alert('Error', 'Failed to mark as Paid');
    } finally {
      setSaving(false);
    }
  };

  const StatusPicker = () => (
    <View style={styles.pickerRow}>
      {statuses.map(s => (
        <TouchableOpacity
          key={s.id}
          style={[styles.pill, statusId === s.id && styles.pillActive, { borderColor: s.color || '#6366f1' }]}
          onPress={() => setStatusId(s.id)}
        >
          <Text style={[styles.pillText, statusId === s.id && { color: '#fff' }]}>{s.status_name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading statuses...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <FontAwesome5 name="plus" size={20} color="#6366f1" />
        </View>
        <Text style={styles.headerTitle}>{financeId ? 'Edit Record' : 'Add New Record'}</Text>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <FontAwesome5 name="times" size={18} color="#ef4444" />
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <FontAwesome5 name="user" size={16} color="#6366f1" style={styles.inputIcon} />
          <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
        </View>
        <View style={styles.inputGroup}>
          <FontAwesome5 name="phone" size={16} color="#6366f1" style={styles.inputIcon} />
          <TextInput style={styles.input} placeholder="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        </View>
        <View style={styles.inputGroup}>
          <FontAwesome5 name="envelope" size={16} color="#6366f1" style={styles.inputIcon} />
          <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        </View>
        <View style={styles.inputGroup}>
          <FontAwesome5 name="money-bill" size={16} color="#6366f1" style={styles.inputIcon} />
          <TextInput style={styles.input} placeholder="Money Provided" value={moneyProvided} onChangeText={setMoneyProvided} keyboardType="decimal-pad" />
        </View>
        <TouchableOpacity style={styles.inputGroup} onPress={() => setShowDatePicker(true)}>
          <FontAwesome5 name="calendar" size={16} color="#6366f1" style={styles.inputIcon} />
          <Text style={styles.input}>{dueDate ? dueDate : 'Select Due Date'}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={dateObj}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setDateObj(selectedDate);
                const y = selectedDate.getFullYear();
                const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
                const d = String(selectedDate.getDate()).padStart(2, '0');
                setDueDate(`${y}-${m}-${d}`);
              }
            }}
          />
        )}
        <View style={styles.inputGroup}>
          <FontAwesome5 name="sticky-note" size={16} color="#6366f1" style={styles.inputIcon} />
          <TextInput style={styles.input} placeholder="Notes" value={notes} onChangeText={setNotes} multiline />
        </View>

        <Text style={styles.sectionTitle}>Status</Text>
        <StatusPicker />

        <TouchableOpacity style={[styles.saveBtn, saving && styles.saveDisabled]} onPress={handleSave} disabled={saving}>
          <FontAwesome5 name="save" size={16} color="#fff" style={styles.saveIcon} />
          <Text style={styles.saveText}>{saving ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
        {financeId && paidStatusId && (
          <TouchableOpacity style={[styles.saveBtn, styles.paidBtn]} onPress={markPaid} disabled={saving}>
            <FontAwesome5 name="check-circle" size={16} color="#fff" style={styles.saveIcon} />
            <Text style={styles.saveText}>Mark as Paid</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#fecaca',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cancelText: {
    marginLeft: 6,
    color: '#dc2626',
    fontWeight: '600',
    fontSize: 13,
  },
  form: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  inputIcon: {
    marginRight: 12,
    opacity: 0.7,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 12,
    marginTop: 8,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  pickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  pill: {
    borderWidth: 2,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pillActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    transform: [{ scale: 1.05 }],
  },
  pillText: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    borderRadius: 14,
    height: 54,
    marginTop: 12,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  paidBtn: {
    backgroundColor: '#10b981',
    shadowColor: '#10b981',
  },
  saveDisabled: {
    backgroundColor: '#cbd5e1',
    shadowOpacity: 0.1,
  },
  saveIcon: {
    marginRight: 10,
  },
  saveText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 15,
    fontWeight: '500',
  },
});

export default NewFinanceScreen;
