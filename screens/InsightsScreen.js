import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  SafeAreaView,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../ThemeContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useExpense } from '../ExpenseContext';
import { useBudget } from '../BudgetContext';
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval, isSameMonth } from 'date-fns';

const InsightsScreen = () => {
  const { theme } = useTheme();
  const { transactions } = useExpense();
  const { monthlyBudget } = useBudget();
  const isDark = theme === 'dark';
  const [loading, setLoading] = useState(true);
  const [insightData, setInsightData] = useState(null);

  // Dark mode colors
  const colors = {
    background: isDark ? '#121212' : '#FFFFFF',
    primary: isDark ? '#BB86FC' : '#7F56D9',
    primaryLight: isDark ? '#3700B3' : '#9F79E8',
    primaryDark: isDark ? '#3700B3' : '#5E35B1',
    textPrimary: isDark ? '#E1E1E1' : '#2D3748',
    textSecondary: isDark ? '#A0A0A0' : '#718096',
    cardBg: isDark ? '#1E1E1E' : '#FFFFFF',
    accent: isDark ? '#BB86FC' : '#8B5CF6',
    shadow: isDark ? '#000000' : '#E2E8F0',
    positive: isDark ? '#03DAC6' : '#10B981',
    negative: isDark ? '#CF6679' : '#EF4444',
    barBg: isDark ? '#2D2D2D' : '#F3F4F6',
    gradientStart: isDark ? '#1E1E1E' : '#FFFFFF',
    gradientEnd: isDark ? '#121212' : '#F5F3FF',
  };

  // Process data for insights
  useEffect(() => {
    if (transactions) {
      const expenses = transactions.filter(t => t.type === 'expense');
      
      // Get current month and previous month
      const now = new Date();
      const currentMonthStart = startOfMonth(now);
      const currentMonthEnd = endOfMonth(now);
      const previousMonthStart = startOfMonth(subMonths(now, 1));
      const previousMonthEnd = endOfMonth(subMonths(now, 1));
      
      // Filter expenses by month
      const currentMonthExpenses = expenses.filter(expense => {
        const expDate = new Date(expense.date);
        return expDate >= currentMonthStart && expDate <= currentMonthEnd;
      });
      
      const previousMonthExpenses = expenses.filter(expense => {
        const expDate = new Date(expense.date);
        return expDate >= previousMonthStart && expDate <= previousMonthEnd;
      });
      
      // Calculate totals
      const currentMonthSpending = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      const previousMonthSpending = previousMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      
      // Calculate category spending for current month
      const categorySpending = currentMonthExpenses.reduce((acc, expense) => {
        const existingCategory = acc.find(item => item.category === expense.category);
        if (existingCategory) {
          existingCategory.amount += expense.amount;
        } else {
          acc.push({
            category: expense.category,
            amount: expense.amount,
            icon: getCategoryIcon(expense.category),
            color: getCategoryColor(expense.category),
          });
        }
        return acc;
      }, []);
      
      // Sort categories by amount
      categorySpending.sort((a, b) => b.amount - a.amount);
      
      // Generate recommendations
      const recommendations = generateRecommendations(
        currentMonthSpending, 
        previousMonthSpending, 
        monthlyBudget,
        categorySpending
      );
      
      // Prepare data for display
      const monthlyTrend = (
        ((currentMonthSpending - previousMonthSpending) / (previousMonthSpending || 1)) * 100
      ).toFixed(1);
      
      const monthlyChange = Math.abs(currentMonthSpending - previousMonthSpending);
      
      const maxAmount = Math.max(0, ...categorySpending.map((c) => c.amount));
      
      setInsightData({
        previousMonthSpending,
        currentMonthSpending,
        monthlyTrend,
        monthlyChange,
        categorySpending,
        recommendations,
        maxAmount
      });
      
      setLoading(false);
    }
  }, [transactions, monthlyBudget]);

  // Helper function to get category icons
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Food & Dining': return 'food';
      case 'Transportation': return 'bus';
      case 'Entertainment': return 'movie';
      case 'Utilities': return 'flash';
      case 'Housing': return 'home';
      case 'Shopping': return 'shopping';
      case 'Healthcare': return 'hospital-box';
      case 'Education': return 'school';
      default: return 'dots-horizontal';
    }
  };

  // Helper function to get category colors
  const getCategoryColor = (category) => {
    const colorMap = {
      'Food & Dining': '#8B5CF6',
      'Transportation': '#7C3AED',
      'Entertainment': '#6D28D9',
      'Utilities': '#5B21B6',
      'Housing': '#4C1D95',
      'Shopping': '#8B5CF6',
      'Healthcare': '#7C3AED',
      'Education': '#6D28D9',
      'Other': '#5B21B6',
    };
    return colorMap[category] || '#4C1D95';
  };

  // Generate personalized recommendations
  const generateRecommendations = (currentSpending, previousSpending, budget, categories) => {
    const recommendations = [];
    
    // Monthly trend recommendation
    if (currentSpending < previousSpending) {
      const savings = previousSpending - currentSpending;
      recommendations.push(
        `Great job! You've spent ${Math.abs(savings).toLocaleString()} FCFA less this month. 
        Consider putting this difference into savings.`
      );
    } else if (currentSpending > previousSpending) {
      const increase = currentSpending - previousSpending;
      recommendations.push(
        `Your spending increased by ${increase.toLocaleString()} FCFA this month. 
        Review your expenses to identify areas to cut back.`
      );
    }
    
    // Budget recommendations
    if (budget && budget > 0) {
      const budgetUsage = (currentSpending / budget) * 100;
      
      if (budgetUsage > 90) {
        recommendations.push(
          `You've used ${Math.round(budgetUsage)}% of your monthly budget. 
          Try to limit additional spending this month.`
        );
      } else if (budgetUsage < 50) {
        recommendations.push(
          `You've only used ${Math.round(budgetUsage)}% of your monthly budget. 
          Consider allocating more to savings.`
        );
      }
    }
    
    // Category recommendations
    if (categories.length > 0) {
      const topCategory = categories[0];
      
      if (topCategory.amount > (currentSpending * 0.4)) {
        recommendations.push(
          `Your spending on ${topCategory.category} accounts for over 40% of your total expenses. 
          Consider ways to reduce costs in this category.`
        );
      }
      
      const transportCategory = categories.find(c => c.category === 'Transportation');
      if (transportCategory && transportCategory.amount > 50000) {
        recommendations.push(
          `Your transport costs are high (${transportCategory.amount.toLocaleString()} FCFA). 
          Try using cheaper transport options or carpooling.`
        );
      }
      
      const foodCategory = categories.find(c => c.category === 'Food & Dining');
      if (foodCategory && foodCategory.amount > 80000) {
        recommendations.push(
          `You're spending a lot on food (${foodCategory.amount.toLocaleString()} FCFA). 
          Consider meal prepping to save money.`
        );
      }
    }
    
    // General savings recommendation
    recommendations.push(
      "Try setting aside at least 20% of your income for savings each month."
    );
    
    // ML-style recommendation
    if (currentSpending > 200000) {
      recommendations.push(
        "Based on your spending level, you might benefit from creating a detailed budget to track expenses more closely."
      );
    } else {
      recommendations.push(
        "Your spending patterns suggest you're doing well managing your expenses. Keep it up!"
      );
    }
    
    return recommendations;
  };

  if (loading || !insightData) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.textPrimary, marginTop: 16 }}>Analyzing your spending patterns...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const {
    previousMonthSpending,
    currentMonthSpending,
    monthlyTrend,
    monthlyChange,
    categorySpending,
    recommendations,
    maxAmount
  } = insightData;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ScrollView 
          style={styles.container}
          contentContainerStyle={styles.scrollContainer}
        >
          <View style={styles.headerContainer}>
            <Text style={[styles.header, { color: colors.primary }]}>Spending Insights</Text>
            <Icon name="lightbulb-on-outline" size={24} color={colors.primary} />
          </View>

          {/* Budget Status */}
          {monthlyBudget && monthlyBudget > 0 && (
            <View style={[styles.budgetCard, { 
              backgroundColor: colors.cardBg, 
              shadowColor: colors.shadow 
            }]}>
              <View style={styles.cardHeader}>
                <Icon name="currency-usd" size={20} color={colors.primary} />
                <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Budget Status</Text>
              </View>
              <Text style={[styles.budgetText, { color: colors.textPrimary }]}>
                Monthly Budget: {monthlyBudget.toLocaleString()} FCFA
              </Text>
              <Text style={[styles.budgetText, { color: colors.textPrimary }]}>
                Current Spending: {currentMonthSpending.toLocaleString()} FCFA
              </Text>
              <View style={[styles.barContainer, { backgroundColor: colors.barBg }]}>
                <View
                  style={[
                    styles.bar,
                    {
                      width: `${Math.min((currentMonthSpending / monthlyBudget) * 100, 100)}%`,
                      backgroundColor: 
                        (currentMonthSpending / monthlyBudget) > 0.9 ? colors.negative : colors.positive,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.budgetStatus, { 
                color: (currentMonthSpending / monthlyBudget) > 0.9 ? colors.negative : colors.textSecondary 
              }]}>
                {Math.round((currentMonthSpending / monthlyBudget) * 100)}% of budget used
              </Text>
            </View>
          )}

          {/* Stats Cards */}
          <View style={styles.statsRow}>
            <View style={[styles.card, { 
              backgroundColor: colors.cardBg, 
              shadowColor: colors.shadow 
            }]}>
              <View style={styles.cardHeader}>
                <Icon name="chart-line" size={20} color={colors.primary} />
                <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Monthly Trend</Text>
              </View>
              <Text style={[
                styles.cardValue, 
                { 
                  color: monthlyTrend > 0 ? colors.negative : colors.positive 
                }
              ]}>
                {monthlyTrend > 0 ? '+' : ''}{monthlyTrend}%
              </Text>
              <Text style={[styles.cardSubtext, { color: colors.textSecondary }]}>
                vs last month
              </Text>
            </View>

            <View style={[styles.card, { 
              backgroundColor: colors.cardBg, 
              shadowColor: colors.shadow 
            }]}>
              <View style={styles.cardHeader}>
                <Icon name="swap-vertical" size={20} color={colors.primary} />
                <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Monthly Change</Text>
              </View>
              <Text style={[styles.cardValue, { color: colors.textPrimary }]}>
                {monthlyChange.toLocaleString()} FCFA
              </Text>
              <Text style={[styles.cardSubtext, { color: colors.textSecondary }]}>
                difference
              </Text>
            </View>
          </View>

          {/* Recommendations Card */}
          <View style={[styles.largeCard, { 
            backgroundColor: colors.cardBg, 
            shadowColor: colors.shadow 
          }]}>
            <View style={styles.cardHeader}>
              <Icon name="lightbulb-on" size={20} color={colors.primary} />
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Smart Recommendations</Text>
            </View>
            <View style={styles.recommendationsContainer}>
              {recommendations.map((item, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <Icon 
                    name="chevron-right" 
                    size={16} 
                    color={colors.primary} 
                    style={styles.bulletIcon}
                  />
                  <Text style={[styles.recommendationText, { color: colors.textSecondary }]}>
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Category Spending Card */}
          <View style={[styles.largeCard, { 
            backgroundColor: colors.cardBg, 
            shadowColor: colors.shadow 
          }]}>
            <View style={styles.cardHeader}>
              <Icon name="format-list-bulleted" size={20} color={colors.primary} />
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Category Breakdown</Text>
            </View>
            <View style={styles.categoriesContainer}>
              {categorySpending.map((item, index) => (
                <View key={index} style={styles.categoryItem}>
                  <View style={styles.categoryHeader}>
                    <View style={[styles.categoryIcon, { backgroundColor: item.color + '20' }]}>
                      <Icon name={item.icon} size={18} color={item.color} />
                    </View>
                    <Text style={[styles.categoryName, { color: colors.textPrimary }]}>
                      {item.category}
                    </Text>
                    <Text style={[styles.categoryAmount, { color: colors.textPrimary }]}>
                      {item.amount.toLocaleString()} FCFA
                    </Text>
                  </View>
                  <View style={[styles.barContainer, { backgroundColor: colors.barBg }]}>
                    <View
                      style={[
                        styles.bar,
                        {
                          width: `${(item.amount / (maxAmount || 1)) * 100}%`,
                          backgroundColor: item.color,
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    justifyContent: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    marginRight: 12,
  },
  budgetCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  budgetText: {
    fontSize: 16,
    marginBottom: 8,
  },
  budgetStatus: {
    fontSize: 14,
    marginTop: 8,
    fontWeight: '600',
  },
  barContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 8,
  },
  bar: {
    height: 8,
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  largeCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSubtext: {
    fontSize: 14,
  },
  recommendationsContainer: {
    marginTop: 8,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bulletIcon: {
    marginTop: 4,
    marginRight: 12,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  categoriesContainer: {
    marginTop: 8,
  },
  categoryItem: {
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default InsightsScreen;