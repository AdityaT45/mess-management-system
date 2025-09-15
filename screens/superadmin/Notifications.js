// src/screens/superadmin/Notifications.js
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import SuperAdminLayout from '../../components/superadmin/SuperAdminLayout';

export default function Notifications() {
  return (
    <SuperAdminLayout
      title="Notifications"
      backgroundColor="#8B5CF6"
      textColor="#FFFFFF"
      logoIconName="notifications"
      logoIconColor="#8B5CF6"
      showNotifications={false}
      showProfile={false}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Notifications Center</Text>
        <Text style={styles.subtitle}>This is a placeholder. Implement notifications list here.</Text>
      </View>
    </SuperAdminLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#718096',
  },
});



