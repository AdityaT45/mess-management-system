import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React, { useMemo } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import locations from '../../../assets/data/locations.json';
import messTypesData from '../../../assets/data/messTypes.json';
import FloatingLabelInput from '../../../components/common/FloatingLabelInput';

export default function AddMessFormModal({
    visible,
    onClose,
    newMess,
    setNewMess,
    formErrors = {},
    onSubmit,
}) {
    const states = useMemo(() => Object.keys(locations || {}), []);
    const cities = useMemo(
        () => Object.keys((locations || {})[newMess.state] || {}),
        [newMess.state]
    );
    const messTypes = useMemo(() => messTypesData?.messTypes || [], []);

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.addMessModal}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Add New Mess</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#718096" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
                        {/* Owner Information */}
                        <View style={styles.formSection}>
                            <Text style={styles.sectionTitle}>Owner Information</Text>

                            <View style={styles.inputGroupTight}>
                                <FloatingLabelInput
                                    label="Owner Name *"
                                    value={newMess.ownerName}
                                    onChangeText={(text) => setNewMess({ ...newMess, ownerName: text })}
                                    inputStyle={[styles.input, formErrors.ownerName && styles.inputError]}
                                />
                                {formErrors.ownerName ? (
                                    <Text style={styles.errorText}>{formErrors.ownerName}</Text>
                                ) : null}
                            </View>

                            <View style={styles.inputRow}>
                                <View style={{ flex: 1 }}>
                                    <FloatingLabelInput
                                        label="Phone Number *"
                                        value={newMess.phoneNumber}
                                        onChangeText={(text) => setNewMess({ ...newMess, phoneNumber: text })}
                                        keyboardType="phone-pad"
                                        inputStyle={[styles.input, formErrors.phoneNumber && styles.inputError]}
                                    />
                                    {formErrors.phoneNumber ? (
                                        <Text style={styles.errorText}>{formErrors.phoneNumber}</Text>
                                    ) : null}
                                </View>
                                <View style={{ width: 10 }} />
                                <View style={{ flex: 1 }}>
                                    <FloatingLabelInput
                                        label="Email Address *"
                                        value={newMess.emailAddress}
                                        onChangeText={(text) => setNewMess({ ...newMess, emailAddress: text })}
                                        keyboardType="email-address"
                                        inputStyle={[styles.input, formErrors.emailAddress && styles.inputError]}
                                    />
                                    {formErrors.emailAddress ? (
                                        <Text style={styles.errorText}>{formErrors.emailAddress}</Text>
                                    ) : null}
                                </View>
                            </View>

                            <View style={styles.inputGroupTight}>
                                <FloatingLabelInput
                                    label="Password *"
                                    value={newMess.password}
                                    onChangeText={(text) => setNewMess({ ...newMess, password: text })}
                                    inputStyle={[styles.input, formErrors.password && styles.inputError]}
                                    secureTextEntry
                                />
                                {formErrors.password ? (
                                    <Text style={styles.errorText}>{formErrors.password}</Text>
                                ) : null}
                            </View>
                        </View>

                        {/* Location */}
                        <View style={styles.formSection}>
                            <Text style={styles.sectionTitle}>Location</Text>

                            <View style={styles.inputGroupTight}>
                                <FloatingLabelInput
                                    label="Address"
                                    value={newMess.address}
                                    onChangeText={(text) => setNewMess({ ...newMess, address: text })}
                                    multiline
                                    numberOfLines={3}
                                    inputStyle={[styles.input, styles.textArea]}
                                />
                            </View>

                            <View style={styles.inputRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.inputLabel}>Country</Text>
                                    <View style={[styles.readonlyBox, styles.input]}>
                                        <Text>India</Text>
                                    </View>
                                </View>
                                <View style={{ width: 10 }} />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.inputLabel}>State *</Text>
                                    <View style={styles.pickerWrapper}>
                                        <Picker
                                            selectedValue={newMess.state}
                                            onValueChange={(value) => setNewMess({ ...newMess, state: value, city: '' })}
                                            style={styles.picker}
                                            mode="dropdown"
                                            dropdownIconColor="#6B7280"
                                        >
                                            <Picker.Item label="Select State" value="" color="#9CA3AF" />
                                            {states.map((s) => (
                                                <Picker.Item key={s} label={s} value={s} color="#111827" />
                                            ))}
                                        </Picker>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.inputGroupTight}>
                                <Text style={styles.inputLabel}>City *</Text>
                                <View style={styles.pickerWrapper}>
                                    <Picker
                                        selectedValue={newMess.city}
                                        onValueChange={(value) => setNewMess({ ...newMess, city: value })}
                                        style={styles.picker}
                                        mode="dropdown"
                                        dropdownIconColor="#6B7280"
                                    >
                                        <Picker.Item label="Select City" value="" color="#9CA3AF" />
                                        {cities.map((c) => (
                                            <Picker.Item key={c} label={c} value={c} color="#111827" />
                                        ))}
                                    </Picker>
                                </View>
                            </View>
                        </View>

                        {/* Mess Details */}
                        <View style={styles.formSection}>
                            <Text style={styles.sectionTitle}>Mess Details</Text>
                            <View style={styles.inputGroupTight}>
                                <Text style={styles.inputLabel}>Mess Type</Text>
                                <View style={styles.pickerWrapper}>
                                    <Picker
                                        selectedValue={newMess.messType}
                                        onValueChange={(value) => setNewMess({ ...newMess, messType: value })}
                                        style={styles.picker}
                                        mode="dropdown"
                                        dropdownIconColor="#6B7280"
                                    >
                                        {messTypes.map((t) => (
                                            <Picker.Item key={t} label={t} value={t} color="#111827" />
                                        ))}
                                    </Picker>
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Mess Description</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Describe your mess (cuisine, specialties, etc.)"
                                    value={newMess.messDescription}
                                    onChangeText={(text) => setNewMess({ ...newMess, messDescription: text })}
                                    multiline
                                    numberOfLines={3}
                                />
                            </View>
                        </View>

                        {/* Additional Information */}
                        <View style={styles.formSection}>
                            <Text style={styles.sectionTitle}>Additional Information</Text>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Notes</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Any additional notes or special requirements"
                                    value={newMess.notes}
                                    onChangeText={(text) => setNewMess({ ...newMess, notes: text })}
                                    multiline
                                    numberOfLines={3}
                                />
                            </View>
                        </View>
                    </ScrollView>

                    <View style={styles.modalActions}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.addMessButton} onPress={onSubmit}>
                            <Text style={styles.addMessButtonText}>Add Mess</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    formContainer: { maxHeight: 400 },
    formSection: { marginBottom: 14 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 6 },
    inputRow: { flexDirection: 'row', alignItems: 'flex-start' },
    inputGroupTight: { marginBottom: 10 },
    inputLabel: { fontSize: 12, color: '#6B7280', marginBottom: 6 },
    input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 12 },
    inputError: { borderColor: '#EF4444' },
    textArea: { minHeight: 96, paddingTop: 12 },
    errorText: { color: '#EF4444', fontSize: 12, marginTop: 4 },
    pickerWrapper: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, backgroundColor: '#FFFFFF', paddingHorizontal: 6 },
    picker: { height: 48, color: '#111827', fontSize: 14 },
    readonlyBox: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, backgroundColor: '#F9FAFB', paddingVertical: 12, paddingHorizontal: 12 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
    addMessModal: { backgroundColor: '#FFFFFF', borderRadius: 20, width: '95%', maxHeight: '90%', padding: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: '600', color: '#2D3748' },
    modalActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
    cancelButton: { flex: 1, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFFFFF', alignItems: 'center' },
    cancelButtonText: { color: '#718096', fontSize: 16, fontWeight: '500' },
    addMessButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#8B5CF6', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, gap: 8, minWidth: 140 },
    addMessButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
});



