/**
 * Social Battery Optimization Types
 * Comprehensive type definitions for social energy optimization and suggestions
 */

export interface SocialOptimizationPattern {
  id: string;
  type: 'recovery-needed' | 'optimal-timing' | 'interaction-overload' | 'social-deficit' | 'energy-correlation';
  description: string;
  confidence: number; // 0-1 confidence score
  frequency: 'daily' | 'weekly' | 'monthly';
  peakTimes?: Array<{
    hour: number;
    dayOfWeek?: number;
    level: number;
  }>;
  lowTimes?: Array<{
    hour: number;
    dayOfWeek?: number;
    level: number;
  }>;
  averageRecoveryTime?: number; // hours
  optimalInteractionCount?: number;
  correlationWithEnergy?: number; // correlation coefficient
}

export interface SocialOptimizationSuggestion {
  id: string;
  title: string;
  description: string;
  category: 'schedule-optimization' | 'recovery-strategies' | 'interaction-management' | 'energy-balance' | 'wellness-tips';
  type: 'immediate' | 'daily-routine' | 'weekly-planning' | 'lifestyle-change';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  confidence: number; // 0-1 confidence in recommendation
  
  // Actionable details
  implementation: {
    steps: string[];
    estimatedTimeToEffect: string; // e.g., "immediate", "2-3 days", "1-2 weeks"
    difficulty: 'easy' | 'moderate' | 'challenging';
    prerequisites?: string[];
  };
  
  // Expected outcomes
  expectedBenefits: string[];
  successMetrics: string[];
  
  // Personalization
  basedOnPatterns: string[]; // Pattern IDs this suggestion is based on
  adaptedFor: {
    currentSocialLevel: number;
    averageEnergyLevels: Record<string, number>;
    recentTrends: string[];
  };
  
  // Tracking
  implemented: boolean;
  implementedAt?: Date;
  effectiveness?: number; // 1-5 rating from user feedback
  userFeedback?: {
    helpful: boolean;
    implemented: boolean;
    difficulty: 'easier' | 'as-expected' | 'harder';
    effectiveness: number; // 1-5
    notes?: string;
    dateProvided: Date;
  };
}

export interface SocialOptimizationAnalysis {
  id: string;
  analysisDate: Date;
  dataRange: {
    startDate: Date;
    endDate: Date;
    daysAnalyzed: number;
  };
  
  // Pattern analysis results
  patterns: SocialOptimizationPattern[];
  suggestions: SocialOptimizationSuggestion[];
  
  // Key insights
  insights: {
    currentTrend: 'improving' | 'declining' | 'stable' | 'fluctuating';
    avgSocialBattery: number;
    avgRecoveryTime: number;
    optimalInteractionWindows: Array<{
      dayOfWeek: number;
      startHour: number;
      endHour: number;
      confidence: number;
    }>;
    riskFactors: string[];
    strengths: string[];
  };
  
  // Recommendations summary
  summary: {
    immediateActions: number;
    routineChanges: number;
    lifestyleAdjustments: number;
    totalPotentialImprovement: number; // estimated percentage improvement
  };
}

export interface SocialOptimizationPreferences {
  enabledCategories: Array<'schedule-optimization' | 'recovery-strategies' | 'interaction-management' | 'energy-balance' | 'wellness-tips'>;
  preferredTypes: Array<'immediate' | 'daily-routine' | 'weekly-planning' | 'lifestyle-change'>;
  maxSuggestionsPerCategory: number;
  minConfidence: number; // 0-1 minimum confidence for showing suggestions
  includeExperimental: boolean;
  notificationPreferences: {
    lowSocialBattery: boolean;
    recoveryReminders: boolean;
    optimalTimingAlerts: boolean;
  };
  personalContext: {
    workSchedule: 'flexible' | 'fixed' | 'shift' | 'remote';
    socialPreference: 'introverted' | 'extroverted' | 'ambivert';
    livingSituation: 'alone' | 'roommates' | 'family' | 'partner';
    commute: 'none' | 'short' | 'long' | 'varies';
  };
}

export interface SocialOptimizationMetrics {
  totalSuggestions: number;
  implementedSuggestions: number;
  implementationRate: number;
  averageEffectiveness: number;
  categoryBreakdown: Record<string, number>;
  typeBreakdown: Record<string, number>;
  improvementMetrics: {
    socialBatteryIncrease: number;
    recoveryTimeDecrease: number;
    interactionQualityImprovement: number;
    overallSatisfaction: number;
  };
  userEngagement: {
    totalFeedback: number;
    positiveRate: number;
    averageRating: number;
    retentionRate: number;
  };
}

// Event types for social battery tracking
export type SocialDrainEvent = {
  timestamp: Date;
  intensity: number; // 1-10
  type: 'meeting' | 'call' | 'social_event' | 'public_speaking' | 'conflict' | 'crowd' | 'networking' | 'customer_service' | 'other';
  description?: string;
  duration?: number; // minutes
  peopleCount?: number;
  energy?: 'high' | 'medium' | 'low'; // energy before event
};

export type SocialRechargeEvent = {
  timestamp: Date;
  intensity: number; // 1-10
  type: 'alone_time' | 'nature' | 'meditation' | 'hobby' | 'sleep' | 'close_friends' | 'pets' | 'reading' | 'music' | 'other';
  description?: string;
  duration?: number; // minutes
  environment?: 'indoor' | 'outdoor' | 'mixed';
};

// Optimization contexts
export interface OptimizationContext {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: 'weekday' | 'weekend';
  currentSocialLevel: number;
  currentEnergyLevels: Record<string, number>;
  recentEvents: Array<SocialDrainEvent | SocialRechargeEvent>;
  upcomingCommitments: Array<{
    type: 'social' | 'work' | 'personal';
    intensity: number;
    duration: number;
    isOptional: boolean;
  }>;
}
