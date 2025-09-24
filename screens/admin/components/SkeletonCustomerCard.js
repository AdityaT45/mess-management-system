import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function SkeletonCustomerCard() {
    return (
        <View style={styles.card}>
            <View style={styles.rowTop}>
                <View style={styles.avatar} />
                <View style={styles.infoWrap}>
                    <View style={[styles.line, { width: '55%' }]} />
                    <View style={[styles.line, { width: '40%', marginTop: 6 }]} />
                    <View style={[styles.line, { width: '30%', marginTop: 6 }]} />
                </View>
                <View style={[styles.badge]} />
            </View>
            <View style={styles.rowBottom}>
                <View style={[styles.chip, { width: 100 }]} />
                <View style={styles.actions}>
                    <View style={[styles.iconBtn, { width: 36 }]} />
                    <View style={[styles.iconBtn, { width: 36 }]} />
                </View>
            </View>
        </View>
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
        shadowOpacity: 0.06,
        shadowRadius: 2,
    },
    rowTop: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#cecfd3' },
    infoWrap: { flex: 1, marginLeft: 12 },
    line: { height: 10, backgroundColor: '#cecfd3', borderRadius: 6 },
    badge: { width: 60, height: 18, borderRadius: 10, backgroundColor: '#cecfd3' },
    rowBottom: { flexDirection: 'row', alignItems: 'center', marginTop: 8, justifyContent: 'space-between' },
    chip: { height: 18, borderRadius: 10, backgroundColor: '#EEF2FF' },
    actions: { flexDirection: 'row', gap: 8 },
    iconBtn: { height: 32, borderRadius: 8, backgroundColor: '#cecfd3' },
});

