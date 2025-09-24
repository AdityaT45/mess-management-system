import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import adminService from '../../../api/adminService';
import AppAlert from '../../../components/common/AppAlert';
import ColorPickerModal from '../../../components/common/ColorPickerModal';
import FloatingLabelInput from '../../../components/common/FloatingLabelInput';
import { ADMIN_COLORS } from '../../../config/colors';

export default function CreateSubscriptionPlan({ navigation }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        totalMealCredits: '',
        durationInDays: '',
        extraDays: '',
        colur: '#2db365'
    });
    const [colorPickerOpen, setColorPickerOpen] = useState(false);
    const [alertState, setAlertState] = useState({ visible: false, type: 'info', title: '', message: '' });

    const showAlert = (type, title, message) => {
        setAlertState({ visible: true, type, title, message: String(message || '') });
    };

    const extractErrorMessage = (resp, fallback) => {
        if (!resp) return fallback || 'Something went wrong';
        if (resp.data) {
            if (typeof resp.data === 'string') return resp.data;
            if (resp.data.message) return resp.data.message;
            if (resp.data.error) return resp.data.error;
        }
        return resp.message || fallback || 'Request failed';
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            totalMealCredits: '',
            durationInDays: '',
            extraDays: '',
            colur: '#2db365'
        });
    };

    const handleCreatePlan = async () => {
        // Validation
        if (!formData.name.trim()) { showAlert('warning', 'Missing field', 'Plan name is required'); return; }
        if (!formData.description.trim()) { showAlert('warning', 'Missing field', 'Plan description is required'); return; }
        if (!formData.price || parseFloat(formData.price) <= 0) { showAlert('warning', 'Invalid value', 'Valid price is required'); return; }
        if (!formData.totalMealCredits || parseInt(formData.totalMealCredits) <= 0) { showAlert('warning', 'Invalid value', 'Valid meal credits is required'); return; }
        if (!formData.durationInDays || parseInt(formData.durationInDays) <= 0) { showAlert('warning', 'Invalid value', 'Valid duration is required'); return; }

        // Optional color validation if provided
        const hexRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
        if (formData.colur && !hexRegex.test(String(formData.colur).trim())) { showAlert('warning', 'Invalid color', 'Please provide a valid color (e.g., #2db365)'); return; }

        try {
            const planData = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                price: parseFloat(formData.price),
                totalMealCredits: parseInt(formData.totalMealCredits),
                durationInDays: parseInt(formData.durationInDays),
                extraDays: parseInt(formData.extraDays) || 0,
                colur: String(formData.colur || '').trim() || undefined
            };

            console.log('Creating plan:', planData);

            const response = await adminService.createSubscriptionPlan(planData);
            if (response.type === 'success') {
                resetForm();
                const msg = (response.data && (response.data.message || response.data.msg)) || response.message || 'Subscription plan created successfully!';
                showAlert('success', 'Success', msg);
            } else {
                const errMsg = extractErrorMessage(response, 'Failed to create plan');
                const isNetwork = response.type === 'network_error' || response.status === 0;
                showAlert(isNetwork ? 'warning' : 'error', isNetwork ? 'Network issue' : 'Error', errMsg);
            }

        } catch (error) {
            console.error('Error creating plan:', error);
            showAlert('error', 'Error', 'Failed to create plan');
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>


                <View style={styles.form}>
                    {/* Plan Information */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Plan Information</Text>

                        <FloatingLabelInput
                            label="Plan Name *"
                            value={formData.name}
                            onChangeText={(value) => handleInputChange('name', value)}
                            placeholder="e.g., Monthly Half Meal Plan"
                        />

                        <FloatingLabelInput
                            label="Description *"
                            value={formData.description}
                            onChangeText={(value) => handleInputChange('description', value)}
                            placeholder="e.g., Includes daily veg lunch and dinner for one month"
                            multiline
                            numberOfLines={4}
                        />
                    </View>

                    {/* Pricing Information */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Pricing Information</Text>
                        <View style={styles.row}>
                            <View style={styles.halfWidth}>
                                <FloatingLabelInput
                                    label="Price (₹) *"
                                    value={formData.price}
                                    onChangeText={(value) => handleInputChange('price', value)}
                                    placeholder="4500.00"
                                    keyboardType="numeric"
                                />
                            </View>
                            <View style={styles.halfWidth}>
                                <FloatingLabelInput
                                    label="Total Meal Credits *"
                                    value={formData.totalMealCredits}
                                    onChangeText={(value) => handleInputChange('totalMealCredits', value)}
                                    placeholder="30"
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>
                    </View>

                    {/* Appearance */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Appearance</Text>

                        <View style={styles.colorRow}>
                            <View style={[styles.colorPreview, { backgroundColor: formData.colur || '#CCCCCC' }]} />
                            <FloatingLabelInput
                                label="Color (Hex)"
                                value={formData.colur}
                                onChangeText={(value) => handleInputChange('colur', value)}
                                placeholder="#2db365"
                                inputStyle={{ flex: 1 }}
                            />
                            <TouchableOpacity style={styles.pickIconBtn} onPress={() => setColorPickerOpen(true)}>
                                <Ionicons name="color-wand-outline" size={18} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.swatchGrid}>
                            {['#2db365', '#cbc3ba', '#0ea5e9', '#f97316', '#9333ea', '#22c55e', '#ef4444', '#0f766e']
                                .map((c, idx) => (
                                    <TouchableOpacity
                                        key={`${c}-${idx}`}
                                        style={[styles.swatch, { backgroundColor: c }, formData.colur === c && styles.swatchActive]}
                                        onPress={() => handleInputChange('colur', c)}
                                        activeOpacity={0.8}
                                    />
                                ))}
                        </View>
                    </View>

                    <ColorPickerModal
                        visible={colorPickerOpen}
                        value={formData.colur}
                        onChange={(c) => handleInputChange('colur', c)}
                        onClose={() => setColorPickerOpen(false)}
                    />

                    {/* Live Preview */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Preview</Text>
                        <View style={[styles.previewCard, { backgroundColor: formData.colur || '#F3F4F6' }]}>
                            <Text style={styles.previewTitle}>{formData.name || 'Plan Name'}</Text>
                            <Text style={styles.previewDesc} numberOfLines={2}>
                                {formData.description || 'Short description of the plan will appear here.'}
                            </Text>
                            <View style={styles.previewRow}>
                                <View style={styles.previewPill}><Text style={styles.previewPillText}>{formData.totalMealCredits ? `${formData.totalMealCredits} credits` : '30 credits'}</Text></View>
                                <View style={styles.previewPill}><Text style={styles.previewPillText}>{formData.durationInDays ? `${formData.durationInDays} days` : '30 days'}</Text></View>
                            </View>
                            <Text style={styles.previewPrice}>{formData.price ? `₹${formData.price}` : '₹4500'}</Text>
                        </View>
                    </View>
                    {/* Duration Information */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Duration Information</Text>

                        <View style={styles.row}>
                            <View style={[styles.halfWidth]}>
                                <FloatingLabelInput
                                    label="Duration (Days) *"
                                    value={formData.durationInDays}
                                    onChangeText={(value) => handleInputChange('durationInDays', value)}
                                    placeholder="30"
                                    keyboardType="numeric"
                                />
                            </View>
                            <View style={[styles.halfWidth]}>
                                <FloatingLabelInput
                                    label="Extra Days"
                                    value={formData.extraDays}
                                    onChangeText={(value) => handleInputChange('extraDays', value)}
                                    placeholder="5"
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.saveButton]}
                            onPress={handleCreatePlan}
                        >
                            <Text style={styles.saveButtonText}>Create Plan</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
            <AppAlert
                visible={alertState.visible}
                type={alertState.type}
                title={alertState.title}
                message={alertState.message}
                confirmText={'Done'}
                onConfirm={() => {
                    const wasSuccess = alertState.type === 'success';
                    setAlertState({ visible: false, type: 'info', title: '', message: '' });
                    if (wasSuccess) navigation.navigate('ManageSubscriptionPlan');
                }}
                onRequestClose={() => setAlertState({ visible: false, type: 'info', title: '', message: '' })}
            />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ADMIN_COLORS.surface,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        backgroundColor: ADMIN_COLORS.primary,
        padding: 20,
        paddingTop: 60,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#F7FAFC',
    },
    form: {
        padding: 20,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: ADMIN_COLORS.text,
        marginBottom: 12,
    },
    inputGroup: {
        marginBottom: 12,
    },
    halfWidth: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: ADMIN_COLORS.text,
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        color: ADMIN_COLORS.text,
        backgroundColor: '#FFFFFF',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    colorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    colorPreview: {
        width: 40,
        height: 40,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    swatchGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    swatch: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    swatchActive: {
        borderColor: ADMIN_COLORS.primary,
    },
    pickBtn: {
        marginLeft: 6,
        backgroundColor: ADMIN_COLORS.primary,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pickIconBtn: {
        marginLeft: 6,
        backgroundColor: ADMIN_COLORS.primary,
        width: 40,
        height: 40,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pickBtnText: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
        marginBottom: 40,
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: '#F7FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    cancelButtonText: {
        color: ADMIN_COLORS.text,
        fontSize: 16,
        fontWeight: '600',
    },
    saveButton: {
        backgroundColor: ADMIN_COLORS.primary,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    previewCard: {
        borderRadius: 16,
        padding: 16,
    },
    previewTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
    previewDesc: { color: 'rgba(255,255,255,0.9)', marginTop: 6 },
    previewRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
    previewPill: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 9999, paddingHorizontal: 10, paddingVertical: 6 },
    previewPillText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
    previewPrice: { color: '#FFFFFF', fontWeight: '900', fontSize: 22, marginTop: 12 },
});
