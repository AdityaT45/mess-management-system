// src/screens/user/CustomerDashboard.js
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    Modal,
    RefreshControl,
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
import customerDashboardService from '../../api/customerDashboardService';
import CUSTOMER_COLORS from '../../config/colors';
import { logout } from '../../store/slices/authSlice';

const { width } = Dimensions.get('window');

export default function CustomerDashboard({ navigation }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [lastRefresh, setLastRefresh] = useState(new Date());
    const [customerData, setCustomerData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [feedback, setFeedback] = useState({
        rating: 5,
        taste: '',
        hygiene: '',
        service: '',
        comments: ''
    });
    const [showAttendanceModal, setShowAttendanceModal] = useState(false);
    const [attendanceCode, setAttendanceCode] = useState('');

    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const insets = useSafeAreaInsets();

    // Handle logout
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

    // Load customer data
    const loadCustomerData = async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            // Try to fetch from API first, fallback to mock data
            const response = await customerDashboardService.getDashboardData();

            if (response.type === 'success' && response.data) {
                setCustomerData(response.data);
            } else {
                // Fallback to mock data if API fails
                const mockCustomerData = {
                    id: '68caa68ac5f59f788d09c336',
                    name: 'Rohit Kumar',
                    email: user?.email || 'rohit@example.com',
                    phoneNumber: '+91 9876543210',
                    messName: 'College Katta Mess',
                    messLogo: '🍽️',
                    plan: 'Monthly Lunch',
                    startDate: '2025-01-01',
                    endDate: '2025-01-31',
                    mealPreference: 'Veg',
                    status: 'Active',
                    planPrice: '₹1,200',
                    lastPayment: '2025-01-01',
                    paymentStatus: 'Paid',
                    attendanceThisMonth: 15,
                    totalDaysThisMonth: 20,
                    nextEligibleMeal: 'Lunch',
                    todayMenu: {
                        breakfast: 'Poha, Tea, Biscuits',
                        lunch: 'Dal, Rice, Roti, Sabzi',
                        dinner: 'Khichdi, Curd, Pickle'
                    },
                    notifications: [
                        {
                            id: 1,
                            title: 'Special Meal Tomorrow',
                            message: 'Biryani will be served tomorrow for lunch',
                            time: '2 hours ago',
                            type: 'info'
                        },
                        {
                            id: 2,
                            title: 'Payment Due',
                            message: 'Your monthly payment is due in 3 days',
                            time: '1 day ago',
                            type: 'warning'
                        }
                    ]
                };
                setCustomerData(mockCustomerData);
            }

            setLastRefresh(new Date());
        } catch (error) {
            console.error('💥 CustomerDashboard - Error loading data:', error);
            Alert.alert('Error', 'Failed to load customer data');
        }

        if (isRefresh) {
            setRefreshing(false);
        } else {
            setLoading(false);
        }
    };

    // Pull to refresh handler
    const onRefresh = () => {
        loadCustomerData(true);
    };

    // Mark attendance
    const markAttendance = async () => {
        if (!attendanceCode.trim()) {
            Alert.alert('Error', 'Please enter attendance code');
            return;
        }

        try {
            const response = await customerDashboardService.markAttendance(attendanceCode);

            if (response.type === 'success') {
                Alert.alert('Success', 'Attendance marked successfully!');
                setShowAttendanceModal(false);
                setAttendanceCode('');

                // Update attendance count
                if (customerData) {
                    setCustomerData({
                        ...customerData,
                        attendanceThisMonth: customerData.attendanceThisMonth + 1
                    });
                }
            } else {
                Alert.alert('Error', response.message || 'Failed to mark attendance');
            }
        } catch (error) {
            console.error('💥 CustomerDashboard - Error marking attendance:', error);
            Alert.alert('Error', 'Failed to mark attendance');
        }
    };

    // Submit feedback
    const submitFeedback = async () => {
        if (!feedback.comments.trim()) {
            Alert.alert('Error', 'Please provide feedback comments');
            return;
        }

        try {
            const response = await customerDashboardService.submitFeedback(feedback);

            if (response.type === 'success') {
                Alert.alert('Success', 'Thank you for your feedback!');
                setShowFeedbackModal(false);
                setFeedback({
                    rating: 5,
                    taste: '',
                    hygiene: '',
                    service: '',
                    comments: ''
                });
            } else {
                Alert.alert('Error', response.message || 'Failed to submit feedback');
            }
        } catch (error) {
            console.error('💥 CustomerDashboard - Error submitting feedback:', error);
            Alert.alert('Error', 'Failed to submit feedback');
        }
    };

    // Calculate attendance percentage
    const getAttendancePercentage = () => {
        if (!customerData) return 0;
        return Math.round((customerData.attendanceThisMonth / customerData.totalDaysThisMonth) * 100);
    };

    // Get days until renewal
    const getDaysUntilRenewal = () => {
        if (!customerData) return 0;
        const endDate = new Date(customerData.endDate);
        const today = new Date();
        const diffTime = endDate - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    // Load data on component mount
    useEffect(() => {
        loadCustomerData();
    }, []);

    const StatCard = ({ title, value, icon, color, onPress, subtitle, progress }) => (
        <TouchableOpacity style={styles.statCard} onPress={onPress}>
            <View style={styles.statHeader}>
                <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>
                    <Ionicons name={icon} size={24} color={color} />
                </View>
                {progress !== undefined && (
                    <View style={styles.progressContainer}>
                        <Text style={styles.progressText}>{progress}%</Text>
                    </View>
                )}
            </View>
            <View style={styles.statContent}>
                <Text style={styles.statValue}>{value}</Text>
                <Text style={styles.statTitle}>{title}</Text>
                {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
                {progress !== undefined && (
                    <View style={styles.progressBarContainer}>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: `${progress}%` }]} />
                        </View>
                    </View>
                )}
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

    const NotificationCard = ({ notification }) => (
        <View style={[styles.notificationCard, { borderLeftColor: notification.type === 'warning' ? '#F56565' : '#4299E1' }]}>
            <View style={styles.notificationHeader}>
                <Text style={styles.notificationTitle}>{notification.title}</Text>
                <Text style={styles.notificationTime}>{notification.time}</Text>
            </View>
            <Text style={styles.notificationMessage}>{notification.message}</Text>
        </View>
    );

    const MenuCard = ({ meal, items }) => (
        <View style={styles.menuCard}>
            <View style={styles.menuHeader}>
                <Ionicons name="restaurant" size={20} color="#FF6B35" />
                <Text style={styles.menuTitle}>{meal}</Text>
            </View>
            <Text style={styles.menuItems}>{items}</Text>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading your dashboard...</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="light-content" backgroundColor={CUSTOMER_COLORS.primary} />




            {/* Sidebar */}
            {sidebarOpen && (
                <View style={[styles.sidebar, { paddingTop: insets.top }]}>
                    <View style={styles.sidebarHeader}>
                        <Text style={styles.sidebarTitle}>Customer Menu</Text>
                        <Text style={styles.sidebarSubtitle}>{user?.email || 'customer@mess.com'}</Text>
                    </View>

                    <View style={styles.sidebarMenu}>
                        <TouchableOpacity
                            style={[styles.sidebarItem, { backgroundColor: '#FFF1EC' }]}
                            onPress={() => setSidebarOpen(false)}
                        >
                            <Ionicons name="home" size={20} color="#FF6B35" />
                            <Text style={[styles.sidebarText, { color: '#FF6B35' }]}>Dashboard</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.sidebarItem}
                            onPress={() => setSidebarOpen(false)}
                        >
                            <Ionicons name="calendar" size={20} color="#718096" />
                            <Text style={styles.sidebarText}>Attendance</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.sidebarItem}
                            onPress={() => setSidebarOpen(false)}
                        >
                            <Ionicons name="card" size={20} color="#718096" />
                            <Text style={styles.sidebarText}>Payments</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.sidebarItem}
                            onPress={() => setSidebarOpen(false)}
                        >
                            <Ionicons name="restaurant" size={20} color="#718096" />
                            <Text style={styles.sidebarText}>Menu</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.sidebarItem}
                            onPress={() => setSidebarOpen(false)}
                        >
                            <Ionicons name="chatbubble" size={20} color="#718096" />
                            <Text style={styles.sidebarText}>Feedback</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.sidebarItem}
                            onPress={() => setSidebarOpen(false)}
                        >
                            <Ionicons name="document-text" size={20} color="#718096" />
                            <Text style={styles.sidebarText}>History</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.sidebarItem, styles.logoutItem]}
                            onPress={handleLogout}
                        >
                            <Ionicons name="log-out" size={20} color="#F56565" />
                            <Text style={[styles.sidebarText, { color: '#F56565' }]}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Main Content */}
            <ScrollView
                style={styles.mainContent}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
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
            >
                {/* Welcome Section */}
                <View style={styles.welcomeSection}>
                    <View style={styles.welcomeHeader}>
                        <View style={styles.profileSection}>
                            <View style={styles.profileAvatar}>
                                <Text style={styles.profileAvatarText}>
                                    {customerData?.name?.charAt(0) || 'R'}
                                </Text>
                            </View>
                            <View style={styles.welcomeTextContainer}>
                                <Text style={styles.welcomeText}>Welcome,</Text>
                                <Text style={styles.customerName}>{customerData?.name || 'Customer'} 👋</Text>
                            </View>
                        </View>
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>{customerData?.status || 'Active'}</Text>
                        </View>
                    </View>
                    {lastRefresh && (
                        <Text style={styles.lastRefreshText}>
                            Last updated: {lastRefresh.toLocaleTimeString()}
                        </Text>
                    )}
                </View>

                {/* Renewal Reminder */}
                {getDaysUntilRenewal() <= 5 && (
                    <View style={styles.renewalBanner}>
                        <View style={styles.renewalContent}>
                            <Ionicons name="warning" size={24} color="#FFFFFF" />
                            <View style={styles.renewalTextContainer}>
                                <Text style={styles.renewalTitle}>
                                    Your plan ends in {getDaysUntilRenewal()} days
                                </Text>
                                <Text style={styles.renewalSubtitle}>Renew now & save 5%</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.renewalButton}>
                            <Text style={styles.renewalButtonText}>Renew Now</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Active Subscription Info */}
                <View style={styles.subscriptionSection}>
                    <Text style={styles.sectionTitle}>Active Subscription</Text>
                    <View style={styles.subscriptionCard}>
                        <View style={styles.subscriptionHeader}>
                            <View style={styles.messInfo}>
                                <Text style={styles.messLogo}>{customerData?.messLogo || '🍽️'}</Text>
                                <View>
                                    <Text style={styles.messName}>{customerData?.messName || 'College Katta Mess'}</Text>
                                    <Text style={styles.planType}>{customerData?.plan || 'Monthly Lunch'}</Text>
                                </View>
                            </View>
                            <View style={styles.subscriptionStatus}>
                                <Text style={styles.planPrice}>{customerData?.planPrice || '₹1,200'}</Text>
                                <Text style={styles.planDuration}>
                                    {customerData?.startDate || '2025-01-01'} → {customerData?.endDate || '2025-01-31'}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.subscriptionDetails}>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Meal Preference:</Text>
                                <Text style={styles.detailValue}>{customerData?.mealPreference || 'Veg'}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Last Payment:</Text>
                                <Text style={[styles.detailValue, { color: '#48BB78' }]}>
                                    {customerData?.paymentStatus || 'Paid'} on {customerData?.lastPayment || '2025-01-01'}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.upgradeButton}>
                            <Text style={styles.upgradeButtonText}>Renew / Upgrade Plan</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Daily Meals Overview */}
                <View style={styles.mealsSection}>
                    <Text style={styles.sectionTitle}>Today's Menu 🍲</Text>
                    {customerData?.todayMenu && (
                        <View style={styles.menuContainer}>
                            <MenuCard meal="Breakfast" items={customerData.todayMenu.breakfast} />
                            <MenuCard meal="Lunch" items={customerData.todayMenu.lunch} />
                            <MenuCard meal="Dinner" items={customerData.todayMenu.dinner} />
                        </View>
                    )}
                    <View style={styles.mealTiming}>
                        <Ionicons name="time" size={16} color="#718096" />
                        <Text style={styles.mealTimingText}>
                            Next meal: {customerData?.nextEligibleMeal || 'Lunch'} at 12:30 PM
                        </Text>
                    </View>
                </View>

                {/* Attendance & Check-ins */}
                <View style={styles.attendanceSection}>
                    <Text style={styles.sectionTitle}>Attendance & Check-ins</Text>
                    <View style={styles.attendanceGrid}>
                        <StatCard
                            title="This Month"
                            value={`${customerData?.attendanceThisMonth || 15}/${customerData?.totalDaysThisMonth || 20}`}
                            subtitle="Days attended"
                            icon="calendar"
                            color="#48BB78"
                            progress={getAttendancePercentage()}
                        />
                        <StatCard
                            title="Next Meal"
                            value={customerData?.nextEligibleMeal || 'Lunch'}
                            subtitle="Eligible for"
                            icon="restaurant"
                            color="#FF6B35"
                        />
                    </View>
                    <TouchableOpacity
                        style={styles.attendanceButton}
                        onPress={() => setShowAttendanceModal(true)}
                    >
                        <Ionicons name="qr-code" size={20} color="#FFFFFF" />
                        <Text style={styles.attendanceButtonText}>Mark Attendance</Text>
                    </TouchableOpacity>
                </View>

                {/* Payment Section */}
                <View style={styles.paymentSection}>
                    <Text style={styles.sectionTitle}>Payment Information</Text>
                    <View style={styles.paymentCard}>
                        <View style={styles.paymentRow}>
                            <Text style={styles.paymentLabel}>Current Plan Price:</Text>
                            <Text style={styles.paymentValue}>{customerData?.planPrice || '₹1,200'}</Text>
                        </View>
                        <View style={styles.paymentRow}>
                            <Text style={styles.paymentLabel}>Last Payment:</Text>
                            <Text style={[styles.paymentValue, { color: '#48BB78' }]}>
                                {customerData?.paymentStatus || 'Paid'} on {customerData?.lastPayment || '2025-01-01'}
                            </Text>
                        </View>
                        <View style={styles.paymentActions}>
                            <TouchableOpacity style={styles.paymentButton}>
                                <Ionicons name="download" size={16} color="#4299E1" />
                                <Text style={styles.paymentButtonText}>Download Invoice</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.paymentButton, styles.payNowButton]}>
                                <Ionicons name="card" size={16} color="#FFFFFF" />
                                <Text style={[styles.paymentButtonText, { color: '#FFFFFF' }]}>Pay Now</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Notifications & Announcements */}
                <View style={styles.notificationsSection}>
                    <Text style={styles.sectionTitle}>Notifications & Announcements</Text>
                    {customerData?.notifications?.map((notification) => (
                        <NotificationCard key={notification.id} notification={notification} />
                    ))}
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActionsSection}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.quickActionsList}>
                        <QuickActionButton
                            title="Add New Subscription"
                            description="Subscribe to a new plan"
                            icon="add-circle"
                            color="#48BB78"
                            onPress={() => Alert.alert('Add Subscription', 'Contact your mess admin to add a new subscription!')}
                        />
                        <QuickActionButton
                            title="Pay Now"
                            description="Make payment online"
                            icon="card"
                            color="#F56565"
                            onPress={() => Alert.alert('Pay Now', 'Payment feature coming soon!')}
                        />
                        <QuickActionButton
                            title="View Menu"
                            description="See weekly meal plan"
                            icon="restaurant"
                            color="#FF6B35"
                            onPress={() => Alert.alert('View Menu', 'Menu feature coming soon!')}
                        />
                        <QuickActionButton
                            title="Give Feedback"
                            description="Rate today's meal"
                            icon="star"
                            color="#9F7AEA"
                            onPress={() => setShowFeedbackModal(true)}
                        />
                    </View>
                </View>

                {/* History & Reports */}
                <View style={styles.historySection}>
                    <Text style={styles.sectionTitle}>History & Reports</Text>
                    <View style={styles.historyGrid}>
                        <TouchableOpacity style={styles.historyCard}>
                            <Ionicons name="calendar" size={24} color="#4299E1" />
                            <Text style={styles.historyTitle}>Attendance Records</Text>
                            <Text style={styles.historySubtitle}>View past attendance</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.historyCard}>
                            <Ionicons name="card" size={24} color="#48BB78" />
                            <Text style={styles.historyTitle}>Payment History</Text>
                            <Text style={styles.historySubtitle}>All transactions</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.historyCard}>
                            <Ionicons name="chatbubble" size={24} color="#F56565" />
                            <Text style={styles.historyTitle}>Feedback History</Text>
                            <Text style={styles.historySubtitle}>Your reviews</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.historyCard}>
                            <Ionicons name="document-text" size={24} color="#9F7AEA" />
                            <Text style={styles.historyTitle}>Reports</Text>
                            <Text style={styles.historySubtitle}>Download reports</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Attendance Modal */}
            <Modal
                visible={showAttendanceModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowAttendanceModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Mark Attendance</Text>
                            <TouchableOpacity onPress={() => setShowAttendanceModal(false)}>
                                <Ionicons name="close" size={24} color="#718096" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalDescription}>
                                Enter the attendance code provided by your mess admin:
                            </Text>
                            <TextInput
                                style={styles.codeInput}
                                value={attendanceCode}
                                onChangeText={setAttendanceCode}
                                placeholder="Enter attendance code"
                                autoCapitalize="characters"
                            />
                            <TouchableOpacity style={styles.submitButton} onPress={markAttendance}>
                                <Text style={styles.submitButtonText}>Mark Attendance</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Feedback Modal */}
            <Modal
                visible={showFeedbackModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowFeedbackModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Rate Today's Meal</Text>
                            <TouchableOpacity onPress={() => setShowFeedbackModal(false)}>
                                <Ionicons name="close" size={24} color="#718096" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalContent}>
                            <View style={styles.ratingContainer}>
                                <Text style={styles.ratingLabel}>Overall Rating:</Text>
                                <View style={styles.starsContainer}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <TouchableOpacity
                                            key={star}
                                            onPress={() => setFeedback({ ...feedback, rating: star })}
                                        >
                                            <Ionicons
                                                name={star <= feedback.rating ? "star" : "star-outline"}
                                                size={30}
                                                color="#FFD700"
                                            />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <TextInput
                                style={styles.feedbackInput}
                                value={feedback.comments}
                                onChangeText={(text) => setFeedback({ ...feedback, comments: text })}
                                placeholder="Share your feedback about today's meal..."
                                multiline
                                numberOfLines={4}
                            />

                            <TouchableOpacity style={styles.submitButton} onPress={submitFeedback}>
                                <Text style={styles.submitButtonText}>Submit Feedback</Text>
                            </TouchableOpacity>
                        </ScrollView>
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
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F7FAFC',
    },
    loadingText: {
        fontSize: 16,
        color: '#718096',
    },
    header: {
        backgroundColor: '#FF6B35',
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
    headerTitle: {
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
    logoutItem: {
        marginTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        paddingTop: 20,
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
    welcomeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#FF6B35',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    profileAvatarText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    welcomeTextContainer: {
        flex: 1,
    },
    welcomeText: {
        fontSize: 14,
        color: '#718096',
        marginBottom: 4,
    },
    customerName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#2D3748',
    },
    statusBadge: {
        backgroundColor: '#48BB78',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    lastRefreshText: {
        fontSize: 12,
        color: '#718096',
        textAlign: 'right',
    },
    renewalBanner: {
        backgroundColor: '#F56565',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    renewalContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    renewalTextContainer: {
        marginLeft: 12,
        flex: 1,
    },
    renewalTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 2,
    },
    renewalSubtitle: {
        fontSize: 14,
        color: '#FFFFFF',
        opacity: 0.9,
    },
    renewalButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    renewalButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#2D3748',
        marginBottom: 16,
    },
    subscriptionSection: {
        marginBottom: 24,
    },
    subscriptionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    subscriptionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    messInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    messLogo: {
        fontSize: 32,
        marginRight: 12,
    },
    messName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2D3748',
        marginBottom: 4,
    },
    planType: {
        fontSize: 14,
        color: '#718096',
    },
    subscriptionStatus: {
        alignItems: 'flex-end',
    },
    planPrice: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FF6B35',
        marginBottom: 4,
    },
    planDuration: {
        fontSize: 12,
        color: '#718096',
    },
    subscriptionDetails: {
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    detailLabel: {
        fontSize: 14,
        color: '#718096',
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#2D3748',
    },
    upgradeButton: {
        backgroundColor: '#FF6B35',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    upgradeButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    mealsSection: {
        marginBottom: 24,
    },
    menuContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    menuCard: {
        marginBottom: 16,
    },
    menuHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2D3748',
        marginLeft: 8,
    },
    menuItems: {
        fontSize: 14,
        color: '#718096',
        marginLeft: 28,
    },
    mealTiming: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7FAFC',
        padding: 12,
        borderRadius: 8,
    },
    mealTimingText: {
        fontSize: 14,
        color: '#718096',
        marginLeft: 8,
    },
    attendanceSection: {
        marginBottom: 24,
    },
    attendanceGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    statCard: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
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
    progressContainer: {
        alignItems: 'flex-end',
    },
    progressText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#48BB78',
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
        marginBottom: 8,
    },
    progressBarContainer: {
        width: '100%',
    },
    progressBar: {
        height: 4,
        backgroundColor: '#E2E8F0',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#48BB78',
        borderRadius: 2,
    },
    attendanceButton: {
        backgroundColor: '#48BB78',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    attendanceButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        marginLeft: 8,
    },
    paymentSection: {
        marginBottom: 24,
    },
    paymentCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    paymentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    paymentLabel: {
        fontSize: 14,
        color: '#718096',
    },
    paymentValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#2D3748',
    },
    paymentActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    paymentButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    payNowButton: {
        backgroundColor: '#FF6B35',
        borderColor: '#FF6B35',
    },
    paymentButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#4299E1',
        marginLeft: 6,
    },
    notificationsSection: {
        marginBottom: 24,
    },
    notificationCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    notificationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2D3748',
    },
    notificationTime: {
        fontSize: 12,
        color: '#718096',
    },
    notificationMessage: {
        fontSize: 14,
        color: '#718096',
        lineHeight: 20,
    },
    quickActionsSection: {
        marginBottom: 24,
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
    historySection: {
        marginBottom: 24,
    },
    historyGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    historyCard: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    historyTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2D3748',
        marginTop: 12,
        marginBottom: 4,
        textAlign: 'center',
    },
    historySubtitle: {
        fontSize: 12,
        color: '#718096',
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        width: '90%',
        maxHeight: '80%',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
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
    modalContent: {
        padding: 20,
    },
    modalDescription: {
        fontSize: 14,
        color: '#718096',
        marginBottom: 16,
        lineHeight: 20,
    },
    codeInput: {
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        color: '#2D3748',
        backgroundColor: '#FFFFFF',
        marginBottom: 20,
    },
    ratingContainer: {
        marginBottom: 20,
    },
    ratingLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#2D3748',
        marginBottom: 12,
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    feedbackInput: {
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        color: '#2D3748',
        backgroundColor: '#FFFFFF',
        textAlignVertical: 'top',
        marginBottom: 20,
    },
    submitButton: {
        backgroundColor: '#FF6B35',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});
