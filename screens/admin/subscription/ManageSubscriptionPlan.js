import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import adminService from '../../../api/adminService';
import { ADMIN_COLORS } from '../../../config/colors';

export default function SubscriptionPlanManagement({ navigation }) {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [deletingPlanId, setDeletingPlanId] = useState(null);
    const [plans, setPlans] = useState([]);

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            console.log('Loading subscription plans...');
            const response = await adminService.getSubscriptionPlans();
            console.log('API Response:', response);

            if (response.type === 'success') {
                const plansData = Array.isArray(response.data) ? response.data : (response.data || []);
                setPlans(plansData);
                console.log('Loaded plans:', plansData);
            } else {
                console.log('API Error:', response.message);
                Alert.alert('Error', response.message || 'Failed to load subscription plans');
                setPlans([]);
            }
        } catch (error) {
            console.error('Error loading plans:', error);
            Alert.alert('Error', 'Failed to load subscription plans');
            setPlans([]);
        } finally {
            if (isRefresh) {
                setRefreshing(false);
            } else {
                setLoading(false);
            }
        }
    };

    const onRefresh = () => {
        loadPlans(true);
    };

    const handleCreatePlan = () => {
        navigation.navigate('CreateSubscription');
    };


    const handleEditPlan = (plan) => {
        navigation.navigate('EditSubscriptionPlan', { plan });
    };

    const handleTogglePlanStatus = async (plan) => {
        try {
            const updatedPlan = { ...plan, active: !plan.active };
            const response = await adminService.updateSubscriptionPlan(plan.id, updatedPlan);

            if (response.type === 'success') {
                const updatedPlanData = response.data;
                setPlans(prev => prev.map(p =>
                    p.id === plan.id ? updatedPlanData : p
                ));
                Alert.alert('Success', `Plan ${updatedPlanData.active ? 'activated' : 'deactivated'} successfully`);
            } else {
                Alert.alert('Error', response.message || 'Failed to update plan status');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to update plan status');
        }
    };

    const handleDeletePlan = (plan) => {
        Alert.alert(
            'Delete Plan',
            `Are you sure you want to delete "${plan.name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setDeletingPlanId(plan.id);
                        try {
                            console.log('Deleting plan:', plan.id);
                            const response = await adminService.deleteSubscriptionPlan(plan.id);
                            console.log('Delete response:', response);

                            if (response.type === 'success') {
                                // Remove from local state immediately for fast UI update
                                setPlans(prev => prev.filter(p => p.id !== plan.id));

                                // Show success message
                                Alert.alert('Success', 'Plan deleted successfully');

                                // Refresh the list from server immediately
                                loadPlans(true);
                            } else {
                                Alert.alert('Error', response.message || 'Failed to delete plan');
                            }
                        } catch (error) {
                            console.error('Delete error:', error);
                            Alert.alert('Error', 'Failed to delete plan: ' + error.message);
                        } finally {
                            setDeletingPlanId(null);
                        }
                    }
                }
            ]
        );
    };

    const renderPlanCard = ({ item }) => (
        <View style={styles.planCard}>
            <View style={styles.planHeader}>
                <View style={styles.planTitleContainer}>
                    <Text style={styles.planName}>{item.name}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: item.active ? '#10B981' : '#EF4444' }]}>
                        <Text style={styles.statusText}>{item.active ? 'Active' : 'Inactive'}</Text>
                    </View>
                </View>
                <View style={styles.planActions}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.editButton]}
                        onPress={() => handleEditPlan(item)}
                    >
                        <Ionicons name="pencil" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.toggleButton]}
                        onPress={() => handleTogglePlanStatus(item)}
                    >
                        <Ionicons name={item.active ? "pause" : "play"} size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton, deletingPlanId === item.id && styles.buttonDisabled]}
                        onPress={() => handleDeletePlan(item)}
                        disabled={deletingPlanId === item.id}
                    >
                        {deletingPlanId === item.id ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Ionicons name="trash" size={16} color="#FFFFFF" />
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            <Text style={styles.planDescription}>{item.description}</Text>

            <View style={styles.planDetails}>
                <View style={styles.detailRow}>
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Price</Text>
                        <Text style={styles.detailValue}>₹{item.price.toLocaleString()}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Meal Credits</Text>
                        <Text style={styles.detailValue}>{item.totalMealCredits}</Text>
                    </View>
                </View>
                <View style={styles.detailRow}>
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Duration</Text>
                        <Text style={styles.detailValue}>{item.durationInDays} days</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Extra Days</Text>
                        <Text style={styles.detailValue}>{item.extraDays}</Text>
                    </View>
                </View>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={ADMIN_COLORS.primary} />
                <Text style={styles.loadingText}>Loading subscription plans...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.contentHeader}>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Manage Subscription Plans</Text>
                    <Text style={styles.headerSubtitle}>Create and manage meal subscription plans for your customers</Text>
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity
                        style={styles.refreshButton}
                        onPress={() => loadPlans(true)}
                    >
                        <Ionicons name="refresh" size={20} color={ADMIN_COLORS.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.createButton}
                        onPress={handleCreatePlan}
                    >
                        <Ionicons name="add" size={20} color="#FFFFFF" />
                        <Text style={styles.createButtonText}>Create Plan</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                data={plans}
                keyExtractor={(item) => item.id}
                renderItem={renderPlanCard}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[ADMIN_COLORS.primary]}
                        tintColor={ADMIN_COLORS.primary}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="card-outline" size={64} color="#CBD5E0" />
                        <Text style={styles.emptyTitle}>No Plans Found</Text>
                        <Text style={styles.emptySubtitle}>Create your first subscription plan to get started</Text>
                        <TouchableOpacity
                            style={styles.emptyButton}
                            onPress={handleCreatePlan}
                        >
                            <Text style={styles.emptyButtonText}>Create Plan</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ADMIN_COLORS.surface,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: ADMIN_COLORS.surface,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: ADMIN_COLORS.primary,
    },
    contentHeader: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    headerContent: {
        flex: 1,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#6B7280',
    },
    createButton: {
        backgroundColor: ADMIN_COLORS.primary,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    createButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    refreshButton: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
    },
    listContainer: {
        padding: 20,
    },
    planCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    planHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    planTitleContainer: {
        flex: 1,
        marginRight: 12,
    },
    planName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 8,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    planActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editButton: {
        backgroundColor: '#3B82F6',
    },
    toggleButton: {
        backgroundColor: '#10B981',
    },
    deleteButton: {
        backgroundColor: '#EF4444',
    },
    buttonDisabled: {
        backgroundColor: '#9CA3AF',
        opacity: 0.6,
    },
    planDescription: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
        marginBottom: 16,
    },
    planDetails: {
        gap: 12,
    },
    detailRow: {
        flexDirection: 'row',
        gap: 16,
    },
    detailItem: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 12,
        color: '#9CA3AF',
        marginBottom: 4,
        fontWeight: '500',
    },
    detailValue: {
        fontSize: 16,
        color: '#1F2937',
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#6B7280',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
        marginBottom: 20,
    },
    emptyButton: {
        backgroundColor: ADMIN_COLORS.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    emptyButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

