import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../ThemeContext';
import { useExpense } from '../ExpenseContext';

const AddExpense = ({ navigation }) => {
  const { theme } = useTheme();
  const { addExpense } = useExpense(); // Now properly destructured
  const isDark = theme === 'dark';
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const colors = {
    background: isDark ? '#121212' : '#F8F9FA',
    cardBg: isDark ? '#1E1E1E' : '#FFFFFF',
    textPrimary: isDark ? '#F5F5F5' : '#2D3748',
    textSecondary: isDark ? '#A0AEC0' : '#718096',
    primary: '#7F56D9',
    border: isDark ? '#2D3748' : '#E2E8F0',
    inputBg: isDark ? '#2D3748' : '#EDF2F7',
    error: '#E53E3E',
  };

  const categories = [
    'Food & Dining',
    'Transportation',
    'Housing',
    'Entertainment',
    'Utilities',
    'Shopping',
    'Healthcare',
    'Education',
    'Other'
  ];

  const handleSubmit = () => {
    // Validate amount
    if (!amount) {
      Alert.alert('Missing Amount', 'Please enter an amount');
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue)) {
      Alert.alert('Invalid Amount', 'Please enter a valid number');
      return;
    }

    if (amountValue <= 0) {
      Alert.alert('Invalid Amount', 'Amount must be greater than 0');
      return;
    }

    // Validate category
    if (!category) {
      Alert.alert('Category Required', 'Please select a category');
      return;
    }

    // Create new expense object
     const newExpense = {
      amount: amountValue,
      description: description || 'No description',
      category,
      date: date.toISOString(), // Convert to ISO string for consistency
      type: 'expense' // Make sure to include type
    };

    // Add expense and reset form
      addExpense(newExpense);
      setAmount('');
      setDescription('');
      setCategory('');
      setDate(new Date());
      
    // Navigate back with success message
    navigation.goBack();
    Alert.alert('Success', 'Expense added successfully!');
  };

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const formatDate = (dateObj) => {
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Add New Expense</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              Track your spending effortlessly
            </Text>
          </View>

          {/* Form Container */}
          <View style={[styles.formContainer, { backgroundColor: colors.cardBg }]}>
            {/* Amount Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Amount</Text>
              <View style={[styles.amountContainer, { backgroundColor: colors.inputBg }]}>
                <Text style={[styles.currencySymbol, { color: colors.textPrimary }]}>FCFA</Text>
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

            {/* Description Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Description</Text>
              <TextInput
                style={[styles.textInput, { 
                  backgroundColor: colors.inputBg,
                  color: colors.textPrimary,
                  borderColor: colors.border
                }]}
                placeholder="What was this expense for?"
                placeholderTextColor={colors.textSecondary}
                value={description}
                onChangeText={setDescription}
              />
            </View>

            {/* Category Selection */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Category</Text>
              <View style={[styles.categoryGrid, { borderColor: colors.border }]}>
                {categories.map((cat, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.categoryButton,
                      { 
                        backgroundColor: category === cat ? colors.primary : colors.inputBg,
                        borderColor: colors.border
                      }
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text style={[
                      styles.categoryText,
                      { color: category === cat ? '#FFFFFF' : colors.textPrimary }
                    ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Date Picker */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Date</Text>
              <TouchableOpacity
                style={[styles.dateButton, { 
                  backgroundColor: colors.inputBg,
                  borderColor: colors.border
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
                  onChange={onChangeDate}
                />
              )}
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: colors.primary }]}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Add Expense</Text>
          </TouchableOpacity>

          {/* New Cancel Button */}
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: colors.inputBg }]}
              onPress={() => navigation.goBack()}
            >
              <Text style={[styles.cancelButtonText, { color: colors.textPrimary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    flexGrow: 1,
  },
  header: {
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.8,
  },
  formContainer: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    height: '100%',
  },
  textInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    height: 56,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryButton: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dateButton: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  dateText: {
    fontSize: 16,
  },
  submitButton: {
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7F56D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // New styles for buttons container and cancel button
  buttonsContainer: {
    gap: 12, // Space between buttons
  },
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
  
  // Update submit button to remove bottom margin
  submitButton: {
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7F56D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    }
});

export default AddExpense;