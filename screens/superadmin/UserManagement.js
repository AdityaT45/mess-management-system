// src/screens/superadmin/UserManagement.js
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import SuperAdminLayout from '../../components/superadmin/SuperAdminLayout';

export default function UserManagement() {
  return (
    <SuperAdminLayout
      title="Customers"
      backgroundColor="#8B5CF6"
      textColor="#FFFFFF"
      logoIconName="people"
      logoIconColor="#8B5CF6"
      showNotifications={false}
      showProfile={false}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Customer Management</Text>
        <Text style={styles.subtitle}>This is a placeholder. Implement customer list and actions here.</Text>
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



