// src/screens/admin/Settings.js
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View
} from 'react-native';

export default function Settings({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.placeholderContent}>
          <Ionicons name="settings" size={64} color="#CBD5E0" />
          <Text style={styles.placeholderTitle}>Settings</Text>
          <Text style={styles.placeholderText}>System settings and preferences will be implemented here</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderContent: {
    alignItems: 'center',
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#718096',
    marginTop: 16,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 16,
    color: '#A0AEC0',
    textAlign: 'center',
    lineHeight: 24,
  },
});
