/// ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const colorScheme = Appearance.getColorScheme();
  const [theme, setTheme] = useState(colorScheme || 'light');

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Professional color palette for expense tracking (light/dark)
  const themeColors = {
    light: {
      // Primary colors (trustworthy blue + accent)
      primary: '#2563EB',       // AWS-inspired blue
      primaryDark: '#1E40AF',    // Darker blue for pressed states
      accent: '#10B981',         // Green (success/actions)
      danger: '#EF4444',         // Red (errors/warnings)

      // Backgrounds & surfaces
      background: '#F9FAFB',     // Light gray (background)
      surface: '#FFFFFF',       // White (cards/modals)
      surfaceAlt: '#F3F4F6',    // Slightly darker for contrast

      // Text & borders
      textPrimary: '#111827',    // Near-black (headings)
      textSecondary: '#4B5563',  // Gray (subtext)
      border: '#E5E7EB',         // Light gray (dividers/inputs)

      // Buttons
      buttonText: '#FFFFFF',     // White text on buttons
      buttonDisabled: '#9CA3AF', // Gray for disabled buttons

      // Inputs & icons
      inputBackground: '#FFFFFF',
      inputBorder: '#D1D5DB',
      icon: '#4B5563',           // Gray icons (neutral)
    },
    dark: {
      // Primary colors (softer blues for dark mode)
      primary: '#3B82F6',        // Brighter blue (better visibility)
      primaryDark: '#1D4ED8',    // Darker blue (pressed)
      accent: '#10B981',         // Same green (consistency)
      danger: '#DC2626',         // Darker red

      // Backgrounds & surfaces
      background: '#0F172A',     // Dark navy (background)
      surface: '#1E293B',        // Dark slate (cards/modals)
      surfaceAlt: '#334155',     // Lighter slate for contrast

      // Text & borders
      textPrimary: '#E2E8F0',    // Light gray (headings)
      textSecondary: '#94A3B8',  // Lighter gray (subtext)
      border: '#475569',         // Dark gray (dividers)

      // Buttons
      buttonText: '#FFFFFF',     // White text on buttons
      buttonDisabled: '#64748B', // Gray for disabled buttons

      // Inputs & icons
      inputBackground: '#1E293B',
      inputBorder: '#475569',
      icon: '#94A3B8',           // Light gray icons
    },
  };

  // Combined theme object
  const currentTheme = {
    colors: themeColors[theme],
    spacing: {
      small: 8,
      medium: 16,
      large: 24,
    },
    typography: {
      heading: { fontSize: 22, fontWeight: 'bold' },
      subheading: { fontSize: 16, fontWeight: '600' },
      body: { fontSize: 14 },
    },
    shadows: {
      small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    },
    theme, // 'light' or 'dark'
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={currentTheme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);