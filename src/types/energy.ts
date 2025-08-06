// Energy tracking data types and interfaces

export interface EnergyLevel {
  timestamp: Date;
  physical: number; // 0-100
  mental: number; // 0-100
  emotional: number; // 0-100
  creative: number; // 0-100
  overall: number; // calculated average or weighted score
}

export interface EnergyReading {
  id: number;
  timestamp: string;
  type: EnergyType;
  level: number; // 0-10
  notes?: string;
  tags?: string[];
}

export interface SocialBatteryData {
  timestamp: Date;
  level: number; // 0-100
  socialInteractions: number; // count of interactions
  drainEvents: Array<{
    timestamp: Date;
    intensity: number; // 1-10
    type: 'meeting' | 'call' | 'social_event' | 'public_speaking' | 'conflict' | 'other';
    description?: string;
  }>;
  rechargeEvents: Array<{
    timestamp: Date;
    intensity: number; // 1-10
    type: 'alone_time' | 'nature' | 'meditation' | 'hobby' | 'sleep' | 'other';
    description?: string;
  }>;
}

export interface EnergyPattern {
  type: 'daily' | 'weekly' | 'monthly' | 'seasonal';
  pattern: number[]; // energy levels over time
  confidence: number; // 0-1
  trend: 'increasing' | 'decreasing' | 'stable' | 'cyclical';
}

export interface EnergyPrediction {
  timestamp: Date;
  predictedEnergy: EnergyLevel;
  confidence: number; // 0-1
  factors: string[]; // factors influencing prediction
}

export interface EnergyGoal {
  id: string;
  type: 'physical' | 'mental' | 'emotional' | 'creative' | 'overall';
  targetValue: number;
  timeframe: 'daily' | 'weekly' | 'monthly';
  created: Date;
  achieved?: Date;
}

export interface EnergyInsight {
  id: string;
  type: 'pattern' | 'anomaly' | 'recommendation' | 'achievement';
  title: string;
  description: string;
  timestamp: Date;
  data?: any; // additional data for the insight
  importance: 'low' | 'medium' | 'high';
}

export type EnergyType = 'physical' | 'mental' | 'emotional' | 'creative';
export type TimeRange = 'day' | 'week' | 'month' | 'quarter' | 'year';
export type ViewMode = 'line' | 'area' | 'bar' | 'heatmap' | 'radar';

export interface ChartConfiguration {
  timeRange: TimeRange;
  viewMode: ViewMode;
  energyTypes: EnergyType[];
  showSocialBattery: boolean;
  showTrends: boolean;
  showPredictions: boolean;
  theme: 'light' | 'dark' | 'warm';
}

export interface EnergyStatistics {
  average: number;
  min: number;
  max: number;
  trend: number; // percentage change
  variance: number;
  correlationWithSocial: number; // -1 to 1
}