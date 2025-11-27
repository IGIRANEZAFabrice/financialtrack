import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Platform, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { getAllFinances } from './database';

const TABS = [
  { key: 'All', icon: 'list' },
  { key: 'Pending', icon: 'clock' },
  { key: 'Partially Paid', icon: 'adjust' },
  { key: 'Paid', icon: 'check-circle' },
  { key: 'Overdue', icon: 'exclamation-triangle' },
];

const HomeScreen = ({ user, onLogout, onAddNew }) => {
  const [activeTab, setActiveTab] = useState(TABS[0].key);
  const [loading, setLoading] = useState(true);
  const [finances, setFinances] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const rows = await getAllFinances(user.id);
        setFinances(rows || []);
      } catch (e) {
        setFinances([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user.id]);

  const filtered = useMemo(() => {
    if (activeTab === 'All') return finances;
    return finances.filter(f => f.status_name === activeTab);
  }, [finances, activeTab]);

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => onAddNew && onAddNew(item.id)}>
      <View style={styles.listItem}>
        <View style={[styles.statusDot, { backgroundColor: item.color || '#6366f1' }]} />
        <View style={styles.rowMain}>
          <View style={styles.rowTop}>
            <Text style={styles.rowTitle}>{item.name}</Text>
            <View style={[styles.badge, { backgroundColor: (item.color || '#6366f1') + '22' }]}> 
              <Text style={[styles.badgeText, { color: item.color || '#6366f1' }]}>{item.status_name}</Text>
            </View>
          </View>
          <View style={styles.rowBottom}>
            <View style={styles.rowInline}>
              <FontAwesome5 name="money-bill-wave" size={14} color="#64748b" style={styles.rowIcon} />
              <Text style={styles.rowText}>Provided: {item.money_provided}</Text>
            </View>
            <View style={styles.rowInline}>
              <FontAwesome5 name="undo" size={14} color="#64748b" style={styles.rowIcon} />
              <Text style={styles.rowText}>Returned: {item.money_returned}</Text>
            </View>
            {item.due_date ? (
              <View style={styles.rowInline}>
                <FontAwesome5 name="calendar" size={14} color="#64748b" style={styles.rowIcon} />
                <Text style={styles.rowText}>{item.due_date}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}> 
      <View style={styles.header}> 
        <View style={styles.iconWrap}> 
          <FontAwesome5 name="wallet" size={28} color="#fff" />
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIconBtn} onPress={() => onAddNew && onAddNew()}> 
            <FontAwesome5 name="plus" size={18} color="#059669" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconBtn} onPress={onLogout}> 
            <FontAwesome5 name="sign-out-alt" size={18} color="#dc2626" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs} contentContainerStyle={styles.tabsContent}> 
        {TABS.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, activeTab === t.key && styles.tabActive]}
            onPress={() => setActiveTab(t.key)}
          >
            <FontAwesome5 name={t.icon} size={14} color={activeTab === t.key ? '#fff' : '#64748b'} style={styles.tabIcon} />
            <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>{t.key}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.loading}> 
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Loading records...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.empty}> 
          <FontAwesome5 name="inbox" size={20} color="#94a3b8" />
          <Text style={styles.emptyText}>No records in {activeTab}</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  headerRight: {
    flexDirection: 'row',
    marginLeft: 'auto',
  },
  headerIconBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    marginLeft: 10,
  },
  tabs: {
    maxHeight: 56,
    marginTop: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  tabsContent: {
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 6,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  tabActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  tabIcon: {
    marginRight: 6,
  },
  tabText: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  tabTextActive: {
    color: '#ffffff',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 15,
    fontWeight: '500',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginHorizontal: 20,
    marginVertical: 20,
    padding: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyText: {
    marginTop: 12,
    color: '#94a3b8',
    fontSize: 15,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 20,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  rowMain: {
    flex: 1,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  rowTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.3,
    flex: 1,
    marginRight: 10,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  rowBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  rowInline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginTop: 4,
  },
  rowIcon: {
    marginRight: 7,
    width: 16,
    opacity: 0.7,
  },
  rowText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default HomeScreen;
