import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions,
  Animated, StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../ThemeContext';

const { height, width } = Dimensions.get('window');

const LandingScreen = () => {
  const navigation = useNavigation();
  const { theme, colors, spacing } = useTheme();
  const isDark = theme === 'dark';

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Gradient colors based on theme
  const gradientColors = isDark
    ? ['#1E1B4B', '#312E81', '#4338CA', '#4F46E5']
    : ['#F5F3FF', '#EDE9FE', '#DDD6FE', '#C4B5FD'];

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  useEffect(() => {
    // Entry animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous animations
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      
      {/* Main gradient background */}
      <LinearGradient
        colors={gradientColors}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Animated background elements */}
        <Animated.View
          style={[
            styles.backgroundCircle1,
            {
              transform: [{ rotate: spin }],
              backgroundColor: isDark
                ? 'rgba(79, 70, 229, 0.15)'
                : 'rgba(196, 181, 253, 0.15)',
              borderColor: isDark
                ? 'rgba(99, 102, 241, 0.3)'
                : 'rgba(167, 139, 250, 0.3)',
            },
          ]}
        />
        
        <Animated.View
          style={[
            styles.backgroundCircle2,
            {
              transform: [{ rotate: spin }, { scale: pulseAnim }],
              backgroundColor: isDark
                ? 'rgba(99, 102, 241, 0.1)'
                : 'rgba(167, 139, 250, 0.1)',
              borderColor: isDark
                ? 'rgba(79, 70, 229, 0.25)'
                : 'rgba(139, 92, 246, 0.25)',
            },
          ]}
        />
        
        <View
          style={[
            styles.backgroundCircle3,
            {
              backgroundColor: isDark
                ? 'rgba(79, 70, 229, 0.08)'
                : 'rgba(139, 92, 246, 0.08)',
            },
          ]}
        />

        {/* Main content with entry animations */}
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          {/* Logo with pulse animation */}
          <Animated.View style={[styles.logoContainer, { transform: [{ scale: pulseAnim }] }]}>
            <View style={styles.logoWrapper}>
              <LinearGradient 
                colors={['#8B5CF6', '#7C3AED']} 
                style={styles.logoGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.logoText}>💰</Text>
              </LinearGradient>
              <View
                style={[
                  styles.logoGlow,
                  {
                    backgroundColor: isDark
                      ? 'rgba(139, 92, 246, 0.25)'
                      : 'rgba(124, 58, 237, 0.25)',
                  },
                ]}
              />
            </View>
          </Animated.View>

          {/* Brand name and underline */}
          <View style={styles.brandContainer}>
            <Text style={[styles.brandName, { color: isDark ? '#F5F3FF' : '#4C1D95' }]}>
              ExpenseTracker
            </Text>
            <View
              style={[
                styles.brandUnderline,
                { backgroundColor: isDark ? '#8B5CF6' : '#7C3AED' },
              ]}
            />
          </View>

          {/* Main headline text */}
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: isDark ? '#F5F3FF' : '#4C1D95' }]}>
              Take Control of Your{' '}
              <Text style={{ color: isDark ? '#A78BFA' : '#7C3AED' }}>Finances</Text>
            </Text>
            <Text style={[styles.subtitle, { color: isDark ? '#C7D2FE' : '#5B21B6' }]}>
              Track expenses effortlessly with cloud sync
            </Text>
          </View>

          {/* Action buttons */}
          <View style={[styles.buttonContainer, { gap: spacing.large }]}>
            <TouchableOpacity 
              onPress={() => navigation.navigate('CloudLoginScreen')}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#7C3AED', '#8B5CF6']}
                style={[
                  styles.primaryButton, 
                  { 
                    paddingVertical: spacing.large, 
                    paddingHorizontal: spacing.xLarge 
                  }
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.primaryButtonText}>Get Started</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.secondaryButton,
                {
                  borderColor: isDark ? '#8B5CF6' : '#7C3AED',
                  paddingVertical: spacing.large,
                  paddingHorizontal: spacing.xLarge,
                },
              ]}
              onPress={() => navigation.navigate('SignUp')}
              activeOpacity={0.85}
            >
              <Text style={[styles.secondaryButtonText, { color: isDark ? '#E9D5FF' : '#7C3AED' }]}>
                Create Account
              </Text>
            </TouchableOpacity>
          </View>

          {/* Feature highlights */}
          <View style={styles.featuresContainer}>
            <View
              style={[
                styles.featuresPill,
                {
                  backgroundColor: isDark ? 'rgba(124, 58, 237, 0.12)' : '#F3E8FF',
                  paddingVertical: spacing.medium,
                  paddingHorizontal: spacing.large,
                },
              ]}
            >
              {[
                { icon: '📊', label: 'Smart Analytics' },
                { icon: '🔒', label: 'Bank Security' },
                { icon: '⚡', label: 'Cloud Sync' },
              ].map((feature, index) => (
                <React.Fragment key={feature.label}>
                  {index > 0 && (
                    <View style={[styles.featureDivider, { backgroundColor: isDark ? '#7C3AED' : '#A78BFA' }]} />
                  )}
                  <View style={styles.featureItem}>
                    <View style={[styles.featureIconContainer, { backgroundColor: isDark ? '#4C1D95' : '#DDD6FE' }]}>
                      <Text style={styles.featureIcon}>{feature.icon}</Text>
                    </View>
                    <Text style={[styles.featureText, { color: isDark ? '#DDD6FE' : '#5B21B6' }]}>
                      {feature.label}
                    </Text>
                  </View>
                </React.Fragment>
              ))}
            </View>
          </View>
        </Animated.View>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  backgroundCircle1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 1,
  },
  backgroundCircle2: {
    position: 'absolute',
    bottom: -150,
    left: -150,
    width: 400,
    height: 400,
    borderRadius: 200,
    borderWidth: 1,
  },
  backgroundCircle3: {
    position: 'absolute',
    top: height * 0.3,
    right: -60,
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  logoContainer: {
    marginBottom: 28,
  },
  logoWrapper: {
    position: 'relative',
  },
  logoGradient: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  logoText: {
    fontSize: 40,
  },
  logoGlow: {
    position: 'absolute',
    top: -12,
    left: -12,
    right: -12,
    bottom: -12,
    borderRadius: 52,
    opacity: 0.6,
    zIndex: -1,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  brandUnderline: {
    width: 80,
    height: 4,
    borderRadius: 3,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 16,
    maxWidth: '90%',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '400',
    maxWidth: '80%',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  primaryButton: {
    borderRadius: 14,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  featuresContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  featuresPill: {
    flexDirection: 'row',
    borderRadius: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 12,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  featureIcon: {
    fontSize: 22,
  },
  featureText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  featureDivider: {
    width: 1,
    height: 40,
    opacity: 0.5,
  },
});

export default LandingScreen;