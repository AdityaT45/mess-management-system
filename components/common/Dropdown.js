import React, { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Dropdown({ label, value, options, onSelect, placeholder = 'Select', searchable = true, disabled = false }) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');

    const safeOptions = Array.isArray(options) ? options : [];

    const normalizedOptions = useMemo(() => safeOptions.map((opt) => {
        if (typeof opt === 'string') return { key: opt, label: opt, value: opt };
        if (opt && typeof opt === 'object') {
            const key = String(opt.key ?? opt.value ?? opt.label ?? JSON.stringify(opt));
            const title = String(opt.title ?? opt.label ?? opt.value ?? opt.key ?? '');
            const subtitle = opt.subtitle ? String(opt.subtitle) : '';
            const value = String(opt.value ?? opt.key ?? opt.label ?? '');
            const label = subtitle ? `${title}\n${subtitle}` : title;
            return { key, label, value, title, subtitle };
        }
        return { key: String(opt), label: String(opt), value: String(opt) };
    }), [safeOptions]);

    const filtered = useMemo(() => {
        if (!searchable) return normalizedOptions;
        const q = query.toLowerCase();
        return normalizedOptions.filter(opt => opt.label.toLowerCase().includes(q));
    }, [normalizedOptions, query, searchable]);

    const isDisabled = disabled || safeOptions.length === 0;

    return (
        <View style={styles.wrap}>
            {label ? <Text style={styles.label}>{label}</Text> : null}
            <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={label || placeholder}
                style={[styles.input, isDisabled && styles.inputDisabled]}
                onPress={() => { if (!isDisabled) setOpen(true); }}
                activeOpacity={isDisabled ? 1 : 0.7}
            >
                <Text style={!value ? styles.placeholder : styles.valueText} numberOfLines={1} ellipsizeMode="tail">{value || placeholder}</Text>
                <Text style={[styles.caret, isDisabled && styles.caretDisabled]}>▾</Text>
            </TouchableOpacity>
            <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
                <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
                <View style={styles.sheet}>
                    {searchable ? (
                        <TextInput
                            placeholder="Search"
                            value={query}
                            onChangeText={setQuery}
                            style={styles.search}
                        />
                    ) : null}
                    <FlatList
                        data={filtered}
                        ListEmptyComponent={<Text style={styles.empty}>No options</Text>}
                        keyExtractor={(item, idx) => String(item.key ?? item.value ?? idx)}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.option}
                                onPress={() => {
                                    onSelect && onSelect(item);
                                    setOpen(false);
                                }}
                            >
                                {item.title ? (
                                    <View>
                                        <Text style={styles.optionTitle} numberOfLines={1}>{item.title}</Text>
                                        {item.subtitle ? (
                                            <Text style={styles.optionSubtitle} numberOfLines={1}>{item.subtitle}</Text>
                                        ) : null}
                                    </View>
                                ) : (
                                    <Text style={styles.optionText}>{item.label ?? String(item)}</Text>
                                )}
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { marginBottom: 12 },
    label: { fontSize: 12, color: '#666', marginBottom: 6 },
    input: {
        borderWidth: 1,
        borderColor: '#e5e5e5',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    inputDisabled: {
        backgroundColor: '#f5f5f5',
    },
    caret: { color: '#666' },
    caretDisabled: { color: '#bbb' },
    placeholder: { color: '#888' },
    valueText: { color: '#111' },
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
    sheet: {
        position: 'absolute',
        left: 16,
        right: 16,
        top: 80,
        bottom: 80,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
    },
    search: {
        borderWidth: 1,
        borderColor: '#e5e5e5',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 8,
    },
    option: { paddingVertical: 12, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: '#f1f1f1' },
    optionText: { color: '#111' },
    optionTitle: { color: '#111', fontWeight: '700' },
    optionSubtitle: { color: '#6B7280', fontSize: 12, marginTop: 2 },
    empty: { textAlign: 'center', color: '#777', paddingVertical: 12 },
});


