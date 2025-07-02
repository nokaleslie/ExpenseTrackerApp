import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

// Add this polyfill at the very top of App.js
import { Alert } from 'react-native';
if (!console.alert) {
  console.alert = (message, title = 'Notification') => {
    Alert.alert(title, message);
  };
}

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThemeProvider } from './ThemeContext';
import { ExpenseProvider } from './ExpenseContext';
import { BudgetProvider } from './BudgetContext';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
// Screens
import CloudLoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import ConfirmSignUpScreen from './screens/ConfirmSignUpScreen';
import LandingScreen from './screens/LandingScreen';
import ViewExpenseScreen from './screens/ViewExpenseScreen';
import AddExpenseScreen from './screens/AddExpenseScreen';
import AddIncomeScreen from './screens/AddIncomeScreen';
import SetBudgetScreen from './screens/SetBudgetScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';
import InsightsScreen from './screens/InsightsScreen';
import SettingsScreen from './screens/SettingsScreen';
import MainTabs from './MainTabs';

const Stack = createNativeStackNavigator();
export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  return (
    <ThemeProvider>
      <ExpenseProvider>
        <BudgetProvider>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="Landing" screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Landing" component={LandingScreen} />
              <Stack.Screen name="CloudLoginScreen" component={CloudLoginScreen} />
              <Stack.Screen name="SignUp" component={SignUpScreen} />
              <Stack.Screen name="Main" component={MainTabs} />
              <Stack.Screen name="ViewExpense" component={ViewExpenseScreen} />
              <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
              <Stack.Screen name="AddIncome" component={AddIncomeScreen} />
              <Stack.Screen name="SetBudget" component={SetBudgetScreen} />
              <Stack.Screen name="Analytics" component={AnalyticsScreen} />
              <Stack.Screen name="Insights" component={InsightsScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </BudgetProvider>
      </ExpenseProvider>
    </ThemeProvider>
  );
}