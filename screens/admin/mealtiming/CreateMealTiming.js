import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import adminService from '../../../api/adminService';
import mealTimes from '../../../assets/data/mealTimes.json';
import AppAlert from '../../../components/common/AppAlert';
import { ADMIN_COLORS } from '../../../config/colors';

export default function CreateMealTiming({ navigation }) {
    const mealTimeOptions = useMemo(() => mealTimes?.mealTimes || ['BREAKFAST', 'LUNCH', 'DINNER'], []);
    const [formData, setFormData] = useState({
        name: mealTimeOptions[0] || 'BREAKFAST',
        startTime: '',
        endTime: '',
        active: true,
    });

    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [pickerStartDate, setPickerStartDate] = useState(new Date());
    const [pickerEndDate, setPickerEndDate] = useState(new Date());

    const [alertState, setAlertState] = useState({ visible: false, type: 'info', title: '', message: '' });

    const showAlert = (type, title, message) => {
        setAlertState({ visible: true, type, title, message: String(message || '') });
    };

    const extractErrorMessage = (resp) => {
        if (!resp) return 'Something went wrong';
        if (resp.data) {
            if (typeof resp.data === 'string') return resp.data;
            if (resp.data.message) return resp.data.message;
            if (resp.data.error) return resp.data.error;
        }
        return resp.message || 'Request failed';
    };

    const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

    const validate = () => {
        if (!formData.name) { showAlert('warning', 'Missing field', 'Please select a meal time'); return false; }
        const timeRegex = /^\d{2}:\d{2}:\d{2}$/;
        if (!timeRegex.test(formData.startTime)) {
            console.log('[CreateMealTiming] validate fail - startTime invalid:', formData.startTime);
            showAlert('warning', 'Invalid time', 'Start time must be HH:MM:SS');
            return false;
        }
        if (!timeRegex.test(formData.endTime)) {
            console.log('[CreateMealTiming] validate fail - endTime invalid:', formData.endTime);
            showAlert('warning', 'Invalid time', 'End time must be HH:MM:SS');
            return false;
        }
        return true;
    };

    const formatTime = (date) => {
        const h = String(date.getHours()).padStart(2, '0');
        const m = String(date.getMinutes()).padStart(2, '0');
        return `${h}:${m}:00`;
    };

    const parseTimeToDate = (timeStr) => {
        try {
            const date = new Date();
            const [h = '00', m = '00'] = String(timeStr || '').split(':');
            date.setHours(Number(h) || 0);
            date.setMinutes(Number(m) || 0);
            date.setSeconds(0);
            date.setMilliseconds(0);
            return date;
        } catch (e) {
            return new Date();
        }
    };

    const handleCreate = async () => {
        console.log('[CreateMealTiming] formData:', formData);
        if (!validate()) return;
        const payload = {
            name: String(formData.name).toUpperCase(),
            startTime: formData.startTime,
            endTime: formData.endTime,
            active: Boolean(formData.active),
        };
        console.log('[CreateMealTiming] payload:', payload);
        console.log('[CreateMealTiming] calling API /admin/createMealTiming ...');
        const resp = await adminService.createMealTiming(payload);
        console.log('[CreateMealTiming] response:', resp);
        if (resp.type === 'success') {
            const successMsg = (resp.data && (resp.data.message || resp.data.msg)) || resp.message || 'Meal timing created';
            showAlert('success', 'Success', successMsg);
        } else {
            console.log('[CreateMealTiming] error details:', {
                type: resp.type,
                status: resp.status,
                message: resp.message,
                data: resp.data,
                url: resp.url,
                error: resp.error,
            });
            const errorMsg = extractErrorMessage(resp) || 'Failed to create';
            const isNetwork = resp.type === 'network_error' || resp.status === 0;
            const isConflict = resp.status === 409;
            if (isNetwork) {
                showAlert('warning', 'Network issue', errorMsg);
            } else if (isConflict) {
                showAlert('warning', 'Conflict', errorMsg);
            } else {
                showAlert('error', 'Ooops', errorMsg);
            }
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.form}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Meal Time</Text>
                        <View style={styles.pickerWrapper}>
                            <Picker selectedValue={formData.name} onValueChange={(v) => handleChange('name', v)} style={styles.picker}>
                                {mealTimeOptions.map((t) => (
                                    <Picker.Item key={t} label={t} value={t} />
                                ))}
                            </Picker>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Timing</Text>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => {
                                setPickerStartDate(parseTimeToDate(formData.startTime));
                                setShowStartPicker(true);
                                console.log('[CreateMealTiming] open start time picker');
                            }}
                            style={styles.timeField}
                        >
                            <Text style={styles.timeFieldLabel}>Start Time</Text>
                            <Text style={styles.timeFieldValue}>{formData.startTime || 'Select time'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => {
                                setPickerEndDate(parseTimeToDate(formData.endTime));
                                setShowEndPicker(true);
                                console.log('[CreateMealTiming] open end time picker');
                            }}
                            style={styles.timeField}
                        >
                            <Text style={styles.timeFieldLabel}>End Time</Text>
                            <Text style={styles.timeFieldValue}>{formData.endTime || 'Select time'}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Status</Text>
                        <View style={styles.statusRow}>
                            <Text style={styles.statusLabel}>Active</Text>
                            <TouchableOpacity
                                onPress={() => handleChange('active', !formData.active)}
                                style={[styles.toggle, formData.active ? styles.toggleOn : styles.toggleOff]}
                            >
                                <Ionicons name={formData.active ? 'checkmark' : 'close'} size={16} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => navigation.goBack()}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleCreate}>
                            <Text style={styles.saveText}>Create</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
            {showStartPicker && (
                <DateTimePicker
                    value={pickerStartDate}
                    mode="time"
                    is24Hour={true}
                    display={Platform.OS === 'ios' ? 'spinner' : 'clock'}
                    onChange={(event, selectedDate) => {
                        if (Platform.OS !== 'ios') setShowStartPicker(false);
                        if (selectedDate) {
                            setPickerStartDate(selectedDate);
                            const v = formatTime(selectedDate);
                            console.log('[CreateMealTiming] start time selected:', v);
                            handleChange('startTime', v);
                        }
                    }}
                />
            )}
            {showEndPicker && (
                <DateTimePicker
                    value={pickerEndDate}
                    mode="time"
                    is24Hour={true}
                    display={Platform.OS === 'ios' ? 'spinner' : 'clock'}
                    onChange={(event, selectedDate) => {
                        if (Platform.OS !== 'ios') setShowEndPicker(false);
                        if (selectedDate) {
                            setPickerEndDate(selectedDate);
                            const v = formatTime(selectedDate);
                            console.log('[CreateMealTiming] end time selected:', v);
                            handleChange('endTime', v);
                        }
                    }}
                />
            )}
            <AppAlert
                visible={alertState.visible}
                type={alertState.type}
                title={alertState.title}
                message={alertState.message}
                confirmText={'Done'}
                onConfirm={() => {
                    const wasSuccess = alertState.type === 'success';
                    setAlertState({ visible: false, type: 'info', title: '', message: '' });
                    if (wasSuccess) navigation.goBack();
                }}
                onRequestClose={() => setAlertState({ visible: false, type: 'info', title: '', message: '' })}
            />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: ADMIN_COLORS.surface },
    scrollView: { flex: 1 },
    form: { padding: 20 },
    section: { marginBottom: 18 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: ADMIN_COLORS.text, marginBottom: 8 },
    pickerWrapper: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, backgroundColor: '#FFFFFF' },
    picker: { height: 48, color: ADMIN_COLORS.text },
    statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12 },
    statusLabel: { color: ADMIN_COLORS.text },
    toggle: { width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    toggleOn: { backgroundColor: '#10B981' },
    toggleOff: { backgroundColor: '#EF4444' },
    buttonRow: { flexDirection: 'row', gap: 12, marginTop: 6 },
    button: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 8 },
    cancelButton: { backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#E2E8F0' },
    cancelText: { color: ADMIN_COLORS.text, fontWeight: '600' },
    saveButton: { backgroundColor: ADMIN_COLORS.primary },
    saveText: { color: '#FFFFFF', fontWeight: '700' },
    timeField: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 12, marginBottom: 10 },
    timeFieldLabel: { color: '#6B7280', fontSize: 12, marginBottom: 4 },
    timeFieldValue: { color: ADMIN_COLORS.text, fontWeight: '600' },
});


