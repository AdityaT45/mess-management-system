import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import NetworkTest from '../../api/networkTest';
import { API_CONFIG } from '../../config/api';

const NetworkDiagnostic = () => {
  const [testResults, setTestResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const runDiagnostic = async () => {
    setIsLoading(true);
    setTestResults(null);
    
    try {
      const results = await NetworkTest.runFullTest();
      setTestResults(results);
    } catch (error) {
      Alert.alert('Diagnostic Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (success) => success ? '✅' : '❌';
  const getStatusColor = (success) => success ? '#4CAF50' : '#F44336';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Network Diagnostic</Text>
        <Text style={styles.subtitle}>Test your API connectivity</Text>
      </View>

      <View style={styles.configInfo}>
        <Text style={styles.configTitle}>Current Configuration:</Text>
        <Text style={styles.configText}>Server URL: {API_CONFIG.BASE_URL}</Text>
        <Text style={styles.configText}>Auth Endpoint: {API_CONFIG.ENDPOINTS.AUTH.LOGIN}</Text>
        <Text style={styles.configText}>Customer Endpoint: {API_CONFIG.ENDPOINTS.CUSTOMER.CREATE}</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={runDiagnostic}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Running Tests...' : 'Run Network Diagnostic'}
        </Text>
      </TouchableOpacity>

      {testResults && (
        <View style={styles.results}>
          <Text style={styles.resultsTitle}>Test Results:</Text>
          
          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>
              {getStatusIcon(testResults.server.success)} Server Connectivity
            </Text>
            <Text style={[styles.resultStatus, { color: getStatusColor(testResults.server.success) }]}>
              {testResults.server.success ? 'Connected' : 'Failed'}
            </Text>
            <Text style={styles.resultMessage}>{testResults.server.message}</Text>
          </View>

          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>
              {getStatusIcon(testResults.auth.success)} Auth Endpoint
            </Text>
            <Text style={[styles.resultStatus, { color: getStatusColor(testResults.auth.success) }]}>
              {testResults.auth.success ? 'Accessible' : 'Failed'}
            </Text>
            <Text style={styles.resultMessage}>{testResults.auth.message}</Text>
          </View>

          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>
              {getStatusIcon(testResults.customer.success)} Customer Endpoint
            </Text>
            <Text style={[styles.resultStatus, { color: getStatusColor(testResults.customer.success) }]}>
              {testResults.customer.success ? 'Accessible' : 'Failed'}
            </Text>
            <Text style={styles.resultMessage}>{testResults.customer.message}</Text>
          </View>
        </View>
      )}

      <View style={styles.troubleshooting}>
        <Text style={styles.troubleshootingTitle}>Troubleshooting Tips:</Text>
        <Text style={styles.tip}>• Make sure your API server is running on port 8080</Text>
        <Text style={styles.tip}>• Check if your IP address is correct in config/api.js</Text>
        <Text style={styles.tip}>• Ensure both devices are on the same network</Text>
        <Text style={styles.tip}>• Try accessing the server URL in your browser</Text>
        <Text style={styles.tip}>• Check if firewall is blocking the connection</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  configInfo: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  configTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  configText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  results: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  resultItem: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  resultStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  resultMessage: {
    fontSize: 12,
    color: '#666',
  },
  troubleshooting: {
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  troubleshootingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 10,
  },
  tip: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 5,
  },
});

export default NetworkDiagnostic;

