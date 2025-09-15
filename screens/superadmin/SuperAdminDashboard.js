// src/screens/superadmin/SuperAdminDashboard.js
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import messService from '../../api/messService';
import SuperAdminLayout from '../../components/superadmin/SuperAdminLayout';
import { logout } from '../../store/slices/authSlice';
import { setError, setLoading, setMessList } from '../../store/slices/messSlice';

const { width } = Dimensions.get('window');

export default function SuperAdminDashboard({ navigation }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { messList, isLoading, pagination } = useSelector((state) => state.mess);
  const insets = useSafeAreaInsets();

  // Load mess data on component mount
  useEffect(() => {
    loadMessData();
  }, []);

  const loadMessData = async () => {
    try {
      dispatch(setLoading(true));
      console.log('Loading mess data...');
      
      const response = await messService.getAllMessList(0, 10, 'createdAt,desc');
      
      if (response.type === 'success') {
        console.log('Mess data loaded successfully:', response.data);
        dispatch(setMessList(response.data));
      } else {
        console.error('Failed to load mess data:', response.message);
        dispatch(setError(response.message));
      }
    } catch (error) {
      console.error('Error loading mess data:', error);
      dispatch(setError('Failed to load mess data'));
    }
  };

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

  const navigateToScreen = (screenName) => {
    const routeMap = {
      SuperAdminDashboard: 'Dashboard',
      MessManagement: 'Messes',
      UserManagement: 'Customers',
      FinancialControl: 'Dashboard',
      Reports: 'Dashboard',
      SystemOperations: 'Activity',
    };
    const target = routeMap[screenName] || screenName;
    navigation.navigate(target);
    setSidebarOpen(false);
  };

  const handleRefresh = () => {
    loadMessData();
  };

  const StatCard = ({ title, value, icon, color, onPress, subtitle, trend }) => (
    <TouchableOpacity style={styles.statCard} onPress={onPress}>
      <View style={styles.statHeader}>
        <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        {trend && (
          <View style={styles.statTrend}>
            <Ionicons name="trending-up" size={16} color="#48BB78" />
            <Text style={styles.trendText}>{trend}</Text>
          </View>
        )}
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </View>
    </TouchableOpacity>
  );

  const FeatureCard = ({ title, icon, color, onPress, description, badge, status }) => (
    <TouchableOpacity style={styles.featureCard} onPress={onPress}>
      <View style={[styles.featureIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
        {status && (
          <View style={[styles.statusIndicator, { backgroundColor: status === 'active' ? '#48BB78' : '#F56565' }]}>
            <Text style={styles.statusText}>{status === 'active' ? 'Active' : 'Inactive'}</Text>
          </View>
        )}
      </View>
      {badge && (
        <View style={[styles.featureBadge, { backgroundColor: color }]}>
          <Text style={styles.featureBadgeText}>{badge}</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={20} color="#CBD5E0" />
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

  const TableRow = ({ label, value, status, time, mess }) => (
    <View style={styles.tableRow}>
      <View style={styles.tableLeft}>
        <Text style={styles.tableLabel}>{label}</Text>
        {mess && <Text style={styles.tableMess}>{mess}</Text>}
        {time && <Text style={styles.tableTime}>{time}</Text>}
      </View>
      <View style={styles.tableRight}>
        <Text style={styles.tableValue}>{value}</Text>
        {status && (
          <View style={[styles.statusBadge, { backgroundColor: status === 'Approved' ? '#48BB78' : status === 'Pending' ? '#ED8936' : '#F56565' }]}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SuperAdminLayout
      title="Super Admin"
      onMenuPress={() => setSidebarOpen(!sidebarOpen)}
      backgroundColor="#8B5CF6"
      textColor="#FFFFFF"
      logoIconName="shield-checkmark"
      logoIconColor="#8B5CF6"
      showNotifications={false}
      notificationCount={0}
      onNotificationsPress={() => {}}
      showProfile={false}
      onProfilePress={handleLogout}
    >
      {/* Sidebar */}
      {sidebarOpen && (
        <>
        <TouchableOpacity style={styles.sidebarBackdrop} activeOpacity={1} onPress={() => setSidebarOpen(false)} />
        <View style={[styles.sidebar, { paddingTop: insets.top }]}> 
          <View style={styles.sidebarHeader}>
            <Text style={styles.sidebarTitle}>Super Admin Panel</Text>
            <Text style={styles.sidebarSubtitle}>{user?.email || 'superadmin@system.com'}</Text>
          </View>
          
          <View style={styles.sidebarMenu}>
            <TouchableOpacity 
              style={[styles.sidebarItem, { backgroundColor: '#F3F4F6' }]}
              onPress={() => navigateToScreen('SuperAdminDashboard')}
            >
              <Ionicons name="home" size={20} color="#8B5CF6" />
              <Text style={[styles.sidebarText, { color: '#8B5CF6' }]}>Dashboard</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.sidebarItem}
              onPress={() => navigateToScreen('MessManagement')}
            >
              <Ionicons name="business" size={20} color="#718096" />
              <Text style={styles.sidebarText}>Mess Management</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.sidebarItem}
              onPress={() => navigateToScreen('UserManagement')}
            >
              <Ionicons name="people" size={20} color="#718096" />
              <Text style={styles.sidebarText}>User Management</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.sidebarItem}
              onPress={() => navigateToScreen('FinancialControl')}
            >
              <Ionicons name="trending-up" size={20} color="#718096" />
              <Text style={styles.sidebarText}>Financial Control</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.sidebarItem}
              onPress={() => navigateToScreen('SystemOperations')}
            >
              <Ionicons name="settings" size={20} color="#718096" />
              <Text style={styles.sidebarText}>System Operations</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.sidebarItem}
              onPress={() => navigateToScreen('Reports')}
            >
              <Ionicons name="bar-chart" size={20} color="#718096" />
              <Text style={styles.sidebarText}>Reports</Text>
            </TouchableOpacity>
          </View>
        </View>
        </>
      )}

      {/* Main Content */}
      <ScrollView 
        style={styles.mainContent} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.adminName}>{user?.email?.split('@')[0] || 'Super Admin'}</Text>
          <Text style={styles.dateText}>{new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</Text>
        </View>

        {/* Global Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#718096" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search any user, admin, mess, or transaction..."
              placeholderTextColor="#A0AEC0"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity style={styles.searchButton}>
              <Ionicons name="options" size={20} color="#8B5CF6" />
            </TouchableOpacity>
          </View>
        </View>

        {/* System Overview Stats */}
        <View style={styles.statsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>System Overview</Text>
            <TouchableOpacity style={styles.viewAllButton} onPress={handleRefresh}>
              <Text style={styles.viewAllText}>{isLoading ? 'Loading...' : 'Refresh'}</Text>
              <Ionicons name={isLoading ? "refresh" : "chevron-forward"} size={16} color="#8B5CF6" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.statsGrid}>
            <StatCard 
              title="Total Messes" 
              value={pagination.totalElements?.toString() || "0"} 
              subtitle="Active messes"
              icon="business" 
              color="#8B5CF6"
              trend="+3 this month"
              onPress={() => navigateToScreen('MessManagement')}
            />
            <StatCard 
              title="Total Users" 
              value="1,247" 
              subtitle="Across all messes"
              icon="people" 
              color="#4299E1"
              trend="+89 this week"
              onPress={() => navigateToScreen('UserManagement')}
            />
            <StatCard 
              title="Total Revenue" 
              value="₹12.4L" 
              subtitle="This month"
              icon="trending-up" 
              color="#48BB78"
              trend="+15% vs last month"
              onPress={() => navigateToScreen('FinancialControl')}
            />
            <StatCard 
              title="Pending Approvals" 
              value="7" 
              subtitle="New mess requests"
              icon="time" 
              color="#F56565"
              onPress={() => navigateToScreen('MessManagement')}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsList}>
            <QuickActionButton 
              title="Approve New Mess" 
              description="Review and approve pending mess applications"
              icon="checkmark-circle" 
              color="#48BB78"
              onPress={() => navigateToScreen('MessManagement')}
            />
            <QuickActionButton 
              title="Create Admin Account" 
              description="Set up new mess admin credentials"
              icon="person-add" 
              color="#4299E1"
              onPress={() => navigateToScreen('UserManagement')}
            />
            <QuickActionButton 
              title="Broadcast Message" 
              description="Send notice to all messes and users"
              icon="megaphone" 
              color="#F56565"
              onPress={() => navigateToScreen('SystemOperations')}
            />
            <QuickActionButton 
              title="Generate Report" 
              color="#9F7AEA"
              description="Export system-wide analytics and data"
              icon="document-text" 
              onPress={() => navigateToScreen('Reports')}
            />
          </View>
        </View>

        {/* Mess & Admin Management */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Mess & Admin Management</Text>
          <View style={styles.featuresGrid}>
            <FeatureCard 
              title="Admin Onboarding"
              description="Approve/reject mess owners before they go live"
              icon="person-check" 
              color="#48BB78"
              onPress={() => navigateToScreen('MessManagement')}
              badge="7"
            />
            <FeatureCard 
              title="Admin Credentials"
              description="Create login IDs and assign roles (owner, manager, staff)"
              icon="key" 
              color="#4299E1"
              onPress={() => navigateToScreen('UserManagement')}
            />
            <FeatureCard 
              title="Mess Performance"
              description="Track total customers enrolled by each mess"
              icon="analytics" 
              color="#9F7AEA"
              onPress={() => navigateToScreen('Reports')}
            />
            <FeatureCard 
              title="Quality Monitoring"
              description="Track feedback/complaints and auto-flag poor service"
              icon="star" 
              color="#ED8936"
              onPress={() => navigateToScreen('Reports')}
              badge="3"
            />
          </View>
        </View>

        {/* Customer & User Oversight */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Customer & User Oversight</Text>
          <View style={styles.featuresGrid}>
            <FeatureCard 
              title="Global User Directory"
              description="See all registered users across all messes"
              icon="people-circle" 
              color="#4299E1"
              onPress={() => navigateToScreen('UserManagement')}
            />
            <FeatureCard 
              title="Subscription History"
              description="Track user subscription patterns and history"
              icon="calendar" 
              color="#48BB78"
              onPress={() => navigateToScreen('UserManagement')}
            />
            <FeatureCard 
              title="Expiry Alerts"
              description="Notify admins about platform subscription expiry"
              icon="warning" 
              color="#F56565"
              onPress={() => navigateToScreen('SystemOperations')}
              badge="5"
            />
          </View>
        </View>

        {/* Financial Control */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Financial Control</Text>
          <View style={styles.featuresGrid}>
            <FeatureCard 
              title="Revenue Dashboard"
              description="Total revenue and breakdown per mess"
              icon="trending-up" 
              color="#48BB78"
              onPress={() => navigateToScreen('FinancialControl')}
            />
            <FeatureCard 
              title="Payment Tracking"
              description="Monitor all transactions across the platform"
              icon="card" 
              color="#4299E1"
              onPress={() => navigateToScreen('FinancialControl')}
            />
            <FeatureCard 
              title="Tax Reports"
              description="Generate financial reports for tax filing"
              icon="document-text" 
              color="#9F7AEA"
              onPress={() => navigateToScreen('Reports')}
            />
          </View>
        </View>

        {/* System Operations */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>System Operations</Text>
          <View style={styles.featuresGrid}>
            <FeatureCard 
              title="Subscription Templates"
              description="Create global subscription models for all messes"
              icon="layers" 
              color="#8B5CF6"
              onPress={() => navigateToScreen('SystemOperations')}
            />
            <FeatureCard 
              title="Content Management"
              description="Broadcast messages across all messes"
              icon="megaphone" 
              color="#F56565"
              onPress={() => navigateToScreen('SystemOperations')}
            />
            <FeatureCard 
              title="Support Tickets"
              description="Manage and resolve user/admin issues"
              icon="help-circle" 
              color="#ED8936"
              onPress={() => navigateToScreen('SystemOperations')}
              badge="12"
            />
            <FeatureCard 
              title="Team Management"
              description="Add sub-superadmins and moderators"
              icon="people" 
              color="#4299E1"
              onPress={() => navigateToScreen('UserManagement')}
            />
            <FeatureCard 
              title="Notification Control"
              description="Manage push notifications and SMS templates"
              icon="notifications" 
              color="#9F7AEA"
              onPress={() => navigateToScreen('SystemOperations')}
            />
            <FeatureCard 
              title="Custom Branding"
              description="Change app logo, theme colors, slogans"
              icon="color-palette" 
              color="#38B2AC"
              onPress={() => navigateToScreen('SystemOperations')}
            />
          </View>
        </View>

        {/* Data & Backup */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Data & Backup</Text>
          <View style={styles.featuresGrid}>
            <FeatureCard 
              title="Data Export"
              description="Export all data to Excel/CSV for audits"
              icon="download" 
              color="#48BB78"
              onPress={() => navigateToScreen('Reports')}
            />
            <FeatureCard 
              title="System Backup"
              description="Automated backup and restore functionality"
              icon="cloud-upload" 
              color="#4299E1"
              onPress={() => navigateToScreen('SystemOperations')}
            />
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
              <Ionicons name="chevron-forward" size={16} color="#8B5CF6" />
            </TouchableOpacity>
          </View>
          
          {/* Recent Mess Approvals */}
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Ionicons name="business" size={20} color="#8B5CF6" />
              <Text style={styles.tableTitle}>Recent Mess Approvals</Text>
            </View>
            {messList && messList.length > 0 ? (
              messList.slice(0, 3).map((mess, index) => (
                <TableRow 
                  key={mess.id || index}
                  label={mess.name || mess.messName || 'Unknown Mess'} 
                  value={mess.status || 'Active'} 
                  status={mess.status || 'Active'} 
                  time={mess.createdAt ? new Date(mess.createdAt).toLocaleDateString() : 'Recently'} 
                  mess={mess.address || mess.location || 'Unknown Location'} 
                />
              ))
            ) : (
              <TableRow label="No mess data available" value="Loading..." status="Pending" time="Please wait" mess="System" />
            )}
          </View>

          {/* Recent Admin Activities */}
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Ionicons name="person" size={20} color="#8B5CF6" />
              <Text style={styles.tableTitle}>Recent Admin Activities</Text>
            </View>
            <TableRow label="Rahul Kumar" value="New Admin Created" time="1 hour ago" mess="Delhi Mess" />
            <TableRow label="Priya Singh" value="Role Updated" time="3 hours ago" mess="Mumbai Mess" />
            <TableRow label="Amit Patel" value="Login Credentials" time="5 hours ago" mess="Bangalore Mess" />
          </View>
        </View>

        {/* System Analytics */}
        <View style={styles.analyticsSection}>
          <Text style={styles.sectionTitle}>System Analytics</Text>
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Platform Growth Overview</Text>
              <Text style={styles.chartSubtitle}>Monthly performance metrics</Text>
            </View>
            <View style={styles.chartPlaceholder}>
              <Ionicons name="bar-chart" size={48} color="#CBD5E0" />
              <Text style={styles.chartPlaceholderText}>Advanced analytics dashboard will be displayed here</Text>
              <Text style={styles.chartPlaceholderSubtext}>Real-time metrics, growth trends, and performance insights</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SuperAdminLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  header: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 20,
    paddingBottom: 16,
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
    marginBottom: 16,
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
  systemName: {
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
  searchSection: {
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2D3748',
  },
  searchButton: {
    padding: 8,
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
    color: '#8B5CF6',
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
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
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
  tableMess: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '500',
    marginBottom: 2,
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
});
