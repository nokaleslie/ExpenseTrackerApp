import React, { 
  useState, 
  useEffect, 
  useRef, 
  useCallback, 
  useMemo 
} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Alert,
  Animated,
  TouchableWithoutFeedback
} from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { format, subDays, eachDayOfInterval, isSameDay } from 'date-fns';
import { AntDesign, Feather, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../ThemeContext';
import { useExpense } from '../ExpenseContext';
import { useBudget } from '../BudgetContext';

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

// Updated CustomDropdown component
const CustomDropdown = ({ 
  items, 
  selectedValue, 
  onSelect, 
  placeholder, 
  containerStyle,
  textColor,
  iconColor
}) => {
  const [visible, setVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-10)).current;
  const animationRef = useRef(null);

  // Cleanup animations on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, []);

  // Animate when visibility changes
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -10,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const toggleDropdown = () => {
    setVisible(!visible);
  };

  const handleSelect = (value) => {
    onSelect(value);
    setVisible(false);
  };

  const selectedLabel = items.find(item => item.value === selectedValue)?.label || placeholder;

  return (
    <View style={[styles.dropdownContainer, containerStyle]}>
      <TouchableOpacity 
        style={styles.dropdownButton}
        onPress={toggleDropdown}
      >
        <Text style={[styles.dropdownButtonText, { color: textColor }]}>
          {selectedLabel}
        </Text>
        <Feather 
          name={visible ? "chevron-up" : "chevron-down"} 
          size={20} 
          color={iconColor} 
        />
      </TouchableOpacity>

      <TouchableWithoutFeedback onPress={toggleDropdown}>
        <Animated.View 
          style={[
            styles.dropdownList, 
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          {items.map((item) => (
            <TouchableOpacity
              key={item.value}
              style={styles.dropdownItem}
              onPress={() => handleSelect(item.value)}
            >
              <Text style={[styles.dropdownItemText, { color: textColor }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const ViewExpenseScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { 
    expenses = [], 
    deleteTransaction, 
    resetTransactions 
  } = useExpense();
  const { monthlyBudget } = useBudget();
  const isDark = theme === 'dark';

  const colors = useMemo(() => ({
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
  }), [isDark]);

  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTime, setSelectedTime] = useState('All');
  const [filteredExpenses, setFilteredExpenses] = useState(expenses);
  const [showChartModal, setShowChartModal] = useState(false);
  const [chartType, setChartType] = useState('bar');
  const [headerHeight, setHeaderHeight] = useState(0);

  const totalExpenses = useMemo(() => 
    filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  , [filteredExpenses]);

  const getRecentTransactionsData = useCallback(() => {
    const today = new Date();
    const lastWeek = subDays(today, 6);
    const days = eachDayOfInterval({ start: lastWeek, end: today });
    
    return days.map(day => {
      const dayExpenses = filteredExpenses.filter(expense => 
        expense.date && isSameDay(new Date(expense.date), day)
      );
      const total = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      return {
        key: format(day, 'yyyy-MM-dd'),
        date: day,
        total,
        formattedDate: format(day, 'EEE')
      };
    });
  }, [filteredExpenses]);

  useEffect(() => {
    let result = [...expenses];
      
    if (selectedCategory !== 'All') {
      result = result.filter(exp => exp.category === selectedCategory);
    }
    
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      result = result.filter(exp => 
        exp.description.toLowerCase().includes(searchLower) || 
        exp.category.toLowerCase().includes(searchLower)
      );
    }
    
    if (selectedTime !== 'All') {
      const now = new Date();
      result = result.filter(exp => {
        const expDate = new Date(exp.date);
        switch(selectedTime) {
          case 'Today': return isSameDay(expDate, now);
          case 'Week': return expDate >= subDays(now, 7);
          case 'Month': return expDate.getMonth() === now.getMonth() && 
                         expDate.getFullYear() === now.getFullYear();
          case 'Year': return expDate.getFullYear() === now.getFullYear();
          default: return true;
        }
      });
    }
    
    setFilteredExpenses(result);
  }, [expenses, selectedCategory, searchText, selectedTime]);

  const renderChart = useCallback(() => {
    const dailyData = getRecentTransactionsData();
    const chartConfig = {
      backgroundColor: colors.cardBg,
      backgroundGradientFrom: colors.cardBg,
      backgroundGradientTo: colors.cardBg,
      decimalPlaces: 0,
      color: () => colors.chartColor,
      labelColor: () => colors.chartLabel,
      style: { borderRadius: 16 },
      propsForDots: { r: '5', strokeWidth: '2', stroke: colors.cardBg },
      propsForBackgroundLines: { stroke: colors.chartGrid },
      fillShadowGradient: colors.chartColor,
      fillShadowGradientOpacity: 0.25,
    };

    const data = {
      labels: dailyData.map(day => day.formattedDate),
      datasets: [{ data: dailyData.map(day => day.total) }],
    };

    return (
      <View style={styles.chartWrapper}>
        {chartType === 'bar' ? (
          <BarChart
            data={data}
            width={Dimensions.get('window').width - 88}
            height={220}
            yAxisLabel="FCFA"
            chartConfig={chartConfig}
            style={styles.chart}
            fromZero
          />
        ) : (
          <LineChart
            data={data}
            width={Dimensions.get('window').width - 88}
            height={220}
            yAxisLabel="FCFA"
            chartConfig={chartConfig}
            style={styles.chart}
            bezier
          />
        )}
      </View>
    );
  }, [getRecentTransactionsData, colors, chartType]);

  const getCategoryIcon = useCallback((category) => {
    switch (category) {
      case 'Food & Dining': return <Feather name="shopping-cart" size={20} color="#FFFFFF" />;
      case 'Transportation': return <Feather name="truck" size={20} color="#FFFFFF" />;
      case 'Entertainment': return <Feather name="film" size={20} color="#FFFFFF" />;
      case 'Utilities': return <Feather name="home" size={20} color="#FFFFFF" />;
      case 'Housing': return <Feather name="home" size={20} color="#FFFFFF" />;
      case 'Shopping': return <Feather name="shopping-bag" size={20} color="#FFFFFF" />;
      case 'Healthcare': return <Feather name="heart" size={20} color="#FFFFFF" />;
      case 'Education': return <Feather name="book" size={20} color="#FFFFFF" />;
      default: return <Feather name="dollar-sign" size={20} color="#FFFFFF" />;
    }
  }, []);

  const handleDeleteExpense = useCallback((id) => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteTransaction(id)
        }
      ]
    );
  }, [deleteTransaction]);

  const handleResetExpenses = useCallback(() => {
    Alert.alert(
      'Reset All Expenses',
      'This will permanently delete all your expenses. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset All', 
          style: 'destructive',
          onPress: () => {
            resetTransactions();
            setSelectedCategory('All');
            setSelectedTime('All');
            setSearchText('');
          }
        }
      ]
    );
  }, [resetTransactions]);

  const categoryOptions = useMemo(() => [
    { label: 'All Categories', value: 'All' },
    { label: 'Food & Dining', value: 'Food & Dining' },
    { label: 'Transportation', value: 'Transportation' },
    { label: 'Entertainment', value: 'Entertainment' },
    { label: 'Utilities', value: 'Utilities' },
    { label: 'Housing', value: 'Housing' },
    { label: 'Shopping', value: 'Shopping' },
    { label: 'Healthcare', value: 'Healthcare' },
    { label: 'Education', value: 'Education' },
    { label: 'Other', value: 'Other' },
  ], []);

  const timeOptions = useMemo(() => [
    { label: 'All Time', value: 'All' },
    { label: 'Today', value: 'Today' },
    { label: 'This Week', value: 'Week' },
    { label: 'This Month', value: 'Month' },
    { label: 'This Year', value: 'Year' },
  ], []);

  const ListHeaderComponent = useMemo(() => () => (
    <View style={styles.headerContainer}>
      {monthlyBudget > 0 && (
        <View style={[styles.budgetProgressContainer, { backgroundColor: colors.cardBg }]}>
          <View style={styles.budgetProgressHeader}>
            <Text style={[styles.budgetProgressText, { color: colors.textPrimary }]}>
              Budget Progress
            </Text>
            <Text style={[styles.budgetProgressText, { color: colors.primary }]}>
              {Math.min(Math.round((totalExpenses / monthlyBudget) * 100), 100)}%
            </Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View style={[styles.progressFill, { 
              width: `${Math.min((totalExpenses / monthlyBudget) * 100, 100)}%`,
              backgroundColor: colors.primary,
            }]} />
          </View>
          <View style={styles.budgetProgressFooter}>
            <Text style={[styles.budgetProgressSmall, { color: colors.textSecondary }]}>
              Spent: {totalExpenses.toLocaleString()} FCFA
            </Text>
            <Text style={[styles.budgetProgressSmall, { color: colors.textSecondary }]}>
              Remaining: {Math.max(0, monthlyBudget - totalExpenses).toLocaleString()} FCFA
            </Text>
          </View>
        </View>
      )}
      
      <View style={styles.headerTitleContainer}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Expenses</Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={handleResetExpenses} 
            style={[styles.headerIcon, { marginRight: 16 }]}
          >
            <Ionicons name="trash-outline" size={24} color={colors.expense} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setShowChartModal(true)} 
            style={styles.headerIcon}
          >
            <Ionicons name="stats-chart" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Total: {totalExpenses.toLocaleString()} FCFA
      </Text>
      
      <View style={[styles.searchContainer, { backgroundColor: colors.cardBg }]}>
        <Feather name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchBar, { color: colors.textPrimary }]}
          placeholder="Search expenses..."
          placeholderTextColor={colors.textSecondary}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>
      
      <View style={styles.filterContainer}>
        <View style={[styles.filterCard, { backgroundColor: colors.cardBg }]}>
          <CustomDropdown
            items={categoryOptions}
            selectedValue={selectedCategory}
            onSelect={setSelectedCategory}
            placeholder="Select Category"
            containerStyle={{ flex: 1 }}
            textColor={colors.textPrimary}
            iconColor={colors.textSecondary}
          />
        </View>
        
        <View style={[styles.filterCard, { backgroundColor: colors.cardBg, marginLeft: 12 }]}>
          <CustomDropdown
            items={timeOptions}
            selectedValue={selectedTime}
            onSelect={setSelectedTime}
            placeholder="Select Time"
            containerStyle={{ flex: 1 }}
            textColor={colors.textPrimary}
            iconColor={colors.textSecondary}
          />
        </View>
      </View>
    </View>
  ), [
    monthlyBudget, 
    totalExpenses, 
    colors, 
    handleResetExpenses, 
    searchText,
    categoryOptions,
    timeOptions,
    selectedCategory,
    selectedTime
  ]);

  const renderItem = useCallback(({ item }) => (
    <TouchableOpacity 
      style={[styles.expenseItem, { backgroundColor: colors.cardBg }]}
      onLongPress={() => handleDeleteExpense(item.id)}
    >
      <View style={[styles.iconBackground, { backgroundColor: getCategoryColor(item.category) }]}>
        {getCategoryIcon(item.category)}
      </View>
      <View style={styles.expenseInfo}>
        <Text style={[styles.expenseTitle, { color: colors.textPrimary }]}>
          {item.category}
        </Text>
        <Text style={[styles.expenseSub, { color: colors.textSecondary }]}>
          {item.description} • {format(new Date(item.date), 'MMM d, yyyy')}
        </Text>
      </View>
      
      <View style={styles.amountContainer}>
        <Text style={[styles.expenseAmount, { color: colors.expense }]}>
          -{item.amount.toLocaleString()} FCFA
        </Text>
        
        <TouchableOpacity 
          onPress={() => handleDeleteExpense(item.id)}
          style={styles.deleteButton}
        >
          <Feather name="trash-2" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  ), [colors, handleDeleteExpense, getCategoryIcon]);

  const keyExtractor = useCallback(item => item.id, []);

  const emptyComponent = useMemo(() => (
    <View style={styles.emptyContainer}>
      <Feather name="file-text" size={48} color={colors.textSecondary} />
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        No expenses found
      </Text>
    </View>
  ), [colors]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Fixed Header */}
      <View 
        style={styles.fixedHeader}
        onLayout={(event) => {
          const { height } = event.nativeEvent.layout;
          setHeaderHeight(height);
        }}
      >
        <ListHeaderComponent />
      </View>

      {/* Expense List */}
      <FlatList
        data={filteredExpenses}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.container, 
          { paddingTop: headerHeight + 16 }
        ]}
        ListEmptyComponent={emptyComponent}
      />

      {/* Add Expense Button */}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('AddExpense')}
      >
        <Feather name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Chart Modal */}
      <Modal
        visible={showChartModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowChartModal(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowChartModal(false)} style={styles.closeButton}>
                <AntDesign name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Spending Analytics
              </Text>
              <TouchableOpacity
                onPress={() => setChartType(chartType === 'bar' ? 'line' : 'bar')}
                style={[styles.chartTypeButton, { backgroundColor: colors.cardBg }]}
              >
                <Feather 
                  name={chartType === 'bar' ? 'bar-chart-2' : 'activity'} 
                  size={20} 
                  color={colors.primary} 
                />
              </TouchableOpacity>
            </View>
            
            <View style={[styles.chartContainer, { backgroundColor: colors.cardBg }]}>
              {renderChart()}
            </View>
            
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: colors.chartColor }]} />
                <Text style={[styles.legendText, { color: colors.textPrimary }]}>
                  Daily Spending
                </Text>
              </View>
            </View>
            
            <View style={[styles.chartStats, { backgroundColor: colors.cardBg }]}>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>This Week</Text>
                <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                  FCFA {getRecentTransactionsData().reduce((sum, day) => sum + day.total, 0).toLocaleString()}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Avg/Day</Text>
                <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                  FCFA {Math.round(getRecentTransactionsData().reduce((sum, day) => sum + day.total, 0) / 7).toLocaleString()}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Highest</Text>
                <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                  FCFA {Math.max(...getRecentTransactionsData().map(day => day.total)).toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // New fixed header style
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  
  dropdownContainer: {
    position: 'relative',
    zIndex: 1,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 50,
  },
  dropdownButtonText: {
    fontSize: 14,
  },
  dropdownList: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  dropdownItemText: {
    fontSize: 14,
  },
  budgetProgressContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  budgetProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  budgetProgressText: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
  },
  budgetProgressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetProgressSmall: {
    fontSize: 12,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 20, // Reduced top padding
    paddingBottom: 80,
  },
  headerContainer: {
    backgroundColor: 'transparent',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerActions: {
    flexDirection: 'row',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  headerIcon: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchBar: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterCard: {
    flex: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    justifyContent: 'center',
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  iconBackground: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  expenseSub: {
    fontSize: 13,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  deleteButton: {
    marginLeft: 12,
    padding: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  chartTypeButton: {
    padding: 10,
    borderRadius: 12,
  },
  chartContainer: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chart: {
    borderRadius: 16,
    marginVertical: 8,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendColor: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chartStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderRadius: 16,
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ViewExpenseScreen;