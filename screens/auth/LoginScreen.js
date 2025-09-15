// src/screens/auth/LoginScreen.js
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { useDispatch } from "react-redux";
import authService from "../../api/authService";
import { login } from "../../store/slices/authSlice";

// Test credentials for quick testing
const TEST_CREDENTIALS = [
  { email: "super@gmail.com", password: "1234", label: "Super Admin" },
  { email: "adi@gmail.com", password: "1234", label: "Admin" },
  { email: "user@gmail.com", password: "1234", label: "User" },
];

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!email.includes('@')) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }



    setIsLoading(true);
    
    try {
      console.log('LoginScreen - Attempting login with:', { email });
      
      // Call the authentication service
      const response = await authService.login({
        email: email.trim(),
        password: password.trim(),
      });

      console.log('LoginScreen - API Response:', response);

      if (response.type === 'success' && response.data) {
        const { user, token } = response.data;
        
        console.log('LoginScreen - Login successful, dispatching to store');
        
        // Dispatch login action with user data
        dispatch(login({ 
          role: user.role, 
          user: { 
            id: user.id, 
            email: user.email, 
            name: user.name 
          },
          token: token
        }));
        
        // Clear form
        setEmail("");
        setPassword("");
        
        console.log('LoginScreen - Login completed successfully');
      } else {
        // Handle login failure with better error messages
        let errorMessage = response.message || 'Login failed. Please check your credentials.';
        
        // Provide more helpful error messages
        if (response.type === 'network_error') {
          errorMessage = 'Cannot connect to server. Please check:\n\n' +
            '1. Your internet connection\n' +
            '2. Server is running on port 8080\n' +
            '3. Correct IP address in config\n\n' +
            'Check console for more details.';
        }
        
        Alert.alert("Login Failed", errorMessage);
        console.log('LoginScreen - Login failed:', response);
      }
    } catch (error) {
      console.error('LoginScreen - Login error:', error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Quick login for testing
  const handleQuickLogin = (credentials) => {
    setEmail(credentials.email);
    setPassword(credentials.password);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.logoContainer}>
              <Ionicons name="restaurant" size={60} color="#FF6B35" />
            </View>
            <Text style={styles.title}>Welcome Back!</Text>
            <Text style={styles.subtitle}>Sign in to your mess account</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputIconContainer}>
                <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  placeholder="Email Address"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  style={styles.textInput}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputIconContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  placeholder="Password"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  style={styles.textInput}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#666" 
                  />
                </TouchableOpacity>
              </View>
            </View>



            {/* Login Button */}
            <TouchableOpacity 
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? "Signing In..." : "Sign In"}
              </Text>
            </TouchableOpacity>

            {/* Forgot Password */}
            <TouchableOpacity 
              style={styles.forgotPassword}
              onPress={() => navigation.navigate("ForgotPassword")}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Test Credentials Info */}
            <View style={styles.testCredentialsContainer}>
              <Text style={styles.testCredentialsTitle}>Quick Login (Test Credentials):</Text>
              {TEST_CREDENTIALS.map((cred, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickLoginButton}
                  onPress={() => handleQuickLogin(cred)}
                >
                  <Text style={styles.quickLoginText}>
                    {cred.label}: {cred.email} / {cred.password}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Footer Section */}
          <View style={styles.footerSection}>
            <Text style={styles.footerText}>
              Don't have an account?{' '}
              <Text 
                style={styles.signupLink}
                onPress={() => navigation.navigate("Signup")}
              >
                Sign Up
              </Text>
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F3',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF1EC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#FF6B35',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 22,
  },
  formSection: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#2D3748',
    paddingVertical: 0,
  },
  eyeIcon: {
    padding: 4,
  },
  loginButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#FF6B35',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  loginButtonDisabled: {
    backgroundColor: '#FFB088',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 20,
  },
  forgotPasswordText: {
    color: '#FF6B35',
    fontSize: 16,
    fontWeight: '500',
  },
  footerSection: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
  },
  signupLink: {
    color: '#FF6B35',
    fontWeight: '600',
  },
  testCredentialsContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  testCredentialsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 8,
    textAlign: 'center',
  },
  testCredentialsText: {
    fontSize: 12,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 4,
  },

  quickLoginButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginVertical: 2,
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickLoginText: {
    fontSize: 11,
    color: '#4A5568',
    textAlign: 'center',
    fontWeight: '500',
  },
});
