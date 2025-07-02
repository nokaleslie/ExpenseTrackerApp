import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Dimensions, 
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { useTheme } from '../ThemeContext';
import { useExpense } from '../ExpenseContext';
import { useBudget } from '../BudgetContext';
import { Feather } from '@expo/vector-icons';
import { format, subMonths, eachMonthOfInterval, isSameMonth, isSameDay, eachDayOfInterval, subDays } from 'date-fns';

const screenWidth = Dimensions.get('window').width;

// Use the same color mapping as in ViewExpenseScreen
const getCategoryColor = (category) => {
  const colorMap = {
    'Food & Dining': '#FF6B6B',
    'Transportation': '#4ECDC4',
    'Entertainment': '#FFD166',
    'Utilities': '#06D6A0',
    'Housing': '#118AB2',
    'Shopping': '#EF476F',
    'Healthcare': '#073B4C',
    'Education': '#7209B7',
    'Other': '#6A4C93',
  };
  return colorMap[category] || '#7F56D9';
};

const AnalyticsScreen = () => {
  const { theme } = useTheme();
  const { transactions } = useExpense();
  const { monthlyBudget } = useBudget();
  const isDark = theme === 'dark';

  // Updated colors to match ViewExpenseScreen
  const colors = {
    background: isDark ? '#0F0F0F' : '#F5F7FA',
    cardBg: isDark ? '#1C1C24' : '#FFFFFF',
    textPrimary: isDark ? '#F9FAFB' : '#111827',
    textSecondary: isDark ? '#A3A3A3' : '#6B7280',
    primary: '#7F56D9',
    expense: '#EF4444',
    border: isDark ? '#262626' : '#E5E7EB',
    iconBg: isDark ? '#2D2D3A' : '#F3F4F6',
    chartColor: '#7F56D9',
    chartLabel: isDark ? '#A3A3A3' : '#6B7280',
    chartGrid: isDark ? '#262626' : '#E5E7EB',
    white: isDark ? '#1E1E1E' : '#FFFFFF',
    shadow: isDark ? '#000000' : '#E2E8F0',
  };

  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month'); // 'week', 'month', 'year'
  const [activeChart, setActiveChart] = useState('spending'); // 'spending', 'income', 'comparison'

  // Process transaction data
  useEffect(() => {
    if (transactions) {
      setLoading(false);
    }
  }, [transactions]);

  // Filter transactions by type
  const expenses = transactions.filter(t => t.type === 'expense');
  const incomes = transactions.filter(t => t.type === 'income');

  // Calculate category breakdown using consistent category colors
  const categoryBreakdown = expenses.reduce((acc, expense) => {
    const existingCategory = acc.find(item => item.name === expense.category);
    const color = getCategoryColor(expense.category);
    
    if (existingCategory) {
      existingCategory.amount += expense.amount;
    } else {
      acc.push({
        name: expense.category,
        amount: expense.amount,
        color,
        legendFontColor: colors.textPrimary,
        legendFontSize: 12
      });
    }
    return acc;
  }, []);

  // Get most spent category
  const mostSpentCategory = categoryBreakdown.length > 0 
    ? categoryBreakdown.reduce((max, category) => 
        category.amount > max.amount ? category : max
      ).name 
    : 'No data';

  // Calculate savings rate if we have income data
  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const savingsRate = totalIncome > 0 
    ? `${Math.round(((totalIncome - totalExpenses) / totalIncome * 100))}%` 
    : '0%';

  // Calculate average daily spend
  const dailySpends = {};
  expenses.forEach(expense => {
    const date = format(new Date(expense.date), 'yyyy-MM-dd');
    if (!dailySpends[date]) {
      dailySpends[date] = 0;
    }
    dailySpends[date] += expense.amount;
  });
  const avgDailySpend = Object.keys(dailySpends).length > 0
    ? `${Math.round(Object.values(dailySpends).reduce((sum, amount) => sum + amount, 0) / Object.keys(dailySpends).length).toLocaleString()} FCFA`
    : '0 FCFA';

  // Prepare data for monthly trend chart
  const prepareMonthlyTrendData = () => {
    const months = eachMonthOfInterval({
      start: subMonths(new Date(), 5),
      end: new Date()
    }).reverse();

    const monthlyData = months.map(month => {
      const monthExpenses = expenses.filter(expense => 
        expense?.date && isSameMonth(new Date(expense.date), month)
      ).reduce((sum, exp) => sum + exp.amount, 0);

      const monthIncome = incomes.filter(income => 
        income?.date && isSameMonth(new Date(income.date), month)
      ).reduce((sum, inc) => sum + inc.amount, 0);

      return {
        month: format(month, 'MMM'),
        expenses: monthExpenses,
        income: monthIncome
      };
    });

    return {
      labels: monthlyData.map(data => data.month),
      datasets: [
        {
          data: monthlyData.map(data => data.income),
          color: () => '#4CAF50', // Green for income
          strokeWidth: 2,
        },
        {
          data: monthlyData.map(data => data.expenses),
          color: () => colors.expense, // Red for expenses to match ViewExpenseScreen
          strokeWidth: 2,
        },
      ],
      legend: ['Income', 'Expenses'],
    };
  };

  // Prepare data for weekly spending chart
  const prepareWeeklySpendingData = () => {
    const today = new Date();
    const lastMonth = subMonths(today, 1);
    const weeks = [
      subDays(today, 28),
      subDays(today, 21),
      subDays(today, 14),
      subDays(today, 7),
      today
    ];

    const weeklyData = weeks.map((week, index) => {
      const weekExpenses = expenses.filter(expense => {
        const expDate = new Date(expense.date);
        return expDate >= (index === 0 ? lastMonth : weeks[index - 1]) && expDate <= week;
      }).reduce((sum, exp) => sum + exp.amount, 0);

      return {
        week: `W${index + 1}`,
        amount: weekExpenses
      };
    });

    return {
      labels: weeklyData.map(data => data.week),
      datasets: [{ 
        data: weeklyData.map(data => data.amount),
        colors: Array(weeklyData.length).fill((opacity = 1) => colors.chartColor)
      }],
    };
  };

  // Monthly comparison data
  const getMonthlyComparison = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const currentMonthExpenses = expenses
      .filter(expense => {
        const expDate = new Date(expense.date);
        return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
      })
      .reduce((sum, exp) => sum + exp.amount, 0);
    
    const prevMonthExpenses = expenses
      .filter(expense => {
        const expDate = new Date(expense.date);
        return expDate.getMonth() === (currentMonth === 0 ? 11 : currentMonth - 1) && 
               expDate.getFullYear() === (currentMonth === 0 ? currentYear - 1 : currentYear);
      })
      .reduce((sum, exp) => sum + exp.amount, 0);
    
    return {
      previous: prevMonthExpenses,
      current: currentMonthExpenses,
      difference: currentMonthExpenses - prevMonthExpenses,
    };
  };

  // Chart configuration - updated to match ViewExpenseScreen
  const chartConfig = {
    backgroundColor: colors.cardBg,
    backgroundGradientFrom: colors.cardBg,
    backgroundGradientTo: colors.cardBg,
    decimalPlaces: 0,
    color: (opacity = 1) => colors.chartColor,
    labelColor: (opacity = 1) => colors.chartLabel,
    style: { borderRadius: 16 },
    propsForDots: { r: '5', strokeWidth: '2', stroke: colors.cardBg },
    propsForBackgroundLines: { stroke: colors.chartGrid, strokeWidth: 0.5, opacity: 0.7 },
    propsForLabels: { fontSize: 11 },
    fillShadowGradient: colors.chartColor,
    fillShadowGradientOpacity: 0.25,
    useShadowColorFromDataset: false,
    strokeWidth: 2,
    barPercentage: 0.6,
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView 
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.header, { color: colors.primary }]}>Analytics Dashboard</Text>
          <Feather 
            name="pie-chart" 
            size={24} 
            color={colors.primary} 
            style={styles.headerIcon}
          />
        </View>

        {/* Time Range Selector */}
        <View style={[styles.timeRangeSelector, { backgroundColor: colors.inputBg }]}>
          <TouchableOpacity 
            style={[
              styles.timeRangeButton, 
              timeRange === 'week' && { backgroundColor: `${colors.primary}20` }
            ]}
            onPress={() => setTimeRange('week')}
          >
            <Text style={[
              styles.timeRangeText, 
              { color: colors.textSecondary },
              timeRange === 'week' && { color: colors.primary }
            ]}>
              Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.timeRangeButton, 
              timeRange === 'month' && { backgroundColor: `${colors.primary}20` }
            ]}
            onPress={() => setTimeRange('month')}
          >
            <Text style={[
              styles.timeRangeText, 
              { color: colors.textSecondary },
              timeRange === 'month' && { color: colors.primary }
            ]}>
              Month
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.timeRangeButton, 
              timeRange === 'year' && { backgroundColor: `${colors.primary}20` }
            ]}
            onPress={() => setTimeRange('year')}
          >
            <Text style={[
              styles.timeRangeText, 
              { color: colors.textSecondary },
              timeRange === 'year' && { color: colors.primary }
            ]}>
              Year
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { 
            backgroundColor: colors.cardBg, 
            shadowColor: colors.shadow,
          }]}>
            <View style={[styles.iconBackground, { backgroundColor: `${colors.primaryLight}20` }]}>
              <Feather name="shopping-cart" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.statTitle, { color: colors.textSecondary }]}>Most Spent</Text>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>{mostSpentCategory}</Text>
          </View>
          
          <View style={[styles.statCard, { 
            backgroundColor: colors.cardBg, 
            shadowColor: colors.shadow,
          }]}>
            <View style={[styles.iconBackground, { backgroundColor: `${colors.primaryLight}20` }]}>
              <Feather name="dollar-sign" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.statTitle, { color: colors.textSecondary }]}>Savings Rate</Text>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>{savingsRate}</Text>
          </View>
        </View>

        <View style={[styles.statCard, { 
          backgroundColor: colors.cardBg, 
          shadowColor: colors.shadow,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center'
        }]}>
          <View>
            <View style={[styles.iconBackground, { backgroundColor: `${colors.primaryLight}20` }]}>
              <Feather name="calendar" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.statTitle, { color: colors.textSecondary }]}>Avg Daily Spend</Text>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>{avgDailySpend}</Text>
          </View>
          <TouchableOpacity style={[styles.detailButton, { backgroundColor: `${colors.primary}20` }]}>
            <Text style={[styles.detailButtonText, { color: colors.primary }]}>Details</Text>
            <Feather name="chevron-right" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Chart Type Selector */}
        <View style={[styles.chartTypeSelector, { backgroundColor: colors.inputBg }]}>
          <TouchableOpacity 
            style={[
              styles.chartTypeButton, 
              activeChart === 'spending' && { backgroundColor: colors.primary }
            ]}
            onPress={() => setActiveChart('spending')}
          >
            <Text style={[
              styles.chartTypeText, 
              { color: colors.textSecondary },
              activeChart === 'spending' && { color: colors.white }
            ]}>
              Spending
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.chartTypeButton, 
              activeChart === 'income' && { backgroundColor: colors.primary }
            ]}
            onPress={() => setActiveChart('income')}
          >
            <Text style={[
              styles.chartTypeText, 
              { color: colors.textSecondary },
              activeChart === 'income' && { color: colors.white }
            ]}>
              Income
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.chartTypeButton, 
              activeChart === 'comparison' && { backgroundColor: colors.primary }
            ]}
            onPress={() => setActiveChart('comparison')}
          >
            <Text style={[
              styles.chartTypeText, 
              { color: colors.textSecondary },
              activeChart === 'comparison' && { color: colors.white }
            ]}>
              Comparison
            </Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic Chart Display */}
        {activeChart === 'spending' && (
          <View style={[styles.chartContainer, { 
            backgroundColor: colors.cardBg, 
            shadowColor: colors.shadow,
          }]}>
            <View style={styles.chartHeader}>
              <Text style={[styles.chartTitle, { color: colors.textPrimary }]}>Category Breakdown</Text>
              <TouchableOpacity>
                <Feather name="more-horizontal" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            {categoryBreakdown.length > 0 ? (
              <>
                <PieChart
                  data={categoryBreakdown}
                  width={screenWidth - 80}
                  height={200}
                  chartConfig={chartConfig}
                  accessor="amount"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                />
                <View style={styles.chartLegend}>
                  {categoryBreakdown.map((item, index) => (
                    <View key={index} style={styles.legendItem}>
                      <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                      <Text style={[styles.legendText, { color: colors.textPrimary }]}>{item.name}</Text>
                    </View>
                  ))}
                </View>
              </>
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={[styles.noDataText, { color: colors.textSecondary }]}>
                  No spending data available
                </Text>
              </View>
            )}
          </View>
        )}

        {activeChart === 'income' && (
          <View style={[styles.chartContainer, { 
            backgroundColor: colors.cardBg, 
            shadowColor: colors.shadow,
          }]}>
            <View style={styles.chartHeader}>
              <Text style={[styles.chartTitle, { color: colors.textPrimary }]}>Monthly Trend</Text>
              <TouchableOpacity>
                <Feather name="more-horizontal" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            {incomes.length > 0 ? (
              <>
                <LineChart
                  data={prepareMonthlyTrendData()}
                  width={screenWidth - 80}
                  height={220}
                  chartConfig={chartConfig}
                  bezier
                  withVerticalLines={false}
                  withHorizontalLines={true}
                  withDots={true}
                  withShadow={true}
                  style={{ backgroundColor: 'transparent', marginTop: 10 }}
                />
                <View style={styles.chartLegend}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
                    <Text style={[styles.legendText, { color: colors.textPrimary }]}>Income</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: colors.expense }]} />
                    <Text style={[styles.legendText, { color: colors.textPrimary }]}>Expenses</Text>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={[styles.noDataText, { color: colors.textSecondary }]}>
                  No income data available
                </Text>
              </View>
            )}
          </View>
        )}

        {activeChart === 'comparison' && (
          <>
            <View style={[styles.chartContainer, { 
              backgroundColor: colors.cardBg, 
              shadowColor: colors.shadow,
            }]}>
              <View style={styles.chartHeader}>
                <Text style={[styles.chartTitle, { color: colors.textPrimary }]}>Weekly Spending</Text>
                <TouchableOpacity>
                  <Feather name="more-horizontal" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              {expenses.length > 0 ? (
                <BarChart
                  data={prepareWeeklySpendingData()}
                  width={screenWidth - 80}
                  height={220}
                  chartConfig={chartConfig}
                  fromZero
                  style={{ backgroundColor: 'transparent', marginTop: 10 }}
                  flatColor={true}
                  showBarTops={false}
                  withInnerLines={false}
                  verticalLabelRotation={30}
                />
              ) : (
                <View style={styles.noDataContainer}>
                  <Text style={[styles.noDataText, { color: colors.textSecondary }]}>
                    No spending data available
                  </Text>
                </View>
              )}
            </View>

            {/* Monthly Comparison */}
            <View style={[styles.comparisonCard, { 
              backgroundColor: colors.cardBg, 
              shadowColor: colors.shadow,
            }]}>
              <View style={styles.chartHeader}>
                <Text style={[styles.comparisonTitle, { color: colors.textPrimary }]}>Monthly Comparison</Text>
                <TouchableOpacity>
                  <Feather name="more-horizontal" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.comparisonRow}>
                <View style={styles.comparisonLabelContainer}>
                  <Feather name="calendar" size={16} color={colors.textSecondary} style={styles.comparisonIcon} />
                  <Text style={[styles.comparisonLabel, { color: colors.textSecondary }]}>Previous Month:</Text>
                </View>
                <Text style={[styles.comparisonValue, { color: colors.textPrimary }]}>
                  {getMonthlyComparison().previous.toLocaleString()} FCFA
                </Text>
              </View>
              
              <View style={styles.comparisonRow}>
                <View style={styles.comparisonLabelContainer}>
                  <Feather name="calendar" size={16} color={colors.textSecondary} style={styles.comparisonIcon} />
                  <Text style={[styles.comparisonLabel, { color: colors.textSecondary }]}>Current Month:</Text>
                </View>
                <Text style={[styles.comparisonValue, { color: colors.textPrimary }]}>
                  {getMonthlyComparison().current.toLocaleString()} FCFA
                </Text>
              </View>
              
              <View style={styles.comparisonRow}>
                <View style={styles.comparisonLabelContainer}>
                  <Feather 
                    name={getMonthlyComparison().difference >= 0 ? "trending-up" : "trending-down"} 
                    size={16} 
                    color={getMonthlyComparison().difference >= 0 ? '#4CAF50' : colors.expense} 
                    style={styles.comparisonIcon} 
                  />
                  <Text style={[styles.comparisonLabel, { color: colors.textSecondary }]}>Difference:</Text>
                </View>
                <Text style={[styles.comparisonValue, { 
                  color: getMonthlyComparison().difference >= 0 ? '#4CAF50' : colors.expense
                }]}>
                  {getMonthlyComparison().difference >= 0 ? '+' : ''}{getMonthlyComparison().difference.toLocaleString()} FCFA
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headerIcon: {
    marginLeft: 12,
  },
  timeRangeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderRadius: 12,
    padding: 4,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 5,
    padding: 16,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  statTitle: {
    fontSize: 14,
    marginTop: 8,
    marginBottom: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  iconBackground: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  detailButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  chartTypeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    borderRadius: 12,
    padding: 4,
  },
  chartTypeButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  chartTypeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chartContainer: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  chartLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
  },
  comparisonCard: {
    padding: 20,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  comparisonTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  comparisonLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  comparisonIcon: {
    marginRight: 8,
  },
  comparisonLabel: {
    fontSize: 14,
  },
  comparisonValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  noDataContainer: {
    alignItems: 'center',
    padding: 20,
  },
  noDataText: {
    fontSize: 14,
  },
});

export default AnalyticsScreen;