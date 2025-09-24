// src/screens/superadmin/MessManagement.js
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
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
import { useDispatch, useSelector } from 'react-redux';
import apiClient from '../../api/apiClient';
import messService from '../../api/messService';
import SuperAdminLayout from '../../components/superadmin/SuperAdminLayout';
import { API_CONFIG } from '../../config/api';
import { addMess, setError, setLoading, setMessList } from '../../store/slices/messSlice';
import AddMessFormModal from './component/addMessForm';

// import { API_CONFIG} from '../../config/api';
const { width } = Dimensions.get('window');

export default function MessManagement({ navigation }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [addMessModalVisible, setAddMessModalVisible] = useState(false);
  const [editMessModalVisible, setEditMessModalVisible] = useState(false);
  const [viewMessModalVisible, setViewMessModalVisible] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [selectedMess, setSelectedMess] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({
    city: '',
    status: '',
    messType: ''
  });
  const [multiSelect, setMultiSelect] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const dispatch = useDispatch();
  const { messList, isLoading, pagination, error } = useSelector((state) => state.mess);
  const insets = useSafeAreaInsets();
  const renderDietIcons = (type) => {
    const t = (type || '').toLowerCase();
    const isVeg = t.includes('veg') || t.includes('jain') || t.includes('vegan');
    const isNonVeg = t.includes('non') || t.includes('chicken') || t.includes('meat') || t.includes('egg') || t.includes('mix');
    // Mixed should show both
    const showVeg = isVeg || t.includes('mix');
    const showNonVeg = isNonVeg || t.includes('mix');
    return (
      <View style={styles.dietIconsRow}>
        {showVeg ? (
          <View style={[styles.dietPill, { backgroundColor: '#DCFCE7' }]}>
            <Ionicons name="leaf" size={14} color="#16A34A" />
            {/* <Text style={[styles.dietPillText, { color: '#166534' }]}>Veg</Text> */}
          </View>
        ) : null}
        {showNonVeg ? (
          <View style={[styles.dietPill, { backgroundColor: '#FEE2E2' }]}>
            <Ionicons name="flame" size={14} color="#DC2626" />
            {/* <Text style={[styles.dietPillText, { color: '#7F1D1D' }]}>Non‑veg</Text> */}
          </View>
        ) : null}
      </View>
    );
  };

  // Form refs for validation
  const ownerNameRef = useRef();
  const phoneNumberRef = useRef();
  const emailAddressRef = useRef();
  const cityRef = useRef();
  const passwordRef = useRef();

  // Load mess data on component mount
  useEffect(() => {
    loadMessData(0, true);
  }, []);

  // Load mess data with pagination
  const loadMessData = async (page = 0, isRefresh = false) => {
    try {
      if (isRefresh) {
        dispatch(setLoading(true));
        setCurrentPage(0);
        setHasMoreData(true);
      }

      console.log('Loading mess data - Page:', page);

      const response = await messService.getAllMessList(page, 3, 'createdAt,desc');

      if (response.type === 'success') {
        // console.log('Mess data loaded successfully:', response.data);

        if (isRefresh || page === 0) {
          dispatch(setMessList(response.data));
        } else {
          // Append new data for infinite scroll
          const newMessList = [...messList, ...response.data.content];
          dispatch(setMessList({ ...response.data, content: newMessList }));
        }

        // Check if there's more data
        setHasMoreData(page < response.data.totalPages - 1);
        setCurrentPage(page);
      } else {
        console.error('Failed to load mess data:', response.message);
        dispatch(setError(response.message));
      }
    } catch (error) {
      console.error('Error loading mess data:', error);
      dispatch(setError('Failed to load mess data'));
    }
  };

  // Load more data for infinite scroll
  const loadMoreData = useCallback(() => {
    if (!isLoading && hasMoreData) {
      const nextPage = currentPage + 1;
      loadMessData(nextPage, false);
    }
  }, [isLoading, hasMoreData, currentPage, messList]);
  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }, []);

  const enterMultiSelect = useCallback((id) => {
    setMultiSelect(true);
    setSelectedIds([id]);
  }, []);

  const exitMultiSelect = useCallback(() => {
    setMultiSelect(false);
    setSelectedIds([]);
  }, []);

  const bulkDelete = useCallback(() => {
    if (!selectedIds.length) return;
    Alert.alert('Delete Messes', `Delete ${selectedIds.length} selected ${selectedIds.length === 1 ? 'mess' : 'messes'}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            setIsBulkDeleting(true);
            // Optimistic update
            const previous = messList;
            const filtered = previous.filter(m => !selectedIds.includes(m.id));
            dispatch(setMessList({ ...pagination, content: filtered, totalElements: (pagination.totalElements || filtered.length) - selectedIds.length }));

            for (const id of selectedIds) {
              // eslint-disable-next-line no-await-in-loop
              const resp = await messService.deleteMessSuper(id);
              if (resp.type !== 'success') throw new Error(resp.message || 'Failed');
            }

            await loadMessData(0, true);
            exitMultiSelect();
          } catch (e) {
            console.error('Bulk delete failed:', e);
            Alert.alert('Error', 'Failed to delete selected');
          } finally {
            setIsBulkDeleting(false);
          }
        }
      }
    ]);
  }, [selectedIds, messList, pagination, dispatch, exitMultiSelect, loadMessData]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadMessData(0, true).finally(() => {
      setRefreshing(false);
    });
  }, []);

  // Handle search
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  const openViewMess = useCallback(async (id) => {

    try {
      setViewLoading(true);
      setViewMessModalVisible(true);
      if (id) {
        let resp = null;



        try {
          // Use Super Admin endpoint for fetching detailed mess info

          resp = await apiClient.get(`${API_CONFIG.ENDPOINTS.MESS.GET_BY_ID}/${id}`);



        } catch (error) {
          console.log("error", error);

          resp = {

            type: API_RESPONSE_TYPES.ERROR,
            message: 'Failed to fetch mess details',
            data: null,
          };
        }

        if (resp?.type === 'success' && resp?.data) {
          setSelectedMess(resp.data);
        } else {
          setSelectedMess(null);
        }
      }
    } finally {
      setViewLoading(false);
    }
  }, []);

  const handleEditMess = useCallback((mess) => {
    setSelectedMess(mess);
    setEditMessModalVisible(true);
  }, []);

  // Derived filtered data for list rendering
  const filteredMessList = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return (messList || []).filter((m) => {
      const owner = (m.ownerName || m.messName || '').toLowerCase();
      const city = (m.city || '').toLowerCase();
      const type = (m.messType || '').toLowerCase();
      const description = (m.description || m.messDescription || '').toLowerCase();

      const matchesQuery = !query || owner.includes(query) || city.includes(query) || type.includes(query) || description.includes(query);
      const matchesCity = !selectedFilters.city || city === selectedFilters.city.toLowerCase();
      const matchesType = !selectedFilters.messType || type === selectedFilters.messType.toLowerCase();

      return matchesQuery && matchesCity && matchesType;
    });
  }, [messList, searchQuery, selectedFilters]);

  const [newMess, setNewMess] = useState({
    ownerName: '',
    phoneNumber: '',
    emailAddress: '',
    address: '',
    city: '',
    state: '',
    district: '',
    taluka: '',
    country: 'India',
    zip: '',
    messType: 'Vegetarian',
    messDescription: '',
    password: '',
    notes: ''
  });

  const [formErrors, setFormErrors] = useState({});

  const messTypes = ['Vegetarian', 'Non-Vegetarian', 'Mixed', 'Jain', 'Vegan'];

  // Dummy data for Indian address hierarchy
  const indianStates = {
    'Delhi': {
      districts: {
        'New Delhi': ['Connaught Place', 'Chanakyapuri', 'Lutyens Delhi'],
        'North Delhi': ['Civil Lines', 'Kashmere Gate', 'Sadar Bazar'],
        'South Delhi': ['Hauz Khas', 'Greater Kailash', 'Defence Colony']
      }
    },
    'Maharashtra': {
      districts: {
        'Mumbai Suburban': ['Bandra West', 'Andheri West', 'Juhu'],
        'Pune': ['Pune City', 'Koregaon Park', 'Kalyani Nagar'],
        'Nagpur': ['Nagpur City', 'Dharampeth', 'Sadar']
      }
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!newMess.ownerName.trim()) {
      errors.ownerName = 'Owner name is required';
    }
    if (!newMess.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required';
    }
    if (!newMess.emailAddress.trim()) {
      errors.emailAddress = 'Email address is required';
    }
    if (!newMess.city.trim()) {
      errors.city = 'City is required';
    }
    if (!newMess.password.trim()) {
      errors.password = 'Password is required';
    }
    if (newMess.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const focusField = (fieldName) => {
    switch (fieldName) {
      case 'ownerName':
        ownerNameRef.current?.focus();
        break;
      case 'phoneNumber':
        phoneNumberRef.current?.focus();
        break;
      case 'emailAddress':
        emailAddressRef.current?.focus();
        break;
      case 'city':
        cityRef.current?.focus();
        break;
      case 'password':
        passwordRef.current?.focus();
        break;
    }
  };

  const handleAddMess = async () => {
    if (!validateForm()) {
      // Focus on first error field
      const firstErrorField = Object.keys(formErrors)[0];
      if (firstErrorField) {
        focusField(firstErrorField);
      }
      return;
    }

    try {
      dispatch(setLoading(true));

      const messData = {
        ownerName: newMess.ownerName,
        phoneNumber: newMess.phoneNumber,
        emailAddress: newMess.emailAddress,
        address: newMess.address,
        city: newMess.city,
        state: newMess.state,
        district: newMess.district,
        taluka: newMess.taluka,
        country: newMess.country,
        zip: undefined,
        messType: newMess.messType,
        messDescription: newMess.messDescription,
        password: newMess.password,
        notes: newMess.notes
      };

      const response = await messService.createMess(messData);

      if (response.type === 'success') {
        // Add new mess to the list
        dispatch(addMess(response.data));

        // Reset form
        setNewMess({
          ownerName: '',
          phoneNumber: '',
          emailAddress: '',
          address: '',
          city: '',
          state: '',
          district: '',
          taluka: '',
          country: 'India',
          zip: '',
          messType: 'Vegetarian',
          messDescription: '',
          password: '',
          notes: ''
        });
        setFormErrors({});
        setAddMessModalVisible(false);
        Alert.alert('Success', 'New mess added successfully!');
      } else {
        Alert.alert('Error', response.message || 'Failed to add mess');
      }
    } catch (error) {
      console.error('Error adding mess:', error);
      Alert.alert('Error', 'Failed to add mess');
    } finally {
      dispatch(setLoading(false));
    }
  };



  return (
    <View style={[styles.container]}>
      <SuperAdminLayout
        title="Messes"
        onMenuPress={() => setSidebarOpen(!sidebarOpen)}
        backgroundColor="#8B5CF6"
        textColor="#FFFFFF"
        logoIconName="business"
        logoIconColor="#8B5CF6"
        showNotifications={false}
        notificationCount={0}
        onNotificationsPress={() => { }}
        showProfile={false}
        onProfilePress={() => { }}
      >
        {sidebarOpen && (
          <>
            <TouchableOpacity style={styles.sidebarBackdrop} activeOpacity={1} onPress={() => setSidebarOpen(false)} />
            <View style={[styles.sidebar, { paddingTop: insets.top }]}>
              <View style={styles.sidebarHeader}>
                <Text style={styles.sidebarTitle}>Messes Menu</Text>
                <Text style={styles.sidebarSubtitle}>Quick actions</Text>
              </View>
              <View style={styles.sidebarMenu}>
                <TouchableOpacity style={[styles.sidebarItem, { backgroundColor: '#F3F4F6' }]} onPress={() => setAddMessModalVisible(true)}>
                  <Ionicons name="add" size={20} color="#8B5CF6" />
                  <Text style={[styles.sidebarText, { color: '#8B5CF6' }]}>Add Mess</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sidebarItem} onPress={() => handleRefresh()}>
                  <Ionicons name="refresh" size={20} color="#718096" />
                  <Text style={styles.sidebarText}>Refresh</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sidebarItem} onPress={() => setFilterModalVisible(true)}>
                  <Ionicons name="options" size={20} color="#718096" />
                  <Text style={styles.sidebarText}>Filters</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Content moved into FlatList header for whole-page scroll */}

          {/* Messes List with Infinite Scroll */}
          <View style={styles.messesSection}>
            <FlatList
              data={filteredMessList}
              keyExtractor={(item) => item.id}
              extraData={{ multiSelect, selectedIds, isBulkDeleting }}
              renderItem={({ item: mess }) => (
                <TouchableOpacity
                  activeOpacity={0.9}
                  // onPress={() => { if (multiSelect) toggleSelect(mess.id); else openViewMess(mess); }}
                  onLongPress={() => enterMultiSelect(mess.id)}
                  style={[styles.messCard, multiSelect && styles.cardSelectable, mess.status === false && styles.cardInactive]}
                >
                  <View style={styles.messCardHeader}>
                    <View style={{ flex: 1, marginRight: 12 }}>
                      {renderDietIcons(mess.messType)}
                      <Text style={styles.messType}>{mess.messType || 'Type'}</Text>
                      <Text style={styles.messOwnerName}>{mess.messName}</Text>
                    </View>
                    {multiSelect ? (
                      <View style={[styles.checkbox, selectedIds.includes(mess.id) && styles.checkboxChecked]}>
                        {selectedIds.includes(mess.id) && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                      </View>
                    ) : (
                      <View style={[styles.statusBadge, { backgroundColor: mess.status ? '#48BB78' : '#F56565' }]}>
                        <Text style={styles.statusText}>{mess.status ? 'Active' : 'Inactive'}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.messLocation}>{mess.city}, {mess.state}</Text>
                  <Text style={styles.messDescription}>{mess.description || mess.messDescription}</Text>
                  <View style={styles.messCardFooter}>
                    <Text style={styles.messDate}>
                      Created: {mess.createdAt ? new Date(mess.createdAt).toLocaleDateString() : 'N/A'}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {!multiSelect && (
                        <TouchableOpacity style={styles.viewButton} onPress={() => openViewMess(mess.id)}>
                          <Text style={styles.viewButtonText}>View</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => {
                          Alert.alert('Delete Mess', 'Are you sure you want to delete this mess?', [
                            { text: 'Cancel', style: 'cancel' },
                            {
                              text: 'Delete', style: 'destructive', onPress: async () => {
                                const resp = await messService.deleteMessSuper(mess.id);
                                if (resp.type === 'success') {
                                  Alert.alert('Deleted', resp.message || 'Mess deleted successfully');
                                  loadMessData(0, true);
                                } else {
                                  Alert.alert('Error', resp.message || 'Failed to delete');
                                }
                              }
                            }
                          ]);
                        }}
                      >
                        <Text style={styles.deleteButtonText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              onEndReached={loadMoreData}
              onEndReachedThreshold={0.1}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  colors={['#8B5CF6']}
                  tintColor="#8B5CF6"
                />
              }
              ListHeaderComponent={() => (
                <View>
                  {/* Page Header */}
                  <View style={styles.pageHeader}>
                    <View style={styles.pageTitleContainer}>
                      <Text style={styles.pageTitle}>Manage all messes in the system</Text>
                      <Text style={styles.pageSubtitle}>Search, filter, and manage messes</Text>
                    </View>
                  </View>

                  {/* Search with inline Filter trigger */}
                  <View style={styles.searchFilterBar}>
                    <View style={styles.searchContainer}>
                      <Ionicons name="search" size={20} color="#718096" />
                      <TextInput
                        style={styles.searchInput}
                        placeholder="Search"
                        value={searchQuery}
                        onChangeText={handleSearch}
                        returnKeyType="search..."
                      />
                      <TouchableOpacity onPress={() => setFilterModalVisible(true)}>
                        <Ionicons name="options" size={20} color="#8B5CF6" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Dashboard before Add New button */}
                  <View style={[styles.statsSection, { marginTop: 8 }]}>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      style={styles.statCard}
                      onPress={() => setSelectedFilters({ city: '', status: '', messType: '' })}
                    >
                      <Ionicons name="business" size={24} color="#8B5CF6" />
                      <Text style={styles.statValue}>{pagination.totalElements || 0}</Text>
                      <Text style={styles.statLabel}>Total Messes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      style={styles.statCard}
                      onPress={() => setSelectedFilters({ ...selectedFilters, status: 'active' })}
                    >
                      <Ionicons name="checkmark-circle" size={24} color="#48BB78" />
                      <Text style={styles.statValue}>{messList.filter(m => m.status).length}</Text>
                      <Text style={styles.statLabel}>Active</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      style={styles.statCard}
                      onPress={() => setSelectedFilters({ ...selectedFilters, status: 'inactive' })}
                    >
                      <Ionicons name="pause-circle" size={24} color="#F56565" />
                      <Text style={styles.statValue}>{messList.filter(m => !m.status).length}</Text>
                      <Text style={styles.statLabel}>Inactive</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      style={styles.statCard}
                      onPress={() => setFilterModalVisible(true)}
                    >
                      <Ionicons name="restaurant" size={24} color="#4299E1" />
                      <Text style={styles.statValue}>{[...new Set(messList.map(m => m.messType))].length}</Text>
                      <Text style={styles.statLabel}>Types</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Add New Mess */}
                  <TouchableOpacity
                    style={[styles.addMessButton, { alignSelf: 'flex-start', marginBottom: 16 }]}
                    onPress={() => setAddMessModalVisible(true)}
                  >
                    <Ionicons name="add" size={20} color="#FFFFFF" />
                    <Text style={styles.addMessButtonText}>Add New Mess</Text>
                  </TouchableOpacity>

                  {/* Section Title */}
                  <Text style={styles.sectionTitle}>
                    Messes ({pagination.totalElements || 0})
                  </Text>
                </View>
              )}
              ListFooterComponent={() => (
                isLoading && (messList.length > 0) ? (
                  <View style={styles.loadingFooter}>
                    <Text style={styles.loadingText}>Loading more messes...</Text>
                  </View>
                ) : null
              )}
              ListEmptyComponent={() => (
                <View style={styles.emptyState}>
                  <Ionicons name="business-outline" size={64} color="#CBD5E0" />
                  <Text style={styles.emptyStateTitle}>No messes found</Text>
                  <Text style={styles.emptyStateSubtitle}>
                    {isLoading ? 'Loading messes...' : 'No messes available at the moment'}
                  </Text>
                </View>
              )}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.flatListContent}
            />
          </View>
        </View>

        {/* Add Mess Modal */}
        <AddMessFormModal
          visible={addMessModalVisible}
          onClose={() => setAddMessModalVisible(false)}
          newMess={newMess}
          setNewMess={setNewMess}
          formErrors={formErrors}
          onSubmit={handleAddMess}
        />

        {/* Bottom Selection Toolbar */}
        {multiSelect && (
          <View style={styles.bottomSelectionBar}>
            <Text style={styles.bottomSelectionText}>{selectedIds.length} selected</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={styles.bottomCancelButton} onPress={exitMultiSelect}>
                <Text style={styles.bottomCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.bottomDeleteButton, isBulkDeleting && { opacity: 0.7 }]} disabled={isBulkDeleting} onPress={bulkDelete}>
                <Text style={styles.bottomDeleteText}>{isBulkDeleting ? 'Deleting…' : 'Delete Selected'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Filter Modal */}
        <Modal
          visible={filterModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setFilterModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.addMessModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Filter Messes</Text>
                <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#718096" />
                </TouchableOpacity>
              </View>

              <View style={{ maxHeight: 400 }}>
                <View style={styles.formSection}>
                  <Text style={styles.sectionTitle}>City</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Filter by city (exact)"
                    value={selectedFilters.city}
                    onChangeText={(text) => setSelectedFilters({ ...selectedFilters, city: text })}
                  />
                </View>

                {/* Status filter removed for superadmin */}

                <View style={styles.formSection}>
                  <Text style={styles.sectionTitle}>Mess Type</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={selectedFilters.messType}
                      onValueChange={(v) => setSelectedFilters({ ...selectedFilters, messType: v })}
                      style={styles.picker}
                    >
                      <Picker.Item label="Any" value="" />
                      {messTypes.map((t) => (
                        <Picker.Item key={t} label={t} value={t} />
                      ))}
                    </Picker>
                  </View>
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setSelectedFilters({ city: '', messType: '' })}
                >
                  <Text style={styles.cancelButtonText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.addMessButton}
                  onPress={() => setFilterModalVisible(false)}
                >
                  <Text style={styles.addMessButtonText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* View Details Modal */}
        <Modal
          visible={viewMessModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setViewMessModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.addMessModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Mess Details</Text>
                <TouchableOpacity onPress={() => setViewMessModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#718096" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
                {viewLoading ? (
                  <View style={{ paddingVertical: 12, alignItems: 'center' }}>
                    <Text style={{ color: '#6B7280' }}>Loading...</Text>
                  </View>
                ) : null}
                <View style={styles.formSection}>
                  <Text style={styles.sectionTitle}>Basic Information</Text>
                  <View style={styles.inputGroup}><Text style={styles.inputLabel}>Mess Name</Text><Text>{selectedMess?.messName || '—'}</Text></View>
                  <View style={styles.inputGroup}><Text style={styles.inputLabel}>Owner Name</Text><Text>{selectedMess?.ownerName || '—'}</Text></View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Mess Type</Text>
                    <View style={{ marginTop: 6 }}>{renderDietIcons(selectedMess?.messType)}</View>
                  </View>
                  <View style={styles.inputGroup}><Text style={styles.inputLabel}>Status</Text><Text>{selectedMess?.status ? 'Active' : 'Inactive'}</Text></View>
                </View>

                <View style={styles.formSection}>
                  <Text style={styles.sectionTitle}>Contact</Text>
                  <View style={styles.inputGroup}><Text style={styles.inputLabel}>Phone</Text><Text>{selectedMess?.phoneNumber || '—'}</Text></View>
                  <View style={styles.inputGroup}><Text style={styles.inputLabel}>Email</Text><Text>{selectedMess?.emailAddress || selectedMess?.email || '—'}</Text></View>
                </View>

                <View style={styles.formSection}>
                  <Text style={styles.sectionTitle}>Location</Text>
                  <View style={styles.inputGroup}><Text style={styles.inputLabel}>Address</Text><Text>{selectedMess?.address || '—'}</Text></View>
                  <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                      <Text style={styles.inputLabel}>City</Text>
                      <Text>{selectedMess?.city || '—'}</Text>
                    </View>
                    <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                      <Text style={styles.inputLabel}>State</Text>
                      <Text>{selectedMess?.state || '—'}</Text>
                    </View>
                  </View>
                  <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                      <Text style={styles.inputLabel}>Country</Text>
                      <Text>{selectedMess?.country || '—'}</Text>
                    </View>
                    <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                      <Text style={styles.inputLabel}>ZIP</Text>
                      <Text>{selectedMess?.zip || '—'}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.formSection}>
                  <Text style={styles.sectionTitle}>Description</Text>
                  <Text>{selectedMess?.description || selectedMess?.messDescription || '—'}</Text>
                </View>
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setViewMessModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Close</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.addMessButton}
                  onPress={() => {
                    setViewMessModalVisible(false);
                    setEditMessModalVisible(true);
                  }}
                >
                  <Text style={styles.addMessButtonText}>Edit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Edit Mess Modal */}
        <Modal
          visible={editMessModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setEditMessModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.addMessModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Mess</Text>
                <TouchableOpacity onPress={() => setEditMessModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#718096" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.formSection}>
                  <Text style={styles.sectionTitle}>Basic Information</Text>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Mess Name</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter mess name"
                      value={selectedMess?.messName || ''}
                      onChangeText={(text) => setSelectedMess({ ...selectedMess, messName: text })}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Mess Number</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="00010"
                      value={selectedMess?.messNumber?.toString?.() || selectedMess?.messNumber || ''}
                      onChangeText={(text) => setSelectedMess({ ...selectedMess, messNumber: text })}
                      keyboardType="number-pad"
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Owner Name</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter owner name"
                      value={selectedMess?.ownerName || ''}
                      onChangeText={(text) => setSelectedMess({ ...selectedMess, ownerName: text })}
                    />
                  </View>

                  <View style={[styles.inputGroup, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
                    <Text style={styles.inputLabel}>Status</Text>
                    <Switch
                      value={!!selectedMess?.status}
                      onValueChange={(v) => setSelectedMess({ ...selectedMess, status: v })}
                      trackColor={{ false: '#E2E8F0', true: '#8B5CF6' }}
                      thumbColor={'#FFFFFF'}
                    />
                  </View>
                </View>

                <View style={styles.formSection}>
                  <Text style={styles.sectionTitle}>Contact</Text>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Phone</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter phone"
                      value={selectedMess?.phoneNumber || ''}
                      onChangeText={(text) => setSelectedMess({ ...selectedMess, phoneNumber: text })}
                      keyboardType="phone-pad"
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Email</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter email"
                      value={selectedMess?.emailAddress || selectedMess?.email || ''}
                      onChangeText={(text) => setSelectedMess({ ...selectedMess, emailAddress: text })}
                      keyboardType="email-address"
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Password (optional)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter new password"
                      value={selectedMess?.password || ''}
                      onChangeText={(text) => setSelectedMess({ ...selectedMess, password: text })}
                      secureTextEntry
                    />
                  </View>
                </View>

                <View style={styles.formSection}>
                  <Text style={styles.sectionTitle}>Location</Text>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Address</Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Enter address"
                      value={selectedMess?.address || ''}
                      onChangeText={(text) => setSelectedMess({ ...selectedMess, address: text })}
                      multiline
                      numberOfLines={3}
                    />
                  </View>
                  <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                      <Text style={styles.inputLabel}>City</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="City"
                        value={selectedMess?.city || ''}
                        onChangeText={(text) => setSelectedMess({ ...selectedMess, city: text })}
                      />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                      <Text style={styles.inputLabel}>State</Text>
                      <View style={styles.pickerWrapper}>
                        <Picker
                          selectedValue={selectedMess?.state || ''}
                          onValueChange={(itemValue) => {
                            setSelectedMess({ ...selectedMess, state: itemValue, district: '', taluka: '' });
                          }}
                          style={styles.picker}
                        >
                          <Picker.Item label="Select State" value="" />
                          {Object.keys(indianStates).map((state) => (
                            <Picker.Item key={state} label={state} value={state} />
                          ))}
                        </Picker>
                      </View>
                    </View>
                  </View>
                  <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                      <Text style={styles.inputLabel}>Country</Text>
                      <View style={styles.pickerWrapper}>
                        <Picker
                          selectedValue={selectedMess?.country || ''}
                          onValueChange={(itemValue) => {
                            setSelectedMess({ ...selectedMess, country: itemValue, state: '', district: '', taluka: '' });
                          }}
                          style={styles.picker}
                        >
                          <Picker.Item label="Select Country" value="" />
                          <Picker.Item label="India" value="India" />
                        </Picker>
                      </View>
                    </View>
                    <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                      <Text style={styles.inputLabel}>ZIP</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="ZIP"
                        value={selectedMess?.zip || ''}
                        onChangeText={(text) => setSelectedMess({ ...selectedMess, zip: text })}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                  {selectedMess?.state && selectedMess?.country === 'India' ? (
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>District</Text>
                      <View style={styles.pickerWrapper}>
                        <Picker
                          selectedValue={selectedMess?.district || ''}
                          onValueChange={(itemValue) => {
                            setSelectedMess({ ...selectedMess, district: itemValue, taluka: '' });
                          }}
                          style={styles.picker}
                        >
                          <Picker.Item label="Select District" value="" />
                          {selectedMess?.state && indianStates[selectedMess.state]?.districts &&
                            Object.keys(indianStates[selectedMess.state].districts).map((district) => (
                              <Picker.Item key={district} label={district} value={district} />
                            ))
                          }
                        </Picker>
                      </View>
                    </View>
                  ) : null}
                  {selectedMess?.district && selectedMess?.country === 'India' ? (
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Taluka</Text>
                      <View style={styles.pickerWrapper}>
                        <Picker
                          selectedValue={selectedMess?.taluka || ''}
                          onValueChange={(itemValue) => {
                            setSelectedMess({ ...selectedMess, taluka: itemValue });
                          }}
                          style={styles.picker}
                        >
                          <Picker.Item label="Select Taluka" value="" />
                          {selectedMess?.district && selectedMess?.state &&
                            indianStates[selectedMess.state]?.districts?.[selectedMess.district]?.map((taluka) => (
                              <Picker.Item key={taluka} label={taluka} value={taluka} />
                            ))
                          }
                        </Picker>
                      </View>
                    </View>
                  ) : null}
                </View>

                <View style={styles.formSection}>
                  <Text style={styles.sectionTitle}>Description</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Enter description"
                    value={selectedMess?.description || selectedMess?.messDescription || ''}
                    onChangeText={(text) => setSelectedMess({ ...selectedMess, description: text })}
                    multiline
                    numberOfLines={3}
                  />
                  <View style={[styles.inputGroup, { marginTop: 12 }]}>
                    <Text style={styles.inputLabel}>Notes</Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Any additional notes"
                      value={selectedMess?.notes || ''}
                      onChangeText={(text) => setSelectedMess({ ...selectedMess, notes: text })}
                      multiline
                      numberOfLines={3}
                    />
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setEditMessModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.addMessButton}
                  onPress={async () => {
                    if (!selectedMess?.id) {
                      Alert.alert('Error', 'Invalid mess');
                      return;
                    }
                    const payload = {
                      email: selectedMess.emailAddress || selectedMess.email,
                      password: selectedMess.password,
                      messNumber: selectedMess.messNumber,
                      ownerName: selectedMess.ownerName,
                      messName: selectedMess.messName,
                      phoneNumber: selectedMess.phoneNumber,
                      address: selectedMess.address,
                      city: selectedMess.city,
                      state: selectedMess.state,
                      country: selectedMess.country,
                      zip: selectedMess.zip,
                      status: Boolean(selectedMess.status),
                      messType: selectedMess.messType,
                      description: selectedMess.description || selectedMess.messDescription,
                      notes: selectedMess.notes,
                    };
                    const resp = await messService.updateMessSuper(selectedMess.id, payload);
                    if (resp.type === 'success') {
                      Alert.alert('Success', 'Mess updated');
                      setEditMessModalVisible(false);
                      loadMessData(0, true);
                    } else {
                      Alert.alert('Error', resp.message || 'Failed to update');
                    }
                  }}
                >
                  <Text style={styles.addMessButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </SuperAdminLayout>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width * 0.8,
    height: '100%',
    backgroundColor: '#FFFFFF',
    zIndex: 1000,
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  sidebarBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    zIndex: 999,
  },
  sidebarHeader: {
    padding: 20,
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#8B5CF6',
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  sidebarSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  sidebarMenu: {
    padding: 20,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  sidebarText: {
    fontSize: 16,
    color: '#718096',
    marginLeft: 16,
    fontWeight: '500',
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    gap: 16,
  },
  pageTitleContainer: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 16,
    color: '#718096',
  },
  addMessButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
    minWidth: 140,
  },
  addMessButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  searchFilterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#2D3748',
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3748',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#718096',
    textAlign: 'center',
  },
  messesSection: {
    flex: 1,
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 20,
  },
  messCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardInactive: { backgroundColor: '#fff1f1' },
  cardSelectable: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16 },
  messCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  messOwnerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  messLocation: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 4,
  },
  messType: {
    fontSize: 14,
    color: '#4A5568',
    marginBottom: 8,
  },
  dietIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  dietPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
    gap: 6,
  },
  dietPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  messDescription: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 12,
    lineHeight: 20,
  },
  messCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messDate: {
    fontSize: 12,
    color: '#A0AEC0',
  },
  viewButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#B91C1C',
    fontSize: 12,
    fontWeight: '700',
  },
  selectionBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F1F5F9', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12 },
  selectionText: { color: '#0F172A', fontWeight: '600' },
  selectionButton: { backgroundColor: '#FFFFFF', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  selectionButtonText: { color: '#475569', fontWeight: '600' },
  selectionButtonDanger: { backgroundColor: '#DC2626', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  selectionButtonDangerText: { color: '#FFFFFF', fontWeight: '700' },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#9CA3AF', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  checkboxChecked: { borderColor: '#8B5CF6', backgroundColor: '#8B5CF6' },
  secondaryButton: {
    backgroundColor: '#feea79',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  secondaryButtonText: {
    color: '#111827',
    fontSize: 12,
    fontWeight: '600',
  },
  flatListContent: {
    paddingBottom: 40,
  },
  loadingFooter: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: '#718096',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#718096',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#A0AEC0',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMessModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '95%',
    maxHeight: '90%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D3748',
  },
  formContainer: {
    maxHeight: 400,
  },
  formSection: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  inputGroup: {
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2D3748',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#2D3748',
  },
  inputError: {
    borderColor: '#F56565',
    borderWidth: 1,
  },
  errorText: {
    color: '#F56565',
    fontSize: 12,
    marginTop: 4,
  },
  textArea: {
    minHeight: 80,
    paddingTop: 10,
    paddingBottom: 10,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  pickerOptionSelected: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  pickerOptionText: {
    fontSize: 14,
    color: '#4A5568',
  },
  pickerOptionTextSelected: {
    color: '#FFFFFF',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  switchLabel: {
    fontSize: 16,
    color: '#4A5568',
  },
  pickerWrapper: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  picker: {
    height: 50,
    color: '#4A5568',
    fontSize: 16,
  },

  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#718096',
    fontSize: 16,
    fontWeight: '500',
  },
  bottomSelectionBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 70,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#111827',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomSelectionText: { color: '#FFFFFF', fontWeight: '700' },
  bottomCancelButton: { backgroundColor: '#374151', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 },
  bottomCancelText: { color: '#E5E7EB', fontWeight: '600' },
  bottomDeleteButton: { backgroundColor: '#DC2626', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 },
  bottomDeleteText: { color: '#FFFFFF', fontWeight: '700' },
});
