// SettingsScreen.js
import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  Switch,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  SafeAreaView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../ThemeContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useBudget } from '../BudgetContext'; // Import useBudget
import AuthService from '../services/AuthService';

const SettingsScreen = ({ navigation }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  
  // Get budget alert state and setter from context
  const { budgetAlertEnabled, setBudgetAlertEnabled } = useBudget();

  const [avatar, setAvatar] = useState(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);

  // Updated color scheme to match ViewExpenseScreen and AnalyticsScreen
  const colors = {
    background: isDark ? '#0F0F0F' : '#F5F7FA',
    cardBg: isDark ? '#1C1C24' : '#FFFFFF',
    textPrimary: isDark ? '#F9FAFB' : '#111827',
    textSecondary: isDark ? '#A3A3A3' : '#6B7280',
    primary: '#7F56D9',
    border: isDark ? '#262626' : '#E5E7EB',
    inputBg: isDark ? '#2D2D3A' : '#F3F4F6',
    placeholderText: isDark ? '#7A7A7A' : '#A0AEC0',
    switchTrackOn: '#7F56D9',
    switchThumb: '#FFFFFF',
    switchTrackOff: isDark ? '#3D3D3D' : '#E2E8F0',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    shadow: isDark ? '#000000' : '#E2E8F0',
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'We need access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleSaveProfile = () => {
    Alert.alert('Profile Updated', 'Your profile changes have been saved');
  };

  const handlePasswordChange = () => {
    Alert.alert('Password update', 'Password update functionality not implemented yet.');
  };

  const handleExportData = () => {
    Alert.alert('Export Data', 'Export data functionality not implemented yet.');
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            const result = await AuthService.signOut();
            if (result.success) {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Landing' }],
              });
            } else {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleNotificationToggle = async (type, newValue) => {
    const notificationLabels = {
      email: 'Email Notifications',
      budget: 'Budget Alerts',
      push: 'Push Notifications',
      weekly: 'Weekly Reports'
    };

    const originalValue = {
      email: emailNotif,
      budget: budgetAlertEnabled, // Use context value
      push: pushNotif,
      weekly: weeklyReports
    }[type];

    // Optimistic UI update
    switch(type) {
      case 'email': setEmailNotif(newValue); break;
      case 'budget': setBudgetAlertEnabled(newValue); break; // Update context
      case 'push': setPushNotif(newValue); break;
      case 'weekly': setWeeklyReports(newValue); break;
    }

    Alert.alert(
      `${notificationLabels[type]} ${newValue ? 'ENABLED' : 'DISABLED'}`,
      `Sending request to server...`
    );

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate 80% success rate
    const isSuccess = Math.random() < 0.8;
    
    if (isSuccess) {
      Alert.alert(
        `✅ Notification Settings Updated!`,
        `${notificationLabels[type]} are now ${newValue ? 'active' : 'disabled'}`
      );
    } else {
      Alert.alert(
        `❌ Update Failed!`,
        `Server timeout. Please try again later.\nReverting to previous setting...`
      );
      // Revert to previous state
      switch(type) {
        case 'email': setEmailNotif(originalValue); break;
        case 'budget': setBudgetAlertEnabled(originalValue); break; // Revert context
        case 'push': setPushNotif(originalValue); break;
        case 'weekly': setWeeklyReports(originalValue); break;
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>Settings</Text>
        </View>

        {/* Profile Section */}
        <View style={[styles.section, { 
          backgroundColor: colors.cardBg,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Profile</Text>
          
          <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
            {avatar ? (
              <Image 
                source={{ uri: avatar }} 
                style={[styles.avatar, { borderColor: colors.primary }]} 
              />
            ) : (
              <View style={[styles.avatarPlaceholder, { 
                backgroundColor: `${colors.primary}20`,
                borderColor: colors.border,
              }]}>
                <Icon name="camera" size={24} color={colors.primary} />
              </View>
            )}
          </TouchableOpacity>
          
          <View style={[styles.inputContainer, {
            backgroundColor: colors.inputBg,
            borderColor: colors.border,
          }]}>
            <Icon name="account" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Full Name"
              placeholderTextColor={colors.placeholderText}
              style={[styles.input, { color: colors.textPrimary }]}
            />
          </View>
          
          <View style={[styles.inputContainer, {
            backgroundColor: colors.inputBg,
            borderColor: colors.border,
          }]}>
            <Icon name="email" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email Address"
              placeholderTextColor={colors.placeholderText}
              style={[styles.input, { color: colors.textPrimary }]}
            />
          </View>
          
          <View style={[styles.inputContainer, {
            backgroundColor: colors.inputBg,
            borderColor: colors.border,
          }]}>
            <Icon name="phone" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="Phone Number"
              placeholderTextColor={colors.placeholderText}
              style={[styles.input, { color: colors.textPrimary }]}
            />
          </View>
          
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleSaveProfile}
          >
            <Text style={styles.buttonText}>Save Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Security Section */}
        <View style={[styles.section, { 
          backgroundColor: colors.cardBg,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Security</Text>
          
          <View style={[styles.inputContainer, {
            backgroundColor: colors.inputBg,
            borderColor: colors.border,
          }]}>
            <Icon name="lock" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              placeholder="Current Password"
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholderTextColor={colors.placeholderText}
              style={[styles.input, { color: colors.textPrimary }]}
            />
          </View>
          
          <View style={[styles.inputContainer, {
            backgroundColor: colors.inputBg,
            borderColor: colors.border,
          }]}>
            <Icon name="lock-reset" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              placeholder="New Password"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              placeholderTextColor={colors.placeholderText}
              style={[styles.input, { color: colors.textPrimary }]}
            />
          </View>
          
          <View style={[styles.inputContainer, {
            backgroundColor: colors.inputBg,
            borderColor: colors.border,
          }]}>
            <Icon name="lock-check" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              placeholder="Confirm Password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholderTextColor={colors.placeholderText}
              style={[styles.input, { color: colors.textPrimary }]}
            />
          </View>
          
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handlePasswordChange}
          >
            <Text style={styles.buttonText}>Update Password</Text>
          </TouchableOpacity>
        </View>

        {/* Notifications Section */}
        <View style={[styles.section, { 
          backgroundColor: colors.cardBg,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Notifications</Text>
          
          <View style={[styles.switchRow, {
            borderBottomColor: colors.border,
          }]}>
            <View style={styles.switchLabel}>
              <Icon name="email" size={20} color={colors.textSecondary} style={styles.switchIcon} />
              <Text style={[styles.switchText, { color: colors.textPrimary }]}>Email Notifications</Text>
            </View>
            <Switch
              value={emailNotif}
              onValueChange={(value) => handleNotificationToggle('email', value)}
              trackColor={{ false: colors.switchTrackOff, true: colors.switchTrackOn }}
              thumbColor={colors.switchThumb}
            />
          </View>
          
          <View style={[styles.switchRow, {
            borderBottomColor: colors.border,
          }]}>
            <View style={styles.switchLabel}>
              <Icon name="bell-alert" size={20} color={colors.textSecondary} style={styles.switchIcon} />
              <Text style={[styles.switchText, { color: colors.textPrimary }]}>Budget Alerts</Text>
            </View>
            <Switch
              value={budgetAlertEnabled} // Use context value
              onValueChange={(value) => handleNotificationToggle('budget', value)}
              trackColor={{ false: colors.switchTrackOff, true: colors.switchTrackOn }}
              thumbColor={colors.switchThumb}
            />
          </View>
          
          <View style={[styles.switchRow, {
            borderBottomColor: colors.border,
          }]}>
            <View style={styles.switchLabel}>
              <Icon name="cellphone" size={20} color={colors.textSecondary} style={styles.switchIcon} />
              <Text style={[styles.switchText, { color: colors.textPrimary }]}>Push Notifications</Text>
            </View>
            <Switch
              value={pushNotif}
              onValueChange={(value) => handleNotificationToggle('push', value)}
              trackColor={{ false: colors.switchTrackOff, true: colors.switchTrackOn }}
              thumbColor={colors.switchThumb}
            />
          </View>
          
          <View style={[styles.switchRow, {
            borderBottomWidth: 0, // Remove bottom border for last item
          }]}>
            <View style={styles.switchLabel}>
              <Icon name="chart-bar" size={20} color={colors.textSecondary} style={styles.switchIcon} />
              <Text style={[styles.switchText, { color: colors.textPrimary }]}>Weekly Reports</Text>
            </View>
            <Switch
              value={weeklyReports}
              onValueChange={(value) => handleNotificationToggle('weekly', value)}
              trackColor={{ false: colors.switchTrackOff, true: colors.switchTrackOn }}
              thumbColor={colors.switchThumb}
            />
          </View>
        </View>

        {/* Appearance Section */}
        <View style={[styles.section, { 
          backgroundColor: colors.cardBg,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Appearance</Text>
          
          <View style={[styles.switchRow, {
            borderBottomWidth: 0, // Remove bottom border
          }]}>
            <View style={styles.switchLabel}>
              <Icon name="theme-light-dark" size={20} color={colors.textSecondary} style={styles.switchIcon} />
              <Text style={[styles.switchText, { color: colors.textPrimary }]}>Dark Mode</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.switchTrackOff, true: colors.switchTrackOn }}
              thumbColor={colors.switchThumb}
            />
          </View>
        </View>

        {/* Actions Section */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.success }]}
            onPress={handleExportData}
          >
            <Icon name="export" size={20} color="#FFFFFF" style={styles.actionIcon} />
            <Text style={styles.actionText}>Export Data</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.error }]}
            onPress={handleLogout}
          >
            <Icon name="logout" size={20} color="#FFFFFF" style={styles.actionIcon} />
            <Text style={styles.actionText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  button: {
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  switchLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchIcon: {
    marginRight: 12,
  },
  switchText: {
    fontSize: 16,
  },
  actionsContainer: {
    marginBottom: 30,
  },
  actionButton: {
    flexDirection: 'row',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  actionIcon: {
    marginRight: 10,
  },
  actionText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default SettingsScreen;