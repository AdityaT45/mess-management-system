import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import adminService from '../../../api/adminService';
import { ADMIN_COLORS } from '../../../config/colors';

export default function EditSubscriptionPlan({ navigation, route }) {
    const { plan } = route.params;
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        totalMealCredits: '',
        durationInDays: '',
        extraDays: ''
    });

    useEffect(() => {
        loadPlanData();
    }, []);

    const loadPlanData = async () => {
        setLoading(true);
        try {
            const response = await adminService.getPlanById(plan.id);
            if (response.type === 'success') {
                const planData = response.data;
                setFormData({
                    name: planData.name || '',
                    description: planData.description || '',
                    price: planData.price?.toString() || '',
                    totalMealCredits: planData.totalMealCredits?.toString() || '',
                    durationInDays: planData.durationInDays?.toString() || '',
                    extraDays: planData.extraDays?.toString() || ''
                });
            } else {
                Alert.alert('Error', response.message || 'Failed to load plan data');
                navigation.goBack();
            }
        } catch (error) {
            console.error('Error loading plan:', error);
            Alert.alert('Error', 'Failed to load plan data');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleUpdatePlan = async () => {
        // Validation
        if (!formData.name.trim()) {
            Alert.alert('Error', 'Plan name is required');
            return;
        }
        if (!formData.description.trim()) {
            Alert.alert('Error', 'Plan description is required');
            return;
        }
        if (!formData.price || parseFloat(formData.price) <= 0) {
            Alert.alert('Error', 'Valid price is required');
            return;
        }
        if (!formData.totalMealCredits || parseInt(formData.totalMealCredits) <= 0) {
            Alert.alert('Error', 'Valid meal credits is required');
            return;
        }
        if (!formData.durationInDays || parseInt(formData.durationInDays) <= 0) {
            Alert.alert('Error', 'Valid duration is required');
            return;
        }

        setSaving(true);
        try {
            const planData = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                price: parseFloat(formData.price),
                totalMealCredits: parseInt(formData.totalMealCredits),
                durationInDays: parseInt(formData.durationInDays),
                extraDays: parseInt(formData.extraDays) || 0
            };

            console.log('Updating plan:', planData);

            const response = await adminService.updateSubscriptionPlan(plan.id, planData);

            if (response.type === 'success') {
                Alert.alert('Success', 'Subscription plan updated successfully!', [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('ManageSubscriptionPlan')
                    }
                ]);
            } else {
                Alert.alert('Error', response.message || 'Failed to update plan');
            }

        } catch (error) {
            console.error('Error updating plan:', error);
            Alert.alert('Error', 'Failed to update plan');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={ADMIN_COLORS.primary} />
                <Text style={styles.loadingText}>Loading plan data...</Text>
            </View>
        );
    }

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

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Plan Name *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.name}
                                onChangeText={(value) => handleInputChange('name', value)}
                                placeholder="e.g., Monthly Half Meal Plan"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Description *</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={formData.description}
                                onChangeText={(value) => handleInputChange('description', value)}
                                placeholder="e.g., Includes daily veg lunch and dinner for one month"
                                multiline
                                numberOfLines={3}
                            />
                        </View>
                    </View>

                    {/* Pricing Information */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Pricing Information</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Price (₹) *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.price}
                                onChangeText={(value) => handleInputChange('price', value)}
                                placeholder="4500.00"
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Total Meal Credits *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.totalMealCredits}
                                onChangeText={(value) => handleInputChange('totalMealCredits', value)}
                                placeholder="30"
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    {/* Duration Information */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Duration Information</Text>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, styles.halfWidth]}>
                                <Text style={styles.label}>Duration (Days) *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.durationInDays}
                                    onChangeText={(value) => handleInputChange('durationInDays', value)}
                                    placeholder="30"
                                    keyboardType="numeric"
                                />
                            </View>
                            <View style={[styles.inputGroup, styles.halfWidth]}>
                                <Text style={styles.label}>Extra Days</Text>
                                <TextInput
                                    style={styles.input}
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
                            style={[styles.button, styles.saveButton, saving && styles.saveButtonDisabled]}
                            onPress={handleUpdatePlan}
                            disabled={saving}
                        >
                            {saving ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Text style={styles.saveButtonText}>Update Plan</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ADMIN_COLORS.surface,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: ADMIN_COLORS.surface,
        padding: 20,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: ADMIN_COLORS.text,
    },
    scrollView: {
        flex: 1,
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
    saveButtonDisabled: {
        backgroundColor: '#CBD5E0',
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

