import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, LayoutAnimation, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';
import { useDispatch } from 'react-redux';
import authService from '../../api/authService';
import customerService from '../../api/customerService';
import CUSTOMER_COLORS from '../../config/colors';
import { logout as logoutAction } from '../../store/slices/authSlice';

export default function Profile() {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [profile, setProfile] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    // Enable layout animation on Android
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            setLoading(true);
            setError(null);
            const res = await customerService.getMyProfile();
            if (!mounted) return;
            if (res.type === 'success') {
                setProfile(res.data);
            } else {
                setError(res.message || 'Failed to load profile');
            }
            setLoading(false);
        };
        load();
        return () => { mounted = false; };
    }, []);

    const profileImageUri = useMemo(() => {
        if (!profile?.profileImage) return null;
        // If API returns raw base64, prefix with data URI
        const isAlreadyDataUri = String(profile.profileImage).startsWith('data:image');
        return isAlreadyDataUri ? profile.profileImage : `data:image/jpeg;base64,${profile.profileImage}`;
    }, [profile]);

    const onLogout = async () => {
        try {
            await authService.logout();
        } finally {
            dispatch(logoutAction());
        }
    };

    const onEditProfile = () => {
        // Try navigate if route exists; else fallback to alert
        try {
            navigation.navigate('EditProfile');
        } catch (e) {
            Alert.alert('Edit Profile', 'Edit screen not available yet.');
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#333" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <Text style={styles.error}>{error}</Text>
                <TouchableOpacity style={styles.button} onPress={() => {
                    setLoading(true);
                    setError(null);
                    setTimeout(async () => {
                        const res = await customerService.getMyProfile();
                        if (res.type === 'success') setProfile(res.data); else setError(res.message);
                        setLoading(false);
                    }, 0);
                }}>
                    <Text style={styles.buttonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.scroll}>
            <View style={styles.card}>
                <View style={styles.headerRow}>
                    {profileImageUri ? (
                        <Image source={{ uri: profileImageUri }} style={styles.avatar} resizeMode="cover" />
                    ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder]}>
                            <Text style={styles.avatarInitial}>{(profile?.name || 'U').charAt(0).toUpperCase()}</Text>
                        </View>
                    )}
                    <View style={styles.headerTextWrap}>
                        <Text style={styles.name}>{profile?.name || '-'}</Text>
                        <Text style={styles.email}>{profile?.email || '-'}</Text>
                        <View style={styles.badgeRow}>
                            {profile?.planeType ? (
                                <View style={[styles.badge, styles.badgePrimary]}>
                                    <Text style={styles.badgeText}>{profile.planeType}</Text>
                                </View>
                            ) : null}
                            <View style={[styles.badge, profile?.status ? styles.badgeSuccess : styles.badgeMuted]}>
                                <Text style={styles.badgeText}>{profile?.status ? 'Active' : 'Inactive'}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.quickGrid}>
                    <InfoMini label="Phone" value={profile?.phoneNumber} />
                    <InfoMini label="Gender" value={profile?.gender || '-'} />
                    <InfoMini label="Start" value={formatDate(profile?.startDate)} />
                    <InfoMini label="End" value={formatDate(profile?.endDate)} />
                </View>

                <TouchableOpacity
                    style={styles.disclosure}
                    onPress={() => {
                        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                        setShowDetails(v => !v);
                    }}
                >
                    <Text style={styles.disclosureText}>{showDetails ? 'Hide details' : 'Show details'}</Text>
                    <Text style={styles.disclosureIcon}>{showDetails ? '▴' : '▾'}</Text>
                </TouchableOpacity>

                {showDetails ? (
                    <View>
                        <Separator />
                        <InfoItem label="Address" value={profile?.address} full />
                        <View style={styles.rowWrap}>
                            <InfoItem label="City" value={profile?.city} />
                            <InfoItem label="State" value={profile?.state} />
                        </View>
                        <View style={styles.rowWrap}>
                            <InfoItem label="Country" value={profile?.country} />
                            <InfoItem label="ZIP" value={profile?.zip} />
                        </View>
                        <InfoItem label="Notes" value={profile?.notes} full />
                    </View>
                ) : null}

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
    );
}

function formatDate(dateString) {
    if (!dateString) return '-';
    try {
        const d = new Date(dateString);
        if (isNaN(d)) return '-';
        return d.toLocaleDateString();
    } catch (_) {
        return '-';
    }
}

function Separator() {
    return <View style={styles.separator} />
}

function InfoItem({ label, value, full }) {
    return (
        <View style={[styles.infoItem, full ? styles.infoItemFull : null]}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value ?? '-'}</Text>
        </View>
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
    scroll: {
        padding: 16,
        backgroundColor: CUSTOMER_COLORS.surface,
    },
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: CUSTOMER_COLORS.white,
    },
    card: {
        backgroundColor: CUSTOMER_COLORS.white,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 96,
        height: 96,
        borderRadius: 48,
        alignSelf: 'center',
        marginBottom: 12,
        backgroundColor: '#eee',
    },
    avatarPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitial: {
        fontSize: 36,
        fontWeight: '700',
        color: '#666',
    },
    headerTextWrap: {
        flex: 1,
    },
    name: {
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
        color: CUSTOMER_COLORS.black,
    },
    email: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginTop: 2,
        marginBottom: 12,
    },
    badgeRow: {
        flexDirection: 'row',
        gap: 8,
        justifyContent: 'center',
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        backgroundColor: '#eee',
    },
    badgePrimary: {
        backgroundColor: '#ecdafc',
    },
    badgeSuccess: {
        backgroundColor: '#e8f5e9',
    },
    badgeMuted: {
        backgroundColor: '#f0f0f0',
    },
    badgeText: {
        color: CUSTOMER_COLORS.primary,
        fontSize: 12,
        fontWeight: '600',
    },
    rowWrap: {
        flexDirection: 'row',
        gap: 12,
    },
    infoItem: {
        flex: 1,
        backgroundColor: '#fafafa',
        borderRadius: 8,
        padding: 12,
        marginTop: 8,
    },
    infoItemFull: {
        flexBasis: '100%',
    },
    infoLabel: {
        fontSize: 12,
        color: '#777',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 16,
        color: '#222',
    },
    quickGrid: {
        marginTop: 8,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    infoMini: {
        flexBasis: '48%',
        backgroundColor: '#fafafa',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 10,
    },
    infoMiniLabel: {
        fontSize: 10,
        color: '#777',
        marginBottom: 2,
    },
    infoMiniValue: {
        fontSize: 14,
        color: '#222',
    },
    separator: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 12,
    },
    disclosure: {
        marginTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f3f3f3',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    disclosureText: {
        fontSize: 12,
        color: CUSTOMER_COLORS.primary,
        fontWeight: '600',
    },
    disclosureIcon: {
        fontSize: 14,
        color: CUSTOMER_COLORS.primary,
        fontWeight: '700',
    },
    button: {
        marginTop: 16,
        backgroundColor: CUSTOMER_COLORS.primary,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    actionsRow: {
        marginTop: 8,
        flexDirection: 'row',
        gap: 12,
    },
    edit: {
        flex: 1,
        backgroundColor: CUSTOMER_COLORS.primary,
    },
    logout: {
        flex: 1,
        backgroundColor: '#d9534f',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    error: {
        color: '#d9534f',
        fontSize: 14,
        marginBottom: 12,
        paddingHorizontal: 24,
        textAlign: 'center',
    },
});
