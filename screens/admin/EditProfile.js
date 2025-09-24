import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import adminService from '../../api/adminService';
import locationsData from '../../assets/data/locations.json';
import messTypesData from '../../assets/data/messTypes.json';
import { ADMIN_COLORS } from '../../config/colors';

export default function EditProfile() {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [mess, setMess] = useState(null);

    // Dropdown states
    const [stateDropdownOpen, setStateDropdownOpen] = useState(false);
    const [districtDropdownOpen, setDistrictDropdownOpen] = useState(false);
    const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
    const [messTypeDropdownOpen, setMessTypeDropdownOpen] = useState(false);
    const [availableDistricts, setAvailableDistricts] = useState([]);
    const [availableCities, setAvailableCities] = useState([]);

    // Form fields
    const [formData, setFormData] = useState({
        messName: '',
        ownerName: '',
        email: '',
        phoneNumber: '',
        address: '',
        district: '',
        city: '',
        state: '',
        country: 'India',
        messType: '',
        description: '',
        notes: ''
    });

    useEffect(() => {
        loadMessData();
    }, []);

    const loadMessData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await adminService.getOwnMess();
            if (response.type === 'success') {
                setMess(response.data);
                setFormData({
                    messName: response.data?.messName || '',
                    ownerName: response.data?.ownerName || '',
                    email: response.data?.email || '',
                    phoneNumber: response.data?.phoneNumber || '',
                    address: response.data?.address || '',
                    district: response.data?.district || '',
                    city: response.data?.city || '',
                    state: response.data?.state || '',
                    country: response.data?.country || 'India',
                    messType: response.data?.messType || '',
                    description: response.data?.description || '',
                    notes: response.data?.notes || ''
                });
            } else {
                setError(response.message || 'Failed to load mess data');
            }
        } catch (error) {
            setError('Failed to load mess data: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // If state changes, update available districts and reset district/city
        if (field === 'state') {
            const districts = locationsData[value] ? Object.keys(locationsData[value]) : [];
            setAvailableDistricts(districts);
            if (value !== formData.state) {
                setFormData(prev => ({
                    ...prev,
                    district: '',
                    city: ''
                }));
            }
        }

        // If district changes, update available cities and reset city
        if (field === 'district') {
            const cities = locationsData[formData.state] && locationsData[formData.state][value]
                ? locationsData[formData.state][value]
                : [];
            setAvailableCities(cities);
            if (value !== formData.district) {
                setFormData(prev => ({
                    ...prev,
                    city: ''
                }));
            }
        }
    };

    const handleStateSelect = (state) => {
        handleInputChange('state', state);
        setStateDropdownOpen(false);
    };

    const handleDistrictSelect = (district) => {
        handleInputChange('district', district);
        setDistrictDropdownOpen(false);
    };

    const handleCitySelect = (city) => {
        handleInputChange('city', city);
        setCityDropdownOpen(false);
    };

    const handleMessTypeSelect = (messType) => {
        handleInputChange('messType', messType);
        setMessTypeDropdownOpen(false);
    };

    const getStates = () => {
        try {
            return Object.keys(locationsData || {});
        } catch (error) {
            return [];
        }
    };

    const getDistricts = () => {
        try {
            if (!formData.state || !locationsData || !locationsData[formData.state]) {
                return [];
            }
            return Object.keys(locationsData[formData.state]);
        } catch (error) {
            return [];
        }
    };

    const getCities = () => {
        try {
            if (!formData.state || !formData.district || !locationsData || !locationsData[formData.state] || !locationsData[formData.state][formData.district]) {
                return [];
            }
            return locationsData[formData.state][formData.district] || [];
        } catch (error) {
            return [];
        }
    };

    const getMessTypes = () => {
        try {
            return messTypesData?.messTypes || [];
        } catch (error) {
            return [];
        }
    };

    const handleSave = async () => {
        if (!mess) {
            Alert.alert('Error', 'No mess data available');
            return;
        }

        // Basic validation
        if (!formData.messName.trim()) {
            Alert.alert('Error', 'Mess name is required');
            return;
        }
        if (!formData.ownerName.trim()) {
            Alert.alert('Error', 'Owner name is required');
            return;
        }
        if (!formData.email.trim()) {
            Alert.alert('Error', 'Email is required');
            return;
        }
        if (!formData.phoneNumber.trim()) {
            Alert.alert('Error', 'Phone number is required');
            return;
        }

        setSaving(true);
        try {
            const updateData = {
                id: mess.id,
                userId: mess.userId,
                superAdminId: mess.superAdminId,
                messNumber: mess.messNumber,
                email: formData.email.trim(),
                ownerName: formData.ownerName.trim(),
                messName: formData.messName.trim(),
                phoneNumber: formData.phoneNumber.trim(),
                address: formData.address.trim(),
                district: formData.district.trim(),
                city: formData.city.trim(),
                state: formData.state.trim(),
                country: formData.country.trim(),
                status: mess.status,
                messType: formData.messType.trim(),
                description: formData.description.trim(),
                notes: formData.notes.trim()
            };

            const response = await adminService.updateOwnMess(updateData);
            if (response.type === 'success') {
                Alert.alert('Success', 'Profile updated successfully', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            } else {
                Alert.alert('Error', response.message || 'Failed to update profile');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to update profile: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={ADMIN_COLORS.primary} />
                <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={loadMessData}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // State Dropdown Component
    const StateDropdown = () => (
        <View>
            <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setStateDropdownOpen(true)}
            >
                <Text style={formData.state ? styles.dropdownText : styles.dropdownPlaceholder}>
                    {formData.state || 'Select state'}
                </Text>
                <Text style={styles.dropdownCaret}>▼</Text>
            </TouchableOpacity>

            <Modal
                visible={stateDropdownOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setStateDropdownOpen(false)}
            >
                <Pressable style={styles.modalBackdrop} onPress={() => setStateDropdownOpen(false)} />
                <View style={styles.dropdownModal}>
                    <Text style={styles.modalTitle}>Select State</Text>
                    <FlatList
                        data={getStates()}
                        keyExtractor={(item, index) => item || index.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.dropdownOption}
                                onPress={() => handleStateSelect(item)}
                            >
                                <Text style={styles.dropdownOptionText}>{item || ''}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </Modal>
        </View>
    );

    // District Dropdown Component
    const DistrictDropdown = () => (
        <View>
            <TouchableOpacity
                style={[styles.dropdownButton, !formData.state && styles.dropdownDisabled]}
                onPress={() => formData.state && setDistrictDropdownOpen(true)}
                disabled={!formData.state}
            >
                <Text style={formData.district ? styles.dropdownText : styles.dropdownPlaceholder}>
                    {formData.district || 'Select district'}
                </Text>
                <Text style={[styles.dropdownCaret, !formData.state && styles.dropdownCaretDisabled]}>▼</Text>
            </TouchableOpacity>

            <Modal
                visible={districtDropdownOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setDistrictDropdownOpen(false)}
            >
                <Pressable style={styles.modalBackdrop} onPress={() => setDistrictDropdownOpen(false)} />
                <View style={styles.dropdownModal}>
                    <Text style={styles.modalTitle}>Select District</Text>
                    <FlatList
                        data={getDistricts()}
                        keyExtractor={(item, index) => item || index.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.dropdownOption}
                                onPress={() => handleDistrictSelect(item)}
                            >
                                <Text style={styles.dropdownOptionText}>{item || ''}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </Modal>
        </View>
    );

    // City Dropdown Component
    const CityDropdown = () => (
        <View>
            <TouchableOpacity
                style={[styles.dropdownButton, (!formData.state || !formData.district) && styles.dropdownDisabled]}
                onPress={() => (formData.state && formData.district) && setCityDropdownOpen(true)}
                disabled={!formData.state || !formData.district}
            >
                <Text style={formData.city ? styles.dropdownText : styles.dropdownPlaceholder}>
                    {formData.city || 'Select city'}
                </Text>
                <Text style={[styles.dropdownCaret, (!formData.state || !formData.district) && styles.dropdownCaretDisabled]}>▼</Text>
            </TouchableOpacity>

            <Modal
                visible={cityDropdownOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setCityDropdownOpen(false)}
            >
                <Pressable style={styles.modalBackdrop} onPress={() => setCityDropdownOpen(false)} />
                <View style={styles.dropdownModal}>
                    <Text style={styles.modalTitle}>Select City</Text>
                    <FlatList
                        data={getCities()}
                        keyExtractor={(item, index) => item || index.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.dropdownOption}
                                onPress={() => handleCitySelect(item)}
                            >
                                <Text style={styles.dropdownOptionText}>{item || ''}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </Modal>
        </View>
    );

    // Mess Type Dropdown Component
    const MessTypeDropdown = () => (
        <View>
            <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setMessTypeDropdownOpen(true)}
            >
                <Text style={formData.messType ? styles.dropdownText : styles.dropdownPlaceholder}>
                    {formData.messType || 'Select mess type'}
                </Text>
                <Text style={styles.dropdownCaret}>▼</Text>
            </TouchableOpacity>

            <Modal
                visible={messTypeDropdownOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setMessTypeDropdownOpen(false)}
            >
                <Pressable style={styles.modalBackdrop} onPress={() => setMessTypeDropdownOpen(false)} />
                <View style={styles.dropdownModal}>
                    <Text style={styles.modalTitle}>Select Mess Type</Text>
                    <FlatList
                        data={getMessTypes()}
                        keyExtractor={(item, index) => item || index.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.dropdownOption}
                                onPress={() => handleMessTypeSelect(item)}
                            >
                                <Text style={styles.dropdownOptionText}>{item || ''}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </Modal>
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Edit Mess Profile</Text>
                    <Text style={styles.headerSubtitle}>Update your mess information</Text>
                </View>

                <View style={styles.form}>
                    {/* Mess Information */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Mess Information</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Mess Name *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.messName}
                                onChangeText={(value) => handleInputChange('messName', value)}
                                placeholder="Enter mess name"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Mess Type</Text>
                            <MessTypeDropdown />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Description</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={formData.description}
                                onChangeText={(value) => handleInputChange('description', value)}
                                placeholder="Describe your mess..."
                                multiline
                                numberOfLines={3}
                            />
                        </View>
                    </View>

                    {/* Owner Information */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Owner Information</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Owner Name *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.ownerName}
                                onChangeText={(value) => handleInputChange('ownerName', value)}
                                placeholder="Enter owner name"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.email}
                                onChangeText={(value) => handleInputChange('email', value)}
                                placeholder="Enter email"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Phone Number *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.phoneNumber}
                                onChangeText={(value) => handleInputChange('phoneNumber', value)}
                                placeholder="Enter phone number"
                                keyboardType="phone-pad"
                            />
                        </View>
                    </View>

                    {/* Address Information */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Address Information</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Address</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={formData.address}
                                onChangeText={(value) => handleInputChange('address', value)}
                                placeholder="Enter full address"
                                multiline
                                numberOfLines={2}
                            />
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, styles.halfWidth]}>
                                <Text style={styles.label}>Country</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.country}
                                    onChangeText={(value) => handleInputChange('country', value)}
                                    placeholder="Country"
                                    editable={false}
                                />
                            </View>

                            <View style={[styles.inputGroup, styles.halfWidth]}>
                                <Text style={styles.label}>State</Text>
                                <StateDropdown />
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, styles.halfWidth]}>
                                <Text style={styles.label}>District</Text>
                                <DistrictDropdown />
                            </View>
                            <View style={[styles.inputGroup, styles.halfWidth]}>
                                <Text style={styles.label}>City</Text>
                                <CityDropdown />
                            </View>
                        </View>

                    </View>

                    {/* Additional Information */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Additional Information</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Notes</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={formData.notes}
                                onChangeText={(value) => handleInputChange('notes', value)}
                                placeholder="Any additional notes..."
                                multiline
                                numberOfLines={3}
                            />
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
                            onPress={handleSave}
                            disabled={saving}
                        >
                            {saving ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Text style={styles.saveButtonText}>Save Changes</Text>
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
    errorText: {
        fontSize: 16,
        color: '#E53E3E',
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: ADMIN_COLORS.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
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
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: ADMIN_COLORS.text,
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
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
    // Dropdown styles
    dropdownButton: {
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dropdownDisabled: {
        backgroundColor: '#F7FAFC',
        borderColor: '#CBD5E0',
    },
    dropdownText: {
        fontSize: 16,
        color: ADMIN_COLORS.text,
    },
    dropdownPlaceholder: {
        fontSize: 16,
        color: '#9CA3AF',
    },
    dropdownCaret: {
        fontSize: 12,
        color: ADMIN_COLORS.text,
    },
    dropdownCaretDisabled: {
        color: '#CBD5E0',
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    dropdownModal: {
        position: 'absolute',
        left: 20,
        right: 20,
        top: 100,
        bottom: 100,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: ADMIN_COLORS.text,
        marginBottom: 16,
        textAlign: 'center',
    },
    dropdownOption: {
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    dropdownOptionText: {
        fontSize: 16,
        color: ADMIN_COLORS.text,
    },
});
