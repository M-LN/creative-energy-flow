import { EnergyType, EnergyReading } from './energy';

/**
 * Types for Energy Pattern Recommendations System
 * Provides intelligent insights and suggestions based on user energy data
 */

export interface EnergyPattern {
  id: string;
  type: EnergyType;
  patternType: 'daily' | 'weekly' | 'monthly' | 'seasonal';
  description: string;
  confidence: number; // 0-1
  dataPoints: number;
  trend: 'increasing' | 'decreasing' | 'stable' | 'cyclical';
  averageValue: number;
  peakTimes: string[]; // Time periods when energy is highest
  lowTimes: string[]; // Time periods when energy is lowest
  insights: string[];
  detectedAt: Date;
  lastUpdated: Date;
}

export interface EnergyRecommendation {
  id: string;
  title: string;
  description: string;
  type: RecommendationType;
  priority: 'high' | 'medium' | 'low';
  energyTypes: EnergyType[];
  category: RecommendationCategory;
  actionable: boolean;
  estimatedImpact: number; // 1-10 scale
  timeToImplement: 'immediate' | 'short-term' | 'long-term';
  basedOnPatterns: string[]; // Pattern IDs this recommendation is based on
  tags: string[];
  createdAt: Date;
  validUntil?: Date;
  implemented?: boolean;
  implementedAt?: Date;
  userFeedback?: RecommendationFeedback;
}

export type RecommendationType = 
  | 'schedule-optimization'
  | 'activity-timing'
  | 'energy-management'
  | 'routine-adjustment'
  | 'rest-suggestion'
  | 'productivity-boost'
  | 'social-timing'
  | 'creative-timing';

export type RecommendationCategory =
  | 'daily-routine'
  | 'work-schedule'
  | 'social-activities'
  | 'rest-recovery'
  | 'creative-work'
  | 'physical-activity'
  | 'mental-focus'
  | 'emotional-wellbeing';

export interface RecommendationFeedback {
  helpful: boolean;
  implemented: boolean;
  effectiveness?: number; // 1-5 scale if implemented
  notes?: string;
  submittedAt: Date;
}

export interface PatternAnalysis {
  analysisId: string;
  userId?: string;
  analysisDate: Date;
  dataRange: {
    startDate: Date;
    endDate: Date;
    totalReadings: number;
  };
  patterns: EnergyPattern[];
  recommendations: EnergyRecommendation[];
  insights: AnalysisInsight[];
  confidence: number; // Overall confidence in analysis
  nextAnalysisDate: Date;
}

export interface AnalysisInsight {
  id: string;
  type: 'correlation' | 'trend' | 'anomaly' | 'opportunity';
  title: string;
  description: string;
  significance: 'high' | 'medium' | 'low';
  data: any; // Flexible data structure for insight-specific information
  visualizationType?: 'chart' | 'heatmap' | 'timeline' | 'comparison';
}

export interface RecommendationPreferences {
  enabledCategories: RecommendationCategory[];
  preferredTypes: RecommendationType[];
  frequency: 'real-time' | 'daily' | 'weekly' | 'bi-weekly';
  minConfidence: number; // Minimum confidence level for recommendations
  includeExperimental: boolean;
  personalityProfile?: PersonalityProfile;
}

export interface PersonalityProfile {
  earlyBird: boolean; // Morning person vs night owl
  socialPreference: 'introvert' | 'extrovert' | 'ambivert';
  workStyle: 'focused-blocks' | 'frequent-breaks' | 'flexible';
  energyRecoveryMethod: 'alone-time' | 'social-interaction' | 'physical-activity' | 'creative-activities';
  stressResponse: 'problem-solving' | 'rest-recovery' | 'social-support' | 'physical-outlet';
  productivityPeaks: 'morning' | 'afternoon' | 'evening' | 'variable';
}

export interface RecommendationEngine {
  version: string;
  lastTraining?: Date;
  accuracy: number;
  totalRecommendations: number;
  implementationRate: number;
  averageEffectiveness: number;
}

// Utility types for recommendation filtering and sorting
export interface RecommendationFilter {
  categories?: RecommendationCategory[];
  types?: RecommendationType[];
  priorities?: ('high' | 'medium' | 'low')[];
  energyTypes?: EnergyType[];
  timeframe?: 'immediate' | 'short-term' | 'long-term';
  implemented?: boolean;
  minImpact?: number;
}

export interface RecommendationSort {
  field: 'priority' | 'impact' | 'createdAt' | 'title';
  direction: 'asc' | 'desc';
}

// Analytics and metrics types
export interface RecommendationMetrics {
  totalGenerated: number;
  totalImplemented: number;
  implementationRate: number;
  averageEffectiveness: number;
  categoryBreakdown: Record<RecommendationCategory, number>;
  typeBreakdown: Record<RecommendationType, number>;
  feedbackSummary: {
    totalFeedback: number;
    positiveRate: number;
    averageRating: number;
  };
}

export interface PatternMetrics {
  totalPatterns: number;
  patternsPerType: Record<EnergyType, number>;
  averageConfidence: number;
  trendDistribution: Record<'increasing' | 'decreasing' | 'stable' | 'cyclical', number>;
  patternAges: {
    new: number; // < 1 week
    recent: number; // 1-4 weeks  
    established: number; // > 4 weeks
  };
}
