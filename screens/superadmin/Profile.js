// src/screens/superadmin/Profile.js
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';
import SuperAdminLayout from '../../components/superadmin/SuperAdminLayout';
import { logout } from '../../store/slices/authSlice';

export default function Profile() {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <SuperAdminLayout
      title="Profile"
      backgroundColor="#8B5CF6"
      textColor="#FFFFFF"
      logoIconName="person"
      logoIconColor="#8B5CF6"
      showNotifications={false}
      showProfile={false}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Super Admin Profile</Text>
        <Text style={styles.subtitle}>This is a placeholder. Implement settings and account details here.</Text>

        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
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
  section: {
    marginTop: 24,
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});



