// Warm Creative color palette for energy visualizations

export const ENERGY_COLORS = {
  // Primary energy colors
  high: '#FF6B35',      // Warm orange for high energy
  medium: '#E55D75',    // Deep coral for medium energy  
  low: '#95A3B3',       // Muted blue-gray for low energy
  
  // Background and UI colors
  background: '#FFF8E7', // Soft cream background
  surface: '#FFFFFF',    // White surface
  gridLines: '#E5E5E5',  // Light gray grid lines
  text: '#2C3E50',       // Dark blue-gray text
  textSecondary: '#7F8C8D', // Lighter gray secondary text
  
  // Energy type specific colors
  physical: '#FF6B35',   // Warm orange
  mental: '#4ECDC4',     // Teal
  emotional: '#E55D75',  // Deep coral
  creative: '#F7B731',   // Golden yellow
  social: '#9B59B6',     // Purple for social battery
  
  // Gradient variants
  gradients: {
    high: ['#FF6B35', '#FF8A5B'],
    medium: ['#E55D75', '#F093A3'],
    creative: ['#F7B731', '#FDD835'],
    low: ['#95A3B3', '#B8C6DB'],
  },
  
  // Chart specific colors
  chart: {
    axis: '#7F8C8D',
    tooltip: '#2C3E50',
    tooltipBackground: '#FFFFFF',
    tooltipBorder: '#E5E5E5',
    hover: '#FF8A5B',
    selection: '#F7B731',
  },
  
  // Status colors
  success: '#27AE60',
  warning: '#F39C12',
  error: '#E74C3C',
  info: '#3498DB',
  
  // Accessibility colors (colorblind-friendly alternatives)
  accessible: {
    high: '#FF6B35',
    medium: '#4ECDC4', 
    low: '#95A3B3',
    pattern1: '#FF6B35',
    pattern2: '#4ECDC4',
    pattern3: '#F7B731',
    pattern4: '#E55D75',
  }
};

export const CHART_THEMES = {
  warm: {
    backgroundColor: ENERGY_COLORS.background,
    textColor: ENERGY_COLORS.text,
    gridColor: ENERGY_COLORS.gridLines,
    tooltipBackground: ENERGY_COLORS.chart.tooltipBackground,
    tooltipBorder: ENERGY_COLORS.chart.tooltipBorder,
  },
  light: {
    backgroundColor: '#FFFFFF',
    textColor: '#333333',
    gridColor: '#E0E0E0',
    tooltipBackground: '#FFFFFF',
    tooltipBorder: '#CCCCCC',
  },
  dark: {
    backgroundColor: '#1A1A1A',
    textColor: '#FFFFFF',
    gridColor: '#404040',
    tooltipBackground: '#2A2A2A',
    tooltipBorder: '#505050',
  }
};

// Chart.js specific color configurations
export const getChartColors = (theme: 'warm' | 'light' | 'dark' = 'warm') => ({
  borderColor: ENERGY_COLORS.gridLines,
  backgroundColor: CHART_THEMES[theme].backgroundColor,
  color: CHART_THEMES[theme].textColor,
  gridColor: CHART_THEMES[theme].gridColor,
});

// Energy level to color mapping
export const getEnergyColor = (level: number): string => {
  if (level >= 75) return ENERGY_COLORS.high;
  if (level >= 50) return ENERGY_COLORS.medium;
  if (level >= 25) return ENERGY_COLORS.creative;
  return ENERGY_COLORS.low;
};

// Energy type to color mapping
export const getEnergyTypeColor = (type: string): string => {
  switch (type) {
    case 'physical': return ENERGY_COLORS.physical;
    case 'mental': return ENERGY_COLORS.mental;
    case 'emotional': return ENERGY_COLORS.emotional;
    case 'creative': return ENERGY_COLORS.creative;
    case 'social': return ENERGY_COLORS.social;
    default: return ENERGY_COLORS.medium;
  }
};

// Extended Theme System for Enhanced Dashboard
export const ENHANCED_THEMES = {
  // Theme Option A: Calm Minimalist
  calm: {
    primary: '#2D3748',    // Dark blue-gray
    secondary: '#4FD1C7',  // Soft teal
    accent: '#F6AD55',     // Warm orange
    background: '#F7FAFC', // Off-white
    surface: '#FFFFFF',    // Pure white
    text: '#2D3748',       // Dark blue-gray
    textSecondary: '#718096', // Medium gray
    border: '#E2E8F0',     // Light gray
    success: '#10B981',    // Green
    warning: '#F6AD55',    // Orange
    error: '#EF4444',      // Red
    info: '#4FD1C7'        // Teal
  },

  // Theme Option B: Warm Creative
  warm: {
    primary: '#2B2D42',    // Deep navy
    secondary: '#8D5524',  // Warm brown
    accent: '#F2CC8F',     // Soft gold
    background: '#F8F4E6', // Cream
    surface: '#FFFFFF',    // Pure white
    text: '#2B2D42',       // Deep navy
    textSecondary: '#6C7B7F', // Blue-gray
    border: '#E8E2D4',     // Light cream
    success: '#10B981',    // Green
    warning: '#F2CC8F',    // Gold
    error: '#D63384',      // Pink-red
    info: '#8D5524'        // Brown
  },

  // Theme Option C: Fresh Energy
  fresh: {
    primary: '#1A365D',    // Deep blue
    secondary: '#38B2AC',  // Teal
    accent: '#ED8936',     // Orange
    background: '#FAFAFA', // Light gray
    surface: '#FFFFFF',    // Pure white
    text: '#1A365D',       // Deep blue
    textSecondary: '#4A5568', // Gray
    border: '#E2E8F0',     // Light gray
    success: '#10B981',    // Green
    warning: '#ED8936',    // Orange
    error: '#E53E3E',      // Red
    info: '#38B2AC'        // Teal
  }
};

// Typography system
export const TYPOGRAPHY = {
  fontFamily: {
    primary: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'Space Mono, "SF Mono", Monaco, Consolas, monospace'
  },
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px'
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75
  }
};

// Spacing system (24px grid)
export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
  '4xl': '48px',
  '5xl': '64px'
};

// Border radius system
export const BORDER_RADIUS = {
  none: '0',
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  '2xl': '16px',
  '3xl': '24px',
  full: '9999px'
};

// Box shadow system
export const SHADOWS = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 2px 8px rgba(0, 0, 0, 0.1)',
  lg: '0 4px 12px rgba(0, 0, 0, 0.15)',
  xl: '0 8px 24px rgba(0, 0, 0, 0.2)',
  inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)'
};

// Animation system
export const ANIMATIONS = {
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms'
  },
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out'
  }
};

// Default theme (using Calm Minimalist)
export const DEFAULT_THEME = ENHANCED_THEMES.calm;

// Helper functions for Enhanced Dashboard
export const getConstraintDifficultyColor = (difficulty: string, theme: keyof typeof ENHANCED_THEMES = 'calm'): string => {
  const currentTheme = ENHANCED_THEMES[theme];
  switch (difficulty) {
    case 'easy': return currentTheme.success;
    case 'medium': return currentTheme.warning;
    case 'hard': return currentTheme.error;
    default: return currentTheme.textSecondary;
  }
};

export const getEnergyLevelColor = (level: number, theme: keyof typeof ENHANCED_THEMES = 'calm'): string => {
  const currentTheme = ENHANCED_THEMES[theme];
  if (level >= 80) return currentTheme.success;
  if (level >= 60) return currentTheme.warning;
  if (level >= 40) return currentTheme.accent;
  return currentTheme.error;
};

// CSS-in-JS style helpers for Enhanced Dashboard
export const createEnhancedStyles = (theme: keyof typeof ENHANCED_THEMES = 'calm') => {
  const currentTheme = ENHANCED_THEMES[theme];
  
  return {
    button: (variant: 'primary' | 'secondary' | 'ghost' = 'primary') => ({
      fontFamily: TYPOGRAPHY.fontFamily.primary,
      fontSize: TYPOGRAPHY.fontSize.base,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      padding: `${SPACING.md} ${SPACING.xl}`,
      borderRadius: BORDER_RADIUS.lg,
      border: 'none',
      cursor: 'pointer',
      transition: `all ${ANIMATIONS.duration.normal} ${ANIMATIONS.easing.easeInOut}`,
      minHeight: '44px', // Accessibility
      ...(variant === 'primary' && {
        backgroundColor: currentTheme.primary,
        color: 'white',
      }),
      ...(variant === 'secondary' && {
        backgroundColor: currentTheme.secondary,
        color: 'white',
      }),
      ...(variant === 'ghost' && {
        backgroundColor: 'transparent',
        color: currentTheme.text,
        border: `1px solid ${currentTheme.border}`,
      })
    }),
    
    card: (elevated: boolean = true) => ({
      backgroundColor: currentTheme.surface,
      borderRadius: BORDER_RADIUS.xl,
      padding: SPACING['2xl'],
      border: `1px solid ${currentTheme.border}`,
      ...(elevated && {
        boxShadow: SHADOWS.md
      })
    }),
    
    constraintCard: () => ({
      backgroundColor: currentTheme.surface,
      borderRadius: BORDER_RADIUS.xl,
      padding: SPACING['2xl'],
      border: `2px solid ${currentTheme.border}`,
      boxShadow: SHADOWS.lg,
      transition: `all ${ANIMATIONS.duration.normal} ${ANIMATIONS.easing.easeInOut}`,
      cursor: 'pointer',
      '&:hover': {
        borderColor: currentTheme.accent,
        transform: 'translateY(-2px)',
        boxShadow: SHADOWS.xl
      }
    }),
    
    energyBar: (level: number) => ({
      width: '100%',
      height: '8px',
      backgroundColor: currentTheme.border,
      borderRadius: BORDER_RADIUS.full,
      overflow: 'hidden',
      position: 'relative' as const,
      '&::after': {
        content: '""',
        position: 'absolute' as const,
        top: 0,
        left: 0,
        height: '100%',
        width: `${level}%`,
        backgroundColor: getEnergyLevelColor(level, theme),
        borderRadius: BORDER_RADIUS.full,
        transition: `all ${ANIMATIONS.duration.slow} ${ANIMATIONS.easing.easeOut}`
      }
    }),
    
    timer: () => ({
      fontSize: TYPOGRAPHY.fontSize['4xl'],
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      fontFamily: TYPOGRAPHY.fontFamily.mono,
      color: currentTheme.primary,
      textAlign: 'center' as const,
      lineHeight: TYPOGRAPHY.lineHeight.tight
    }),
    
    text: (variant: 'heading' | 'body' | 'caption' = 'body') => ({
      fontFamily: TYPOGRAPHY.fontFamily.primary,
      margin: 0,
      ...(variant === 'heading' && {
        fontSize: TYPOGRAPHY.fontSize['2xl'],
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: currentTheme.text,
        lineHeight: TYPOGRAPHY.lineHeight.tight
      }),
      ...(variant === 'body' && {
        fontSize: TYPOGRAPHY.fontSize.base,
        fontWeight: TYPOGRAPHY.fontWeight.normal,
        color: currentTheme.text,
        lineHeight: TYPOGRAPHY.lineHeight.normal
      }),
      ...(variant === 'caption' && {
        fontSize: TYPOGRAPHY.fontSize.sm,
        fontWeight: TYPOGRAPHY.fontWeight.normal,
        color: currentTheme.textSecondary,
        lineHeight: TYPOGRAPHY.lineHeight.normal
      })
    })
  };
};