// src/screens/superadmin/Profile.js
import React, { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';
import SuperAdminLayout from '../../components/superadmin/SuperAdminLayout';
import { SUPER_ADMIN_COLORS } from '../../config/colors';
import { logout } from '../../store/slices/authSlice';

export default function Profile() {
  const dispatch = useDispatch();

  // TODO: Replace with real API data when integrated
  const [profile] = useState({
    name: 'College katta group',
    email: 'superadmin@mess.com',
    phoneNumber: '9876543210',
    organizationName: 'College Katta Group',
    city: 'Nashik',
    state: 'Maharashtra',
    profileImage: null,
  });

  const avatarUri = useMemo(() => {
    if (!profile?.profileImage) return null;
    const isDataUri = String(profile.profileImage).startsWith('data:image');
    return isDataUri ? profile.profileImage : `data:image/jpeg;base64,${profile.profileImage}`;
  }, [profile]);

  const onEditProfile = () => { };
  const onLogout = () => { dispatch(logout()); };

  return (
    <SuperAdminLayout title="Profile" logoIconName="person" showNotifications={false} showProfile={false}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} resizeMode="cover" />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarInitial}>{(profile?.name || 'S').charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <View style={styles.headerTextWrap}>
              <Text style={styles.name}>{profile?.name || '-'}</Text>
              <Text style={styles.email}>{profile?.email || '-'}</Text>
              <View style={styles.badgeRow}>
                <View style={[styles.badge, styles.badgePrimary]}>
                  <Text style={styles.badgeText}>Super Admin</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.quickGrid}>
            <InfoMini label="Phone" value={profile?.phoneNumber} />
            <InfoMini label="Organization" value={profile?.organizationName} />
            <InfoMini label="City" value={profile?.city} />
            <InfoMini label="State" value={profile?.state} />
          </View>

          <TouchableOpacity style={styles.disclosure}>
            <Text style={styles.disclosureText}>Show details</Text>
            <Text style={styles.disclosureIcon}>▾</Text>
          </TouchableOpacity>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={[styles.button, styles.edit]} onPress={onEditProfile}>
              <Text style={styles.buttonText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.logout]} onPress={onLogout}>
              <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SuperAdminLayout>
  );
}

function InfoMini({ label, value }) {
  return (
    <View style={styles.infoMini}>
      <Text style={styles.infoMiniLabel}>{label}</Text>
      <Text style={styles.infoMiniValue} numberOfLines={1} ellipsizeMode="tail">{value ?? '-'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: SUPER_ADMIN_COLORS.surface, padding: 16 },
  card: { backgroundColor: SUPER_ADMIN_COLORS.white, borderRadius: 16, padding: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 96, height: 96, borderRadius: 48, alignSelf: 'center', marginBottom: 12, backgroundColor: '#eee' },
  avatarPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: 36, fontWeight: '700', color: '#666' },
  headerTextWrap: { flex: 1 },
  name: { fontSize: 20, fontWeight: '700', textAlign: 'center', color: SUPER_ADMIN_COLORS.black },
  email: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 2, marginBottom: 12 },
  badgeRow: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: '#eee' },
  badgePrimary: { backgroundColor: '#ecdafc' },
  badgeSuccess: { backgroundColor: '#e8f5e9' },
  badgeText: { color: SUPER_ADMIN_COLORS.primary, fontSize: 12, fontWeight: '600' },
  quickGrid: { marginTop: 8, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  infoMini: { flexBasis: '48%', backgroundColor: '#fafafa', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 10 },
  infoMiniLabel: { fontSize: 10, color: '#777', marginBottom: 2 },
  infoMiniValue: { fontSize: 14, color: '#222' },
  disclosure: { marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f3f3f3', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
  disclosureText: { fontSize: 12, color: SUPER_ADMIN_COLORS.primary, fontWeight: '600' },
  disclosureIcon: { fontSize: 14, color: SUPER_ADMIN_COLORS.primary, fontWeight: '700' },
  actionsRow: { marginTop: 8, flexDirection: 'row', gap: 12 },
  button: { marginTop: 16, backgroundColor: SUPER_ADMIN_COLORS.primary, paddingVertical: 12, borderRadius: 8, alignItems: 'center', flex: 1 },
  edit: { backgroundColor: SUPER_ADMIN_COLORS.primary },
  logout: { backgroundColor: '#d9534f' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});



