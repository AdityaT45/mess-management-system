// src/screens/superadmin/UserManagement.js
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import customerService from '../../api/customerService';
import messService from '../../api/messService';
import SuperAdminLayout from '../../components/superadmin/SuperAdminLayout';

export default function UserManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [messes, setMesses] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [custResp, messResp] = await Promise.all([
        customerService.getAllCustomers(),
        messService.getAllMessList(0, 1000, 'createdAt,desc'),
      ]);

      if (custResp.type === 'success') {
        const list = Array.isArray(custResp.data?.content) ? custResp.data.content : Array.isArray(custResp.data) ? custResp.data : [];
        setCustomers(list);
      } else {
        Alert.alert('Error', custResp.message || 'Failed to load customers');
      }

      if (messResp.type === 'success') {
        const m = messResp.data?.content || messResp.data || [];
        setMesses(Array.isArray(m) ? m : []);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData().finally(() => setRefreshing(false));
  };

  const adminIdToMessName = useMemo(() => {
    const map = new Map();
    (messes || []).forEach((m) => {
      const key = m.adminId || m.id;
      const name = m.messName || m.ownerName || m.name || '—';
      if (key) map.set(key, name);
    });
    return map;
  }, [messes]);

  // Filter to ROLE_CUSTOMER
  const roleFilteredCustomers = useMemo(() => {
    const list = Array.isArray(customers) ? customers : [];
    return list.filter((c) => !c.role || c.role === 'ROLE_CUSTOMER');
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return roleFilteredCustomers;
    return roleFilteredCustomers.filter((c) => {
      const name = (c.name || '').toLowerCase();
      const email = (c.email || '').toLowerCase();
      const phone = (c.phoneNumber || '').toLowerCase();
      const mess = (adminIdToMessName.get(c.adminId) || '').toLowerCase();
      return name.includes(q) || email.includes(q) || phone.includes(q) || mess.includes(q);
    });
  }, [roleFilteredCustomers, searchQuery, adminIdToMessName]);

  const renderItem = ({ item }) => {
    const messName = adminIdToMessName.get(item.adminId) || 'Unknown Mess';
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={styles.name}>{item.name || '—'}</Text>
            <Text style={styles.email}>{item.email || '—'}</Text>
            <Text style={styles.phone}>{item.phoneNumber || '—'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: item.status ? '#48BB78' : '#F56565' }]}>
            <Text style={styles.statusText}>{item.status ? 'Active' : 'Inactive'}</Text>
          </View>
        </View>
        <Text style={styles.messText}>Mess: {messName}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.plan}>{item.planeType || '—'}</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => {}}>
              <Text style={styles.secondaryButtonText}>View</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SuperAdminLayout
      title="Customers"
      backgroundColor="#8B5CF6"
      textColor="#FFFFFF"
      logoIconName="people"
      logoIconColor="#8B5CF6"
      showNotifications={false}
      showProfile={false}
    >
      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#718096" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search customers by name, email, phone, or mess"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          <TouchableOpacity onPress={handleRefresh}>
            <Ionicons name="refresh" size={20} color="#8B5CF6" />
          </TouchableOpacity>
        </View>

        {/* Customers List */}
        <FlatList
          data={filteredCustomers}
          keyExtractor={(item, idx) => item.id || String(idx)}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#8B5CF6']} tintColor="#8B5CF6" />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={64} color="#CBD5E0" />
              <Text style={styles.emptyTitle}>{isLoading ? 'Loading customers...' : 'No customers found'}</Text>
              <Text style={styles.emptySubtitle}>Try adjusting your search</Text>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SuperAdminLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 16,
  },
  searchInput: { flex: 1, fontSize: 16, color: '#2D3748' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  name: { fontSize: 16, fontWeight: '700', color: '#111827' },
  email: { fontSize: 12, color: '#718096', marginTop: 2 },
  phone: { fontSize: 12, color: '#718096', marginTop: 2 },
  messText: { fontSize: 12, color: '#4299E1', marginBottom: 8, fontWeight: '600' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '600', color: '#FFFFFF' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  plan: { fontSize: 12, color: '#4299E1', fontWeight: '600' },
  secondaryButton: { backgroundColor: '#ffd351', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  secondaryButtonText: { color: '#111827', fontSize: 12, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#718096', marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#A0AEC0', textAlign: 'center' },
});



