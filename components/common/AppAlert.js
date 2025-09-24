import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ADMIN_COLORS } from '../../config/colors';

// Reusable App Alert Dialog
// Props:
// - visible: boolean
// - type: 'success' | 'error' | 'warning' | 'info'
// - title: string
// - message: string | ReactNode
// - confirmText?: string (default: 'Done')
// - cancelText?: string (optional shows a secondary button)
// - onConfirm?: () => void
// - onCancel?: () => void
// - onRequestClose?: () => void
// - iconName?: Ionicons name override
export default function AppAlert({
    visible,
    type = 'info',
    title = '',
    message = '',
    confirmText = 'Done',
    cancelText,
    onConfirm,
    onCancel,
    onRequestClose,
    iconName,
}) {
    const palette = getPalette(type);
    const icon = iconName || getIcon(type);

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent
            onRequestClose={onRequestClose || onCancel || onConfirm}
        >
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <View style={[styles.iconWrap, { backgroundColor: palette.bg }]}>
                        <Ionicons name={icon} size={22} color={palette.fg} />
                    </View>
                    {!!title && <Text style={styles.title}>{title}</Text>}
                    {typeof message === 'string' ? (
                        <Text style={styles.message}>{message}</Text>
                    ) : (
                        message
                    )}

                    <View style={styles.actionsRow}>
                        {cancelText ? (
                            <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={onCancel}>
                                <Text style={[styles.btnGhostText]}>{cancelText}</Text>
                            </TouchableOpacity>
                        ) : null}
                        <TouchableOpacity
                            style={[styles.btn, { backgroundColor: palette.bg }]}
                            onPress={onConfirm}
                        >
                            <Text style={[styles.btnText, { color: '#FFFFFF' }]}>{confirmText}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

function getIcon(type) {
    switch (type) {
        case 'success':
            return 'checkmark';
        case 'error':
            return 'trash';
        case 'warning':
            return 'warning';
        default:
            return 'information';
    }
}

function getPalette(type) {
    switch (type) {
        case 'success':
            return { bg: '#10B981', fg: '#FFFFFF' };
        case 'error':
            return { bg: '#EF4444', fg: '#FFFFFF' };
        case 'warning':
            return { bg: '#F59E0B', fg: '#111827' };
        case 'info':
        default:
            return { bg: ADMIN_COLORS.primary, fg: '#FFFFFF' };
    }
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
    card: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 16, paddingHorizontal: 16, paddingBottom: 16, alignItems: 'center' },
    iconWrap: { width: 56, height: 56, borderRadius: 999, alignItems: 'center', justifyContent: 'center', marginTop: -28 },
    title: { marginTop: 12, fontSize: 18, fontWeight: '700', color: '#111827' },
    message: { marginTop: 8, color: '#6B7280', textAlign: 'center' },
    actionsRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
    btn: { flex: 1, minWidth: 120, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 10 },
    btnText: { fontWeight: '800' },
    btnGhost: { backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
    btnGhostText: { color: '#111827', fontWeight: '700' },
});


