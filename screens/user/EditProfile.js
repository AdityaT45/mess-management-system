import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import customerService from '../../api/customerService';
import locations from '../../assets/data/locations.json';
import Dropdown from '../../components/common/Dropdown';
import CUSTOMER_COLORS from '../../config/colors';

export default function EditProfile() {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [form, setForm] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        address: '',
        city: '',
        state: '',
        country: '',
        zip: '',
        notes: '',
        planeType: '',
        startDate: '',
        endDate: '',
        gender: '',
    });

    useEffect(() => {
        let mounted = true;
        (async () => {
            const res = await customerService.getMyProfile();
            if (!mounted) return;
            if (res.type === 'success') {
                setForm({
                    name: res.data?.name || '',
                    email: res.data?.email || '',
                    phoneNumber: res.data?.phoneNumber || '',
                    address: res.data?.address || '',
                    city: res.data?.city || '',
                    state: res.data?.state || '',
                    country: res.data?.country || '',
                    zip: res.data?.zip || '',
                    notes: res.data?.notes || '',
                    planeType: res.data?.planeType || '',
                    startDate: res.data?.startDate || '',
                    endDate: res.data?.endDate || '',
                    gender: res.data?.gender || '',
                });
            } else {
                setError(res.message || 'Failed to load profile');
            }
            setLoading(false);
        })();
        return () => { mounted = false; };
    }, []);

    const setField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

    const onSave = async () => {
        setSaving(true);
        const res = await customerService.updateMyProfile(form);
        setSaving(false);
        if (res.type === 'success') {
            Alert.alert('Success', 'Profile updated successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } else {
            Alert.alert('Update failed', res.message || 'Please try again');
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.scroll}>
            <View style={styles.card}>
                <Text style={styles.heading}>Edit Profile</Text>

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
                            onSelect={(val) => {
                                setField('state', val);
                                setField('city', '');
                                setField('taluka', '');
                            }}
                            disabled={false}
                        />
                    </View>
                    <View style={styles.fieldSmall}>
                        <Dropdown
                            label="District"
                            value={form.city}
                            options={form.state ? Object.keys(locations[form.state] || {}) : []}
                            onSelect={(val) => {
                                setField('city', val);
                                setField('taluka', '');
                            }}
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
    scroll: {
        padding: 16,
        backgroundColor: CUSTOMER_COLORS.surface,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
    },
    heading: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
    },
    row2: {
        flexDirection: 'row',
        gap: 12,
    },
    fieldWrap: {
        marginBottom: 12,
        flex: 1,
    },
    fieldSmall: {
        flexBasis: '48%',
    },
    fieldLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: '#e5e5e5',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: '#111',
        backgroundColor: '#fff',
    },
    inputDisabled: {
        backgroundColor: '#f7f7f7',
        color: '#999',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancel: {
        backgroundColor: '#bbb',
    },
    save: {
        backgroundColor: CUSTOMER_COLORS.primary,
    },
    btnText: {
        color: '#fff',
        fontWeight: '600',
    },
});


