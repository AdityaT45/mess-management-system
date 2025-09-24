// src/screens/superadmin/Profile.js
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';
import SuperAdminLayout from '../../components/superadmin/SuperAdminLayout';
import { logout } from '../../store/slices/authSlice';

export default function Profile() {
  const dispatch = useDispatch();

  // Profile details
  const [name, setName] = useState('Super Admin');
  const [email, setEmail] = useState('superadmin@mess.com');
  const [phone, setPhone] = useState('9876543210');
  const [orgName, setOrgName] = useState('College Katta Group');
  const [city, setCity] = useState('Nashik');
  const [state, setState] = useState('Maharashtra');

  // Preferences
  const [notifySystem, setNotifySystem] = useState(true);
  const [notifyAdmins, setNotifyAdmins] = useState(true);

  // Security
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSaveProfile = () => {
    Alert.alert('Saved', 'Profile updated successfully');
  };

  const handleChangePassword = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    Alert.alert('Success', 'Password changed');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => dispatch(logout()) },
      ],
    );
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
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={36} color="#8B5CF6" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerName}>{name}</Text>
            <Text style={styles.headerSub}>{orgName}</Text>
          </View>
          <TouchableOpacity style={styles.saveBadge} onPress={handleSaveProfile}>
            <Ionicons name="save" size={18} color="#FFFFFF" />
            <Text style={styles.saveBadgeText}>Save</Text>
          </TouchableOpacity>
        </View>

        {/* Account Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account Details</Text>
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Full name" />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Phone</Text>
              <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="Phone number" />
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="Email" />
          </View>
        </View>

        {/* Organization Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Organization</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Organization Name</Text>
            <TextInput style={styles.input} value={orgName} onChangeText={setOrgName} placeholder="Organization name" />
          </View>
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>City</Text>
              <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="City" />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>State</Text>
              <TextInput style={styles.input} value={state} onChangeText={setState} placeholder="State" />
            </View>
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Preferences</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>System notifications</Text>
            <Switch value={notifySystem} onValueChange={setNotifySystem} trackColor={{ false: '#E2E8F0', true: '#8B5CF6' }} thumbColor={'#FFFFFF'} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Admin activity alerts</Text>
            <Switch value={notifyAdmins} onValueChange={setNotifyAdmins} trackColor={{ false: '#E2E8F0', true: '#8B5CF6' }} thumbColor={'#FFFFFF'} />
          </View>
        </View>

        {/* Security */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Security</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Old Password</Text>
            <TextInput style={styles.input} value={oldPassword} onChangeText={setOldPassword} placeholder="Old password" secureTextEntry />
          </View>
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>New Password</Text>
              <TextInput style={styles.input} value={newPassword} onChangeText={setNewPassword} placeholder="New password" secureTextEntry />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput style={styles.input} value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Confirm password" secureTextEntry />
            </View>
          </View>
          <TouchableOpacity style={styles.primaryButton} onPress={handleChangePassword}>
            <Ionicons name="lock-closed" size={18} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Change Password</Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <View style={[styles.card, { borderWidth: 1, borderColor: '#F3E8FF', backgroundColor: '#FAF5FF', marginBottom: 80 }]}>
          <Text style={styles.cardTitle}>Account</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out" size={18} color="#FFFFFF" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SuperAdminLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC', padding: 16 },
  headerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#F5F3FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  headerName: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  headerSub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  saveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#8B5CF6', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, gap: 6 },
  saveBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  inputGroup: { marginBottom: 12 },
  label: { fontSize: 12, color: '#6B7280', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: '#111827', backgroundColor: '#FFFFFF' },
  row: { flexDirection: 'row' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F9FAFB', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, marginBottom: 10 },
  switchLabel: { fontSize: 14, color: '#374151' },
  primaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#8B5CF6', borderRadius: 10, paddingVertical: 12, marginTop: 4 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#EF4444', borderRadius: 10, paddingVertical: 12 },
  logoutButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});



