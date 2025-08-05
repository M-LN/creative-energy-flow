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