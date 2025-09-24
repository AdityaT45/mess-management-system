import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useRef, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import locations from '../../assets/data/locations.json';
import Dropdown from '../../components/common/Dropdown';
import { ADMIN_COLORS } from '../../config/colors';

export default function CreateCustomerModal({ visible, onClose, onSubmit }) {
    const nameRef = useRef();
    const emailRef = useRef();
    const phoneRef = useRef();
    const [step, setStep] = useState(0);
    const [errors, setErrors] = useState({});
    const [form, setForm] = useState({
        email: '',
        name: '',
        phoneNumber: '',
        address: '',
        city: '',
        taluka: '',
        state: '',
        country: 'India',
        zip: '',
        notes: '',
        planeType: 'Monthly Lunch',
        startDate: '',
        endDate: '',
        status: true,
        profileImage: '',
        gender: '',
    });

    const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

    const getImageSource = (value) => {
        if (!value || typeof value !== 'string') return null;
        const v = value.trim();
        if (!v) return null;
        if (v.startsWith('http') || v.startsWith('file://') || v.startsWith('content://') || v.startsWith('data:')) return { uri: v };
        return { uri: `data:image/jpeg;base64,${v}` };
    };

    const formatDateLocal = (dateString) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return dateString;
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        const ss = String(d.getSeconds()).padStart(2, '0');
        return `${y}-${m}-${day}T${hh}:${mm}:${ss}`;
    };

    const validate = (currentStep) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\d{10}$/;
        const e = {};
        if (currentStep === 0) {
            if (!form.name.trim()) e.name = 'Full name is required';
            if (!form.email.trim()) e.email = 'Email is required';
            else if (!emailRegex.test(form.email.trim())) e.email = 'Invalid email format';
            if (!form.phoneNumber.trim()) e.phoneNumber = 'Phone is required';
            else if (!phoneRegex.test(form.phoneNumber.trim())) e.phoneNumber = 'Enter 10 digit phone';
            if (!form.gender) e.gender = 'Select gender';
        }
        if (currentStep === 1) {
            if (!form.address.trim()) e.address = 'Address is required';
            if (!form.state) e.state = 'Select state';
            if (!form.city.trim()) e.city = 'District is required';
            if (!form.taluka.trim()) e.taluka = 'Taluka is required';
            if (!form.zip.trim()) e.zip = 'ZIP is required';
        }
        setErrors((prev) => ({ ...prev, ...e }));
        return Object.keys(e).length === 0;
    };

    const handlePickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') { Alert.alert('Permission required', 'We need gallery permission to pick images.'); return; }
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8, allowsEditing: true });
        if (!result.canceled && result.assets && result.assets.length > 0) {
            setField('profileImage', result.assets[0].uri);
        }
    };

    const submit = () => {
        const payload = { ...form, startDate: formatDateLocal(form.startDate), endDate: formatDateLocal(form.endDate) };
        onSubmit && onSubmit(payload, () => setStep(0));
    };

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View style={styles.overlay}>
                <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} style={styles.card}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Add Customer</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#718096" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.stepperTrack}>
                        <View style={[styles.stepperProgress, { width: `${((step + 1) / 3) * 100}%` }]} />
                    </View>

                    <ScrollView style={{ maxHeight: 440 }} contentContainerStyle={{ paddingBottom: 12 }} showsVerticalScrollIndicator={false}>
                        {step === 0 && (
                            <View style={styles.section}>
                                <View style={{ alignItems: 'center' }}>
                                    {getImageSource(form.profileImage) ? (
                                        <Image source={getImageSource(form.profileImage)} style={styles.avatar} />
                                    ) : (
                                        <View style={[styles.avatar, { alignItems: 'center', justifyContent: 'center' }]}>
                                            <Ionicons name="person" size={44} color="#9CA3AF" />
                                        </View>
                                    )}
                                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, width: '100%' }}>
                                        <TouchableOpacity style={[styles.btnPrimary, { flex: 1 }]} onPress={handlePickImage}>
                                            <Text style={styles.btnPrimaryText}>Choose Photo</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.btnGhost} onPress={() => setField('profileImage', '')}>
                                            <Text style={styles.btnGhostText}>Clear</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={styles.group}>
                                    <Text style={styles.label}>Full Name *</Text>
                                    <TextInput ref={nameRef} style={[styles.input]} placeholder="Full name" value={form.name} onChangeText={(t) => { setField('name', t); if (errors.name) setErrors({ ...errors, name: '' }); }} />
                                    {!!errors.name && <Text style={styles.error}>{errors.name}</Text>}
                                </View>

                                <View style={styles.group}>
                                    <Text style={styles.label}>Email *</Text>
                                    <TextInput ref={emailRef} style={[styles.input]} placeholder="Email address" autoCapitalize="none" keyboardType="email-address" value={form.email} onChangeText={(t) => { setField('email', t); if (errors.email) setErrors({ ...errors, email: '' }); }} />
                                    {!!errors.email && <Text style={styles.error}>{errors.email}</Text>}
                                </View>

                                <View style={styles.group}>
                                    <Text style={styles.label}>Phone Number *</Text>
                                    <TextInput ref={phoneRef} style={[styles.input]} placeholder="10 digit phone" keyboardType="phone-pad" value={form.phoneNumber} onChangeText={(t) => { setField('phoneNumber', t); if (errors.phoneNumber) setErrors({ ...errors, phoneNumber: '' }); }} />
                                    {!!errors.phoneNumber && <Text style={styles.error}>{errors.phoneNumber}</Text>}
                                </View>

                                <View style={styles.group}>
                                    <Text style={styles.label}>Gender *</Text>
                                    <View style={styles.chipsRow}>
                                        {['Male', 'Female', 'Other'].map((g) => (
                                            <TouchableOpacity key={g} style={[styles.chip, form.gender === g && styles.chipSelected]} onPress={() => setField('gender', g)}>
                                                <Text style={[styles.chipText, form.gender === g && styles.chipTextSelected]}>{g}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                    {!!errors.gender && <Text style={styles.error}>{errors.gender}</Text>}
                                </View>
                            </View>
                        )}

                        {step === 1 && (
                            <View style={styles.section}>
                                <View style={styles.group}>
                                    <Text style={styles.label}>Address *</Text>
                                    <TextInput style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]} placeholder="Address" multiline numberOfLines={3} value={form.address} onChangeText={(t) => { setField('address', t); if (errors.address) setErrors({ ...errors, address: '' }); }} />
                                    {!!errors.address && <Text style={styles.error}>{errors.address}</Text>}
                                </View>
                                <View style={{ flexDirection: 'row' }}>
                                    <View style={[styles.group, { flex: 1, marginRight: 8 }]}>
                                        <Dropdown label="State *" value={form.state} options={Object.keys(locations)} onSelect={(val) => { setField('state', val); setField('city', ''); setField('taluka', ''); if (errors.state) setErrors({ ...errors, state: '' }); }} />
                                        {!!errors.state && <Text style={styles.error}>{errors.state}</Text>}
                                    </View>
                                    <View style={[styles.group, { flex: 1, marginLeft: 8 }]}>
                                        <Dropdown label="District *" value={form.city} options={form.state ? Object.keys(locations[form.state] || {}) : []} onSelect={(val) => { setField('city', val); setField('taluka', ''); if (errors.city) setErrors({ ...errors, city: '' }); }} disabled={!form.state} />
                                        {!!errors.city && <Text style={styles.error}>{errors.city}</Text>}
                                    </View>
                                </View>
                                <View style={{ flexDirection: 'row' }}>
                                    <View style={[styles.group, { flex: 1, marginRight: 8 }]}>
                                        <Dropdown label="Taluka *" value={form.taluka} options={form.state && form.city ? (locations[form.state]?.[form.city] || []) : []} onSelect={(val) => { setField('taluka', val); if (errors.taluka) setErrors({ ...errors, taluka: '' }); }} disabled={!form.state || !form.city} />
                                        {!!errors.taluka && <Text style={styles.error}>{errors.taluka}</Text>}
                                    </View>
                                    <View style={[styles.group, { flex: 1, marginLeft: 8 }]}>
                                        <Text style={styles.label}>ZIP *</Text>
                                        <TextInput style={styles.input} placeholder="ZIP" keyboardType="numeric" value={form.zip} onChangeText={(t) => { setField('zip', t); if (errors.zip) setErrors({ ...errors, zip: '' }); }} />
                                        {!!errors.zip && <Text style={styles.error}>{errors.zip}</Text>}
                                    </View>
                                </View>
                            </View>
                        )}

                        {step === 2 && (
                            <View style={styles.section}>
                                <View style={styles.group}>
                                    <Text style={styles.label}>Plan Type</Text>
                                    <View style={styles.chipsRow}>
                                        {['Monthly Lunch', 'Monthly Dinner', 'Monthly Both', 'Daily Lunch', 'Daily Dinner', 'Daily Both', 'Trial Plan'].map((type) => (
                                            <TouchableOpacity key={type} style={[styles.chip, form.planeType === type && styles.chipSelected]} onPress={() => setField('planeType', type)}>
                                                <Text style={[styles.chipText, form.planeType === type && styles.chipTextSelected]}>{type}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                                <View style={{ flexDirection: 'row' }}>
                                    <View style={[styles.group, { flex: 1, marginRight: 8 }]}>
                                        <Text style={styles.label}>Start Date (YYYY-MM-DDTHH:mm:ss)</Text>
                                        <TextInput style={styles.input} placeholder="2025-10-01T12:00:00" value={form.startDate} onChangeText={(t) => setField('startDate', t)} />
                                    </View>
                                    <View style={[styles.group, { flex: 1, marginLeft: 8 }]}>
                                        <Text style={styles.label}>End Date (YYYY-MM-DDTHH:mm:ss)</Text>
                                        <TextInput style={styles.input} placeholder="2025-10-31T12:00:00" value={form.endDate} onChangeText={(t) => setField('endDate', t)} />
                                    </View>
                                </View>
                                <View style={styles.group}>
                                    <Text style={styles.label}>Notes</Text>
                                    <TextInput style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]} placeholder="Notes" multiline numberOfLines={3} value={form.notes} onChangeText={(t) => setField('notes', t)} />
                                </View>
                                <View style={styles.group}>
                                    <Text style={styles.label}>Status</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F3F4F6', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12 }}>
                                        <Text style={{ fontSize: 16, color: '#4A5568' }}>{form.status ? 'Active' : 'Inactive'}</Text>
                                        <TouchableOpacity onPress={() => setField('status', !form.status)} style={[styles.switchBtn, form.status && { backgroundColor: ADMIN_COLORS.primary }]}>
                                            <View style={[styles.switchDot, form.status && { left: 20 }]} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        )}
                    </ScrollView>

                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.btnGhost} onPress={() => { if (step > 0) setStep(step - 1); else onClose && onClose(); }}>
                            <Text style={styles.btnGhostText}>{step > 0 ? 'Back' : 'Cancel'}</Text>
                        </TouchableOpacity>
                        {step < 2 ? (
                            <TouchableOpacity style={styles.btnPrimary} onPress={() => { if (validate(step)) setStep(step + 1); }}>
                                <Text style={styles.btnPrimaryText}>Next</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity style={styles.btnPrimary} onPress={() => { if (validate(0) && validate(1)) submit(); }}>
                                <Text style={styles.btnPrimaryText}>Submit</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    card: { backgroundColor: '#FFFFFF', borderRadius: 20, width: '95%', maxHeight: '90%', padding: 16 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    title: { fontSize: 18, fontWeight: '700', color: '#2D3748' },
    stepperTrack: { height: 6, backgroundColor: '#E5E7EB', borderRadius: 9999, overflow: 'hidden', marginBottom: 12 },
    stepperProgress: { height: 6, backgroundColor: ADMIN_COLORS.primary, borderRadius: 9999 },
    section: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 8 },
    avatar: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#E5E7EB', borderWidth: 2, borderColor: '#EEF2FF' },
    group: { marginBottom: 12 },
    label: { fontSize: 13, fontWeight: '500', color: '#4A5568', marginBottom: 6 },
    input: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: '#2D3748', backgroundColor: '#FFFFFF', },
    chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFFFFF' },
    chipSelected: { backgroundColor: ADMIN_COLORS.primary, borderColor: ADMIN_COLORS.primary },
    chipText: { fontSize: 12, color: '#4A5568' },
    chipTextSelected: { color: '#FFFFFF' },
    actions: { flexDirection: 'row', gap: 12, marginTop: 12 },
    btnPrimary: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: ADMIN_COLORS.primary, alignItems: 'center' },
    btnPrimaryText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
    btnGhost: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFFFFF', alignItems: 'center' },
    btnGhostText: { color: '#374151', fontSize: 15, fontWeight: '500' },
    error: { color: '#DC2626', fontSize: 12, marginTop: 4 },
    switchBtn: { width: 36, height: 22, borderRadius: 11, backgroundColor: '#CBD5E0', position: 'relative' },
    switchDot: { position: 'absolute', top: 3, left: 3, width: 16, height: 16, borderRadius: 8, backgroundColor: '#FFFFFF' },
});


