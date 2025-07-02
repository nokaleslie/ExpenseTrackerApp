import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useBudget } from '../BudgetContext';
import { useTheme } from '../ThemeContext';

const SetBudgetScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { setMonthlyBudget } = useBudget(); // Destructure setMonthlyBudget from BudgetContext
  const isDark = theme === 'dark';
  const [monthlyBudget, setMonthlyBudgetState] = useState('');

  const handleSetBudget = () => {
    if (!monthlyBudget) {
      Alert.alert('Required', 'Please enter your budget amount');
      return;
    }
    setMonthlyBudget(monthlyBudget); // Save to context
    navigation.goBack();
  };

  // Using the purple color palette from AddIncome
  const colors = {
    background: isDark ? '#121212' : '#F8F9FA',
    cardBg: isDark ? '#1E1E1E' : '#FFFFFF',
    textPrimary: isDark ? '#F5F5F5' : '#2D3748',
    textSecondary: isDark ? '#A0AEC0' : '#718096',
    primary: '#7F56D9',        // Main purple
    primaryLight: '#9F79E8',   // Lighter purple
    primaryDark: '#5E35B1',    // Darker purple
    border: isDark ? '#2D3748' : '#E2E8F0',
    inputBg: isDark ? '#2D3748' : '#EDF2F7',
    success: '#22C55E',
    error: '#EF4444',
    buttonText: '#FFFFFF',
    iconBg: isDark ? '#2D3748' : '#EDF2F7',
    highlight: isDark ? '#7F56D9' : '#7F56D9', // Purple accent
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
          {/* Header with back button and title */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <LinearGradient
                colors={isDark ? ['#4C1D95', '#7F56D9'] : ['#7F56D9', '#9F79E8']}
                style={styles.backButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={[styles.backButtonText, { color: colors.buttonText }]}>←</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <View style={styles.headerTextContainer}>
              <Text style={[styles.welcomeText, { color: colors.textPrimary }]}>Set Monthly Budget</Text>
              <Text style={[styles.subtitle, { color: isDark ? '#C4B5FD' : '#5B21B6' }]}>
                Plan your finances with confidence
              </Text>
            </View>
          </View>

          {/* Main form container */}
          <View style={[styles.formContainer, { 
            backgroundColor: colors.cardBg,
            shadowColor: isDark ? '#000' : '#E5E7EB',
            borderTopWidth: 4,
            borderTopColor: colors.primary,
          }]}>
            {/* Budget Input with elegant styling */}
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>MONTHLY BUDGET (FCFA)</Text>
              <View style={[styles.inputWrapper, { 
                backgroundColor: colors.inputBg,
                borderLeftWidth: 4,
                borderLeftColor: colors.primary,
              }]}>
                <Text style={[styles.inputIcon, { color: colors.primary }]}>FCFA</Text>
                <TextInput
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary}
                  value={monthlyBudget}
                  onChangeText={setMonthlyBudgetState}
                  style={[styles.input, { color: colors.textPrimary }]}
                  keyboardType="numeric"
                  autoFocus={true}
                />
              </View>
            </View>

            {/* Budget Tips with modern card layout */}
            <View style={[styles.tipsContainer, { 
              backgroundColor: colors.inputBg,
              borderLeftWidth: 4,
              borderLeftColor: colors.primary,
            }]}>
              <View style={styles.tipsHeader}>
                <Text style={[styles.tipsTitle, { color: colors.textPrimary }]}>Budgeting Guide</Text>
                <Text style={[styles.tipsIcon, { color: colors.primary }]}>💡</Text>
              </View>
              
              <View style={styles.tipItem}>
                <View style={[styles.tipBullet, { backgroundColor: colors.primary }]} />
                <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                  Allocate 50% to needs, 30% to wants, and 20% to savings
                </Text>
              </View>
              <View style={styles.tipItem}>
                <View style={[styles.tipBullet, { backgroundColor: colors.primary }]} />
                <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                  Include a 10% buffer for unexpected expenses
                </Text>
              </View>
              <View style={styles.tipItem}>
                <View style={[styles.tipBullet, { backgroundColor: colors.primary }]} />
                <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                  Review weekly and adjust as needed
                </Text>
              </View>
            </View>

            {/* Action Buttons with improved styling */}
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.cancelButton, { 
                  backgroundColor: colors.inputBg,
                }]}
                onPress={() => navigation.goBack()}
              >
                <Text style={[styles.actionButtonText, { color: colors.textPrimary }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, { 
                  backgroundColor: colors.primary,
                }]}
                onPress={handleSetBudget}
              >
                <LinearGradient
                  colors={isDark ? ['#5B21B6', '#7F56D9'] : ['#7F56D9', '#9F79E8']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={[styles.actionButtonText, { color: colors.buttonText }]}>Set Budget</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    marginRight: 16,
  },
  backButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: '600',
  },
  headerTextContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.9,
  },
  formContainer: {
    borderRadius: 16,
    padding: 24,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.5,
    opacity: 0.8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
    opacity: 0.8,
  },
  input: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    paddingVertical: 0,
  },
  tipsContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  tipsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  tipsIcon: {
    fontSize: 20,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    marginRight: 10,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '48%',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  cancelButton: {
    justifyContent: 'center',
    paddingVertical: 16,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SetBudgetScreen;