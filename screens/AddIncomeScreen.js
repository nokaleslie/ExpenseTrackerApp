import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../ThemeContext';
import { useExpense } from '../ExpenseContext';
import { useNavigation } from '@react-navigation/native';

const incomeSources = ['Salary', 'Business', 'Freelance', 'Investment', 'Gift', 'Other'];

const AddIncomeScreen = () => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [source, setSource] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { theme } = useTheme();
  const { addIncome } = useExpense();
  const isDark = theme === 'dark';
  const navigation = useNavigation();

  const colors = {
    background: isDark ? '#121212' : '#F8F9FA',
    cardBg: isDark ? '#1E1E1E' : '#FFFFFF',
    textPrimary: isDark ? '#F5F5F5' : '#2D3748',
    textSecondary: isDark ? '#A0AEC0' : '#718096',
    primary: '#7F56D9',
    primaryLight: '#9F79E8',
    border: isDark ? '#2D3748' : '#E2E8F0',
    inputBg: isDark ? '#2D3748' : '#EDF2F7',
    success: '#22C55E',
    error: '#EF4444',
    buttonText: '#FFFFFF',
    iconBg: isDark ? '#2D3748' : '#EDF2F7',
    highlight: isDark ? '#4C1D95' : '#EDE9FE',
  };

  const handleSave = () => {
    // Validate required fields
    if (!amount || !source) {
      Alert.alert('Required Fields', 'Please enter amount and income source');
      return;
    }

    // Validate amount
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue)) {
      Alert.alert('Invalid Amount', 'Please enter a valid number');
      return;
    }

    if (amountValue <= 0) {
      Alert.alert('Invalid Amount', 'Amount must be greater than 0');
      return;
    }

    // Validate date
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      Alert.alert('Invalid Date', 'Please select a valid date');
      return;
    }

    // Create new income object with proper date handling
    const newIncome = {
      id: Date.now().toString(),
      type: 'income',
      title: source,
      category: source,
      amount: amountValue,
      description: description || 'No description',
      date: date.toISOString(), // Store as ISO string
      createdAt: new Date().toISOString()
    };

    // Add to context
    addIncome(newIncome);

    // Reset form
    setAmount('');
    setDescription('');
    setSource('');
    setDate(new Date());
    
    // Navigate back with success message
    navigation.goBack();
    Alert.alert('Success', 'Income added successfully!');
  };

  const formatDate = (dateObj) => {
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <LinearGradient
            colors={isDark ? ['#4C1D95', '#7F56D9'] : ['#DDD6FE', '#C4B5FD']}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.header}>
              <TouchableOpacity 
                onPress={() => navigation.goBack()}
                style={styles.backButton}
              >
                <Text style={[styles.backButtonText, { color: isDark ? '#EDE9FE' : '#4C1D95' }]}>←</Text>
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: isDark ? '#F5F3FF' : '#4C1D95' }]}>Add Income</Text>
              <Text style={[styles.headerSubtitle, { color: isDark ? '#C4B5FD' : '#5B21B6' }]}>
                Record your new income source
              </Text>
            </View>
          </LinearGradient>

          <View style={[styles.formContainer, {
            backgroundColor: colors.cardBg,
            shadowColor: isDark ? '#000' : '#E5E7EB',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDark ? 0.1 : 0.05,
            shadowRadius: 8,
            borderTopWidth: 4,
            borderTopColor: colors.primary,
          }]}>
            {/* Amount Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>AMOUNT (FCFA)</Text>
              <View style={[styles.amountContainer, {
                backgroundColor: colors.inputBg,
                borderLeftWidth: 4,
                borderLeftColor: colors.primary,
              }]}>
                <Text style={[styles.currencySymbol, { color: colors.primary }]}>FCFA</Text>
                <TextInput
                  style={[styles.amountInput, { color: colors.textPrimary }]}
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                  autoFocus={true}
                />
              </View>
            </View>

            {/* Income Source */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>INCOME SOURCE</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryContainer}>
                {incomeSources.map((src, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.categoryButton,
                      {
                        backgroundColor: source === src ? colors.primary : colors.inputBg,
                        borderWidth: source === src ? 0 : 1,
                        borderColor: colors.border,
                      }
                    ]}
                    onPress={() => setSource(src)}
                  >
                    <Text style={[
                      styles.categoryText,
                      { color: source === src ? colors.buttonText : colors.textPrimary }
                    ]}>
                      {src}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TextInput
                style={[styles.textInput, {
                  backgroundColor: colors.inputBg,
                  color: colors.textPrimary,
                  marginTop: 12,
                  borderLeftWidth: 4,
                  borderLeftColor: colors.primary,
                }]}
                placeholder="Custom source"
                placeholderTextColor={colors.textSecondary}
                value={source}
                onChangeText={setSource}
              />
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>DESCRIPTION</Text>
              <TextInput
                style={[styles.textInput, {
                  backgroundColor: colors.inputBg,
                  color: colors.textPrimary,
                  borderLeftWidth: 4,
                  borderLeftColor: colors.primary,
                  minHeight: 100,
                  textAlignVertical: 'top',
                }]}
                placeholder="Optional description"
                placeholderTextColor={colors.textSecondary}
                value={description}
                onChangeText={setDescription}
                multiline
              />
            </View>

            {/* Date Picker */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>DATE</Text>
              <TouchableOpacity
                style={[styles.dateButton, {
                  backgroundColor: colors.inputBg,
                  borderLeftWidth: 4,
                  borderLeftColor: colors.primary,
                }]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={[styles.dateText, { color: colors.textPrimary }]}>
                  {formatDate(date)}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              )}
            </View>

            {/* Submit Button */}
            <LinearGradient
              colors={isDark ? ['#5B21B6', '#7F56D9'] : ['#7F56D9', '#9F79E8']}
              style={[styles.submitButton, { shadowColor: colors.primary }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <TouchableOpacity onPress={handleSave} style={styles.submitButtonTouchable}>
                <Text style={styles.submitButtonText}>Save Income</Text>
              </TouchableOpacity>
               {/* Cancel Button */}
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: colors.inputBg }]}
              onPress={() => navigation.goBack()}
            >
              <Text style={[styles.cancelButtonText, { color: colors.textPrimary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            </LinearGradient>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { flexGrow: 1 },
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    marginBottom: 24,
  },
  header: { marginBottom: 8 },
  backButton: { marginBottom: 16 },
  backButtonText: { fontSize: 24, fontWeight: '600' },
  headerTitle: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  headerSubtitle: { fontSize: 14, opacity: 0.9 },
  formContainer: {
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 20,
    marginBottom: 24,
  },
  inputGroup: { marginBottom: 24 },
  inputLabel: { fontSize: 12, fontWeight: '600', marginBottom: 8 },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  currencySymbol: { fontSize: 16, fontWeight: '600', marginRight: 8 },
  amountInput: { flex: 1, fontSize: 20, fontWeight: '600' },
  textInput: { borderRadius: 12, padding: 16, fontSize: 16 },
  categoryContainer: { paddingVertical: 4, gap: 10 },
  categoryButton: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  categoryText: { fontSize: 14, fontWeight: '500' },
  dateButton: { borderRadius: 12, padding: 16 },
  dateText: { fontSize: 16, fontWeight: '500' },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
   submitButtonTouchable: {
    padding: 18,
    alignItems: 'center',
    width: '100%',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',

  },
  buttonsContainer: {
    gap: 12, // Sp
    // ace between buttons
  },
  // Cancel button styles
  cancelButton: {
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
   buttonsContainer: {
    marginHorizontal: 20,
    gap: 12,
  },
  // Update submit button to remove bottom margin
  submitButton: {
    borderRadius: 12,
    
    
    overflow: 'hidden',
    marginTop: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
});

export default AddIncomeScreen;