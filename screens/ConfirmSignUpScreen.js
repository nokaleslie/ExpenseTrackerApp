import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import AuthService from '../services/AuthService';

export default function ConfirmSignUpScreen({ navigation, route }) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const email = route.params?.email || '';

  const colors = {
    background: isDark ? '#121212' : '#FFFFFF',
    cardBg: isDark ? '#1E1E1E' : '#FFFFFF',
    textPrimary: isDark ? '#FFFFFF' : '#2D3748',
    textSecondary: isDark ? '#A0AEC0' : '#718096',
    primary: isDark ? '#7C3AED' : '#6B46C1',
    inputBg: isDark ? '#2D3748' : '#EDF2F7',
    inputBorder: isDark ? '#4A5568' : '#E2E8F0',
    buttonText: '#FFFFFF',
  };

  const handleConfirm = async () => {
    if (!code.trim()) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    setIsLoading(true);
    const result = await AuthService.confirmSignUp(email, code);
    
    if (result.success) {
      Alert.alert(
        'Success',
        'Your account has been verified! You can now login.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } else {
      Alert.alert('Error', result.error.message || 'Invalid verification code');
    }
    setIsLoading(false);
  };

  const handleResendCode = async () => {
    setIsResending(true);
    const result = await AuthService.resendConfirmationCode(email);
    
    if (result.success) {
      Alert.alert('Success', 'Verification code sent to your email');
    } else {
      Alert.alert('Error', 'Failed to resend code. Please try again.');
    }
    setIsResending(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: colors.cardBg }]}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={colors.primary} />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Verify Your Email
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            We sent a verification code to {email}
          </Text>
        </View>

        <View style={[styles.formContainer, { backgroundColor: colors.cardBg }]}>
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>
              Verification Code
            </Text>
            <TextInput
              placeholder="Enter 6-digit code"
              placeholderTextColor={colors.textSecondary}
              value={code}
              onChangeText={setCode}
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                  color: colors.textPrimary,
                },
              ]}
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>

          <TouchableOpacity
            style={[styles.confirmButton, { backgroundColor: colors.primary }]}
            onPress={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.buttonText} />
            ) : (
              <Text style={[styles.buttonText, { color: colors.buttonText }]}>
                Verify Account
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resendContainer}
            onPress={handleResendCode}
            disabled={isResending}
          >
            <Text style={[styles.resendText, { color: colors.textSecondary }]}>
              Didn't receive the code?{' '}
            </Text>
            <Text style={[styles.resendLink, { color: colors.primary }]}>
              {isResending ? 'Sending...' : 'Resend'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  formContainer: {
    borderRadius: 16,
    padding: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 52,
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 2,
  },
  confirmButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});