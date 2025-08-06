/**
 * Social Optimization Service
 * Manages social battery optimization suggestions and recommendations
 */

import { SocialBatteryData, EnergyLevel } from '../types/energy';
import { 
  SocialOptimizationSuggestion, 
  SocialOptimizationAnalysis, 
  SocialOptimizationPreferences,
  SocialOptimizationMetrics,
  OptimizationContext 
} from '../types/socialOptimization';
import { SocialPatternEngine } from './SocialPatternEngine';

export class SocialOptimizationService {
  private static readonly STORAGE_KEY = 'social-optimization-analysis';
  private static readonly PREFERENCES_KEY = 'social-optimization-preferences';
  private static readonly SUGGESTIONS_KEY = 'social-optimization-suggestions';

  /**
   * Generate comprehensive social optimization analysis
   */
  public static generateOptimizationAnalysis(
    socialData: SocialBatteryData[], 
    energyData?: EnergyLevel[]
  ): SocialOptimizationAnalysis {
    try {
      // Get pattern analysis from engine
      const analysis = SocialPatternEngine.analyzePatterns(socialData, energyData);
      
      // Generate suggestions based on patterns
      const suggestions = this.generateOptimizationSuggestions(analysis, socialData, energyData);
      analysis.suggestions = suggestions;
      
      // Store analysis
      this.storeAnalysis(analysis);
      
      return analysis;
    } catch (error) {
      console.error('Error generating optimization analysis:', error);
      throw error;
    }
  }

  /**
   * Generate optimization suggestions based on analysis patterns
   */
  private static generateOptimizationSuggestions(
    analysis: SocialOptimizationAnalysis,
    socialData: SocialBatteryData[],
    energyData?: EnergyLevel[]
  ): SocialOptimizationSuggestion[] {
    const suggestions: SocialOptimizationSuggestion[] = [];
    const preferences = this.getPreferences();
    const currentLevel = socialData[socialData.length - 1]?.level || 50;
    const avgEnergyLevels = energyData ? this.calculateAverageEnergyLevels(energyData) : {};

    analysis.patterns.forEach(pattern => {
      const patternSuggestions = this.generateSuggestionsForPattern(
        pattern, 
        analysis, 
        currentLevel,
        avgEnergyLevels,
        preferences
      );
      suggestions.push(...patternSuggestions);
    });

    // Add context-specific suggestions
    const contextSuggestions = this.generateContextualSuggestions(
      analysis.insights,
      currentLevel,
      avgEnergyLevels
    );
    suggestions.push(...contextSuggestions);

    // Filter by preferences and confidence
    return suggestions
      .filter(suggestion => 
        preferences.enabledCategories.includes(suggestion.category) &&
        preferences.preferredTypes.includes(suggestion.type) &&
        suggestion.confidence >= preferences.minConfidence
      )
      .sort((a, b) => {
        // Sort by priority, then confidence
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        return priorityDiff !== 0 ? priorityDiff : b.confidence - a.confidence;
      })
      .slice(0, 12); // Limit to 12 suggestions
  }

  /**
   * Generate suggestions for a specific pattern
   */
  private static generateSuggestionsForPattern(
    pattern: any,
    analysis: SocialOptimizationAnalysis,
    currentLevel: number,
    avgEnergyLevels: Record<string, number>,
    preferences: SocialOptimizationPreferences
  ): SocialOptimizationSuggestion[] {
    const suggestions: SocialOptimizationSuggestion[] = [];
    const baseAdaptation = {
      currentSocialLevel: currentLevel,
      averageEnergyLevels: avgEnergyLevels,
      recentTrends: [analysis.insights.currentTrend]
    };

    switch (pattern.type) {
      case 'recovery-needed':
        if (pattern.averageRecoveryTime && pattern.averageRecoveryTime > 3) {
          suggestions.push({
            id: `recovery-${pattern.id}`,
            title: 'Optimize Your Recovery Time',
            description: `Your average recovery time is ${pattern.averageRecoveryTime.toFixed(1)} hours. Let's reduce this with targeted strategies.`,
            category: 'recovery-strategies',
            type: 'daily-routine',
            priority: currentLevel < 40 ? 'high' : 'medium',
            confidence: pattern.confidence,
            implementation: {
              steps: [
                'Schedule 15-30 minutes of alone time immediately after social interactions',
                'Create a quiet, comfortable recovery space in your home',
                'Use noise-canceling headphones or calming music',
                'Practice deep breathing or brief meditation'
              ],
              estimatedTimeToEffect: '2-3 days',
              difficulty: 'easy',
              prerequisites: ['Access to quiet space']
            },
            expectedBenefits: [
              'Faster social battery recovery',
              'Reduced social fatigue',
              'Better preparation for next social interaction'
            ],
            successMetrics: [
              'Recovery time reduced by 30%',
              'Social battery level above 60% after 2 hours',
              'Fewer consecutive low-energy days'
            ],
            basedOnPatterns: [pattern.id],
            adaptedFor: baseAdaptation,
            implemented: false
          });
        }

        if (pattern.peakTimes && pattern.peakTimes.length > 0) {
          const peakHour = pattern.peakTimes[0].hour;
          suggestions.push({
            id: `recovery-timing-${pattern.id}`,
            title: 'Schedule Recovery During Peak Hours',
            description: `Your data shows ${peakHour}:00 is optimal for recovery. Plan your recharge time accordingly.`,
            category: 'schedule-optimization',
            type: 'daily-routine',
            priority: 'medium',
            confidence: pattern.confidence,
            implementation: {
              steps: [
                `Block ${peakHour}:00-${peakHour + 1}:00 for personal recovery time`,
                'Avoid scheduling social activities during this window',
                'Use this time for your most effective recharge activities',
                'Set a daily reminder for your optimal recovery period'
              ],
              estimatedTimeToEffect: '1 week',
              difficulty: 'moderate'
            },
            expectedBenefits: [
              'More effective recovery sessions',
              'Better alignment with natural energy rhythms',
              'Increased social battery capacity'
            ],
            successMetrics: [
              'Social battery increases by 20+ points during recovery window',
              'Fewer recovery sessions needed throughout the day'
            ],
            basedOnPatterns: [pattern.id],
            adaptedFor: baseAdaptation,
            implemented: false
          });
        }
        break;

      case 'optimal-timing':
        if (pattern.peakTimes && pattern.peakTimes.length > 0) {
          const bestTimes = pattern.peakTimes.slice(0, 2);
          suggestions.push({
            id: `timing-${pattern.id}`,
            title: 'Schedule Social Activities During Peak Hours',
            description: `Your social battery is highest at ${bestTimes.map((t: any) => `${t.hour}:00`).join(' and ')}. Plan important social interactions during these windows.`,
            category: 'schedule-optimization',
            type: 'weekly-planning',
            priority: 'medium',
            confidence: pattern.confidence,
            implementation: {
              steps: [
                'Move important meetings to peak social battery hours',
                'Schedule networking events during these optimal windows',
                'Block calendar during peak times for social activities',
                'Reschedule routine social activities to align with peaks'
              ],
              estimatedTimeToEffect: '1-2 weeks',
              difficulty: 'moderate',
              prerequisites: ['Flexible schedule', 'Calendar access']
            },
            expectedBenefits: [
              'Better performance in social situations',
              'Reduced social fatigue',
              'More enjoyable social interactions'
            ],
            successMetrics: [
              'Social activities rated 20% more enjoyable',
              'Social battery remains above 50% after planned interactions'
            ],
            basedOnPatterns: [pattern.id],
            adaptedFor: baseAdaptation,
            implemented: false
          });
        }
        break;

      case 'interaction-overload':
        if (pattern.optimalInteractionCount) {
          suggestions.push({
            id: `overload-${pattern.id}`,
            title: 'Limit Daily Social Interactions',
            description: `Your optimal interaction count is ${pattern.optimalInteractionCount} per day. Current patterns show overload beyond this threshold.`,
            category: 'interaction-management',
            type: 'daily-routine',
            priority: currentLevel < 30 ? 'urgent' : 'high',
            confidence: pattern.confidence,
            implementation: {
              steps: [
                `Limit yourself to ${pattern.optimalInteractionCount} significant social interactions per day`,
                'Batch similar social activities together',
                'Use asynchronous communication (email, text) when possible',
                'Practice saying no to non-essential social commitments'
              ],
              estimatedTimeToEffect: 'immediate',
              difficulty: 'challenging',
              prerequisites: ['Assertiveness skills', 'Communication alternatives']
            },
            expectedBenefits: [
              'Reduced social overwhelm',
              'Higher quality social interactions',
              'Better social battery preservation'
            ],
            successMetrics: [
              'Social battery stays above 40% even on social days',
              'Fewer days with complete social exhaustion'
            ],
            basedOnPatterns: [pattern.id],
            adaptedFor: baseAdaptation,
            implemented: false
          });
        }
        break;

      case 'social-deficit':
        suggestions.push({
          id: `deficit-${pattern.id}`,
          title: 'Increase Meaningful Social Connections',
          description: 'Your data shows periods of social isolation. Consider adding low-energy, high-quality social activities.',
          category: 'interaction-management',
          type: 'weekly-planning',
          priority: 'medium',
          confidence: pattern.confidence,
          implementation: {
            steps: [
              'Schedule one low-energy social activity per week (coffee with a close friend)',
              'Join a regular, structured social activity (book club, hobby group)',
              'Plan virtual social connections when in-person feels too draining',
              'Start with text-based social connections to ease back into interaction'
            ],
            estimatedTimeToEffect: '2-4 weeks',
            difficulty: 'moderate'
          },
          expectedBenefits: [
            'Improved mood and connection',
            'Better social skill maintenance',
            'Reduced social anxiety from isolation'
          ],
          successMetrics: [
            'At least 2-3 meaningful social interactions per week',
            'Increased satisfaction with social connections'
          ],
          basedOnPatterns: [pattern.id],
          adaptedFor: baseAdaptation,
          implemented: false
        });
        break;

      case 'energy-correlation':
        if (pattern.correlationWithEnergy && Math.abs(pattern.correlationWithEnergy) > 0.5) {
          const correlationType = pattern.correlationWithEnergy > 0 ? 'positively' : 'negatively';
          suggestions.push({
            id: `correlation-${pattern.id}`,
            title: 'Align Social and Energy Management',
            description: `Your social battery is ${correlationType} correlated with your overall energy. Optimize both together.`,
            category: 'energy-balance',
            type: 'lifestyle-change',
            priority: 'medium',
            confidence: pattern.confidence,
            implementation: {
              steps: [
                'Track both social and energy levels simultaneously',
                'Schedule social activities when overall energy is high',
                'Use energy-boosting activities before social interactions',
                'Plan recovery time that addresses both social and energy needs'
              ],
              estimatedTimeToEffect: '3-4 weeks',
              difficulty: 'challenging'
            },
            expectedBenefits: [
              'Improved overall energy management',
              'Better synchronization between social and energy needs',
              'More sustainable social activity patterns'
            ],
            successMetrics: [
              'Both social and energy levels trending upward',
              'Reduced variance in both metrics'
            ],
            basedOnPatterns: [pattern.id],
            adaptedFor: baseAdaptation,
            implemented: false
          });
        }
        break;
    }

    return suggestions;
  }

  /**
   * Generate contextual suggestions based on current insights
   */
  private static generateContextualSuggestions(
    insights: any,
    currentLevel: number,
    avgEnergyLevels: Record<string, number>
  ): SocialOptimizationSuggestion[] {
    const suggestions: SocialOptimizationSuggestion[] = [];

    // Emergency suggestions for very low social battery
    if (currentLevel < 20) {
      suggestions.push({
        id: 'emergency-recovery',
        title: 'Emergency Social Battery Recovery',
        description: 'Your social battery is critically low. Immediate recovery actions needed.',
        category: 'recovery-strategies',
        type: 'immediate',
        priority: 'urgent',
        confidence: 0.95,
        implementation: {
          steps: [
            'Cancel all non-essential social commitments for today',
            'Find a quiet, comfortable space for at least 2 hours',
            'Turn off all notifications and social media',
            'Engage in your most effective recharge activity'
          ],
          estimatedTimeToEffect: 'immediate',
          difficulty: 'easy'
        },
        expectedBenefits: [
          'Immediate relief from social overwhelm',
          'Prevention of social burnout',
          'Restored capacity for essential interactions'
        ],
        successMetrics: [
          'Social battery increases to 40+ within 4 hours',
          'Feeling refreshed and ready for necessary social interactions'
        ],
        basedOnPatterns: ['current-state'],
        adaptedFor: {
          currentSocialLevel: currentLevel,
          averageEnergyLevels: avgEnergyLevels,
          recentTrends: ['critical-low']
        },
        implemented: false
      });
    }

    // Trend-based suggestions
    if (insights.currentTrend === 'declining') {
      suggestions.push({
        id: 'trend-intervention',
        title: 'Reverse Declining Social Battery Trend',
        description: 'Your social battery has been declining. Time for proactive intervention.',
        category: 'wellness-tips',
        type: 'daily-routine',
        priority: 'high',
        confidence: 0.8,
        implementation: {
          steps: [
            'Identify and eliminate the biggest social energy drains',
            'Increase recovery time between social activities',
            'Add more high-quality, low-energy social connections',
            'Review and adjust your social commitments'
          ],
          estimatedTimeToEffect: '1-2 weeks',
          difficulty: 'moderate'
        },
        expectedBenefits: [
          'Stabilized social battery levels',
          'Improved social energy sustainability',
          'Better work-life-social balance'
        ],
        successMetrics: [
          'Social battery trend becomes stable or improving',
          'Fewer days below 40% social battery'
        ],
        basedOnPatterns: ['trend-analysis'],
        adaptedFor: {
          currentSocialLevel: currentLevel,
          averageEnergyLevels: avgEnergyLevels,
          recentTrends: [insights.currentTrend]
        },
        implemented: false
      });
    }

    return suggestions;
  }

  /**
   * Get optimization suggestions with filtering options
   */
  public static getOptimizationSuggestions(
    filter?: 'all' | 'immediate' | 'daily-routine' | 'weekly-planning' | 'lifestyle-change',
    sortBy?: 'priority' | 'confidence' | 'category' | 'recent'
  ): SocialOptimizationSuggestion[] {
    try {
      const stored = localStorage.getItem(this.SUGGESTIONS_KEY);
      if (!stored) return [];

      let suggestions: SocialOptimizationSuggestion[] = JSON.parse(stored);
      
      // Apply filter
      if (filter && filter !== 'all') {
        suggestions = suggestions.filter(s => s.type === filter);
      }
      
      // Apply sorting
      if (sortBy) {
        suggestions.sort((a, b) => {
          switch (sortBy) {
            case 'priority':
              const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
              return priorityOrder[b.priority] - priorityOrder[a.priority];
            case 'confidence':
              return b.confidence - a.confidence;
            case 'category':
              return a.category.localeCompare(b.category);
            case 'recent':
              return (b.implementedAt?.getTime() || 0) - (a.implementedAt?.getTime() || 0);
            default:
              return 0;
          }
        });
      }
      
      return suggestions;
    } catch (error) {
      console.error('Error getting optimization suggestions:', error);
      return [];
    }
  }

  /**
   * Get the latest optimization analysis
   */
  public static getLatestAnalysis(): SocialOptimizationAnalysis | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;

      const analysis = JSON.parse(stored);
      // Convert date strings back to Date objects
      analysis.analysisDate = new Date(analysis.analysisDate);
      analysis.dataRange.startDate = new Date(analysis.dataRange.startDate);
      analysis.dataRange.endDate = new Date(analysis.dataRange.endDate);
      
      return analysis;
    } catch (error) {
      console.error('Error getting latest analysis:', error);
      return null;
    }
  }

  /**
   * Implement a suggestion and track usage
   */
  public static implementSuggestion(suggestionId: string): boolean {
    try {
      const stored = localStorage.getItem(this.SUGGESTIONS_KEY);
      if (!stored) return false;

      const suggestions: SocialOptimizationSuggestion[] = JSON.parse(stored);
      const suggestion = suggestions.find(s => s.id === suggestionId);
      
      if (suggestion) {
        suggestion.implemented = true;
        suggestion.implementedAt = new Date();
        
        localStorage.setItem(this.SUGGESTIONS_KEY, JSON.stringify(suggestions));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error implementing suggestion:', error);
      return false;
    }
  }

  /**
   * Submit feedback for a suggestion
   */
  public static submitFeedback(
    suggestionId: string, 
    feedback: {
      helpful: boolean;
      implemented: boolean;
      difficulty?: 'easier' | 'as-expected' | 'harder';
      effectiveness?: number;
      notes?: string;
    }
  ): boolean {
    try {
      const stored = localStorage.getItem(this.SUGGESTIONS_KEY);
      if (!stored) return false;

      const suggestions: SocialOptimizationSuggestion[] = JSON.parse(stored);
      const suggestion = suggestions.find(s => s.id === suggestionId);
      
      if (suggestion) {
        suggestion.userFeedback = {
          helpful: feedback.helpful,
          implemented: feedback.implemented,
          difficulty: feedback.difficulty || 'as-expected',
          effectiveness: feedback.effectiveness || 0,
          notes: feedback.notes,
          dateProvided: new Date()
        };
        
        if (feedback.effectiveness) {
          suggestion.effectiveness = feedback.effectiveness;
        }
        
        localStorage.setItem(this.SUGGESTIONS_KEY, JSON.stringify(suggestions));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      return false;
    }
  }

  /**
   * Get optimization metrics and analytics
   */
  public static getOptimizationMetrics(): SocialOptimizationMetrics {
    try {
      const stored = localStorage.getItem(this.SUGGESTIONS_KEY);
      if (!stored) {
        return this.getEmptyMetrics();
      }

      const suggestions: SocialOptimizationSuggestion[] = JSON.parse(stored);
      const totalSuggestions = suggestions.length;
      const implementedSuggestions = suggestions.filter(s => s.implemented).length;
      const implementationRate = totalSuggestions > 0 ? implementedSuggestions / totalSuggestions : 0;

      // Calculate metrics from feedback
      const feedbackSuggestions = suggestions.filter(s => s.userFeedback?.effectiveness);
      const averageEffectiveness = feedbackSuggestions.length > 0
        ? feedbackSuggestions.reduce((sum, s) => sum + s.userFeedback!.effectiveness!, 0) / feedbackSuggestions.length
        : 0;

      // Category and type breakdowns
      const categoryBreakdown = suggestions.reduce((acc, s) => {
        acc[s.category] = (acc[s.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const typeBreakdown = suggestions.reduce((acc, s) => {
        acc[s.type] = (acc[s.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // User engagement metrics
      const totalFeedback = suggestions.filter(s => s.userFeedback).length;
      const positiveFeedback = suggestions.filter(s => s.userFeedback?.helpful).length;
      const positiveRate = totalFeedback > 0 ? positiveFeedback / totalFeedback : 0;

      return {
        totalSuggestions,
        implementedSuggestions,
        implementationRate,
        averageEffectiveness,
        categoryBreakdown,
        typeBreakdown,
        improvementMetrics: {
          socialBatteryIncrease: averageEffectiveness * 10, // Estimated based on effectiveness
          recoveryTimeDecrease: averageEffectiveness * 5,
          interactionQualityImprovement: averageEffectiveness * 8,
          overallSatisfaction: averageEffectiveness * 20
        },
        userEngagement: {
          totalFeedback,
          positiveRate,
          averageRating: averageEffectiveness,
          retentionRate: implementationRate
        }
      };
    } catch (error) {
      console.error('Error getting optimization metrics:', error);
      return this.getEmptyMetrics();
    }
  }

  /**
   * Get user preferences for optimization
   */
  public static getPreferences(): SocialOptimizationPreferences {
    try {
      const stored = localStorage.getItem(this.PREFERENCES_KEY);
      if (stored) {
        return JSON.parse(stored);
      }

      // Default preferences
      return {
        enabledCategories: ['schedule-optimization', 'recovery-strategies', 'interaction-management'],
        preferredTypes: ['immediate', 'daily-routine', 'weekly-planning'],
        maxSuggestionsPerCategory: 3,
        minConfidence: 0.6,
        includeExperimental: false,
        notificationPreferences: {
          lowSocialBattery: true,
          recoveryReminders: true,
          optimalTimingAlerts: false
        },
        personalContext: {
          workSchedule: 'flexible',
          socialPreference: 'ambivert',
          livingSituation: 'alone',
          commute: 'short'
        }
      };
    } catch (error) {
      console.error('Error getting preferences:', error);
      return this.getDefaultPreferences();
    }
  }

  /**
   * Update user preferences
   */
  public static updatePreferences(preferences: Partial<SocialOptimizationPreferences>): boolean {
    try {
      const current = this.getPreferences();
      const updated = { ...current, ...preferences };
      localStorage.setItem(this.PREFERENCES_KEY, JSON.stringify(updated));
      return true;
    } catch (error) {
      console.error('Error updating preferences:', error);
      return false;
    }
  }

  // Private helper methods

  private static storeAnalysis(analysis: SocialOptimizationAnalysis): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(analysis));
      localStorage.setItem(this.SUGGESTIONS_KEY, JSON.stringify(analysis.suggestions));
    } catch (error) {
      console.error('Error storing analysis:', error);
    }
  }

  private static calculateAverageEnergyLevels(energyData: EnergyLevel[]): Record<string, number> {
    if (energyData.length === 0) return {};

    const totals = energyData.reduce((acc, entry) => {
      acc.physical += entry.physical;
      acc.mental += entry.mental;
      acc.emotional += entry.emotional;
      acc.creative += entry.creative;
      acc.overall += entry.overall;
      return acc;
    }, { physical: 0, mental: 0, emotional: 0, creative: 0, overall: 0 });

    const count = energyData.length;
    return {
      physical: totals.physical / count,
      mental: totals.mental / count,
      emotional: totals.emotional / count,
      creative: totals.creative / count,
      overall: totals.overall / count
    };
  }

  private static getEmptyMetrics(): SocialOptimizationMetrics {
    return {
      totalSuggestions: 0,
      implementedSuggestions: 0,
      implementationRate: 0,
      averageEffectiveness: 0,
      categoryBreakdown: {},
      typeBreakdown: {},
      improvementMetrics: {
        socialBatteryIncrease: 0,
        recoveryTimeDecrease: 0,
        interactionQualityImprovement: 0,
        overallSatisfaction: 0
      },
      userEngagement: {
        totalFeedback: 0,
        positiveRate: 0,
        averageRating: 0,
        retentionRate: 0
      }
    };
  }

  private static getDefaultPreferences(): SocialOptimizationPreferences {
    return {
      enabledCategories: ['schedule-optimization', 'recovery-strategies', 'interaction-management'],
      preferredTypes: ['immediate', 'daily-routine', 'weekly-planning'],
      maxSuggestionsPerCategory: 3,
      minConfidence: 0.6,
      includeExperimental: false,
      notificationPreferences: {
        lowSocialBattery: true,
        recoveryReminders: true,
        optimalTimingAlerts: false
      },
      personalContext: {
        workSchedule: 'flexible',
        socialPreference: 'ambivert',
        livingSituation: 'alone',
        commute: 'short'
      }
    };
  }
}
