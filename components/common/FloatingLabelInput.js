import React, { useEffect, useRef, useState } from 'react';
import { Animated, Platform, StyleSheet, TextInput, View } from 'react-native';
import { ADMIN_COLORS } from '../../config/colors';

export default function FloatingLabelInput({
    label,
    value,
    onChangeText,
    placeholder = '',
    multiline = false,
    numberOfLines = 1,
    keyboardType = 'default',
    style,
    inputStyle,
}) {
    const [focused, setFocused] = useState(false);
    const animated = useRef(new Animated.Value(value ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(animated, {
            toValue: focused || (value && String(value).length > 0) ? 1 : 0,
            duration: 160,
            useNativeDriver: false,
        }).start();
    }, [focused, value, animated]);

    // When focused/has value, float above the border like a chip
    const labelTop = animated.interpolate({ inputRange: [0, 1], outputRange: [18, -8] });
    const labelFont = animated.interpolate({ inputRange: [0, 1], outputRange: [16, 12] });
    const labelColor = animated.interpolate({ inputRange: [0, 1], outputRange: ['#6B7280', ADMIN_COLORS.primary] });

    return (
        <View style={[styles.wrap, style]}>
            <Animated.Text style={[styles.label, { top: labelTop, fontSize: labelFont, color: labelColor }]}>
                {label}
            </Animated.Text>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={focused ? placeholder : ''}
                style={[styles.input, multiline && styles.inputMultiline, focused && styles.inputFocused, inputStyle]}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                multiline={multiline}
                numberOfLines={multiline ? numberOfLines : 1}
                keyboardType={keyboardType}
                textAlignVertical={multiline ? 'top' : 'auto'}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        position: 'relative',
        marginBottom: 12,
    },
    label: {
        position: 'absolute',
        left: 12,
        zIndex: 2,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 6,
        borderRadius: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: Platform.OS === 'ios' ? 16 : 14,
        paddingTop: Platform.OS === 'ios' ? 18 : 16,
        fontSize: 16,
        color: ADMIN_COLORS.text,
        backgroundColor: '#FFFFFF',
    },
    inputFocused: {
        borderColor: ADMIN_COLORS.primary,
    },
    inputMultiline: {
        minHeight: 96,
        paddingTop: 22,
    },
});


