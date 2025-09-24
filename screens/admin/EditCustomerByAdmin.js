import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import customerService from '../../api/customerService';
import locations from '../../assets/data/locations.json';
import Dropdown from '../../components/common/Dropdown';

export default function EditCustomerByAdmin() {
    const route = useRoute();
    const navigation = useNavigation();
    const { customer } = route.params || {};
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        id: customer?.id || '',
        name: customer?.name || '',
        email: customer?.email || '',
        phoneNumber: customer?.phoneNumber || '',
        address: customer?.address || '',
        city: customer?.city || '',
        state: customer?.state || '',
        country: customer?.country || 'India',
        zip: customer?.zip || '',
        notes: customer?.notes || '',
        planeType: customer?.planeType || 'Monthly Lunch',
        startDate: customer?.startDate || '',
        endDate: customer?.endDate || '',
        gender: customer?.gender || '',
        status: customer?.status ?? true,
        profileImage: customer?.profileImage || '',
    });

    const setField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

    const getImageSource = (value) => {
        if (!value || typeof value !== 'string') return null;
        const v = value.trim();
        if (!v) return null;
        if (v.startsWith('http') || v.startsWith('file://') || v.startsWith('content://') || v.startsWith('data:')) {
            return { uri: v };
        }
        return { uri: `data:image/jpeg;base64,${v}` };
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') { Alert.alert('Permission required', 'We need gallery permission to pick images.'); return; }
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8, allowsEditing: true });
        if (!result.canceled && result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            setField('profileImage', asset.uri);
        }
    };

    const onSave = async () => {
        if (!form.id) { Alert.alert('Error', 'Invalid customer'); return; }
        setSaving(true);
        const payload = {
            name: form.name,
            phoneNumber: form.phoneNumber,
            address: form.address,
            city: form.city,
            state: form.state,
            country: form.country,
            zip: form.zip,
            notes: form.notes,
            startDate: form.startDate,
            endDate: form.endDate,
            planeType: form.planeType,
            status: form.status,
            profileImage: form.profileImage,
        };
        const res = await customerService.updateCustomer(form.id, payload);
        setSaving(false);
        if (res.type === 'success') {
            Alert.alert('Success', 'Customer updated successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } else {
            Alert.alert('Update failed', res.message || 'Please try again');
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.scroll}>
            <View style={styles.card}>
                <Text style={styles.heading}>Edit Customer</Text>

                <TouchableOpacity style={styles.avatarWrap} onPress={pickImage}>
                    {getImageSource(form.profileImage) ? (
                        <Image source={getImageSource(form.profileImage)} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, { alignItems: 'center', justifyContent: 'center' }]}>
                            <Text style={{ color: '#9CA3AF' }}>Tap to add photo</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <Field label="Name" value={form.name} onChangeText={(t) => setField('name', t)} />
                <Field label="Email" value={form.email} editable={false} />
                <Field label="Phone" value={form.phoneNumber} onChangeText={(t) => setField('phoneNumber', t)} keyboardType="phone-pad" />

                <Field label="Address" value={form.address} onChangeText={(t) => setField('address', t)} />

                <View style={styles.row2}>
                    <View style={styles.fieldSmall}>
                        <Dropdown
                            label="State"
                            value={form.state}
                            options={Object.keys(locations)}
                            onSelect={(val) => { setField('state', val); setField('city', ''); setField('taluka', ''); }}
                            disabled={false}
                        />
                    </View>
                    <View style={styles.fieldSmall}>
                        <Dropdown
                            label="District"
                            value={form.city}
                            options={form.state ? Object.keys(locations[form.state] || {}) : []}
                            onSelect={(val) => { setField('city', val); setField('taluka', ''); }}
                            disabled={!form.state}
                        />
                    </View>
                </View>

                <View style={styles.row2}>
                    <View style={styles.fieldSmall}>
                        <Dropdown
                            label="Taluka"
                            value={form.taluka}
                            options={form.state && form.city ? (locations[form.state]?.[form.city] || []) : []}
                            onSelect={(val) => setField('taluka', val)}
                            disabled={!form.state || !form.city}
                        />
                    </View>
                    <View style={styles.fieldSmall}>
                        <Field label="ZIP" value={form.zip} onChangeText={(t) => setField('zip', t)} small keyboardType="number-pad" />
                    </View>
                </View>

                <Field label="Notes" value={form.notes} onChangeText={(t) => setField('notes', t)} multiline />

                <View style={styles.actions}>
                    <TouchableOpacity style={[styles.button, styles.cancel]} onPress={() => navigation.goBack()}>
                        <Text style={styles.btnText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, styles.save]} onPress={onSave} disabled={saving}>
                        <Text style={styles.btnText}>{saving ? 'Saving...' : 'Save'}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

function Field({ label, value, onChangeText, keyboardType, editable = true, small, multiline }) {
    return (
        <View style={[styles.fieldWrap, small ? styles.fieldSmall : null]}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <TextInput
                style={[styles.input, !editable && styles.inputDisabled]}
                value={value}
                editable={editable}
                onChangeText={onChangeText}
                keyboardType={keyboardType}
                multiline={multiline}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    scroll: { padding: 16, backgroundColor: '#F7FAFC' },
    card: { backgroundColor: '#fff', borderRadius: 12, padding: 16 },
    heading: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
    avatarWrap: { alignItems: 'center', marginBottom: 16 },
    avatar: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#E5E7EB' },
    row2: { flexDirection: 'row', gap: 12 },
    fieldWrap: { marginBottom: 12, flex: 1 },
    fieldSmall: { flexBasis: '48%' },
    fieldLabel: { fontSize: 12, color: '#666', marginBottom: 6 },
    input: { borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#111', backgroundColor: '#fff' },
    inputDisabled: { backgroundColor: '#f7f7f7', color: '#999' },
    actions: { flexDirection: 'row', gap: 12, marginTop: 8 },
    button: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
    cancel: { backgroundColor: '#bbb' },
    save: { backgroundColor: '#FF6B35' },
    btnText: { color: '#fff', fontWeight: '600' },
});


