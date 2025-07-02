import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image
} from 'react-native';
import { useTheme } from '../ThemeContext';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase'; // 🔄 Make sure the path is correct

export default function SignUpScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const colors = {
    background: isDark ? '#121212' : '#F9F9F9',
    cardBg: isDark ? '#1E1E1E' : '#FFFFFF',
    textPrimary: isDark ? '#FFFFFF' : '#2D3748',
    textSecondary: isDark ? '#A0AEC0' : '#718096',
    primary: isDark ? '#7C3AED' : '#6B46C1',
    primaryLight: isDark ? '#9F7AEA' : '#805AD5',
    inputBg: isDark ? '#2D3748' : '#EDF2F7',
    inputBorder: isDark ? '#4A5568' : '#E2E8F0',
    buttonText: '#FFFFFF',
    success: '#48BB78',
  };

  const handleSignUp = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long.');
      return;
    }
    if (!agreeToTerms) {
      Alert.alert('Error', 'Please agree to the Terms & Conditions.');
      return;
    }

    setIsLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, email, password);

      Alert.alert('Success', 'Account created successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('CloudLoginScreen'),
        },
      ]);
    } catch (error) {
      console.error('Firebase Signup Error:', error.message);
      Alert.alert('Signup Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Image
              source={isDark ? require('../assets/logo-dark.png') : require('../assets/logo-light.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={[styles.title, { color: colors.textPrimary }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Join us to start managing your expenses efficiently
            </Text>
          </View>

          <View style={[styles.formContainer, { backgroundColor: colors.cardBg }]}>
            <View style={styles.inputGroup}>
              {renderInputField('Full Name', fullName, setFullName, false, colors)}
              {renderInputField('Email Address', email, setEmail, false, colors)}
              {renderInputField('Password', password, setPassword, !showPassword, colors, () => setShowPassword(!showPassword))}
              {renderInputField('Confirm Password', confirmPassword, setConfirmPassword, !showConfirmPassword, colors, () => setShowConfirmPassword(!showConfirmPassword))}
            </View>

            <View style={styles.termsContainer}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setAgreeToTerms(!agreeToTerms)}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.checkbox,
                  { borderColor: colors.primary },
                  agreeToTerms && { backgroundColor: colors.primary }
                ]}>
                  {agreeToTerms && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={[styles.termsText, { color: colors.textSecondary }]}>
                  I agree to the <Text style={[styles.termsLink, { color: colors.primary }]}>Terms</Text> and <Text style={[styles.termsLink, { color: colors.primary }]}>Privacy Policy</Text>
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.signUpButton,
                { backgroundColor: colors.primary },
                isLoading && styles.buttonDisabled
              ]}
              onPress={handleSignUp}
              disabled={isLoading}
              activeOpacity={0.9}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.buttonText} />
              ) : (
                <Text style={[styles.buttonText, { color: colors.buttonText }]}>
                  Create Account
                </Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={[styles.dividerLine, { backgroundColor: colors.inputBorder }]} />
              <Text style={[styles.dividerText, { color: colors.textSecondary }]}>or</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.inputBorder }]} />
            </View>

            <View style={styles.loginContainer}>
              <Text style={[styles.loginText, { color: colors.textSecondary }]}>
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('CloudLoginScreen')}>
                <Text style={[styles.loginLink, { color: colors.primary }]}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// 🔧 Reusable Input Field Function
function renderInputField(label, value, onChange, secureText, colors, onEyePress) {
  return (
    <View style={styles.inputContainer}>
      <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>{label}</Text>
      <View style={[styles.inputWrapper, {
        backgroundColor: colors.inputBg,
        borderColor: colors.inputBorder
      }]}>
        <TextInput
          placeholder={`Enter your ${label.toLowerCase()}`}
          placeholderTextColor={colors.textSecondary}
          value={value}
          onChangeText={onChange}
          style={[styles.input, { color: colors.textPrimary }]}
          secureTextEntry={secureText}
          autoCapitalize={label === 'Full Name' ? 'words' : 'none'}
          autoCorrect={false}
        />
        {onEyePress && (
          <TouchableOpacity style={styles.eyeIcon} onPress={onEyePress}>
            <Text style={[styles.eyeIconText, { color: colors.textSecondary }]}>
              {secureText ? '👁️‍🗨️' : '👁️'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 40,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 40,
  },
  formContainer: {
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputGroup: { marginBottom: 16 },
  inputContainer: { marginBottom: 16 },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 52,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 14,
  },
  eyeIcon: { padding: 8 },
  eyeIconText: { fontSize: 18 },
  termsContainer: { marginVertical: 16 },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderRadius: 4,
    marginRight: 12,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  termsLink: {
    fontWeight: '600',
  },
  signUpButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 14,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});
