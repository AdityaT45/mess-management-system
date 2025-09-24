// src/screens/admin/CustomerManagement.js
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Linking,
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
import { ADMIN_COLORS } from '../../config/colors';
import CustomerCard from './components/CustomerCard';
import SkeletonCustomerCard from './components/SkeletonCustomerCard';
import CreateCustomerModal from './CreateCustomerModal';

const { width } = Dimensions.get('window');

// Minimal India states -> cities mapping for dropdowns
const INDIA_STATES_CITIES = {
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane'],
  'Delhi': ['New Delhi', 'Dwarka', 'Rohini'],
  'Karnataka': ['Bengaluru', 'Mysuru', 'Mangalore'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara'],
  'Telangana': ['Hyderabad', 'Warangal'],
};

export default function CustomerManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [deletingId, setDeletingId] = useState(null);
  const [addStep, setAddStep] = useState(0); // 0: Personal, 1: Address, 2: Plan
  const [activeFilter, setActiveFilter] = useState('all'); // all, active, inactive, trial
  const [multiSelect, setMultiSelect] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const nameRef = useRef();
  const emailRef = useRef();
  const phoneRef = useRef();

  const [newCustomer, setNewCustomer] = useState({
    email: '',
    name: '',
    phoneNumber: '',
    address: '',
    city: '',
    taluka: '',
    state: '',
    country: 'India',
    zip: '',
    notes: '',
    planeType: 'Monthly Lunch',
    startDate: '',
    endDate: '',
    status: true,
    profileImage: '',
    gender: '',
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  // Use consistent header add button; remove inline top bar
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => setAddModalVisible(true)} style={{ paddingHorizontal: 12 }}>
          <Ionicons name="person-add" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      )
    });
  }, [navigation]);

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

  const openViewCustomer = async (customer) => {
    try {
      setViewLoading(true);
      setViewModalVisible(true);
      // Use id if available to fetch latest details
      if (customer?.id) {
        const resp = await customerService.getCustomerById(customer.id);
        if (resp.type === 'success' && resp.data) {
          setSelectedCustomer(resp.data);


        } else {
          // fallback to local item if API fails
          setSelectedCustomer(customer);
        }
      } else {
        setSelectedCustomer(customer);
      }
    } finally {
      setViewLoading(false);
    }
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadCustomers().finally(() => setRefreshing(false));
  }, []);

  const filteredCustomers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let filtered = (customers || []).filter(c => {
      const name = (c.name || '').toLowerCase();
      const email = (c.email || '').toLowerCase();
      const phone = (c.phoneNumber || '').toLowerCase();
      const city = (c.city || '').toLowerCase();
      return !q || name.includes(q) || email.includes(q) || phone.includes(q) || city.includes(q);
    });

    // Apply filter
    if (activeFilter === 'active') {
      filtered = filtered.filter(c => c.status === true);
    } else if (activeFilter === 'inactive') {
      filtered = filtered.filter(c => c.status === false);
    } else if (activeFilter === 'trial') {
      filtered = filtered.filter(c => c.planeType === 'Trial Plan');
    }

    return filtered;
  }, [customers, searchQuery, activeFilter]);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\d{10}$/;

  const validateForm = () => {
    const errors = {};
    // Step 1 validations
    if (!newCustomer.name.trim()) errors.name = 'Full name is required';
    if (!newCustomer.email.trim()) errors.email = 'Email is required';
    else if (!emailRegex.test(newCustomer.email.trim())) errors.email = 'Invalid email format';
    if (!newCustomer.phoneNumber.trim()) errors.phoneNumber = 'Phone is required';
    else if (!phoneRegex.test(newCustomer.phoneNumber.trim())) errors.phoneNumber = 'Enter 10 digit phone';
    if (!newCustomer.gender) errors.gender = 'Select gender';
    // Step 2 validations
    if (!newCustomer.address.trim()) errors.address = 'Address is required';
    if (!newCustomer.state) errors.state = 'Select state';
    if (!newCustomer.city.trim()) errors.city = 'District is required';
    if (!newCustomer.taluka.trim()) errors.taluka = 'Taluka is required';
    if (!newCustomer.zip.trim()) errors.zip = 'ZIP is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep = (step) => {
    const errors = {};
    if (step === 0) {
      if (!newCustomer.name.trim()) errors.name = 'Full name is required';
      if (!newCustomer.email.trim()) errors.email = 'Email is required';
      else if (!emailRegex.test(newCustomer.email.trim())) errors.email = 'Invalid email format';
      if (!newCustomer.phoneNumber.trim()) errors.phoneNumber = 'Phone is required';
      else if (!phoneRegex.test(newCustomer.phoneNumber.trim())) errors.phoneNumber = 'Enter 10 digit phone';
      if (!newCustomer.gender) errors.gender = 'Select gender';
    }
    if (step === 1) {
      if (!newCustomer.address.trim()) errors.address = 'Address is required';
      if (!newCustomer.state) errors.state = 'Select state';
      if (!newCustomer.city.trim()) errors.city = 'District is required';
      if (!newCustomer.taluka.trim()) errors.taluka = 'Taluka is required';
      if (!newCustomer.zip.trim()) errors.zip = 'ZIP is required';
    }
    setFormErrors(prev => ({ ...prev, ...errors }));
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

  // Resolve a profile image value into an Image source
  const getImageSource = (value) => {
    if (!value || typeof value !== 'string') return null;
    const v = value.trim();
    if (!v) return null;
    if (v.startsWith('http') || v.startsWith('file://') || v.startsWith('content://') || v.startsWith('data:')) {
      return { uri: v };
    }
    // Assume backend sent raw base64 without prefix
    return { uri: `data:image/jpeg;base64,${v}` };
  };

  const handleAddCustomer = async () => {
    if (!validateForm()) {
      // Jump to first failing step
      if (!newCustomer.name || !newCustomer.email || !newCustomer.phoneNumber || !newCustomer.gender) setAddStep(0);
      else if (!newCustomer.address || !newCustomer.state || !newCustomer.city || !newCustomer.zip) setAddStep(1);
      return;
    }
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
        email: '', name: '', phoneNumber: '', address: '', city: '', state: '', country: 'India', zip: '', notes: '', planeType: 'Monthly Lunch', startDate: '', endDate: '', status: true, profileImage: '', gender: '',
      });
      setAddStep(0);
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
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          setDeletingId(id);
          // Optimistic UI: remove locally first
          const previous = customers;
          setCustomers(prev => prev.filter(c => c.id !== id));
          const resp = await customerService.deleteCustomer(id);

          if (resp.type === 'success') {
            // Refresh in background
            loadCustomers();
          } else {
            // Revert on failure
            setCustomers(previous);
            Alert.alert('Error', resp.message || 'Failed to delete');
          }
          setDeletingId(null);
        }
      }
    ]);
  };

  const dialNumber = (rawPhone) => {
    const phone = String(rawPhone || '').replace(/\D/g, '');
    if (!phone) { Alert.alert('Error', 'Phone number not available'); return; }
    Linking.openURL(`tel:${phone}`);
  };

  const openWhatsApp = (rawPhone) => {
    const digits = String(rawPhone || '').replace(/\D/g, '');
    if (!digits) { Alert.alert('Error', 'Phone number not available'); return; }
    const intl = digits.startsWith('0') ? digits.slice(1) : digits;
    const withCountry = intl.startsWith('91') || intl.startsWith('+91') ? intl.replace(/^\+/, '') : `91${intl}`;
    const url = `whatsapp://send?phone=${withCountry}`;
    Linking.canOpenURL(url).then((supported) => {
      if (supported) Linking.openURL(url); else Linking.openURL(`https://wa.me/${withCountry}`);
    });
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const enterMultiSelect = (id) => {
    setMultiSelect(true);
    setSelectedIds([id]);
  };

  const exitMultiSelect = () => {
    setMultiSelect(false);
    setSelectedIds([]);
  };

  const bulkDelete = async () => {
    if (!selectedIds.length) return;
    Alert.alert('Delete Customers', `Delete ${selectedIds.length} selected ${selectedIds.length === 1 ? 'customer' : 'customers'}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          setIsBulkDeleting(true);
          const previous = customers;
          setCustomers(prev => prev.filter(c => !selectedIds.includes(c.id)));
          try {
            // Fire deletes sequentially to keep API simple; can be parallelized later
            for (const id of selectedIds) {
              // eslint-disable-next-line no-await-in-loop
              const resp = await customerService.deleteCustomer(id);
              if (resp.type !== 'success') throw new Error(resp.message || 'Failed');
            }
            await loadCustomers();
            exitMultiSelect();
          } catch (e) {
            setCustomers(previous);
            Alert.alert('Error', 'Failed to delete selected customers');
          } finally {
            setIsBulkDeleting(false);
          }
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header provides Add button; local top bar removed for consistency */}

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

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {[
          { key: 'all', label: 'All', icon: 'people' },
          { key: 'active', label: 'Active', icon: 'checkmark-circle' },
          { key: 'inactive', label: 'Inactive', icon: 'close-circle' },
          { key: 'trial', label: 'Trial', icon: 'star' }
        ].map(filter => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              activeFilter === filter.key && styles.filterButtonActive
            ]}
            onPress={() => setActiveFilter(filter.key)}
          >
            <Ionicons
              name={filter.icon}
              size={16}
              color={activeFilter === filter.key ? '#FFFFFF' : '#6B7280'}
            />
            <Text style={[
              styles.filterButtonText,
              activeFilter === filter.key && styles.filterButtonTextActive
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Selection Toolbar */}
      {multiSelect && (
        <View style={styles.selectionBar}>
          <Text style={styles.selectionText}>{selectedIds.length} selected</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity style={styles.selectionButton} onPress={exitMultiSelect}>
              <Text style={styles.selectionButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.selectionButtonDanger, isBulkDeleting && { opacity: 0.6 }]} disabled={isBulkDeleting} onPress={bulkDelete}>
              <Text style={styles.selectionButtonDangerText}>{isBulkDeleting ? 'Deleting…' : 'Delete Selected'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

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
          isLoading
            ? <SkeletonCustomerCard />
            : <CustomerCard
              item={item}
              multiSelect={multiSelect}
              selected={selectedIds.includes(item.id)}
              onPress={() => { if (multiSelect) toggleSelect(item.id); else openViewCustomer(item); }}
              onLongPress={() => enterMultiSelect(item.id)}
              onCallPress={() => dialNumber(item.phoneNumber)}
              onWhatsAppPress={() => openWhatsApp(item.phoneNumber)}
            />
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
      <CreateCustomerModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSubmit={async (payload, reset) => {
          const resp = await customerService.createCustomer(payload);
          if (resp.type === 'success') {
            setAddModalVisible(false);
            await loadCustomers();
            Alert.alert('Success', 'Customer added successfully');
            reset && reset();
          } else {
            Alert.alert('Error', resp.message || 'Failed to add customer');
          }
        }}
      />

      {/* View Customer Modal (read-only) */}
      <Modal visible={viewModalVisible} animationType="slide" transparent={true} onRequestClose={() => setViewModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Customer Details</Text>
              <TouchableOpacity onPress={() => setViewModalVisible(false)}>
                <Ionicons name="close" size={24} color="#718096" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
              {viewLoading && (
                <View style={{ paddingVertical: 12, alignItems: 'center' }}>
                  <Text style={{ color: '#6B7280' }}>Loading...</Text>
                </View>
              )}
              <View style={{ alignItems: 'center', marginBottom: 16 }}>
                {getImageSource(selectedCustomer?.profileImage) ? (
                  <Image
                    source={getImageSource(selectedCustomer?.profileImage)}
                    style={styles.avatarLarge}
                  />
                ) : (
                  <View style={[styles.avatarLarge, { alignItems: 'center', justifyContent: 'center' }]}>
                    <Ionicons name="person" size={44} color="#9CA3AF" />
                  </View>
                )}
                <Text style={[styles.customerName, { marginTop: 8 }]}>{selectedCustomer?.name || '—'}</Text>
                <View style={[styles.statusBadge, { marginTop: 8, backgroundColor: selectedCustomer?.status ? '#48BB78' : '#F56565' }]}>
                  <Text style={styles.statusText}>{selectedCustomer?.status ? 'Active' : 'Inactive'}</Text>
                </View>
              </View>

              <View style={styles.infoGroup}>
                <View style={styles.infoRow}><Ionicons name="mail" size={16} color="#6B7280" /><Text style={styles.infoText}>{selectedCustomer?.email || '—'}</Text></View>
                <View style={styles.infoRow}><Ionicons name="call" size={16} color="#6B7280" /><Text style={styles.infoText}>{selectedCustomer?.phoneNumber || '—'}</Text></View>
                <View style={styles.infoRow}><Ionicons name="location" size={16} color="#6B7280" /><Text style={styles.infoText}>{[selectedCustomer?.address, selectedCustomer?.city, selectedCustomer?.state, selectedCustomer?.country || 'India', selectedCustomer?.zip].filter(Boolean).join(', ') || '—'}</Text></View>
                <View style={styles.infoRow}><Ionicons name="pricetag" size={16} color="#6B7280" /><Text style={styles.infoText}>{selectedCustomer?.planeType || '—'}</Text></View>

                {!!selectedCustomer?.notes && (
                  <View style={[styles.infoRow, { alignItems: 'flex-start' }]}>
                    <Ionicons name="document-text" size={16} color="#6B7280" />
                    <Text style={[styles.infoText, { flex: 1 }]}>{selectedCustomer?.notes}</Text>
                  </View>
                )}
              </View>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                <TouchableOpacity style={[styles.selectionButtonDanger, { flex: 1, alignItems: 'center' }]} onPress={() => {
                  if (!selectedCustomer?.id) return;
                  Alert.alert('Delete Customer', 'Are you sure you want to delete this customer?', [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete', style: 'destructive', onPress: async () => {
                        const id = selectedCustomer.id;
                        setViewModalVisible(false);
                        await handleDeleteCustomer(id);
                      }
                    }
                  ]);
                }}>
                  <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.primaryButton, { flex: 1 }]} onPress={() => { setViewModalVisible(false); if (selectedCustomer) { navigation.navigate('EditCustomerByAdmin', { customer: selectedCustomer }); } }}>
                  <Text style={styles.primaryButtonText}>Edit</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setViewModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Close</Text>
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

            <ScrollView style={styles.formContainer} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
              <View style={styles.formSection}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput style={styles.input} value={selectedCustomer?.name || ''} onChangeText={(t) => setSelectedCustomer({ ...selectedCustomer, name: t })} />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput style={styles.input} autoCapitalize="none" keyboardType="email-address" value={selectedCustomer?.email || ''} onChangeText={(t) => setSelectedCustomer({ ...selectedCustomer, email: t })} />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.inputLabel}>Phone</Text>
                <TextInput style={styles.input} keyboardType="phone-pad" value={selectedCustomer?.phoneNumber || ''} onChangeText={(t) => setSelectedCustomer({ ...selectedCustomer, phoneNumber: t })} />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.inputLabel}>Address</Text>
                <TextInput style={[styles.input, styles.textArea]} placeholder="Address" multiline numberOfLines={3} value={selectedCustomer?.address || ''} onChangeText={(t) => setSelectedCustomer({ ...selectedCustomer, address: t })} />
              </View>

              <View style={styles.row}>
                <View style={[styles.formSection, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>State</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={selectedCustomer?.state || ''}
                      onValueChange={(val) => setSelectedCustomer({ ...selectedCustomer, state: val, city: '' })}
                      style={styles.picker}
                    >
                      <Picker.Item label="Select State" value="" />
                      {Object.keys(INDIA_STATES_CITIES).map((s) => (
                        <Picker.Item key={s} label={s} value={s} />
                      ))}
                    </Picker>
                  </View>
                </View>
                <View style={[styles.formSection, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.inputLabel}>City</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      enabled={Boolean(selectedCustomer?.state)}
                      selectedValue={selectedCustomer?.city || ''}
                      onValueChange={(val) => setSelectedCustomer({ ...selectedCustomer, city: val })}
                      style={styles.picker}
                    >
                      <Picker.Item label={selectedCustomer?.state ? 'Select City' : 'Select State first'} value="" />
                      {(INDIA_STATES_CITIES[selectedCustomer?.state] || []).map((c) => (
                        <Picker.Item key={c} label={c} value={c} />
                      ))}
                    </Picker>
                  </View>
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.formSection, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>Country</Text>
                  <TextInput style={styles.input} value={selectedCustomer?.country || 'India'} onChangeText={(t) => setSelectedCustomer({ ...selectedCustomer, country: t })} />
                </View>
                <View style={[styles.formSection, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.inputLabel}>ZIP</Text>
                  <TextInput style={styles.input} placeholder="ZIP" keyboardType="numeric" value={selectedCustomer?.zip || ''} onChangeText={(t) => setSelectedCustomer({ ...selectedCustomer, zip: t })} />
                </View>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.inputLabel}>Plan Type</Text>
                <View style={styles.pickerContainer}>
                  {['Monthly Lunch', 'Monthly Dinner', 'Monthly Both', 'Daily Lunch', 'Daily Dinner', 'Daily Both'].map((type) => (
                    <TouchableOpacity key={type} style={[styles.pickerOption, selectedCustomer?.planeType === type && styles.pickerOptionSelected]} onPress={() => setSelectedCustomer({ ...selectedCustomer, planeType: type })}>
                      <Text style={[styles.pickerOptionText, selectedCustomer?.planeType === type && styles.pickerOptionTextSelected]}>{type}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.formSection, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>Start Date (YYYY-MM-DDTHH:mm:ss)</Text>
                  <TextInput style={styles.input} placeholder="2025-10-01T12:00:00" value={selectedCustomer?.startDate || ''} onChangeText={(t) => setSelectedCustomer({ ...selectedCustomer, startDate: t })} />
                </View>
                <View style={[styles.formSection, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.inputLabel}>End Date (YYYY-MM-DDTHH:mm:ss)</Text>
                  <TextInput style={styles.input} placeholder="2025-10-31T12:00:00" value={selectedCustomer?.endDate || ''} onChangeText={(t) => setSelectedCustomer({ ...selectedCustomer, endDate: t })} />
                </View>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.inputLabel}>Notes</Text>
                <TextInput style={[styles.input, styles.textArea]} placeholder="Notes" multiline numberOfLines={3} value={selectedCustomer?.notes || ''} onChangeText={(t) => setSelectedCustomer({ ...selectedCustomer, notes: t })} />
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
                if (!selectedCustomer?.id) {
                  Alert.alert('Error', 'Invalid customer');
                  return;
                }

                console.log('🔄 CustomerManagement - Starting update for customer:', selectedCustomer.id);
                console.log('🔄 CustomerManagement - Update payload:', selectedCustomer);

                try {
                  const payload = {
                    name: selectedCustomer.name,
                    phoneNumber: selectedCustomer.phoneNumber,
                    address: selectedCustomer.address,
                    city: selectedCustomer.city,
                    state: selectedCustomer.state,
                    country: selectedCustomer.country || 'india',
                    zip: selectedCustomer.zip,
                    notes: selectedCustomer.notes,
                    startDate: selectedCustomer.startDate,
                    endDate: selectedCustomer.endDate,
                    planeType: selectedCustomer.planeType,
                    status: selectedCustomer.status,
                  };
                  const resp = await customerService.updateCustomer(selectedCustomer.id, payload);

                  console.log('🔄 CustomerManagement - Update response:', resp);

                  if (resp.type === 'success') {
                    // Replace selectedCustomer with server response for immediate accuracy
                    if (resp.data) setSelectedCustomer(resp.data);
                    setEditModalVisible(false);
                    await loadCustomers();
                    Alert.alert('Success', 'Customer updated successfully');
                  } else {
                    console.error('💥 CustomerManagement - Update failed:', resp);
                    Alert.alert('Error', resp.message || 'Failed to update customer');
                  }
                } catch (error) {
                  console.error('💥 CustomerManagement - Update error:', error);
                  Alert.alert('Error', 'An unexpected error occurred while updating customer');
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
    backgroundColor: ADMIN_COLORS.surface,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
    elevation: 2,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    minWidth: 140,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
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
    padding: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardInactive: { backgroundColor: '#fff1f1' },
  cardSelectable: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  customerName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  customerEmail: { fontSize: 12, color: '#718096', marginTop: 2 },
  customerPhone: { fontSize: 12, color: '#718096', marginTop: 2 },
  customerMeta: { fontSize: 12, color: '#718096', marginBottom: 8 },
  cardBodyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  planChip: { backgroundColor: '#EEF2FF', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  planChipText: { color: '#4F46E5', fontSize: 12, fontWeight: '600' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '600', color: '#FFFFFF' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  customerPlan: { fontSize: 12, color: '#4299E1', fontWeight: '600' },
  avatarSmall: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E5E7EB' },
  avatarLarge: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#E5E7EB' },
  viewButton: { backgroundColor: '#E0E7FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  viewButtonText: { color: '#3730A3', fontSize: 12, fontWeight: '700' },
  deleteButton: { backgroundColor: '#FEE2E2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  deleteButtonText: { color: '#B91C1C', fontSize: 12, fontWeight: '700' },
  callButton: { backgroundColor: '#D1FAE5', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  whatsappButton: { backgroundColor: '#22C55E', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
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
  inputElevated: { backgroundColor: '#FFFFFF', elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } },
  inputError: { borderColor: '#F56565', borderWidth: 1 },
  errorText: { color: '#DC2626', fontSize: 12, marginTop: 4 },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row' },
  pickerContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pickerOption: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFFFFF' },
  pickerOptionSelected: { backgroundColor: '#8B5CF6', borderColor: '#8B5CF6' },
  pickerOptionText: { fontSize: 12, color: '#4A5568' },
  pickerOptionTextSelected: { color: '#FFFFFF' },
  pickerWrapper: { backgroundColor: '#F3F4F6', borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  picker: { height: 50, color: '#4A5568', fontSize: 16 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 16 },
  cancelButton: { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFFFFF', alignItems: 'center' },
  cancelButtonText: { color: '#718096', fontSize: 16, fontWeight: '500' },
  primaryButton: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: '#FF6B35', alignItems: 'center' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F3F4F6', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  switchText: { fontSize: 16, color: '#4A5568' },
  infoGroup: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12, gap: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { fontSize: 14, color: '#374151' },
  stepperContainer: { marginBottom: 8 },
  stepperTrack: { height: 6, backgroundColor: '#E5E7EB', borderRadius: 9999 },
  stepperProgress: { height: 6, backgroundColor: '#8B5CF6', borderRadius: 9999 },
  stepperIcons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, alignItems: 'center' },
  stepIconWrap: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  stepIconActive: { backgroundColor: '#8B5CF6' },
  stepWithLabel: { alignItems: 'center', gap: 6 },
  stepLabel: { fontSize: 12, color: '#9CA3AF' },
  stepLabelActive: { color: '#8B5CF6', fontWeight: '600' },
  wizardHeader: { marginBottom: 8 },
  wizardTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  wizardSubtitle: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  wizardCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 },
  filterContainer: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filterButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  filterButtonActive: { backgroundColor: '#8B5CF6', borderColor: '#8B5CF6' },
  filterButtonText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  filterButtonTextActive: { color: '#FFFFFF' },
  wizardTitle: { fontSize: 20, fontWeight: '600', color: '#2D3748', marginBottom: 4 },
  wizardSubtitle: { fontSize: 14, color: '#718096', marginBottom: 16 },
  wizardCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
  stepWithLabel: { alignItems: 'center' },
  stepLabel: { fontSize: 12, color: '#9CA3AF', marginTop: 8 },
  stepLabelActive: { color: '#8B5CF6', fontWeight: '600' },
  selectionBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F1F5F9', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12 },
  selectionText: { color: '#0F172A', fontWeight: '600' },
  selectionButton: { backgroundColor: '#FFFFFF', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  selectionButtonText: { color: '#475569', fontWeight: '600' },
  selectionButtonDanger: { backgroundColor: '#DC2626', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  selectionButtonDangerText: { color: '#FFFFFF', fontWeight: '700' },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#9CA3AF', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  checkboxChecked: { borderColor: '#8B5CF6', backgroundColor: '#8B5CF6' },
});


