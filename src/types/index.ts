// Core energy tracking types
export interface EnergyLevel {
  id: string;
  timestamp: Date;
  overall: number; // 0-100
  creative: number; // 0-100
  physical: number; // 0-100
  mental: number; // 0-100
  social: number; // 0-100 (social battery level)
  notes?: string;
}

// Social interaction types
export enum InteractionType {
  WORK_MEETING = 'work_meeting',
  SOCIAL_GATHERING = 'social_gathering',
  CLOSE_FRIENDS = 'close_friends',
  FAMILY_TIME = 'family_time',
  SOLO_TIME = 'solo_time',
  PUBLIC_EVENT = 'public_event',
  ONLINE_MEETING = 'online_meeting',
  PHONE_CALL = 'phone_call'
}

export enum SocialContext {
  WORK = 'work',
  PERSONAL = 'personal',
  PUBLIC = 'public',
  INTIMATE = 'intimate'
}

export interface SocialInteraction {
  id: string;
  timestamp: Date;
  type: InteractionType;
  context: SocialContext;
  duration: number; // minutes
  intensity: number; // 1-10 (how draining)
  peopleCount: number;
  enjoyment: number; // 1-10 (how much you enjoyed it)
  energyBefore: number; // social battery before (0-100)
  energyAfter: number; // social battery after (0-100)
  notes?: string;
  location?: string;
}

// Social battery calculation
export interface SocialBatteryState {
  currentLevel: number; // 0-100
  lastInteraction?: SocialInteraction;
  recoveryRate: number; // % per hour
  personalLimits: SocialLimits;
  weeklyStats: WeeklySocialStats;
}

export interface SocialLimits {
  dailyInteractionLimit: number; // max minutes per day
  weeklyInteractionLimit: number; // max minutes per week
  recoveryTimeNeeded: number; // hours needed for full recovery
  optimalSocialLevel: number; // preferred battery level to maintain
}

export interface WeeklySocialStats {
  totalInteractionTime: number; // minutes
  averageEnergyLevel: number;
  mostDrainingDay: string;
  preferredInteractionTypes: InteractionType[];
  recoveryPatterns: RecoveryPattern[];
}

export interface RecoveryPattern {
  activityType: string;
  effectivenessScore: number; // 1-10
  duration: number; // minutes
  frequency: number; // times per week
}

// Recovery recommendations
export interface RecoveryRecommendation {
  id: string;
  type: 'immediate' | 'short_term' | 'long_term';
  activity: string;
  description: string;
  estimatedBenefit: number; // expected energy increase
  duration: number; // minutes
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

// Forecasting
export interface SocialBatteryForecast {
  upcomingEvents: UpcomingEvent[];
  predictedEnergyLevel: number[];
  recommendations: RecoveryRecommendation[];
  warnings: string[];
}

export interface UpcomingEvent {
  id: string;
  name: string;
  timestamp: Date;
  estimatedType: InteractionType;
  estimatedDuration: number;
  estimatedDrain: number;
  confidence: number; // 0-1
}

// Dashboard display types
export interface DashboardMetrics {
  currentSocialBattery: number;
  todayInteractionTime: number;
  weeklyInteractionTime: number;
  nextRecoveryTime: Date;
  energyTrend: 'increasing' | 'decreasing' | 'stable';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

// Color palette
export const WARM_CREATIVE_COLORS = {
  GOLDEN_YELLOW: '#F7B731',
  WARM_ORANGE: '#FF6B35',
  DEEP_CORAL: '#E55D75',
  MUTED_RED: '#C0392B',
  SOFT_CREAM: '#FFF8E1',
  LIGHT_PEACH: '#FFE0B2',
  SAGE_GREEN: '#A8D5A3',
  CALM_BLUE: '#74B9FF'
} as const;