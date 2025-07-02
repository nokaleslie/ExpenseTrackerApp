// BudgetContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const BudgetContext = createContext();

export const BudgetProvider = ({ children }) => {
  const [monthlyBudget, setMonthlyBudget] = useState(null);
  const [budgetAlertEnabled, setBudgetAlertEnabled] = useState(true);

  // Load both budget and alert settings on startup
  useEffect(() => {
    const loadBudgetSettings = async () => {
      try {
        // Load monthly budget
        const savedBudget = await AsyncStorage.getItem('@monthlyBudget');
        if (savedBudget !== null) {
          setMonthlyBudget(parseFloat(savedBudget));
        }
        
        // Load budget alert setting
        const savedAlertSetting = await AsyncStorage.getItem('@budgetAlertEnabled');
        if (savedAlertSetting !== null) {
          setBudgetAlertEnabled(savedAlertSetting === 'true');
        }
      } catch (e) {
        console.error('Failed to load budget settings', e);
      }
    };
    loadBudgetSettings();
  }, []);

  // Save budget to storage
  const updateBudget = async (amount) => {
    setMonthlyBudget(amount);
    try {
      await AsyncStorage.setItem('@monthlyBudget', amount.toString());
    } catch (e) {
      console.error('Failed to save budget', e);
    }
  };

  // Save budget alert setting to storage
  const updateBudgetAlert = async (enabled) => {
    setBudgetAlertEnabled(enabled);
    try {
      await AsyncStorage.setItem('@budgetAlertEnabled', enabled.toString());
    } catch (e) {
      console.error('Failed to save budget alert setting', e);
    }
  };

  return (
    <BudgetContext.Provider value={{ 
      monthlyBudget, 
      setMonthlyBudget: updateBudget,
      budgetAlertEnabled,
      setBudgetAlertEnabled: updateBudgetAlert
    }}>
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};