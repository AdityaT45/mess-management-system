// src/screens/admin/CustomerManagement.js
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Alert,
    Dimensions,
    FlatList,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import customerService from '../../api/customerService';

const { width } = Dimensions.get('window');

export default function CustomerManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [formErrors, setFormErrors] = useState({});

  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  const nameRef = useRef();
  const emailRef = useRef();
  const phoneRef = useRef();

  const [newCustomer, setNewCustomer] = useState({
    email: '',
    name: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    zip: '',
    notes: '',
    planeType: 'Monthly Lunch',
    startDate: '',
    endDate: '',
    status: true,
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setIsLoading(true);
    const resp = await customerService.getAllCustomers();
    if (resp.type === 'success') {
      const list = Array.isArray(resp.data?.content) ? resp.data.content : Array.isArray(resp.data) ? resp.data : [];
      setCustomers(list);
    } else {
      Alert.alert('Error', resp.message || 'Failed to load customers');
    }
    setIsLoading(false);
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadCustomers().finally(() => setRefreshing(false));
  }, []);

  const filteredCustomers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return (customers || []).filter(c => {
      const name = (c.name || '').toLowerCase();
      const email = (c.email || '').toLowerCase();
      const phone = (c.phoneNumber || '').toLowerCase();
      const city = (c.city || '').toLowerCase();
      return !q || name.includes(q) || email.includes(q) || phone.includes(q) || city.includes(q);
    });
  }, [customers, searchQuery]);

  const validateForm = () => {
    const errors = {};
    if (!newCustomer.name.trim()) errors.name = 'Name is required';
    if (!newCustomer.email.trim()) errors.email = 'Email is required';
    if (!newCustomer.phoneNumber.trim()) errors.phoneNumber = 'Phone is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const formatDateLocal = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${y}-${m}-${day}T${hh}:${mm}:${ss}`;
  };

  const handleAddCustomer = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    const payload = {
      ...newCustomer,
      startDate: formatDateLocal(newCustomer.startDate),
      endDate: formatDateLocal(newCustomer.endDate),
    };
    const resp = await customerService.createCustomer(payload);
    if (resp.type === 'success') {
      setAddModalVisible(false);
      setNewCustomer({
        email: '', name: '', phoneNumber: '', address: '', city: '', state: '', country: 'India', zip: '', notes: '', planeType: 'Monthly Lunch', startDate: '', endDate: '', status: true,
      });
      await loadCustomers();
      Alert.alert('Success', 'Customer added successfully');
    } else {
      Alert.alert('Error', resp.message || 'Failed to add customer');
    }
    setIsLoading(false);
  };

  const handleDeleteCustomer = async (id) => {
    Alert.alert('Delete Customer', 'Are you sure you want to delete this customer?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          const resp = await customerService.deleteCustomer(id);
          if (resp.type === 'success') {
            await loadCustomers();
            Alert.alert('Deleted', 'Customer deleted');
          } else {
            Alert.alert('Error', resp.message || 'Failed to delete');
          }
        } }
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.pageHeader}>
        <View style={styles.pageTitleContainer}>
          <Text style={styles.pageTitle}>Customers</Text>
          <Text style={styles.pageSubtitle}>Manage all customers in the system</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setAddModalVisible(true)}>
          <Ionicons name="person-add" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add Customer</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#718096" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, email, phone, city"
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        <TouchableOpacity onPress={handleRefresh}>
          <Ionicons name="refresh" size={20} color="#8B5CF6" />
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={filteredCustomers}
        keyExtractor={(item, idx) => item.id || String(idx)}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#8B5CF6']}
            tintColor="#8B5CF6"
          />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={styles.customerName}>{item.name || '—'}</Text>
                <Text style={styles.customerEmail}>{item.email || '—'}</Text>
                <Text style={styles.customerPhone}>{item.phoneNumber || '—'}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: item.status ? '#48BB78' : '#F56565' }]}>
                <Text style={styles.statusText}>{item.status ? 'Active' : 'Inactive'}</Text>
              </View>
            </View>
            <Text style={styles.customerMeta}>{[item.city, item.state].filter(Boolean).join(', ')}</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.customerPlan}>{item.planeType || '—'}</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity style={styles.secondaryButton} onPress={() => { setSelectedCustomer(item); setEditModalVisible(true); }}>
                  <Text style={styles.secondaryButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteCustomer(item.id)}>
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#CBD5E0" />
            <Text style={styles.emptyTitle}>No customers found</Text>
            <Text style={styles.emptySubtitle}>{isLoading ? 'Loading customers...' : 'Add your first customer'}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Add Customer Modal */}
      <Modal visible={addModalVisible} animationType="slide" transparent={true} onRequestClose={() => setAddModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Customer</Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                <Ionicons name="close" size={24} color="#718096" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
              <View style={styles.formSection}>
                <Text style={styles.inputLabel}>Name *</Text>
                <TextInput ref={nameRef} style={[styles.input, formErrors.name && styles.inputError]} placeholder="Full name" value={newCustomer.name} onChangeText={(t) => { setNewCustomer({ ...newCustomer, name: t }); if (formErrors.name) setFormErrors({ ...formErrors, name: '' }); }} />
                {formErrors.name ? <Text style={styles.errorText}>{formErrors.name}</Text> : null}
              </View>
              <View style={styles.formSection}>
                <Text style={styles.inputLabel}>Email *</Text>
                <TextInput ref={emailRef} style={[styles.input, formErrors.email && styles.inputError]} placeholder="Email address" autoCapitalize="none" keyboardType="email-address" value={newCustomer.email} onChangeText={(t) => { setNewCustomer({ ...newCustomer, email: t }); if (formErrors.email) setFormErrors({ ...formErrors, email: '' }); }} />
                {formErrors.email ? <Text style={styles.errorText}>{formErrors.email}</Text> : null}
              </View>
              <View style={styles.formSection}>
                <Text style={styles.inputLabel}>Phone *</Text>
                <TextInput ref={phoneRef} style={[styles.input, formErrors.phoneNumber && styles.inputError]} placeholder="Phone number" keyboardType="phone-pad" value={newCustomer.phoneNumber} onChangeText={(t) => { setNewCustomer({ ...newCustomer, phoneNumber: t }); if (formErrors.phoneNumber) setFormErrors({ ...formErrors, phoneNumber: '' }); }} />
                {formErrors.phoneNumber ? <Text style={styles.errorText}>{formErrors.phoneNumber}</Text> : null}
              </View>
              <View style={styles.formSection}>
                <Text style={styles.inputLabel}>Address</Text>
                <TextInput style={[styles.input, styles.textArea]} placeholder="Address" multiline numberOfLines={3} value={newCustomer.address} onChangeText={(t) => setNewCustomer({ ...newCustomer, address: t })} />
              </View>
              <View style={styles.row}> 
                <View style={[styles.formSection, { flex: 1, marginRight: 8 }]}> 
                  <Text style={styles.inputLabel}>City</Text>
                  <TextInput style={styles.input} placeholder="City" value={newCustomer.city} onChangeText={(t) => setNewCustomer({ ...newCustomer, city: t })} />
                </View>
                <View style={[styles.formSection, { flex: 1, marginLeft: 8 }]}> 
                  <Text style={styles.inputLabel}>State</Text>
                  <TextInput style={styles.input} placeholder="State" value={newCustomer.state} onChangeText={(t) => setNewCustomer({ ...newCustomer, state: t })} />
                </View>
              </View>
              <View style={styles.row}>
                <View style={[styles.formSection, { flex: 1, marginRight: 8 }]}> 
                  <Text style={styles.inputLabel}>Country</Text>
                  <TextInput style={styles.input} placeholder="Country" value={newCustomer.country} onChangeText={(t) => setNewCustomer({ ...newCustomer, country: t })} />
                </View>
                <View style={[styles.formSection, { flex: 1, marginLeft: 8 }]}> 
                  <Text style={styles.inputLabel}>ZIP</Text>
                  <TextInput style={styles.input} placeholder="ZIP" keyboardType="numeric" value={newCustomer.zip} onChangeText={(t) => setNewCustomer({ ...newCustomer, zip: t })} />
                </View>
              </View>
              <View style={styles.formSection}>
                <Text style={styles.inputLabel}>Plan Type</Text>
                <View style={styles.pickerContainer}>
                  {['Monthly Lunch','Monthly Dinner','Monthly Both','Daily Lunch','Daily Dinner','Daily Both'].map((type) => (
                    <TouchableOpacity key={type} style={[styles.pickerOption, newCustomer.planeType === type && styles.pickerOptionSelected]} onPress={() => setNewCustomer({ ...newCustomer, planeType: type })}>
                      <Text style={[styles.pickerOptionText, newCustomer.planeType === type && styles.pickerOptionTextSelected]}>{type}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.row}>
                <View style={[styles.formSection, { flex: 1, marginRight: 8 }]}> 
                  <Text style={styles.inputLabel}>Start Date (YYYY-MM-DDTHH:mm:ss)</Text>
                  <TextInput style={styles.input} placeholder="2025-10-01T12:00:00" value={newCustomer.startDate} onChangeText={(t) => setNewCustomer({ ...newCustomer, startDate: t })} />
                </View>
                <View style={[styles.formSection, { flex: 1, marginLeft: 8 }]}> 
                  <Text style={styles.inputLabel}>End Date (YYYY-MM-DDTHH:mm:ss)</Text>
                  <TextInput style={styles.input} placeholder="2025-10-31T12:00:00" value={newCustomer.endDate} onChangeText={(t) => setNewCustomer({ ...newCustomer, endDate: t })} />
                </View>
              </View>
              <View style={styles.formSection}>
                <Text style={styles.inputLabel}>Notes</Text>
                <TextInput style={[styles.input, styles.textArea]} placeholder="Notes" multiline numberOfLines={3} value={newCustomer.notes} onChangeText={(t) => setNewCustomer({ ...newCustomer, notes: t })} />
              </View>
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setAddModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButton} onPress={handleAddCustomer}>
                <Text style={styles.primaryButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Customer Modal (basic fields) */}
      <Modal visible={editModalVisible} animationType="slide" transparent={true} onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Customer</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color="#718096" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
              <View style={styles.formSection}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput style={styles.input} value={selectedCustomer?.name || ''} onChangeText={(t) => setSelectedCustomer({ ...selectedCustomer, name: t })} />
              </View>
              <View style={styles.formSection}>
                <Text style={styles.inputLabel}>Phone</Text>
                <TextInput style={styles.input} keyboardType="phone-pad" value={selectedCustomer?.phoneNumber || ''} onChangeText={(t) => setSelectedCustomer({ ...selectedCustomer, phoneNumber: t })} />
              </View>
              <View style={styles.formSection}>
                <Text style={styles.inputLabel}>Status</Text>
                <View style={styles.switchRow}>
                  <Text style={styles.switchText}>{selectedCustomer?.status ? 'Active' : 'Inactive'}</Text>
                  <Switch value={!!selectedCustomer?.status} onValueChange={(v) => setSelectedCustomer({ ...selectedCustomer, status: v })} trackColor={{ false: '#E2E8F0', true: '#8B5CF6' }} thumbColor={'#FFFFFF'} />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButton} onPress={async () => {
                if (!selectedCustomer?.id) { Alert.alert('Error', 'Invalid customer'); return; }
                const payload = { ...selectedCustomer };
                const resp = await customerService.updateCustomer(selectedCustomer.id, payload);
                if (resp.type === 'success') {
                  setEditModalVisible(false);
                  await loadCustomers();
                  Alert.alert('Success', 'Customer updated');
                } else {
                  Alert.alert('Error', resp.message || 'Failed to update');
                }
              }}>
                <Text style={styles.primaryButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pageTitleContainer: { flex: 1 },
  pageTitle: { fontSize: 24, fontWeight: '700', color: '#2D3748' },
  pageSubtitle: { fontSize: 14, color: '#718096', marginTop: 4 },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
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
  customerName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  customerEmail: { fontSize: 12, color: '#718096', marginTop: 2 },
  customerPhone: { fontSize: 12, color: '#718096', marginTop: 2 },
  customerMeta: { fontSize: 12, color: '#718096', marginBottom: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '600', color: '#FFFFFF' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  customerPlan: { fontSize: 12, color: '#4299E1', fontWeight: '600' },
  deleteButton: { backgroundColor: '#FEE2E2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  deleteButtonText: { color: '#B91C1C', fontSize: 12, fontWeight: '700' },
  secondaryButton: { backgroundColor: '#ffd351', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  secondaryButtonText: { color: '#111827', fontSize: 12, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#718096', marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#A0AEC0', textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { backgroundColor: '#FFFFFF', borderRadius: 20, width: '95%', maxHeight: '90%', padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '600', color: '#2D3748' },
  formContainer: { maxHeight: 420 },
  formSection: { marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '500', color: '#4A5568', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: '#2D3748' },
  inputError: { borderColor: '#F56565', borderWidth: 1 },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row' },
  pickerContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pickerOption: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFFFFF' },
  pickerOptionSelected: { backgroundColor: '#8B5CF6', borderColor: '#8B5CF6' },
  pickerOptionText: { fontSize: 12, color: '#4A5568' },
  pickerOptionTextSelected: { color: '#FFFFFF' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 16 },
  cancelButton: { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFFFFF', alignItems: 'center' },
  cancelButtonText: { color: '#718096', fontSize: 16, fontWeight: '500' },
  primaryButton: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: '#FF6B35', alignItems: 'center' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F3F4F6', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  switchText: { fontSize: 16, color: '#4A5568' },
});


