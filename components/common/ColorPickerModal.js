import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import ColorPicker from 'react-native-wheel-color-picker';
import { ADMIN_COLORS } from '../../config/colors';

export default function ColorPickerModal({ visible, value, onChange, onClose }) {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable style={styles.backdrop} onPress={onClose} />
            <View style={styles.sheet}>
                <ColorPicker
                    color={value || '#2db365'}
                    onColorChangeComplete={onChange}
                    onColorChange={onChange}
                    thumbSize={28}
                    sliderSize={24}
                    noSnap={true}
                    row={false}
                />
                <View style={styles.actions}>
                    <Pressable style={[styles.btn, styles.cancel]} onPress={onClose}>
                        <Text style={styles.btnText}>Done</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
    sheet: {
        position: 'absolute',
        left: 16,
        right: 16,
        top: 100,
        bottom: 120,
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 16,
    },
    actions: { marginTop: 12, flexDirection: 'row', justifyContent: 'flex-end' },
    btn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
    cancel: { backgroundColor: ADMIN_COLORS.primary },
    btnText: { color: '#fff', fontWeight: '600' },
});


