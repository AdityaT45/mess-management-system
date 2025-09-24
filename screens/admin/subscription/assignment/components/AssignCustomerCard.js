import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AssignCustomerCard({ item, expanded, onToggle }) {
    const imageSource = useMemo(() => {
        const v = item.profileImage ? String(item.profileImage) : '';
        if (!v) return null;
        if (v.startsWith('http') || v.startsWith('file://') || v.startsWith('content://') || v.startsWith('data:')) return { uri: v };
        return { uri: `data:image/jpeg;base64,${v}` };
    }, [item.profileImage]);

    return (
        <View style={styles.card}>
            <View style={styles.topRow}>
                {imageSource ? (
                    <Image source={imageSource} style={styles.avatar} />
                ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                        <Ionicons name="person" size={20} color="#9CA3AF" />
                    </View>
                )}
                <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.customerName}>{item.customerName}</Text>
                    <Text style={styles.planText}>{item.planName}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: item.status === 'ACTIVE' ? '#10B981' : '#EF4444' }]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
            </View>

            <View style={styles.compactRow}>
                <View style={styles.compactItem}>
                    <Ionicons name="fast-food" size={14} color="#6B7280" />
                    <Text style={styles.compactLabel}>Remaining</Text>
                    <Text style={styles.compactValue}>{item.remainingMealCredits}</Text>
                </View>
                <TouchableOpacity
                    style={styles.moreButton}
                    onPress={onToggle}
                >
                    <Text style={styles.moreButtonText}>{expanded ? 'Hide' : 'More'}</Text>
                    <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color="#4B5563" />
                </TouchableOpacity>
            </View>

            {expanded && (
                <View style={styles.collapse}>
                    <View style={styles.row}>
                        <Text style={styles.label}>Phone</Text>
                        <Text style={styles.value}>{item.phoneNumber}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Start</Text>
                        <Text style={styles.value}>{item.startDate}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>End</Text>
                        <Text style={styles.value}>{item.endDate}</Text>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12 },
    topRow: { flexDirection: 'row', alignItems: 'center' },
    customerName: { fontSize: 15, fontWeight: '700', color: '#111827' },
    planText: { fontSize: 12, color: '#6B7280', marginTop: 2 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 9999 },
    statusText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
    avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E5E7EB' },
    avatarPlaceholder: { alignItems: 'center', justifyContent: 'center' },
    compactRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
    compactItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    compactLabel: { color: '#6B7280', fontSize: 12 },
    compactValue: { color: '#111827', fontSize: 14, fontWeight: '700' },
    moreButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F3F4F6', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
    moreButtonText: { color: '#4B5563', fontSize: 12, fontWeight: '600' },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    label: { color: '#6B7280', fontSize: 12, fontWeight: '500' },
    value: { color: '#111827', fontSize: 14, fontWeight: '600' },
    collapse: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
});


