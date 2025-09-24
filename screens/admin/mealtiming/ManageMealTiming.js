import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import adminService from '../../../api/adminService';
import AppAlert from '../../../components/common/AppAlert';
import { classifyError, extractErrorMessage } from '../../../components/common/alertUtils';
import { ADMIN_COLORS } from '../../../config/colors';

export default function ManageMealTiming({ navigation }) {
    const [loading, setLoading] = useState(true);
    const [timings, setTimings] = useState([]);
    const [alertState, setAlertState] = useState({ visible: false, type: 'info', title: '', message: '' });
    const showAlert = (type, title, message) => setAlertState({ visible: true, type, title, message: String(message || '') });

    const loadTimings = async () => {
        try {
            setLoading(true);
            const resp = await adminService.getAllMealTimings();
            if (resp.type === 'success') {
                setTimings(resp.data || []);
            } else {
                const msg = extractErrorMessage(resp, 'Failed to load meal timings');
                showAlert(classifyError(resp), 'Error', msg);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', loadTimings);
        return unsubscribe;
    }, [navigation]);

    return (
        <>
            <View style={styles.container}>
                <View style={styles.contentHeader}>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>Manage Meal Timings</Text>
                        <Text style={styles.headerSubtitle}>Create and manage meal serving windows</Text>
                    </View>
                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.refreshButton} onPress={() => loadTimings()}>
                            <Ionicons name="refresh" size={20} color={ADMIN_COLORS.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.createButton} onPress={() => navigation.navigate('CreateMealTiming')}>
                            <Ionicons name="add" size={20} color="#FFFFFF" />
                            <Text style={styles.createButtonText}>Create Meal Time</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <FlatList
                    data={timings}
                    keyExtractor={(item) => item.id}
                    refreshing={loading}
                    onRefresh={loadTimings}
                    contentContainerStyle={{ padding: 16 }}
                    ListEmptyComponent={!loading ? (
                        <View style={{ alignItems: 'center', paddingVertical: 60 }}>
                            <Ionicons name="time-outline" size={48} color="#CBD5E0" />
                            <Text style={{ color: '#718096', marginTop: 8 }}>No meal timings yet</Text>
                        </View>
                    ) : null}
                    renderItem={({ item }) => (
                        <View style={[styles.card, !item.active && { opacity: 0.6 }]}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={styles.cardTitle}>{item.name}</Text>
                                <View style={[styles.badge, { backgroundColor: item.active ? '#10B981' : '#EF4444' }]}>
                                    <Text style={styles.badgeText}>{item.active ? 'Active' : 'Inactive'}</Text>
                                </View>
                            </View>
                            <Text style={styles.cardSubtitle}>{item.startTime} - {item.endTime}</Text>
                        </View>
                    )}
                />
            </View>
            <AppAlert
                visible={alertState.visible}
                type={alertState.type}
                title={alertState.title}
                message={alertState.message}
                confirmText={'Done'}
                onConfirm={() => setAlertState({ visible: false, type: 'info', title: '', message: '' })}
                onRequestClose={() => setAlertState({ visible: false, type: 'info', title: '', message: '' })}
            />
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: ADMIN_COLORS.surface },
    contentHeader: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerContent: { flex: 1 },
    headerTitle: { fontSize: 20, fontWeight: '700', color: ADMIN_COLORS.text },
    headerSubtitle: { fontSize: 12, color: '#718096', marginTop: 4 },
    headerActions: { flexDirection: 'row', gap: 10, marginLeft: 12 },
    refreshButton: { backgroundColor: '#F3F4F6', borderRadius: 8, padding: 10 },
    createButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: ADMIN_COLORS.primary, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
    createButtonText: { color: '#FFFFFF', fontWeight: '700' },
    card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', elevation: 2 },
    cardTitle: { fontSize: 16, fontWeight: '800', color: ADMIN_COLORS.text },
    cardSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 6 },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
    badgeText: { color: '#fff', fontWeight: '800', fontSize: 12 },
});


