import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'auto';

export interface ThemeColors {
  // Background colors
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textMuted: string;
  
  // Primary colors
  primary: string;
  primaryHover: string;
  primaryLight: string;
  
  // Accent colors
  accent: string;
  accentHover: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Border and divider colors
  border: string;
  divider: string;
  
  // Card and surface colors
  surface: string;
  surfaceHover: string;
  
  // Energy level colors (consistent across themes)
  energyLow: string;
  energyMedium: string;
  energyHigh: string;
  
  // Chart colors
  chartGrid: string;
  chartTooltip: string;
}

export interface ThemeContextType {
  theme: Theme;
  effectiveTheme: 'light' | 'dark';
  colors: ThemeColors;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const lightColors: ThemeColors = {
  background: '#ffffff',
  backgroundSecondary: '#f8fafc',
  backgroundTertiary: '#f1f5f9',
  
  text: '#111827',
  textSecondary: '#374151',
  textMuted: '#6b7280',
  
  primary: '#3b82f6',
  primaryHover: '#2563eb',
  primaryLight: '#93c5fd',
  
  accent: '#f59e0b',
  accentHover: '#d97706',
  
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  border: '#e5e7eb',
  divider: '#d1d5db',
  
  surface: '#ffffff',
  surfaceHover: '#f9fafb',
  
  energyLow: '#ef4444',
  energyMedium: '#f59e0b',
  energyHigh: '#10b981',
  
  chartGrid: '#e5e7eb',
  chartTooltip: '#1f2937'
};

const darkColors: ThemeColors = {
  background: '#0f172a',
  backgroundSecondary: '#1e293b',
  backgroundTertiary: '#334155',
  
  text: '#f8fafc',
  textSecondary: '#cbd5e1',
  textMuted: '#94a3b8',
  
  primary: '#60a5fa',
  primaryHover: '#3b82f6',
  primaryLight: '#1d4ed8',
  
  accent: '#fbbf24',
  accentHover: '#f59e0b',
  
  success: '#34d399',
  warning: '#fbbf24',
  error: '#f87171',
  info: '#60a5fa',
  
  border: '#475569',
  divider: '#64748b',
  
  surface: '#1e293b',
  surfaceHover: '#334155',
  
  energyLow: '#f87171',
  energyMedium: '#fbbf24',
  energyHigh: '#34d399',
  
  chartGrid: '#475569',
  chartTooltip: '#f8fafc'
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('energy-flow-theme') as Theme;
    return savedTheme || 'auto';
  });

  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');

  // Determine effective theme based on user preference and system preference
  useEffect(() => {
    const updateEffectiveTheme = () => {
      if (theme === 'auto') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setEffectiveTheme(systemPrefersDark ? 'dark' : 'light');
      } else {
        setEffectiveTheme(theme);
      }
    };

    updateEffectiveTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if (theme === 'auto') {
        updateEffectiveTheme();
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [theme]);

  // Save theme preference to localStorage
  useEffect(() => {
    localStorage.setItem('energy-flow-theme', theme);
  }, [theme]);

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;
    const colors = effectiveTheme === 'dark' ? darkColors : lightColors;
    
    // Set CSS custom properties for the current theme
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value);
    });
    
    // Set theme class on body for component-specific styling
    document.body.className = `theme-${effectiveTheme}`;
    
    // Set theme-color meta tag for browser UI
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', colors.primary);
    }
  }, [effectiveTheme]);

  const toggleTheme = () => {
    const themeOrder: Theme[] = ['light', 'dark', 'auto'];
    const currentIndex = themeOrder.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    setTheme(themeOrder[nextIndex]);
  };

  const colors = effectiveTheme === 'dark' ? darkColors : lightColors;

  const contextValue: ThemeContextType = {
    theme,
    effectiveTheme,
    colors,
    setTheme,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
