import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import adminService from '../../../../api/adminService';
import Dropdown from '../../../../components/common/Dropdown';
import { ADMIN_COLORS } from '../../../../config/colors';

export default function AssignSubscription() {
    const [customers, setCustomers] = useState([]);
    const [plans, setPlans] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [startDate, setStartDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [customersRes, plansRes] = await Promise.all([
                adminService.getEligibleCustomersForSubscription({ page: 0, size: 100 }),
                adminService.getSubscriptionPlans(),
            ]);

            if (customersRes.type === 'success') {
                const list = Array.isArray(customersRes.data?.content)
                    ? customersRes.data.content
                    : Array.isArray(customersRes.data?.items)
                        ? customersRes.data.items
                        : Array.isArray(customersRes.data)
                            ? customersRes.data
                            : [];
                setCustomers(list);
            } else {
                Alert.alert('Error', customersRes.message || 'Failed to load customers');
            }

            if (plansRes.type === 'success') {
                const list = Array.isArray(plansRes.data?.content)
                    ? plansRes.data.content
                    : Array.isArray(plansRes.data?.items)
                        ? plansRes.data.items
                        : Array.isArray(plansRes.data)
                            ? plansRes.data
                            : [];
                setPlans(list);
            } else {
                Alert.alert('Error', plansRes.message || 'Failed to load plans');
            }
        } catch (e) {
            Alert.alert('Error', 'Failed to load data');
        }
    };

    const customerOptions = useMemo(() => {
        const toId = (c) => c?.id || c?._id || c?.customerId || c?.customerID || c?.customer_id || c?.userId || c?.userID;
        const toNameParts = (c) => {
            const first = c?.firstName || c?.firstname || c?.first_name;
            const last = c?.lastName || c?.lastname || c?.last_name;
            const name = c?.name || c?.fullName || c?.full_name || [first, last].filter(Boolean).join(' ').trim();
            const phone = c?.phone || c?.mobile || c?.contactNumber || c?.contact_no;
            return { title: name || phone || '', subtitle: phone && name ? phone : '' };
        };
        return (Array.isArray(customers) ? customers : [])
            .map((c) => {
                const id = toId(c);
                const { title, subtitle } = toNameParts(c);
                return id ? { key: String(id), title, subtitle, value: String(id) } : null;
            })
            .filter(Boolean);
    }, [customers]);
    const planOptions = useMemo(() => plans.map(p => ({ key: p.id || p._id, label: p.name, value: p.id || p._id })), [plans]);

    const formattedDate = useMemo(() => {
        const yyyy = startDate.getFullYear();
        const mm = String(startDate.getMonth() + 1).padStart(2, '0');
        const dd = String(startDate.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }, [startDate]);

    const handleSubmit = async () => {
        if (!selectedCustomer || !selectedPlan || !startDate) {
            Alert.alert('Validation', 'Please select customer, plan and start date');
            return;
        }
        setSubmitting(true);
        try {
            const yyyy = startDate.getFullYear();
            const mm = String(startDate.getMonth() + 1).padStart(2, '0');
            const dd = String(startDate.getDate()).padStart(2, '0');
            const payload = {
                customerId: selectedCustomer.value,
                planId: selectedPlan.value,
                startDate: `${yyyy}-${mm}-${dd}T00:00:00`,
            };

            const res = await adminService.assignSubscriptionToCustomer(payload);
            if (res.type === 'success') {
                Alert.alert('Success', 'Subscription assigned successfully');
            } else {
                Alert.alert('Error', res.message || 'Failed to assign subscription');
            }
        } catch (e) {
            Alert.alert('Error', 'Failed to assign subscription');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Assign Subscription</Text>

                <Dropdown
                    label="Customer"
                    value={selectedCustomer ? selectedCustomer.title : ''}
                    options={customerOptions}
                    onSelect={(item) => {
                        setSelectedCustomer(item || null);
                    }}
                    placeholder="Select customer"
                />

                <Dropdown
                    label="Plan"
                    value={selectedPlan?.label}
                    options={planOptions.map(o => o.label)}
                    onSelect={(label) => {
                        const found = planOptions.find(o => o.label === label);
                        setSelectedPlan(found || null);
                    }}
                    placeholder="Select plan"
                />

                <Text style={styles.label}>Start Date</Text>
                <TouchableOpacity style={styles.dateField} onPress={() => setShowDatePicker(true)} activeOpacity={0.7}>
                    <Text style={formattedDate ? styles.valueText : styles.placeholder}>{formattedDate || 'Select date'}</Text>
                </TouchableOpacity>
                {showDatePicker && (
                    <DateTimePicker
                        value={startDate}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(event, date) => {
                            if (Platform.OS === 'android') {
                                setShowDatePicker(false);
                            }
                            if (date) {
                                setStartDate(date);
                            }
                        }}
                        onTouchCancel={() => setShowDatePicker(false)}
                    />
                )}

                <TouchableOpacity style={[styles.button, submitting && styles.buttonDisabled]} disabled={submitting} onPress={handleSubmit}>
                    <Text style={styles.buttonText}>{submitting ? 'Assigning...' : 'Assign Subscription'}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: ADMIN_COLORS.surface, padding: 16 },
    card: { backgroundColor: '#fff', borderRadius: 12, padding: 16 },
    title: { fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 12 },
    label: { fontSize: 12, color: '#666', marginBottom: 6, marginTop: 8 },
    dateWrap: { backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#e5e5e5', padding: 4 },
    dateField: { backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#e5e5e5', paddingHorizontal: 12, paddingVertical: 12 },
    valueText: { color: '#111' },
    button: { backgroundColor: ADMIN_COLORS.primary, paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 16 },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: '#fff', fontWeight: '600' },
});


