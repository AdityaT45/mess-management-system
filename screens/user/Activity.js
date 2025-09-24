import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function Activity() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Activity</Text>
            <Text style={styles.subtitle}>See notifications and recent updates.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 22,
        fontWeight: '600',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
});



