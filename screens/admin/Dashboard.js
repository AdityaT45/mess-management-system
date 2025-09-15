// src/screens/admin/Dashboard.js
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import customerService from '../../api/customerService';
import { logout } from '../../store/slices/authSlice';

const { width } = Dimensions.get('window');

export default function AdminDashboard({ navigation }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
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
    startDate: '',
    endDate: '',
    planeType: 'Monthly Lunch'
  });
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          onPress: () => dispatch(logout())
        }
      ]
    );
  };

  // Load customers
  const loadCustomers = async () => {
    console.log('🔍 Dashboard - Loading customers...');
    setLoading(true);
    try {
      const response = await customerService.getAllCustomers();
      console.log('📡 Dashboard - Load customers response:', response);
      
      if (response.type === 'success') {
        console.log('✅ Dashboard - Customers loaded successfully:', response.data);
        setCustomers(response.data);
      } else {
        console.log('❌ Dashboard - Failed to load customers:', response.message);
        Alert.alert('Error', response.message);
      }
    } catch (error) {
      console.error('💥 Dashboard - Error loading customers:', error);
      Alert.alert('Error', 'Failed to load customers');
    }
    setLoading(false);
  };

  // Add new customer
  // Fill form with random test data
  const fillRandomData = () => {
    const randomNames = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'David Brown', 'Lisa Davis', 'Tom Wilson', 'Emma Taylor'];
    const randomEmails = ['john@example.com', 'jane@test.com', 'mike@demo.com', 'sarah@sample.com', 'david@test.org', 'lisa@example.net'];
    const randomCities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Pune', 'Hyderabad', 'Ahmedabad'];
    const randomStates = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Gujarat', 'Telangana', 'Rajasthan'];
    const randomAddresses = ['123 Main Street', '456 Park Avenue', '789 Oak Road', '321 Pine Street', '654 Elm Avenue', '987 Maple Drive'];
    const randomNotes = ['Regular customer', 'VIP member', 'New customer', 'Special dietary requirements', 'Prefers morning meals', 'Lunch only'];
    const planeTypes = ['Monthly Lunch', 'Monthly Dinner', 'Monthly Both', 'Daily Lunch', 'Daily Dinner', 'Daily Both'];
    
    const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
    const randomEmail = randomEmails[Math.floor(Math.random() * randomEmails.length)];
    const randomCity = randomCities[Math.floor(Math.random() * randomCities.length)];
    const randomState = randomStates[Math.floor(Math.random() * randomStates.length)];
    const randomAddress = randomAddresses[Math.floor(Math.random() * randomAddresses.length)];
    const randomNote = randomNotes[Math.floor(Math.random() * randomNotes.length)];
    const randomPlaneType = planeTypes[Math.floor(Math.random() * planeTypes.length)];
    
    // Generate random phone number
    const randomPhone = '9' + Math.floor(Math.random() * 900000000 + 100000000);
    
    // Generate random dates (start date today, end date 30-365 days from now)
    const today = new Date();
    const futureDate = new Date(today.getTime() + (Math.floor(Math.random() * 335) + 30) * 24 * 60 * 60 * 1000);
    
    // Format dates as LocalDateTime: YYYY-MM-DDTHH:mm:ss
    const formatDateForRandom = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    };
    
    const startDate = formatDateForRandom(today);
    const endDate = formatDateForRandom(futureDate);
    
    // Generate random ZIP code
    const randomZip = Math.floor(Math.random() * 900000 + 100000).toString();
    
    setNewCustomer({
      email: randomEmail,
      name: randomName,
      phoneNumber: randomPhone,
      address: randomAddress,
      city: randomCity,
      state: randomState,
      country: 'India',
      zip: randomZip,
      notes: randomNote,
      startDate: startDate,
      endDate: endDate,
      planeType: randomPlaneType
    });
    
    console.log('🎲 Dashboard - Filled form with random data');
  };

  const handleAddCustomer = async () => {
    console.log('🔨 Dashboard - Starting to add customer...');
    console.log('📝 Dashboard - Customer data:', newCustomer);
    
    if (!newCustomer.email || !newCustomer.name || !newCustomer.phoneNumber) {
      console.log('❌ Dashboard - Validation failed: missing required fields');
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    console.log('✅ Dashboard - Validation passed, setting loading to true');
    setLoading(true);
    
    try {
      // Prepare customer data with properly formatted dates
      const customerData = {
        ...newCustomer,
        startDate: formatDateForAPI(newCustomer.startDate),
        endDate: formatDateForAPI(newCustomer.endDate)
      };
      
      console.log('📡 Dashboard - Calling customerService.createCustomer...');
      console.log('📝 Dashboard - Formatted customer data:', customerData);
      const response = await customerService.createCustomer(customerData);
      
      console.log('📡 Dashboard - Received response:', response);
      console.log('📡 Dashboard - Response type:', response.type);
      console.log('📡 Dashboard - Response message:', response.message);
      
      if (response.type === 'success') {
        console.log('✅ Dashboard - Customer added successfully');
        Alert.alert('Success', 'Customer added successfully');
        setShowCustomerModal(false);
        setNewCustomer({
          email: '',
          name: '',
          phoneNumber: '',
          address: '',
          city: '',
          state: '',
          country: 'India',
          zip: '',
          notes: '',
          startDate: '',
          endDate: '',
          planeType: 'Monthly Lunch'
        });
        loadCustomers(); // Refresh the list
      } else {
        console.log('❌ Dashboard - Customer creation failed:', response.message);
        Alert.alert('Error', response.message);
      }
    } catch (error) {
      console.error('💥 Dashboard - Error in handleAddCustomer:', error);
      console.error('💥 Dashboard - Error message:', error.message);
      Alert.alert('Error', 'Failed to add customer: ' + error.message);
    }
    
    console.log('🔄 Dashboard - Setting loading to false');
    setLoading(false);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Format date for API (ensure it has time component)
  const formatDateForAPI = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString; // Return original if invalid
      }
      
      // Format as LocalDateTime format: YYYY-MM-DDTHH:mm:ss
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    } catch (error) {
      console.warn('Error formatting date:', error);
      return dateString;
    }
  };

  const navigateToScreen = (screenName) => {
    navigation.navigate(screenName);
    setSidebarOpen(false);
  };

  // Load customers on component mount
  useEffect(() => {
    loadCustomers();
  }, []);

  const StatCard = ({ title, value, icon, color, onPress, subtitle }) => (
    <TouchableOpacity style={styles.statCard} onPress={onPress}>
      <View style={styles.statHeader}>
        <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <View style={styles.statTrend}>
          <Ionicons name="trending-up" size={16} color="#48BB78" />
          <Text style={styles.trendText}>+12%</Text>
        </View>
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </View>
    </TouchableOpacity>
  );

  const QuickActionButton = ({ title, icon, color, onPress, description }) => (
    <TouchableOpacity style={styles.quickActionButton} onPress={onPress}>
      <View style={[styles.actionIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.actionContent}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionDescription}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#CBD5E0" />
    </TouchableOpacity>
  );

  const FeatureCard = ({ title, icon, color, onPress, description, badge }) => (
    <TouchableOpacity style={styles.featureCard} onPress={onPress}>
      <View style={[styles.featureIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
      {badge && (
        <View style={[styles.featureBadge, { backgroundColor: color }]}>
          <Text style={styles.featureBadgeText}>{badge}</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={20} color="#CBD5E0" />
    </TouchableOpacity>
  );

  const TableRow = ({ label, value, status, time }) => (
    <View style={styles.tableRow}>
      <View style={styles.tableLeft}>
        <Text style={styles.tableLabel}>{label}</Text>
        {time && <Text style={styles.tableTime}>{time}</Text>}
      </View>
      <View style={styles.tableRight}>
        <Text style={styles.tableValue}>{value}</Text>
        {status && (
          <View style={[styles.statusBadge, { backgroundColor: status === 'Paid' ? '#48BB78' : '#F56565' }]}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />
      
      {/* Modern Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => setSidebarOpen(!sidebarOpen)}
          >
            <Ionicons name="menu" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <View style={styles.logoContainer}>
              <Ionicons name="restaurant" size={18} color="#FF6B35" />
            </View>
            <Text style={styles.messName}>College Katta Mess</Text>
          </View>
          
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications" size={22} color="#FFFFFF" />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.profileButton} onPress={handleLogout}>
              <Ionicons name="person-circle" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Sidebar */}
      {sidebarOpen && (
        <View style={[styles.sidebar, { paddingTop: insets.top }]}>
          <View style={styles.sidebarHeader}>
            <Text style={styles.sidebarTitle}>Admin Panel</Text>
            <Text style={styles.sidebarSubtitle}>{user?.email || 'admin@mess.com'}</Text>
          </View>
          
          <View style={styles.sidebarMenu}>
            <TouchableOpacity 
              style={[styles.sidebarItem, { backgroundColor: '#FFF1EC' }]}
              onPress={() => navigateToScreen('AdminDashboard')}
            >
              <Ionicons name="home" size={20} color="#FF6B35" />
              <Text style={[styles.sidebarText, { color: '#FF6B35' }]}>Dashboard</Text>
            </TouchableOpacity>
            
            
            <TouchableOpacity 
              style={styles.sidebarItem}
              onPress={() => navigateToScreen('Attendance')}
            >
              <Ionicons name="calendar" size={20} color="#718096" />
              <Text style={styles.sidebarText}>Attendance</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.sidebarItem}
              onPress={() => navigateToScreen('Payments')}
            >
              <Ionicons name="card" size={20} color="#718096" />
              <Text style={styles.sidebarText}>Payments</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.sidebarItem}
              onPress={() => navigateToScreen('Menu')}
            >
              <Ionicons name="restaurant" size={20} color="#718096" />
              <Text style={styles.sidebarText}>Menu</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.sidebarItem}
              onPress={() => navigateToScreen('Reports')}
            >
              <Ionicons name="bar-chart" size={20} color="#718096" />
              <Text style={styles.sidebarText}>Reports</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.sidebarItem}
              onPress={() => navigateToScreen('Settings')}
            >
              <Ionicons name="settings" size={20} color="#718096" />
              <Text style={styles.sidebarText}>Settings</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.sidebarItem}
              onPress={() => navigateToScreen('NetworkDiagnostic')}
            >
              <Ionicons name="wifi" size={20} color="#718096" />
              <Text style={styles.sidebarText}>Network Diagnostic</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Main Content */}
      <ScrollView 
        style={styles.mainContent} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Welcome Section - Now in scrollable content */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.adminName}>{user?.email?.split('@')[0] || 'Admin'}</Text>
          <Text style={styles.dateText}>{new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Overview</Text>
            
          </View>
          
          {/* Customers Stat Card - matches other dashboard cards */}
          
          
          <View style={styles.statsGrid}>
          <StatCard 
            title="Customers" 
            value={String(customers.length)}
            subtitle="Total registered"
            icon="people" 
            color="#FF6B35"
            onPress={() => navigateToScreen('CustomerManagement')}
          />
            <StatCard 
              title="Today's Attendance" 
              value="38" 
              subtitle="84% present"
              icon="calendar" 
              color="#48BB78"
              onPress={() => navigateToScreen('Attendance')}
            />
            <StatCard 
              title="Pending Payments" 
              value="12" 
              subtitle="₹15,600 due"
              icon="card" 
              color="#F56565"
              onPress={() => navigateToScreen('Payments')}
            />
            <StatCard 
              title="Monthly Revenue" 
              value="₹45,000" 
              subtitle="+8% vs last month"
              icon="trending-up" 
              color="#9F7AEA"
              onPress={() => navigateToScreen('Reports')}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsList}>
            <QuickActionButton 
              title="Update Daily Menu" 
              description="Plan today's meals"
              icon="restaurant" 
              color="#48BB78"
              onPress={() => navigateToScreen('Menu')}
            />
            <QuickActionButton 
              title="Generate Report" 
              description="Monthly analytics & insights"
              icon="document-text" 
              color="#9F7AEA"
              onPress={() => navigateToScreen('Reports')}
            />
            <QuickActionButton 
              title="Mark Attendance" 
              description="Record today's presence"
              icon="calendar" 
              color="#F56565"
              onPress={() => navigateToScreen('Attendance')}
            />
            <QuickActionButton 
              title="Network Diagnostic" 
              description="Test API connectivity"
              icon="wifi" 
              color="#4299E1"
              onPress={() => navigateToScreen('NetworkDiagnostic')}
            />
          </View>
        </View>

        {/* New Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Advanced Features</Text>
          <View style={styles.featuresGrid}>
            <FeatureCard 
              title="Attendance Management"
              description="Mark daily attendance manually ✅❌"
              icon="checkmark-circle" 
              color="#48BB78"
              onPress={() => navigateToScreen('Attendance')}
            />
            <FeatureCard 
              title="Digital Attendance QR"
              description="Generate QR for each member. Scan on entry → instantly marks attendance"
              icon="qr-code" 
              color="#4299E1"
              onPress={() => navigateToScreen('Attendance')}
            />
            <FeatureCard 
              title="Complaint & Feedback"
              description="Members can submit complaints/feedback. Admin dashboard shows unresolved"
              icon="chatbubble-ellipses" 
              color="#F56565"
              onPress={() => navigateToScreen('Reports')}
              badge="3"
            />
            <FeatureCard 
              title="Meal Scheduling"
              description="Weekly/Monthly meal plan visible in dashboard. Members can see it too"
              icon="calendar" 
              color="#9F7AEA"
              onPress={() => navigateToScreen('Menu')}
            />
            <FeatureCard 
              title="Staff Management"
              description="Add cooks, helpers, waiters. Track attendance of staff also"
              icon="people" 
              color="#ED8936"
              onPress={() => navigateToScreen('Attendance')}
            />
            <FeatureCard 
              title="Emergency Broadcast"
              description="If mess is closed for a day. Admin can broadcast notice → reaches all members"
              icon="megaphone" 
              color="#E53E3E"
              onPress={() => navigateToScreen('Settings')}
            />
            <FeatureCard 
              title="Smart Reports Export"
              description="Download financial + attendance reports in PDF/Excel. Easy for tax filing"
              icon="download" 
              color="#38B2AC"
              onPress={() => navigateToScreen('Reports')}
            />
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
              <Ionicons name="chevron-forward" size={16} color="#FF6B35" />
            </TouchableOpacity>
          </View>
          
          {/* Recent Payments */}
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Ionicons name="card" size={20} color="#FF6B35" />
              <Text style={styles.tableTitle}>Recent Payments</Text>
            </View>
            <TableRow label="Rahul Kumar" value="₹1,200" status="Paid" time="2 hours ago" />
            <TableRow label="Priya Singh" value="₹1,500" status="Pending" time="4 hours ago" />
            <TableRow label="Amit Patel" value="₹1,800" status="Paid" time="6 hours ago" />
            <TableRow label="Neha Sharma" value="₹1,300" status="Paid" time="1 day ago" />
            <TableRow label="Vikram Singh" value="₹1,600" status="Pending" time="1 day ago" />
          </View>

          {/* Today's Absentees */}
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Ionicons name="calendar" size={20} color="#FF6B35" />
              <Text style={styles.tableTitle}>Today's Absentees</Text>
            </View>
            <TableRow label="Rahul Kumar" value="Sick Leave" time="Notified at 8:00 AM" />
            <TableRow label="Priya Singh" value="Personal" time="Notified at 7:30 AM" />
            <TableRow label="Amit Patel" value="Out of Station" time="Notified at 7:00 AM" />
          </View>
        </View>

        {/* Analytics Preview */}
        <View style={styles.analyticsSection}>
          <Text style={styles.sectionTitle}>Analytics Preview</Text>
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Weekly Attendance Trend</Text>
              <Text style={styles.chartSubtitle}>Last 7 days performance</Text>
            </View>
            <View style={styles.chartPlaceholder}>
              <Ionicons name="bar-chart" size={48} color="#CBD5E0" />
              <Text style={styles.chartPlaceholderText}>Chart visualization will be displayed here</Text>
              <Text style={styles.chartPlaceholderSubtext}>Interactive charts with real-time data</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Add Customer Modal */}
      <Modal
        visible={showCustomerModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Customer</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowCustomerModal(false)}
            >
              <Ionicons name="close" size={24} color="#718096" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                value={newCustomer.email}
                onChangeText={(text) => setNewCustomer({...newCustomer, email: text})}
                placeholder="Enter email address"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={styles.input}
                value={newCustomer.name}
                onChangeText={(text) => setNewCustomer({...newCustomer, name: text})}
                placeholder="Enter full name"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Phone Number *</Text>
              <TextInput
                style={styles.input}
                value={newCustomer.phoneNumber}
                onChangeText={(text) => setNewCustomer({...newCustomer, phoneNumber: text})}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Address</Text>
              <TextInput
                style={styles.input}
                value={newCustomer.address}
                onChangeText={(text) => setNewCustomer({...newCustomer, address: text})}
                placeholder="Enter address"
                multiline
                numberOfLines={2}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>City</Text>
                <TextInput
                  style={styles.input}
                  value={newCustomer.city}
                  onChangeText={(text) => setNewCustomer({...newCustomer, city: text})}
                  placeholder="City"
                />
              </View>
              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>State</Text>
                <TextInput
                  style={styles.input}
                  value={newCustomer.state}
                  onChangeText={(text) => setNewCustomer({...newCustomer, state: text})}
                  placeholder="State"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Country</Text>
                <TextInput
                  style={styles.input}
                  value={newCustomer.country}
                  onChangeText={(text) => setNewCustomer({...newCustomer, country: text})}
                  placeholder="Country"
                />
              </View>
              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>ZIP Code</Text>
                <TextInput
                  style={styles.input}
                  value={newCustomer.zip}
                  onChangeText={(text) => setNewCustomer({...newCustomer, zip: text})}
                  placeholder="ZIP"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Plan Type</Text>
              <TextInput
                style={styles.input}
                value={newCustomer.planeType}
                onChangeText={(text) => setNewCustomer({...newCustomer, planeType: text})}
                placeholder="e.g., Monthly Lunch, Daily Dinner"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Start Date</Text>
                <TextInput
                  style={styles.input}
                  value={newCustomer.startDate}
                  onChangeText={(text) => setNewCustomer({...newCustomer, startDate: text})}
                  placeholder="2025-01-01T12:00:00"
                />
              </View>
              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>End Date</Text>
                <TextInput
                  style={styles.input}
                  value={newCustomer.endDate}
                  onChangeText={(text) => setNewCustomer({...newCustomer, endDate: text})}
                  placeholder="2025-01-31T12:00:00"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newCustomer.notes}
                onChangeText={(text) => setNewCustomer({...newCustomer, notes: text})}
                placeholder="Additional notes (optional)"
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Fill Random Data Button */}
            <TouchableOpacity 
              style={styles.randomDataButton}
              onPress={fillRandomData}
            >
              <Ionicons name="shuffle" size={20} color="#4299E1" />
              <Text style={styles.randomDataButtonText}>Fill Random Data</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleAddCustomer}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Adding...' : 'Add Customer'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  header: {
    backgroundColor: '#F7FAFC',
    paddingHorizontal: 20,
    paddingBottom: 0,
    paddingTop: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    height: 56,
  },
  menuButton: {
    padding: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  logoContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  messName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationButton: {
    padding: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F56565',
  },
  profileButton: {
    padding: 6,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width * 0.8,
    height: '100%',
    backgroundColor: '#FFFFFF',
    zIndex: 1000,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  sidebarHeader: {
    padding: 20,
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FF6B35',
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
  mainContent: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  welcomeSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  welcomeText: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 4,
  },
  adminName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#718096',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2D3748',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF6B35',
    marginRight: 4,
  },
  statsSection: {
    marginBottom: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
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
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statTrend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#48BB78',
    marginLeft: 4,
  },
  statContent: {
    alignItems: 'flex-start',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#718096',
  },
  quickActionsSection: {
    marginBottom: 32,
  },
  quickActionsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    overflow: 'hidden',
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F7FAFC',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: '#718096',
  },
  featuresSection: {
    marginBottom: 32,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    position: 'relative',
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 12,
    color: '#718096',
    lineHeight: 16,
  },
  featureBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featureBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  activitySection: {
    marginBottom: 32,
  },
  tableContainer: {
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
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginLeft: 12,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F7FAFC',
  },
  tableLeft: {
    flex: 1,
  },
  tableLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2D3748',
    marginBottom: 4,
  },
  tableTime: {
    fontSize: 12,
    color: '#718096',
  },
  tableRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tableValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
  analyticsSection: {
    marginBottom: 32,
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  chartHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 14,
    color: '#718096',
  },
  chartPlaceholder: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  chartPlaceholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#718096',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  chartPlaceholderSubtext: {
    fontSize: 14,
    color: '#A0AEC0',
    textAlign: 'center',
  },
  
  // Customer Management Styles
  customerManagementCard: {
    backgroundColor: '#F7FAFC',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  customerCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  customerCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
  },
  addCustomerButton: {
    backgroundColor: '#FF6B35',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addCustomerButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  customersScrollView: {
    marginHorizontal: -4,
  },
  customerCard: {
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    width: 200,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  customerCardContent: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  customerEmail: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 2,
  },
  customerPhone: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 2,
  },
  customerPlan: {
    fontSize: 12,
    color: '#4299E1',
    fontWeight: '500',
    marginBottom: 8,
  },
  customerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#4A5568',
    fontWeight: '500',
  },
  noCustomersCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    width: 200,
  },
  noCustomersText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4A5568',
    marginTop: 12,
    marginBottom: 4,
  },
  noCustomersSubtext: {
    fontSize: 12,
    color: '#718096',
    textAlign: 'center',
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D3748',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4A5568',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#2D3748',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  submitButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#CBD5E0',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
