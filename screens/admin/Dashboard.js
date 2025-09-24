// src/screens/admin/Dashboard.js
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import adminService from '../../api/adminService';
import customerService from '../../api/customerService';
import { ADMIN_COLORS } from '../../config/colors';

const { width } = Dimensions.get('window');

export default function AdminDashboard({ navigation }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [mess, setMess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
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
  const scrollY = useRef(new Animated.Value(0)).current;
  const [showRevenue, setShowRevenue] = useState(false);
  const [heroVisible, setHeroVisible] = useState(true);
  const HERO_MAX_HEIGHT = 160;

  const headerOpacity = scrollY.interpolate({ inputRange: [0, 60], outputRange: [1, 0], extrapolate: 'clamp' });
  const headerTranslate = scrollY.interpolate({ inputRange: [0, HERO_MAX_HEIGHT], outputRange: [0, -HERO_MAX_HEIGHT], extrapolate: 'clamp' });

  React.useEffect(() => {
    const id = scrollY.addListener(({ value }) => {
      // Hysteresis to prevent flicker: hide when >80, show when <30
      setHeroVisible((prev) => {
        if (prev && value > 80) return false;
        if (!prev && value < 30) return true;
        return prev;
      });
    });
    return () => scrollY.removeListener(id);
  }, [scrollY]);

  // Toggle native header visibility based on hero visibility
  useLayoutEffect(() => {
    if (!heroVisible) {
      navigation.setOptions({
        headerShown: true,
        title: 'Dashboard',
        headerStyle: { backgroundColor: ADMIN_COLORS.primary },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { color: '#FFFFFF' },
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={{ paddingHorizontal: 12 }}>
            <Ionicons name="menu" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        ),
      });
    } else {
      // Ensure native header hides again when returning to top
      navigation.setOptions({ headerShown: false });
      // Reset scroll-linked animation state for reliability on revisit to top
      // This prevents a stuck hidden state after fast flings
      // (no-op for user but stabilizes the hero visibility)
    }
  }, [navigation, heroVisible]);

  const handleProfile = () => {
    navigation.navigate('Profile');
  };

  // Load mess data
  const loadMessData = async () => {
    try {
      const response = await adminService.getOwnMess();
      if (response.type === 'success') {
        setMess(response.data);
      } else {
        console.warn('Failed to load mess data:', response.message);
      }
    } catch (error) {
      console.error('💥 Dashboard - Error loading mess data:', error);
    }
  };

  // Load customers
  const loadCustomers = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await customerService.getAllCustomers();

      if (response.type === 'success') {
        setCustomers(response.data);
        setLastRefresh(new Date());
      } else {
        Alert.alert('Error', response.message);
      }
    } catch (error) {
      console.error('💥 Dashboard - Error loading customers:', error);
      Alert.alert('Error', 'Failed to load customers');
    }

    if (isRefresh) {
      setRefreshing(false);
    } else {
      setLoading(false);
    }
  };

  // Auto-refresh function
  const handleAutoRefresh = () => {
    loadCustomers(true);
    loadMessData();
  };

  // Pull to refresh handler
  const onRefresh = () => {
    loadCustomers(true);
    loadMessData();
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

  // Load data on component mount
  useEffect(() => {
    loadCustomers();
    loadMessData();
  }, []);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadMessData();
    }, [])
  );

  // Auto-refresh timer (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      handleAutoRefresh();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
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
      <StatusBar barStyle="light-content" backgroundColor={ADMIN_COLORS.primary} />

      {/* Curved Hero Header - slides up on scroll (native-driver) */}
      <Animated.View style={[styles.heroWrap, { opacity: headerOpacity, transform: [{ translateY: headerTranslate }] }]} pointerEvents={heroVisible ? 'auto' : 'none'}>
        <View style={styles.heroBg}>
          <View style={styles.heroTopRow}>
            <TouchableOpacity style={styles.heroMenuBtn} onPress={() => navigation.toggleDrawer()}>
              <Ionicons name="menu" size={22} color={ADMIN_COLORS.white} />
            </TouchableOpacity>
          </View>
          <View style={styles.heroContent}>
            <View style={styles.logoWrap}>
              <Image source={{ uri: 'https://i.ibb.co/4j2mH0T/restaurant.png' }} style={styles.logoImg} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.messTitle}>{mess?.messName || 'College Katta Mess'}</Text>
              <Text style={styles.messSub}>Hello, {mess?.ownerName || user?.email?.split('@')[0] || 'Admin'}</Text>

            </View>
            <TouchableOpacity style={styles.revenueCard} onPress={() => setShowRevenue(!showRevenue)} activeOpacity={0.8}>
              <Text style={styles.revenueLabel}>Today</Text>
              <Text style={styles.revenueValue}>{showRevenue ? '₹4,500' : 'xxxxx'}</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.heroSubRow,]}>
            <View style={styles.datePill}>
              <Ionicons name="calendar-outline" size={14} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.heroDate}>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</Text>
            </View>
            {mess?.city && (
              <View style={styles.locationPill}>
                <Ionicons name="location-outline" size={14} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.locationText}>{mess.city}{mess.state ? `, ${mess.state}` : ''}</Text>
              </View>
            )}


          </View>
        </View>
        <View style={styles.heroCurve} />
      </Animated.View>

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
      <Animated.ScrollView
        style={styles.mainContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: HERO_MAX_HEIGHT + 12 }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FF6B35']}
            tintColor="#FF6B35"
            title="Pull to refresh"
            titleColor="#666"
          />
        }
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
      >



        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Overview</Text>
            <TouchableOpacity style={styles.refreshButton} onPress={onRefresh} disabled={refreshing}>
              <Ionicons
                name={refreshing ? "refresh" : "refresh-outline"}
                size={18}
                color={refreshing ? "#999" : "#FF6B35"}
                style={refreshing ? { transform: [{ rotate: '180deg' }] } : {}}
              />
              <Text style={[styles.refreshText, refreshing && { color: '#999' }]}>
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Text>
            </TouchableOpacity>
          </View>
          {lastRefresh && (
            <Text style={styles.lastRefreshText}>
              Last updated: {lastRefresh.toLocaleTimeString()}
            </Text>
          )}

          {/* Customers Stat Card - matches other dashboard cards */}


          <View style={styles.statsGrid}>
            <StatCard
              title="Customers"
              value={String(customers.length)}
              subtitle="Total registered"
              icon="people"
              color="#FF6B35"
              onPress={() => navigateToScreen('Customers')}
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

        Quick Actions
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
      </Animated.ScrollView>


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ADMIN_COLORS.surface,
  },

  mainContent: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  heroWrap: { paddingHorizontal: 0, height: 170, position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  heroBg: { backgroundColor: ADMIN_COLORS.primary, paddingBottom: 10, paddingHorizontal: 27, paddingLeft: 20, borderBottomLeftRadius: 55, borderBottomRightRadius: 55, elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.18, shadowRadius: 10 },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroMenuBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginTop: 0 },
  heroContent: { flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingBottom: 8 },
  logoWrap: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginRight: 12, elevation: 6, shadowColor: '#000' },
  logoImg: { width: 40, height: 40, borderRadius: 20 },
  messTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  messSub: { color: '#f3f3f3', fontSize: 12, marginTop: 2 },
  messNumber: { color: '#f3f3f3', fontSize: 10, marginTop: 2, opacity: 0.8 },
  revenueCard: { backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, alignItems: 'flex-end', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.18, shadowRadius: 8 },
  revenueLabel: { color: '#fff', fontSize: 10 },
  revenueValue: { color: '#fff', fontSize: 16, fontWeight: '700' },
  heroSubRow: { paddingVertical: 8, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  datePill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  heroDate: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  locationPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  locationText: { color: '#FFFFFF', fontSize: 12, fontWeight: '500' },
  typePill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  typeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '500' },


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
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFF1EC',
    borderRadius: 8,
  },
  refreshText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF6B35',
    marginLeft: 4,
  },
  lastRefreshText: {
    fontSize: 12,
    color: '#718096',
    marginTop: -10,
    marginBottom: 10,
    textAlign: 'right',
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
