import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ADMIN_COLORS } from '../../../config/colors';

function getImageSource(value) {
    if (!value || typeof value !== 'string') return null;
    const v = value.trim();
    if (!v) return null;
    if (v.startsWith('http') || v.startsWith('file://') || v.startsWith('content://') || v.startsWith('data:')) return { uri: v };
    return { uri: `data:image/jpeg;base64,${v}` };
}

export default function CustomerCard({ item, selected, multiSelect, onPress, onLongPress, onCallPress, onWhatsAppPress }) {
    const avatarSrc = getImageSource(item.profileImage);
    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={onPress}
            onLongPress={onLongPress}
            style={[styles.card, item.status === false && styles.cardInactive, multiSelect && styles.cardSelectable]}
        >
            <View style={styles.rowTop}>
                {avatarSrc ? (
                    <Image source={avatarSrc} style={styles.avatar} />
                ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                        <Ionicons name="person" size={20} color="#9CA3AF" />
                    </View>
                )}
                <View style={styles.infoWrap}>
                    <Text style={styles.name} numberOfLines={1}>{item.name || '—'}</Text>
                    <Text style={styles.phoneEmail} numberOfLines={1}>{item.phoneNumber || '—'}</Text>
                    <Text style={styles.meta} numberOfLines={1}>{[item.city, item.state].filter(Boolean).join(', ')}</Text>
                </View>
                {multiSelect ? (
                    <View style={[styles.checkbox, selected && styles.checkboxChecked]}>
                        {selected && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                    </View>
                ) : (
                    <View style={[styles.statusBadge, { backgroundColor: item.status ? '#10B981' : '#9CA3AF' }]}>
                        <Text style={styles.statusText}>{item.status ? 'Active' : 'Inactive'}</Text>
                    </View>
                )}
            </View>

            <View style={styles.rowBottom}>
                {!!item.planeType && (
                    <View style={styles.planChip}>
                        <Text style={styles.planChipText} numberOfLines={1}>{item.planeType}</Text>
                    </View>
                )}
                <View style={styles.actions}>
                    {!multiSelect && (
                        <TouchableOpacity style={styles.iconBtn} onPress={onCallPress}>
                            <Ionicons name="call" size={16} color="#065F46" />
                        </TouchableOpacity>
                    )}
                    {!multiSelect && (
                        <TouchableOpacity style={[styles.iconBtn, styles.whatsappBtn]} onPress={onWhatsAppPress}>
                            <Ionicons name="logo-whatsapp" size={18} color="#FFFFFF" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 12,
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
    },
    cardInactive: {
        opacity: 0.92,
    },
    cardSelectable: {
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    rowTop: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E5E7EB' },
    avatarPlaceholder: { alignItems: 'center', justifyContent: 'center' },
    infoWrap: { flex: 1, marginLeft: 12 },
    name: { fontSize: 15, fontWeight: '700', color: '#111827' },
    phoneEmail: { fontSize: 12, color: '#6B7280', marginTop: 2 },
    meta: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
    checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#9CA3AF', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
    checkboxChecked: { borderColor: ADMIN_COLORS.primary, backgroundColor: ADMIN_COLORS.primary },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    statusText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
    rowBottom: { flexDirection: 'row', alignItems: 'center', marginTop: 8, justifyContent: 'space-between' },
    planChip: { backgroundColor: '#EEF2FF', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, maxWidth: '70%' },
    planChipText: { color: '#4F46E5', fontSize: 11, fontWeight: '700' },
    actions: { flexDirection: 'row', gap: 8 },
    iconBtn: { backgroundColor: '#D1FAE5', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
    whatsappBtn: { backgroundColor: '#22C55E' },
});
