// screens/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

const { width: screenWidth } = Dimensions.get('window');
const isSmallDevice = screenWidth < 375;

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    // Validation
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      await login(email.toLowerCase().trim(), password);
      // Navigation will be handled by the auth context
      router.replace('/');
    } catch (error: any) {
      Alert.alert(
        'Login Failed',
        error.message || 'Unable to login. Please check your credentials and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToSignup = () => {
    router.push('/signup');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
          <View style={styles.headerContainer}>
            <Text style={[styles.welcomeTitle, { fontSize: isSmallDevice ? 28 : 32 }]}>
              Welcome Back! 👋
            </Text>
            <Text style={[styles.welcomeSubtitle, { fontSize: isSmallDevice ? 16 : 18 }]}>
              Sign in to continue managing your tasks
            </Text>
            <Image
  source={require('../assets/images/tasks-LP.png')}
  style={{ width: 200, height: 200, resizeMode: 'contain', alignSelf: 'center' }}
/>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>📧</Text>
                <TextInput
                  style={[styles.input, { fontSize: isSmallDevice ? 16 : 18 }]}
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={[styles.input, { fontSize: isSmallDevice ? 16 : 18 }]}
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  <Text style={styles.passwordToggleText}>
                    {showPassword ? '🙈' : '👁️'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                { 
                  paddingVertical: isSmallDevice ? 16 : 20,
                  opacity: isLoading ? 0.7 : 1 
                }
              ]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <View style={styles.loginButtonContent}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={[styles.loginButtonText, { 
                    fontSize: isSmallDevice ? 16 : 18,
                    marginLeft: 12 
                  }]}>
                    Signing In...
                  </Text>
                </View>
              ) : (
                <Text style={[styles.loginButtonText, { fontSize: isSmallDevice ? 16 : 18 }]}>
                  Sign In
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer Section */}
          <View style={styles.footerContainer}>
            <Text style={[styles.footerText, { fontSize: isSmallDevice ? 14 : 16 }]}>
              Don't have an account?
            </Text>
            <TouchableOpacity 
              onPress={navigateToSignup}
              disabled={isLoading}
              style={{ opacity: isLoading ? 0.5 : 1 }}
            >
              <Text style={[styles.signupLink, { fontSize: isSmallDevice ? 14 : 16 }]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: isSmallDevice ? 20 : 32,
    paddingBottom: 20,
  },
  
  // Header Styles
  headerContainer: {
    paddingTop: isSmallDevice ? 40 : 60,
    paddingBottom: isSmallDevice ? 40 : 50,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontWeight: '800',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    color: '#6c757d',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: isSmallDevice ? 22 : 26,
  },

  // Form Styles
  formContainer: {
    flex: 1,
    paddingBottom: 10,
    marginTop:-19,
  },
  inputContainer: {
    marginBottom: isSmallDevice ? 10: 24,
  },
  inputLabel: {
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: isSmallDevice ? 12 : 16,
    borderWidth: 2,
    borderColor: '#e9ecef',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputIcon: {
    fontSize: isSmallDevice ? 18 : 20,
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: isSmallDevice ? 16 : 20,
    color: '#2c3e50',
    fontWeight: '500',
  },
  passwordToggle: {
    padding: 8,
  },
  passwordToggleText: {
    fontSize: isSmallDevice ? 18 : 20,
  },

  // Button Styles
  loginButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: isSmallDevice ? 12 : 16,
    marginTop: isSmallDevice ? 20 : 32,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  loginButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
  },

  // Footer Styles
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: isSmallDevice ? 20 : 32,
    gap: 6,
  },
  footerText: {
    color: '#6c757d',
    fontWeight: '500',
    marginTop:-50,
  },
  signupLink: {
    color: '#4ECDC4',
    fontWeight: '700',
    marginBottom:50
  },
});