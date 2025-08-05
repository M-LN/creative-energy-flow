// Core types for the Creative Energy Flow application

export interface EnergyLevel {
  id: string;
  timestamp: Date;
  level: number; // 1-10 scale
  type: 'creative' | 'physical' | 'mental' | 'emotional';
  note?: string;
  activities?: string[];
  mood?: string;
}

export interface SocialBatteryEntry {
  id: string;
  timestamp: Date;
  level: number; // 1-10 scale
  interactionType: 'solo' | 'small-group' | 'large-group' | 'public';
  drainFactors?: string[];
  rechargeFactors?: string[];
  note?: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
  }[];
}

export interface AIInsight {
  id: string;
  timestamp: Date;
  type: 'pattern' | 'recommendation' | 'prediction' | 'alert';
  title: string;
  content: string;
  confidence: number; // 0-1 scale
  actionable: boolean;
  relatedData?: string[];
}

export interface PWAState {
  isOnline: boolean;
  isInstalled: boolean;
  updateAvailable: boolean;
  syncStatus: 'synced' | 'syncing' | 'error' | 'offline';
}

export interface AppState {
  energyData: EnergyLevel[];
  socialBatteryData: SocialBatteryEntry[];
  aiInsights: AIInsight[];
  pwaState: PWAState;
  currentView: string;
  user: {
    preferences: UserPreferences;
    settings: AppSettings;
  };
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'warm';
  notifications: boolean;
  autoSync: boolean;
  reminderFrequency: number; // hours
  privacyLevel: 'minimal' | 'balanced' | 'full';
}

export interface AppSettings {
  energyTrackingEnabled: boolean;
  socialBatteryEnabled: boolean;
  aiInsightsEnabled: boolean;
  chartAnimations: boolean;
  dataRetentionDays: number;
}

export interface FeatureConfig {
  name: string;
  enabled: boolean;
  dependencies: string[];
  priority: number;
  component?: any;
}

export interface EventPayload {
  type: string;
  data: any;
  source: string;
  timestamp: Date;
}

export interface DataFlowConfig {
  source: string;
  target: string;
  transform?: (data: any) => any;
  enabled: boolean;
}