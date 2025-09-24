import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import adminService from '../../../../api/adminService';
import { ADMIN_COLORS } from '../../../../config/colors';
import AssignCustomerCard from './components/AssignCustomerCard';

export default function ManageAssignSubscription({ navigation }) {
    const [expandedId, setExpandedId] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(5);
    const [status, setStatus] = useState(''); // '', 'ACTIVE', 'PAUSE', 'NONE', 'CANCEL', 'RESUME'

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, size, status]);

    const load = async () => {
        setLoading(true);
        const resp = await adminService.getDetailedCustomersForSubscription({ page, size, status });
        if (resp.type === 'success') {
            const content = Array.isArray(resp.data?.content) ? resp.data.content : Array.isArray(resp.data) ? resp.data : [];
            setItems(content);
        } else {
            setItems([]);
        }
        setLoading(false);
    };

    const getImageSource = (value) => {
        const v = value ? String(value) : '';
        if (!v) return null;
        if (v.startsWith('http') || v.startsWith('file://') || v.startsWith('content://') || v.startsWith('data:')) return { uri: v };
        return { uri: `data:image/jpeg;base64,${v}` };
    };

    const resolveProfileImage = (item) => {
        return (
            item.profileImage ||
            item.profilePic ||
            item.imageUrl ||
            item.image ||
            item.avatar ||
            item.photo ||
            item.profile ||
            ''
        );
    };

    const renderCard = (item) => {
        const isExpanded = expandedId === item.id;
        return (
            <AssignCustomerCard
                item={item}
                expanded={isExpanded}
                onToggle={() => setExpandedId(isExpanded ? null : item.id)}
            />
        );
    };

    const FILTERS = useMemo(() => ([
        { key: '', label: 'ALL' },
        { key: 'ACTIVE', label: 'ACTIVE' },
        { key: 'PAUSE', label: 'PAUSE' },
        { key: 'NONE', label: 'NONE' },
        { key: 'CANCEL', label: 'CANCELL' },
     
    ]), []);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Assigned Subscriptions</Text>
                <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('AssignSubscription')}>
                    <Ionicons name="add" size={18} color="#FFFFFF" />
                    <Text style={styles.primaryButtonText}>Assign Subscription</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.filterRow}>
                {FILTERS.map(f => (
                    <TouchableOpacity
                        key={f.key + f.label}
                        style={[styles.filterBtn, status === f.key && styles.filterBtnActive]}
                        onPress={() => { setStatus(f.key); setPage(0); }}
                    >
                        <Text style={[styles.filterText, status === f.key && styles.filterTextActive]}>{f.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? (
                <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                    <ActivityIndicator size="small" color={ADMIN_COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => renderCard({
                        id: item.id,
                        customerName: item.name,
                        phoneNumber: item.phoneNumber,
                        profileImage: resolveProfileImage(item),
                        planName: item.planName || '—',
                        startDate: item.subscriptionStartDate || '-',
                        endDate: item.subscriptionEndDate || '-',
                        remainingMealCredits: item.remainingMealCredits ?? 0,
                        status: item.subscriptionStatus || 'NONE',
                    })}
                    contentContainerStyle={{ gap: 12, paddingBottom: 12 }}
                    ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#6B7280', paddingVertical: 24 }}>No customers found</Text>}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: ADMIN_COLORS.surface, padding: 16 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    title: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
    primaryButton: { backgroundColor: ADMIN_COLORS.primary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 8 },
    primaryButtonText: { color: '#FFFFFF', fontWeight: '700' },
    filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
    filterBtn: { backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 9999 },
    filterBtnActive: { backgroundColor: ADMIN_COLORS.primary, borderColor: ADMIN_COLORS.primary },
    filterText: { fontSize: 12, color: '#374151', fontWeight: '600' },
    filterTextActive: { color: '#FFFFFF' },
});


