// ExpenseContext.js
import React, { createContext, useContext, useState } from 'react';

const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);

  // Add any type of transaction
  const addTransaction = (transaction) => {
    if (!transaction.type) {
      console.error('Transaction type is required');
      return;
    }
    setTransactions(prev => [transaction, ...prev]);
  };

  // For adding expenses
  const addExpense = (expense) => {
    if (!expense.amount || expense.amount <= 0) {
      console.error('Invalid expense amount');
      return;
    }
    const newExpense = {
      ...expense,
      type: 'expense',
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    addTransaction(newExpense);
  };

  // For adding incomes
  const addIncome = (income) => {
    if (!income.amount || income.amount <= 0) {
      console.error('Invalid income amount');
      return;
    }
    const newIncome = {
      ...income,
      type: 'income',
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    addTransaction(newIncome);
  };

  // Delete a transaction by ID
  const deleteTransaction = (id) => {
    setTransactions(prev => prev.filter(transaction => transaction.id !== id));
  };

  // Reset all transactions
  const resetTransactions = () => {
    setTransactions([]);
  };

  // Filtered transactions
  const expenses = transactions.filter(t => t.type === 'expense');
  const incomes = transactions.filter(t => t.type === 'income');

  // Totals
  const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const totalIncome = incomes.reduce((sum, i) => sum + parseFloat(i.amount), 0);

  // Category breakdowns
  const getExpensesByCategory = () => {
    return expenses.reduce((acc, e) => {
      const category = e.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + parseFloat(e.amount);
      return acc;
    }, {});
  };

  const getIncomeBySource = () => {
    return incomes.reduce((acc, i) => {
      const source = i.category || 'Other';
      acc[source] = (acc[source] || 0) + parseFloat(i.amount);
      return acc;
    }, {});
  };

  return (
    <ExpenseContext.Provider value={{
      transactions,
      expenses,
      incomes,
      totalExpenses,
      totalIncome,
      addTransaction,
      addExpense,
      addIncome,
      deleteTransaction, // Added delete function
      resetTransactions, // Added reset function
      getExpensesByCategory,
      getIncomeBySource
    }}>
      {children}
    </ExpenseContext.Provider>
  );
};

// Custom hook
export const useExpense = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpense must be used within an ExpenseProvider');
  }
  return context;
};