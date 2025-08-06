/**
 * Social Battery Pattern Engine
 * Analyzes social battery data to detect patterns and optimization opportunities
 */

import { SocialBatteryData, EnergyLevel } from '../types/energy';
import { 
  SocialOptimizationPattern, 
  SocialOptimizationAnalysis,
  OptimizationContext 
} from '../types/socialOptimization';
import { addDays, differenceInHours, getHours, getDay, format } from 'date-fns';

export class SocialPatternEngine {
  
  /**
   * Analyze social battery patterns and generate optimization analysis
   */
  public static analyzePatterns(
    socialData: SocialBatteryData[], 
    energyData?: EnergyLevel[]
  ): SocialOptimizationAnalysis {
    if (socialData.length < 7) {
      throw new Error('Insufficient data: Need at least 7 days of social battery data for analysis');
    }

    const analysisDate = new Date();
    const sortedData = [...socialData].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const startDate = sortedData[0].timestamp;
    const endDate = sortedData[sortedData.length - 1].timestamp;
    const daysAnalyzed = Math.ceil(differenceInHours(endDate, startDate) / 24);

    // Detect various patterns
    const patterns: SocialOptimizationPattern[] = [
      ...this.detectRecoveryPatterns(socialData),
      ...this.detectOptimalTimingPatterns(socialData),
      ...this.detectOverloadPatterns(socialData),
      ...this.detectDeficitPatterns(socialData),
      ...(energyData ? this.detectEnergyCorrelationPatterns(socialData, energyData) : [])
    ];

    // Calculate key insights
    const insights = this.calculateInsights(socialData, energyData);
    
    // Create analysis summary
    const summary = this.createAnalysisSummary(patterns);

    const analysis: SocialOptimizationAnalysis = {
      id: `social-analysis-${analysisDate.getTime()}`,
      analysisDate,
      dataRange: {
        startDate,
        endDate,
        daysAnalyzed
      },
      patterns,
      suggestions: [], // Will be filled by SocialOptimizationService
      insights,
      summary
    };

    return analysis;
  }

  /**
   * Detect social battery recovery patterns
   */
  private static detectRecoveryPatterns(socialData: SocialBatteryData[]): SocialOptimizationPattern[] {
    const patterns: SocialOptimizationPattern[] = [];
    
    // Analyze recovery times after social interactions
    const recoveryTimes: number[] = [];
    
    for (let i = 0; i < socialData.length - 1; i++) {
      const current = socialData[i];
      const next = socialData[i + 1];
      
      // If social battery increased significantly
      if (next.level > current.level + 10) {
        const recoveryTime = differenceInHours(next.timestamp, current.timestamp);
        recoveryTimes.push(recoveryTime);
      }
    }

    if (recoveryTimes.length >= 3) {
      const avgRecoveryTime = recoveryTimes.reduce((sum, time) => sum + time, 0) / recoveryTimes.length;
      const confidence = Math.min(0.9, recoveryTimes.length / 10); // Higher confidence with more data

      patterns.push({
        id: 'recovery-pattern-general',
        type: 'recovery-needed',
        description: `Average recovery time after social interactions is ${avgRecoveryTime.toFixed(1)} hours`,
        confidence,
        frequency: 'daily',
        averageRecoveryTime: avgRecoveryTime
      });
    }

    // Detect consistent recovery periods
    const rechargeEvents = socialData.flatMap(day => day.rechargeEvents);
    if (rechargeEvents.length >= 5) {
      const rechargeHours = rechargeEvents.map(event => getHours(event.timestamp));
      const hourCounts = rechargeHours.reduce((acc, hour) => {
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      const mostCommonHour = Object.entries(hourCounts)
        .sort((a, b) => b[1] - a[1])[0];
      
      if (parseInt(mostCommonHour[0]) && mostCommonHour[1] >= 3) {
        patterns.push({
          id: 'recovery-pattern-timing',
          type: 'recovery-needed',
          description: `Most effective recovery time appears to be around ${mostCommonHour[0]}:00`,
          confidence: Math.min(0.8, mostCommonHour[1] / rechargeEvents.length),
          frequency: 'daily',
          peakTimes: [{
            hour: parseInt(mostCommonHour[0]),
            level: mostCommonHour[1]
          }]
        });
      }
    }

    return patterns;
  }

  /**
   * Detect optimal timing patterns for social interactions
   */
  private static detectOptimalTimingPatterns(socialData: SocialBatteryData[]): SocialOptimizationPattern[] {
    const patterns: SocialOptimizationPattern[] = [];
    
    // Analyze social battery levels by hour and day of week
    const hourlyLevels: Record<number, number[]> = {};
    const weeklyLevels: Record<number, number[]> = {};

    socialData.forEach(day => {
      const hour = getHours(day.timestamp);
      const dayOfWeek = getDay(day.timestamp);
      
      if (!hourlyLevels[hour]) hourlyLevels[hour] = [];
      if (!weeklyLevels[dayOfWeek]) weeklyLevels[dayOfWeek] = [];
      
      hourlyLevels[hour].push(day.level);
      weeklyLevels[dayOfWeek].push(day.level);
    });

    // Find peak social battery hours
    const hourlyAverages = Object.entries(hourlyLevels)
      .map(([hour, levels]) => ({
        hour: parseInt(hour),
        average: levels.reduce((sum, level) => sum + level, 0) / levels.length,
        dataPoints: levels.length
      }))
      .filter(data => data.dataPoints >= 3)
      .sort((a, b) => b.average - a.average);

    if (hourlyAverages.length >= 3) {
      const topHours = hourlyAverages.slice(0, 3);
      const confidence = Math.min(0.9, socialData.length / 30); // Higher confidence with more data

      patterns.push({
        id: 'optimal-timing-hourly',
        type: 'optimal-timing',
        description: `Highest social battery typically occurs at ${topHours[0].hour}:00, ${topHours[1].hour}:00, and ${topHours[2].hour}:00`,
        confidence,
        frequency: 'daily',
        peakTimes: topHours.map(data => ({
          hour: data.hour,
          level: data.average
        }))
      });
    }

    // Find optimal days of week
    const weeklyAverages = Object.entries(weeklyLevels)
      .map(([day, levels]) => ({
        dayOfWeek: parseInt(day),
        average: levels.reduce((sum, level) => sum + level, 0) / levels.length,
        dataPoints: levels.length
      }))
      .filter(data => data.dataPoints >= 2)
      .sort((a, b) => b.average - a.average);

    if (weeklyAverages.length >= 2) {
      const bestDay = weeklyAverages[0];
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      patterns.push({
        id: 'optimal-timing-weekly',
        type: 'optimal-timing',
        description: `${dayNames[bestDay.dayOfWeek]} tends to be your best day for social activities`,
        confidence: Math.min(0.8, bestDay.dataPoints / 5),
        frequency: 'weekly',
        peakTimes: [{
          hour: 12, // Midday as default
          dayOfWeek: bestDay.dayOfWeek,
          level: bestDay.average
        }]
      });
    }

    return patterns;
  }

  /**
   * Detect social interaction overload patterns
   */
  private static detectOverloadPatterns(socialData: SocialBatteryData[]): SocialOptimizationPattern[] {
    const patterns: SocialOptimizationPattern[] = [];
    
    // Analyze days with high interaction counts and low battery
    const overloadDays = socialData.filter(day => 
      day.socialInteractions > 6 && day.level < 40
    );

    if (overloadDays.length >= 3) {
      const avgInteractions = overloadDays.reduce((sum, day) => sum + day.socialInteractions, 0) / overloadDays.length;
      const avgLevel = overloadDays.reduce((sum, day) => sum + day.level, 0) / overloadDays.length;
      
      patterns.push({
        id: 'interaction-overload',
        type: 'interaction-overload',
        description: `When you have ${Math.round(avgInteractions)}+ social interactions, your social battery drops to ${Math.round(avgLevel)}%`,
        confidence: Math.min(0.85, overloadDays.length / 7),
        frequency: 'weekly',
        optimalInteractionCount: Math.max(3, Math.round(avgInteractions * 0.7))
      });
    }

    // Detect consecutive high-drain days
    let consecutiveDrainDays = 0;
    let maxConsecutiveDrainDays = 0;
    
    socialData.forEach(day => {
      if (day.drainEvents.length > day.rechargeEvents.length && day.level < 50) {
        consecutiveDrainDays++;
        maxConsecutiveDrainDays = Math.max(maxConsecutiveDrainDays, consecutiveDrainDays);
      } else {
        consecutiveDrainDays = 0;
      }
    });

    if (maxConsecutiveDrainDays >= 3) {
      patterns.push({
        id: 'consecutive-drain-pattern',
        type: 'interaction-overload',
        description: `You experience ${maxConsecutiveDrainDays} consecutive days of social battery drain`,
        confidence: 0.8,
        frequency: 'weekly'
      });
    }

    return patterns;
  }

  /**
   * Detect social deficit patterns
   */
  private static detectDeficitPatterns(socialData: SocialBatteryData[]): SocialOptimizationPattern[] {
    const patterns: SocialOptimizationPattern[] = [];
    
    // Detect consistently low social interaction days
    const lowInteractionDays = socialData.filter(day => 
      day.socialInteractions < 2 && day.level > 80
    );

    if (lowInteractionDays.length >= 3) {
      patterns.push({
        id: 'social-deficit-pattern',
        type: 'social-deficit',
        description: `You have ${lowInteractionDays.length} days with very few social interactions but high social battery`,
        confidence: Math.min(0.8, lowInteractionDays.length / 10),
        frequency: 'weekly'
      });
    }

    // Detect isolation periods
    const avgInteractions = socialData.reduce((sum, day) => sum + day.socialInteractions, 0) / socialData.length;
    const isolatedDays = socialData.filter(day => day.socialInteractions === 0);
    
    if (isolatedDays.length >= 2 && avgInteractions < 3) {
      patterns.push({
        id: 'isolation-pattern',
        type: 'social-deficit',
        description: `You have ${isolatedDays.length} days with no social interactions`,
        confidence: 0.7,
        frequency: 'weekly'
      });
    }

    return patterns;
  }

  /**
   * Detect correlations between social battery and energy levels
   */
  private static detectEnergyCorrelationPatterns(
    socialData: SocialBatteryData[], 
    energyData: EnergyLevel[]
  ): SocialOptimizationPattern[] {
    const patterns: SocialOptimizationPattern[] = [];
    
    // Match social and energy data by date
    const correlationData: Array<{social: number, energy: number}> = [];
    
    socialData.forEach(socialDay => {
      const matchingEnergy = energyData.find(energyDay => 
        format(socialDay.timestamp, 'yyyy-MM-dd') === format(energyDay.timestamp, 'yyyy-MM-dd')
      );
      
      if (matchingEnergy) {
        correlationData.push({
          social: socialDay.level,
          energy: matchingEnergy.overall
        });
      }
    });

    if (correlationData.length >= 7) {
      // Calculate correlation coefficient
      const correlation = this.calculateCorrelation(
        correlationData.map(d => d.social),
        correlationData.map(d => d.energy)
      );

      if (Math.abs(correlation) > 0.4) {
        const relationshipType = correlation > 0 ? 'positively' : 'negatively';
        
        patterns.push({
          id: 'energy-correlation-pattern',
          type: 'energy-correlation',
          description: `Your social battery is ${relationshipType} correlated with your overall energy (r = ${correlation.toFixed(2)})`,
          confidence: Math.min(0.9, Math.abs(correlation)),
          frequency: 'daily',
          correlationWithEnergy: correlation
        });
      }
    }

    return patterns;
  }

  /**
   * Calculate insights from social battery data
   */
  private static calculateInsights(socialData: SocialBatteryData[], energyData?: EnergyLevel[]) {
    const avgSocialBattery = socialData.reduce((sum, day) => sum + day.level, 0) / socialData.length;
    
    // Calculate trend
    const recentData = socialData.slice(-7);
    const olderData = socialData.slice(-14, -7);
    
    let currentTrend: 'improving' | 'declining' | 'stable' | 'fluctuating' = 'stable';
    
    if (recentData.length >= 3 && olderData.length >= 3) {
      const recentAvg = recentData.reduce((sum, day) => sum + day.level, 0) / recentData.length;
      const olderAvg = olderData.reduce((sum, day) => sum + day.level, 0) / olderData.length;
      const difference = recentAvg - olderAvg;
      
      if (difference > 5) currentTrend = 'improving';
      else if (difference < -5) currentTrend = 'declining';
      else {
        const variance = recentData.reduce((sum, day) => sum + Math.pow(day.level - recentAvg, 2), 0) / recentData.length;
        if (variance > 400) currentTrend = 'fluctuating';
      }
    }

    // Calculate average recovery time
    const allRechargeEvents = socialData.flatMap(day => day.rechargeEvents);
    const avgRecoveryTime = allRechargeEvents.length > 0 
      ? allRechargeEvents.reduce((sum, event) => sum + event.intensity * 10, 0) / allRechargeEvents.length / 60
      : 2; // Default 2 hours

    // Find optimal interaction windows
    const hourlyData: Record<number, {levels: number[], interactions: number[]}> = {};
    
    socialData.forEach(day => {
      const hour = getHours(day.timestamp);
      if (!hourlyData[hour]) hourlyData[hour] = {levels: [], interactions: []};
      hourlyData[hour].levels.push(day.level);
      hourlyData[hour].interactions.push(day.socialInteractions);
    });

    const optimalInteractionWindows = Object.entries(hourlyData)
      .filter(([_, data]) => data.levels.length >= 3)
      .map(([hour, data]) => {
        const avgLevel = data.levels.reduce((sum, level) => sum + level, 0) / data.levels.length;
        const avgInteractions = data.interactions.reduce((sum, count) => sum + count, 0) / data.interactions.length;
        
        return {
          dayOfWeek: -1, // All days
          startHour: parseInt(hour),
          endHour: parseInt(hour) + 2,
          confidence: Math.min(0.8, data.levels.length / 10),
          avgLevel,
          avgInteractions
        };
      })
      .filter(window => window.avgLevel > 60)
      .sort((a, b) => b.avgLevel - a.avgLevel)
      .slice(0, 3);

    // Identify risk factors and strengths
    const riskFactors: string[] = [];
    const strengths: string[] = [];

    if (avgSocialBattery < 40) riskFactors.push('Consistently low social battery');
    if (socialData.filter(day => day.socialInteractions > 8).length > socialData.length * 0.3) {
      riskFactors.push('Frequent social overload');
    }
    if (socialData.filter(day => day.socialInteractions === 0).length > socialData.length * 0.2) {
      riskFactors.push('Regular social isolation');
    }

    if (avgSocialBattery > 70) strengths.push('Good overall social battery management');
    if (currentTrend === 'improving') strengths.push('Improving social energy patterns');
    if (optimalInteractionWindows.length >= 2) strengths.push('Consistent optimal interaction windows');

    return {
      currentTrend,
      avgSocialBattery,
      avgRecoveryTime,
      optimalInteractionWindows,
      riskFactors,
      strengths
    };
  }

  /**
   * Create analysis summary
   */
  private static createAnalysisSummary(patterns: SocialOptimizationPattern[]) {
    const patternTypes = patterns.reduce((acc, pattern) => {
      acc[pattern.type] = (acc[pattern.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      immediateActions: (patternTypes['recovery-needed'] || 0) + (patternTypes['interaction-overload'] || 0),
      routineChanges: (patternTypes['optimal-timing'] || 0) + (patternTypes['social-deficit'] || 0),
      lifestyleAdjustments: patternTypes['energy-correlation'] || 0,
      totalPotentialImprovement: Math.min(30, patterns.length * 5) // Estimated percentage
    };
  }

  /**
   * Calculate correlation coefficient between two arrays
   */
  private static calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return 0;
    
    const n = x.length;
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);
    const sumYY = y.reduce((sum, val) => sum + val * val, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Get current optimization context
   */
  public static getCurrentContext(
    currentSocialLevel: number,
    currentEnergyLevels: Record<string, number>,
    recentSocialData: SocialBatteryData[]
  ): OptimizationContext {
    const now = new Date();
    const hour = getHours(now);
    const dayOfWeek = getDay(now);
    
    let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    if (hour < 6) timeOfDay = 'night';
    else if (hour < 12) timeOfDay = 'morning';
    else if (hour < 18) timeOfDay = 'afternoon';
    else if (hour < 22) timeOfDay = 'evening';
    else timeOfDay = 'night';

    const recentEvents = recentSocialData
      .flatMap(day => [...day.drainEvents, ...day.rechargeEvents])
      .filter(event => differenceInHours(now, event.timestamp) <= 24)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return {
      timeOfDay,
      dayOfWeek: dayOfWeek === 0 || dayOfWeek === 6 ? 'weekend' : 'weekday',
      currentSocialLevel,
      currentEnergyLevels,
      recentEvents: recentEvents.slice(0, 5), // Last 5 events
      upcomingCommitments: [] // Would be populated from calendar integration
    };
  }
}
