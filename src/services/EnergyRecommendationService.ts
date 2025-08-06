import { EnergyReading } from '../types/energy';
import { 
  PatternAnalysis, 
  EnergyRecommendation, 
  RecommendationPreferences,
  RecommendationFilter,
  RecommendationSort,
  RecommendationMetrics,
  RecommendationFeedback
} from '../types/recommendations';
import { EnergyPatternEngine } from './EnergyPatternEngine';

/**
 * Energy Recommendation Service
 * Manages pattern analysis and recommendation generation
 */
export class EnergyRecommendationService {
  private static readonly STORAGE_KEY = 'energy_recommendations';
  private static readonly PREFERENCES_KEY = 'recommendation_preferences';
  private static readonly FEEDBACK_KEY = 'recommendation_feedback';

  /**
   * Analyze energy patterns and generate recommendations
   */
  public static async analyzeAndRecommend(readings: EnergyReading[]): Promise<PatternAnalysis> {
    try {
      const engine = new EnergyPatternEngine(readings);
      const analysis = engine.analyzePatterns();
      
      // Store analysis for later retrieval
      this.storeAnalysis(analysis);
      
      return analysis;
    } catch (error) {
      console.error('Error analyzing energy patterns:', error);
      throw new Error('Failed to analyze energy patterns');
    }
  }

  /**
   * Get filtered recommendations
   */
  public static getRecommendations(filter?: RecommendationFilter, sort?: RecommendationSort): EnergyRecommendation[] {
    try {
      const analysis = this.getStoredAnalysis();
      if (!analysis || !analysis.recommendations) {
        return [];
      }

      let recommendations = [...analysis.recommendations];

      // Apply filters
      if (filter) {
        recommendations = this.applyFilters(recommendations, filter);
      }

      // Apply sorting
      if (sort) {
        recommendations = this.applySorting(recommendations, sort);
      }

      return recommendations;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  }

  /**
   * Get a specific recommendation by ID
   */
  public static getRecommendation(id: string): EnergyRecommendation | null {
    try {
      const analysis = this.getStoredAnalysis();
      if (!analysis || !analysis.recommendations) {
        return null;
      }

      return analysis.recommendations.find(rec => rec.id === id) || null;
    } catch (error) {
      console.error('Error getting recommendation:', error);
      return null;
    }
  }

  /**
   * Mark a recommendation as implemented
   */
  public static implementRecommendation(id: string): boolean {
    try {
      const analysis = this.getStoredAnalysis();
      if (!analysis || !analysis.recommendations) {
        return false;
      }

      const recommendation = analysis.recommendations.find(rec => rec.id === id);
      if (!recommendation) {
        return false;
      }

      recommendation.implemented = true;
      recommendation.implementedAt = new Date();

      this.storeAnalysis(analysis);
      return true;
    } catch (error) {
      console.error('Error implementing recommendation:', error);
      return false;
    }
  }

  /**
   * Submit feedback for a recommendation
   */
  public static submitFeedback(id: string, feedback: Omit<RecommendationFeedback, 'submittedAt'>): boolean {
    try {
      const analysis = this.getStoredAnalysis();
      if (!analysis || !analysis.recommendations) {
        return false;
      }

      const recommendation = analysis.recommendations.find(rec => rec.id === id);
      if (!recommendation) {
        return false;
      }

      recommendation.userFeedback = {
        ...feedback,
        submittedAt: new Date()
      };

      this.storeAnalysis(analysis);
      
      // Store feedback separately for analytics
      this.storeFeedback(id, recommendation.userFeedback);
      
      return true;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      return false;
    }
  }

  /**
   * Get recommendation metrics and analytics
   */
  public static getRecommendationMetrics(): RecommendationMetrics {
    try {
      const analysis = this.getStoredAnalysis();
      if (!analysis || !analysis.recommendations) {
        return this.getEmptyMetrics();
      }

      const recommendations = analysis.recommendations;
      const totalGenerated = recommendations.length;
      const totalImplemented = recommendations.filter(r => r.implemented).length;
      const implementationRate = totalGenerated > 0 ? totalImplemented / totalGenerated : 0;

      // Calculate average effectiveness from feedback
      const feedbackRatings = recommendations
        .filter(r => r.userFeedback?.effectiveness)
        .map(r => r.userFeedback!.effectiveness!);
      
      const averageEffectiveness = feedbackRatings.length > 0 
        ? feedbackRatings.reduce((sum, rating) => sum + rating, 0) / feedbackRatings.length 
        : 0;

      // Category breakdown
      const categoryBreakdown = recommendations.reduce((acc, rec) => {
        acc[rec.category] = (acc[rec.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Type breakdown
      const typeBreakdown = recommendations.reduce((acc, rec) => {
        acc[rec.type] = (acc[rec.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Feedback summary
      const feedbackCount = recommendations.filter(r => r.userFeedback).length;
      const positiveFeedback = recommendations.filter(r => r.userFeedback?.helpful).length;
      const positiveRate = feedbackCount > 0 ? positiveFeedback / feedbackCount : 0;

      return {
        totalGenerated,
        totalImplemented,
        implementationRate,
        averageEffectiveness,
        categoryBreakdown: categoryBreakdown as any,
        typeBreakdown: typeBreakdown as any,
        feedbackSummary: {
          totalFeedback: feedbackCount,
          positiveRate,
          averageRating: averageEffectiveness
        }
      };
    } catch (error) {
      console.error('Error getting recommendation metrics:', error);
      return this.getEmptyMetrics();
    }
  }

  /**
   * Get user preferences for recommendations
   */
  public static getPreferences(): RecommendationPreferences {
    try {
      const stored = localStorage.getItem(this.PREFERENCES_KEY);
      if (stored) {
        return JSON.parse(stored);
      }

      // Default preferences
      return {
        enabledCategories: ['daily-routine', 'work-schedule', 'rest-recovery'],
        preferredTypes: ['schedule-optimization', 'energy-management', 'routine-adjustment'],
        frequency: 'weekly',
        minConfidence: 0.6,
        includeExperimental: false
      };
    } catch (error) {
      console.error('Error getting preferences:', error);
      return {
        enabledCategories: ['daily-routine', 'work-schedule', 'rest-recovery'],
        preferredTypes: ['schedule-optimization', 'energy-management', 'routine-adjustment'],
        frequency: 'weekly',
        minConfidence: 0.6,
        includeExperimental: false
      };
    }
  }

  /**
   * Save user preferences
   */
  public static savePreferences(preferences: RecommendationPreferences): boolean {
    try {
      localStorage.setItem(this.PREFERENCES_KEY, JSON.stringify(preferences));
      return true;
    } catch (error) {
      console.error('Error saving preferences:', error);
      return false;
    }
  }

  /**
   * Generate fresh recommendations based on current data
   */
  public static async generateFreshRecommendations(readings: EnergyReading[]): Promise<PatternAnalysis> {
    // Clear existing analysis and generate new one
    localStorage.removeItem(this.STORAGE_KEY);
    return this.analyzeAndRecommend(readings);
  }

  /**
   * Get the latest pattern analysis
   */
  public static getLatestAnalysis(): PatternAnalysis | null {
    return this.getStoredAnalysis();
  }

  /**
   * Apply filters to recommendations
   */
  private static applyFilters(recommendations: EnergyRecommendation[], filter: RecommendationFilter): EnergyRecommendation[] {
    return recommendations.filter(rec => {
      if (filter.categories && !filter.categories.includes(rec.category)) {
        return false;
      }
      
      if (filter.types && !filter.types.includes(rec.type)) {
        return false;
      }
      
      if (filter.priorities && !filter.priorities.includes(rec.priority)) {
        return false;
      }
      
      if (filter.energyTypes && !filter.energyTypes.some(type => rec.energyTypes.includes(type))) {
        return false;
      }
      
      if (filter.timeframe && rec.timeToImplement !== filter.timeframe) {
        return false;
      }
      
      if (filter.implemented !== undefined && rec.implemented !== filter.implemented) {
        return false;
      }
      
      if (filter.minImpact && rec.estimatedImpact < filter.minImpact) {
        return false;
      }
      
      return true;
    });
  }

  /**
   * Apply sorting to recommendations
   */
  private static applySorting(recommendations: EnergyRecommendation[], sort: RecommendationSort): EnergyRecommendation[] {
    return recommendations.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      // Handle each field type
      switch (sort.field) {
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case 'impact':
          aValue = a.estimatedImpact;
          bValue = b.estimatedImpact;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'title':
          aValue = a.title;
          bValue = b.title;
          break;
        default:
          aValue = 0;
          bValue = 0;
      }

      if (sort.direction === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
  }

  /**
   * Store pattern analysis
   */
  private static storeAnalysis(analysis: PatternAnalysis): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(analysis));
    } catch (error) {
      console.error('Error storing analysis:', error);
    }
  }

  /**
   * Get stored pattern analysis
   */
  private static getStoredAnalysis(): PatternAnalysis | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const analysis = JSON.parse(stored);
        // Convert date strings back to Date objects
        analysis.analysisDate = new Date(analysis.analysisDate);
        analysis.dataRange.startDate = new Date(analysis.dataRange.startDate);
        analysis.dataRange.endDate = new Date(analysis.dataRange.endDate);
        analysis.nextAnalysisDate = new Date(analysis.nextAnalysisDate);
        
        // Convert dates in patterns and recommendations
        analysis.patterns?.forEach((pattern: any) => {
          pattern.detectedAt = new Date(pattern.detectedAt);
          pattern.lastUpdated = new Date(pattern.lastUpdated);
        });
        
        analysis.recommendations?.forEach((rec: any) => {
          rec.createdAt = new Date(rec.createdAt);
          if (rec.validUntil) rec.validUntil = new Date(rec.validUntil);
          if (rec.implementedAt) rec.implementedAt = new Date(rec.implementedAt);
          if (rec.userFeedback?.submittedAt) {
            rec.userFeedback.submittedAt = new Date(rec.userFeedback.submittedAt);
          }
        });
        
        return analysis;
      }
      return null;
    } catch (error) {
      console.error('Error getting stored analysis:', error);
      return null;
    }
  }

  /**
   * Store feedback separately for analytics
   */
  private static storeFeedback(recommendationId: string, feedback: RecommendationFeedback): void {
    try {
      const stored = localStorage.getItem(this.FEEDBACK_KEY);
      const allFeedback = stored ? JSON.parse(stored) : {};
      
      allFeedback[recommendationId] = feedback;
      
      localStorage.setItem(this.FEEDBACK_KEY, JSON.stringify(allFeedback));
    } catch (error) {
      console.error('Error storing feedback:', error);
    }
  }

  /**
   * Get empty metrics object
   */
  private static getEmptyMetrics(): RecommendationMetrics {
    return {
      totalGenerated: 0,
      totalImplemented: 0,
      implementationRate: 0,
      averageEffectiveness: 0,
      categoryBreakdown: {} as any,
      typeBreakdown: {} as any,
      feedbackSummary: {
        totalFeedback: 0,
        positiveRate: 0,
        averageRating: 0
      }
    };
  }
}
