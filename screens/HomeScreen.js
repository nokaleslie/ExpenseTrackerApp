import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../ThemeContext';
import { useExpense } from '../ExpenseContext';
import { useBudget } from '../BudgetContext';
import { format } from 'date-fns';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { transactions } = useExpense();
  const { monthlyBudget } = useBudget(); // Get monthly budget from context
  const isDark = theme === 'dark';

  const colors = {
    background: isDark ? '#0F0F0F' : '#F5F7FA',
    cardBg: isDark ? '#1C1C24' : '#FFFFFF',
    textPrimary: isDark ? '#F9FAFB' : '#111827',
    textSecondary: isDark ? '#A3A3A3' : '#6B7280',
    primary: '#7F56D9',
    income: '#22C55E',
    expense: '#EF4444',
    border: isDark ? '#262626' : '#E5E7EB',
    iconBg: isDark ? '#2D2D3A' : '#F3F4F6',
  };

  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  // Get recent transactions (5 most recent)
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.headerText, { color: colors.textPrimary }]}>Hello, Leslie</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Your financial overview</Text>
          </View>
        </View>
 {/* Add Budget Card */}
        {/* Summary Cards */}
        <View style={styles.cardRow}>
          <View style={[styles.card, { borderLeftColor: colors.income, backgroundColor: colors.cardBg }]}>
            
            <Text style={[styles.label, { color: colors.textSecondary }]}>Income</Text>
            <Text style={[styles.amount, { color: colors.income }]}>{totalIncome.toLocaleString()} FCFA</Text>
          </View>
          <View style={[styles.card, { borderLeftColor: colors.expense, backgroundColor: colors.cardBg }]}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Expenses</Text>
            <Text style={[styles.amount, { color: colors.expense }]}>{totalExpenses.toLocaleString()} FCFA</Text>
          </View>
          <View style={[styles.card, { borderLeftColor: colors.primary, backgroundColor: colors.cardBg }]}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Balance</Text>
            <Text style={[styles.amount, { color: colors.primary }]}>{balance.toLocaleString()} FCFA</Text>
          </View>
        </View>
        {/* Quick Actions */}
        <View style={[styles.section, { backgroundColor: colors.cardBg }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('AddExpense')}
            >
              <Text style={styles.actionText}>Add Expense</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('AddIncome')}
            >
              <Text style={styles.actionText}>Add Income</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: colors.primary }]}
              onPress={() => navigation.navigate('SetBudget')}
            >
              <Text style={[styles.secondaryText, { color: colors.primary }]}>Set Budget</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={[styles.section, { backgroundColor: colors.cardBg }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ViewExpense')}>
              <Text style={{ color: colors.primary }}>View All</Text>
            </TouchableOpacity>
          </View>

          {recentTransactions.length > 0 ? (
            recentTransactions.map((txn) => (
              <View key={txn.id} style={[styles.txnRow, { borderBottomColor: colors.border }]}>
                <View style={styles.txnLeft}>
                  <View style={[styles.txnIcon, { backgroundColor: colors.iconBg }]}>
                    <Text style={{ fontSize: 18 }}>{txn.type === 'income' ? '💰' : '💸'}</Text>
                  </View>
                  <View>
                    <Text style={[styles.txnTitle, { color: colors.textPrimary }]}>{txn.category}</Text>
                    <Text style={[styles.txnSubtitle, { color: colors.textSecondary }]}>
                      {format(new Date(txn.date), 'MMM d')} • {txn.description}
                    </Text>
                  </View>
                </View>
                <Text style={{
                  color: txn.type === 'income' ? colors.income : colors.expense,
                  fontWeight: '600'
                }}>
                  {txn.type === 'income' ? '+' : '-'}{txn.amount.toLocaleString()} FCFA
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No transactions yet
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    flexBasis: '48%',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  secondaryButton: {
    flexBasis: '100%',
    borderRadius: 10,
    borderWidth: 1.5,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryText: {
    fontWeight: '600',
    fontSize: 15,
  },
  txnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  txnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  txnIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txnTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  txnSubtitle: {
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 14,
  },
});

export default HomeScreen;