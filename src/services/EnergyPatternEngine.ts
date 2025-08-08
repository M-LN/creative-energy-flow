import { EnergyReading, EnergyType } from '../types/energy';
import { 
  EnergyPattern, 
  EnergyRecommendation, 
  PatternAnalysis, 
  AnalysisInsight
} from '../types/recommendations';
import { getHours } from 'date-fns';

/**
 * Energy Pattern Analysis Engine
 * Analyzes energy data to detect patterns and generate insights
 */
export class EnergyPatternEngine {
  private readings: EnergyReading[] = [];
  private minDataPoints = 7; // Minimum readings needed for pattern detection
  private confidenceThreshold = 0.6; // Minimum confidence for valid patterns

  constructor(readings: EnergyReading[] = []) {
    this.readings = readings.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  /**
   * Analyze energy data and generate comprehensive pattern analysis
   */
  public analyzePatterns(): PatternAnalysis {
    const now = new Date();
    const analysisId = `analysis_${now.getTime()}`;
    
    if (this.readings.length < this.minDataPoints) {
      return this.createEmptyAnalysis(analysisId, now);
    }

    const dataRange = this.getDataRange();
    const patterns = this.detectAllPatterns();
    const insights = this.generateInsights(patterns);
    const recommendations = this.generateRecommendations(patterns, insights);
    
    const confidence = this.calculateOverallConfidence(patterns);
    const nextAnalysisDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Next week

    return {
      analysisId,
      analysisDate: now,
      dataRange,
      patterns,
      recommendations,
      insights,
      confidence,
      nextAnalysisDate
    };
  }

  /**
   * Detect daily patterns in energy levels
   */
  private detectDailyPatterns(): EnergyPattern[] {
    const patterns: EnergyPattern[] = [];
    const energyTypes: EnergyType[] = ['physical', 'mental', 'emotional', 'creative'];

    for (const energyType of energyTypes) {
      const typeReadings = this.readings.filter(r => r.type === energyType);
      if (typeReadings.length < this.minDataPoints) continue;

      const hourlyAverages = this.calculateHourlyAverages(typeReadings);
      const pattern = this.analyzeHourlyPattern(energyType, hourlyAverages);
      
      if (pattern && pattern.confidence >= this.confidenceThreshold) {
        patterns.push(pattern);
      }
    }

    return patterns;
  }

  /**
   * Detect weekly patterns in energy levels
   */
  private detectWeeklyPatterns(): EnergyPattern[] {
    const patterns: EnergyPattern[] = [];
    const energyTypes: EnergyType[] = ['physical', 'mental', 'emotional', 'creative'];

    for (const energyType of energyTypes) {
      const typeReadings = this.readings.filter(r => r.type === energyType);
      if (typeReadings.length < this.minDataPoints * 2) continue;

      const weeklyData = this.groupByWeekday(typeReadings);
      const pattern = this.analyzeWeeklyPattern(energyType, weeklyData);
      
      if (pattern && pattern.confidence >= this.confidenceThreshold) {
        patterns.push(pattern);
      }
    }

    return patterns;
  }

  /**
   * Detect all types of patterns
   */
  private detectAllPatterns(): EnergyPattern[] {
    const patterns: EnergyPattern[] = [];
    
    patterns.push(...this.detectDailyPatterns());
    patterns.push(...this.detectWeeklyPatterns());
    
    // Add trend patterns
    patterns.push(...this.detectTrendPatterns());
    
    return patterns;
  }

  /**
   * Detect trend patterns (increasing, decreasing, stable)
   */
  private detectTrendPatterns(): EnergyPattern[] {
    const patterns: EnergyPattern[] = [];
    const energyTypes: EnergyType[] = ['physical', 'mental', 'emotional', 'creative'];

    for (const energyType of energyTypes) {
      const typeReadings = this.readings.filter(r => r.type === energyType);
      if (typeReadings.length < this.minDataPoints) continue;

      const trend = this.calculateTrend(typeReadings);
      const pattern = this.createTrendPattern(energyType, typeReadings, trend);
      
      if (pattern && pattern.confidence >= this.confidenceThreshold) {
        patterns.push(pattern);
      }
    }

    return patterns;
  }

  /**
   * Calculate hourly averages for energy readings
   */
  private calculateHourlyAverages(readings: EnergyReading[]): Record<number, number> {
    const hourlyGroups: Record<number, number[]> = {};
    
    readings.forEach(reading => {
      const hour = getHours(new Date(reading.timestamp));
      if (!hourlyGroups[hour]) {
        hourlyGroups[hour] = [];
      }
      hourlyGroups[hour].push(reading.level);
    });

    const hourlyAverages: Record<number, number> = {};
    Object.keys(hourlyGroups).forEach(hourStr => {
      const hour = parseInt(hourStr);
      const values = hourlyGroups[hour];
      hourlyAverages[hour] = values.reduce((sum, val) => sum + val, 0) / values.length;
    });

    return hourlyAverages;
  }

  /**
   * Analyze hourly pattern and create pattern object
   */
  private analyzeHourlyPattern(energyType: EnergyType, hourlyAverages: Record<number, number>): EnergyPattern | null {
    const hours = Object.keys(hourlyAverages).map(h => parseInt(h)).sort();
    if (hours.length < 4) return null;

    const values = hours.map(h => hourlyAverages[h]);
    const avgValue = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    // Find peak and low times
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    
    const peakHours = hours.filter(h => hourlyAverages[h] >= maxValue * 0.9);
    const lowHours = hours.filter(h => hourlyAverages[h] <= minValue * 1.1);
    
    const peakTimes = peakHours.map(h => `${h}:00-${h + 1}:00`);
    const lowTimes = lowHours.map(h => `${h}:00-${h + 1}:00`);

    // Calculate confidence based on variance and data points
    const variance = this.calculateVariance(values);
    const confidence = Math.min(0.9, Math.max(0.3, 1 - (variance / avgValue) + (hours.length / 24) * 0.2));

    const insights = this.generateHourlyInsights(energyType, peakTimes, lowTimes, avgValue);

    return {
      id: `daily_${energyType}_${Date.now()}`,
      type: energyType,
      patternType: 'daily',
      description: `Daily ${energyType} energy pattern`,
      confidence,
      dataPoints: hours.length,
      trend: 'cyclical',
      averageValue: avgValue,
      peakTimes,
      lowTimes,
      insights,
      detectedAt: new Date(),
      lastUpdated: new Date()
    };
  }

  /**
   * Group readings by weekday
   */
  private groupByWeekday(readings: EnergyReading[]): Record<number, number[]> {
    const weekdayGroups: Record<number, number[]> = {};
    
    readings.forEach(reading => {
      const date = new Date(reading.timestamp);
      const weekday = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      if (!weekdayGroups[weekday]) {
        weekdayGroups[weekday] = [];
      }
      weekdayGroups[weekday].push(reading.level);
    });

    return weekdayGroups;
  }

  /**
   * Analyze weekly pattern
   */
  private analyzeWeeklyPattern(energyType: EnergyType, weeklyData: Record<number, number[]>): EnergyPattern | null {
    const weekdays = Object.keys(weeklyData).map(d => parseInt(d)).sort();
    if (weekdays.length < 3) return null;

    const weekdayAverages: Record<number, number> = {};
    weekdays.forEach(day => {
      const values = weeklyData[day];
      weekdayAverages[day] = values.reduce((sum, val) => sum + val, 0) / values.length;
    });

    const values = weekdays.map(d => weekdayAverages[d]);
    const avgValue = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    
    const peakDays = weekdays.filter(d => weekdayAverages[d] >= maxValue * 0.95);
    const lowDays = weekdays.filter(d => weekdayAverages[d] <= minValue * 1.05);
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const peakTimes = peakDays.map(d => dayNames[d]);
    const lowTimes = lowDays.map(d => dayNames[d]);

    const variance = this.calculateVariance(values);
    const confidence = Math.min(0.9, Math.max(0.4, 1 - (variance / avgValue) + (weekdays.length / 7) * 0.3));

    const insights = this.generateWeeklyInsights(energyType, peakTimes, lowTimes);

    return {
      id: `weekly_${energyType}_${Date.now()}`,
      type: energyType,
      patternType: 'weekly',
      description: `Weekly ${energyType} energy pattern`,
      confidence,
      dataPoints: weekdays.length,
      trend: 'cyclical',
      averageValue: avgValue,
      peakTimes,
      lowTimes,
      insights,
      detectedAt: new Date(),
      lastUpdated: new Date()
    };
  }

  /**
   * Calculate trend for energy readings
   */
  private calculateTrend(readings: EnergyReading[]): 'increasing' | 'decreasing' | 'stable' {
    if (readings.length < 3) return 'stable';

    const values = readings.map(r => r.level);
    const n = values.length;
    
    // Simple linear regression slope
    const sumX = readings.reduce((sum, _, i) => sum + i, 0);
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = readings.reduce((sum, reading, i) => sum + i * reading.level, 0);
    const sumXX = readings.reduce((sum, _, i) => sum + i * i, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    
    if (Math.abs(slope) < 0.1) return 'stable';
    return slope > 0 ? 'increasing' : 'decreasing';
  }

  /**
   * Create trend pattern
   */
  private createTrendPattern(energyType: EnergyType, readings: EnergyReading[], trend: string): EnergyPattern | null {
    const values = readings.map(r => r.level);
    const avgValue = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    const variance = this.calculateVariance(values);
    const confidence = Math.min(0.85, Math.max(0.5, 1 - (variance / avgValue) + (readings.length / 30) * 0.2));

    if (trend === 'stable' && confidence < 0.7) return null;

    const insights = this.generateTrendInsights(energyType, trend as any, avgValue);

    return {
      id: `trend_${energyType}_${Date.now()}`,
      type: energyType,
      patternType: 'monthly',
      description: `${trend} trend in ${energyType} energy`,
      confidence,
      dataPoints: readings.length,
      trend: trend as any,
      averageValue: avgValue,
      peakTimes: [],
      lowTimes: [],
      insights,
      detectedAt: new Date(),
      lastUpdated: new Date()
    };
  }

  /**
   * Calculate variance of values
   */
  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
  }

  /**
   * Generate insights for hourly patterns
   */
  private generateHourlyInsights(energyType: EnergyType, peakTimes: string[], lowTimes: string[], avgValue: number): string[] {
    const insights: string[] = [];
    
    if (peakTimes.length > 0) {
      insights.push(`Your ${energyType} energy peaks during ${peakTimes.join(', ')}`);
    }
    
    if (lowTimes.length > 0) {
      insights.push(`Your ${energyType} energy is lowest during ${lowTimes.join(', ')}`);
    }
    
    if (avgValue > 7) {
      insights.push(`Your overall ${energyType} energy levels are high (${avgValue.toFixed(1)}/10)`);
    } else if (avgValue < 4) {
      insights.push(`Your overall ${energyType} energy levels are low (${avgValue.toFixed(1)}/10)`);
    }

    return insights;
  }

  /**
   * Generate insights for weekly patterns
   */
  private generateWeeklyInsights(energyType: EnergyType, peakTimes: string[], lowTimes: string[]): string[] {
    const insights: string[] = [];
    
    if (peakTimes.length > 0) {
      insights.push(`Your ${energyType} energy is highest on ${peakTimes.join(', ')}`);
    }
    
    if (lowTimes.length > 0) {
      insights.push(`Your ${energyType} energy dips on ${lowTimes.join(', ')}`);
    }

    return insights;
  }

  /**
   * Generate insights for trend patterns
   */
  private generateTrendInsights(energyType: EnergyType, trend: 'increasing' | 'decreasing' | 'stable', avgValue: number): string[] {
    const insights: string[] = [];
    
    switch (trend) {
      case 'increasing':
        insights.push(`Your ${energyType} energy has been steadily improving`);
        insights.push('Keep up whatever you\'re doing - it\'s working!');
        break;
      case 'decreasing':
        insights.push(`Your ${energyType} energy has been declining recently`);
        insights.push('Consider adjusting your routine to support better energy levels');
        break;
      case 'stable':
        insights.push(`Your ${energyType} energy levels are consistent`);
        if (avgValue > 6) {
          insights.push('Great job maintaining high energy levels!');
        } else {
          insights.push('Consider strategies to boost your energy levels');
        }
        break;
    }

    return insights;
  }

  /**
   * Generate comprehensive insights from all patterns
   */
  private generateInsights(patterns: EnergyPattern[]): AnalysisInsight[] {
    const insights: AnalysisInsight[] = [];
    
    // Overall energy analysis
    if (patterns.length > 0) {
      const avgConfidence = patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length;
      insights.push({
        id: `insight_overall_${Date.now()}`,
        type: 'trend',
        title: 'Pattern Analysis Quality',
        description: `We've detected ${patterns.length} energy patterns with ${Math.round(avgConfidence * 100)}% confidence`,
        significance: avgConfidence > 0.7 ? 'high' : avgConfidence > 0.5 ? 'medium' : 'low',
        data: { patternCount: patterns.length, confidence: avgConfidence }
      });
    }

    // Energy type correlations
    const energyTypePatterns = this.groupPatternsByEnergyType(patterns);
    if (Object.keys(energyTypePatterns).length > 1) {
      insights.push({
        id: `insight_correlation_${Date.now()}`,
        type: 'correlation',
        title: 'Energy Type Relationships',
        description: 'Multiple energy types show similar patterns, suggesting interconnected factors',
        significance: 'medium',
        data: { correlations: energyTypePatterns },
        visualizationType: 'comparison'
      });
    }

    return insights;
  }

  /**
   * Generate recommendations based on patterns and insights
   */
  private generateRecommendations(patterns: EnergyPattern[], insights: AnalysisInsight[]): EnergyRecommendation[] {
    const recommendations: EnergyRecommendation[] = [];
    
    // Generate recommendations for each pattern
    patterns.forEach(pattern => {
      recommendations.push(...this.generatePatternRecommendations(pattern));
    });

    return recommendations;
  }

  /**
   * Generate recommendations for a specific pattern
   */
  private generatePatternRecommendations(pattern: EnergyPattern): EnergyRecommendation[] {
    const recommendations: EnergyRecommendation[] = [];
    const now = new Date();

    // Schedule optimization recommendations
    if (pattern.patternType === 'daily' && pattern.peakTimes.length > 0) {
      recommendations.push({
        id: `rec_schedule_${pattern.id}_${now.getTime()}`,
        title: `Optimize Your ${pattern.type} Energy Schedule`,
        description: `Schedule important ${pattern.type} activities during your peak times: ${pattern.peakTimes.join(', ')}`,
        type: 'schedule-optimization',
        priority: 'high',
        energyTypes: [pattern.type],
        category: 'daily-routine',
        actionable: true,
        estimatedImpact: 8,
        timeToImplement: 'immediate',
        basedOnPatterns: [pattern.id],
        tags: ['scheduling', 'optimization', pattern.type],
        createdAt: now
      });
    }

    // Low energy management
    if (pattern.lowTimes.length > 0) {
      recommendations.push({
        id: `rec_lowenergy_${pattern.id}_${now.getTime()}`,
        title: `Manage Low ${pattern.type} Energy Periods`,
        description: `Plan lighter activities or rest during ${pattern.lowTimes.join(', ')} when your ${pattern.type} energy is naturally lower`,
        type: 'energy-management',
        priority: 'medium',
        energyTypes: [pattern.type],
        category: 'rest-recovery',
        actionable: true,
        estimatedImpact: 6,
        timeToImplement: 'immediate',
        basedOnPatterns: [pattern.id],
        tags: ['energy-management', 'rest', pattern.type],
        createdAt: now
      });
    }

    return recommendations;
  }

  /**
   * Group patterns by energy type
   */
  private groupPatternsByEnergyType(patterns: EnergyPattern[]): Record<EnergyType, EnergyPattern[]> {
    const groups: Record<EnergyType, EnergyPattern[]> = {
      physical: [],
      mental: [],
      emotional: [],
      creative: []
    };

    patterns.forEach(pattern => {
      groups[pattern.type].push(pattern);
    });

    return groups;
  }

  /**
   * Calculate overall confidence in analysis
   */
  private calculateOverallConfidence(patterns: EnergyPattern[]): number {
    if (patterns.length === 0) return 0;
    
    const avgConfidence = patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length;
    const dataRichness = Math.min(1, this.readings.length / 50); // More data = higher confidence
    
    return Math.round((avgConfidence * 0.7 + dataRichness * 0.3) * 100) / 100;
  }

  /**
   * Get data range for analysis
   */
  private getDataRange() {
    const timestamps = this.readings.map(r => new Date(r.timestamp));
    const startDate = new Date(Math.min(...timestamps.map(d => d.getTime())));
    const endDate = new Date(Math.max(...timestamps.map(d => d.getTime())));
    
    return {
      startDate,
      endDate,
      totalReadings: this.readings.length
    };
  }

  /**
   * Create empty analysis when insufficient data
   */
  private createEmptyAnalysis(analysisId: string, now: Date): PatternAnalysis {
    return {
      analysisId,
      analysisDate: now,
      dataRange: {
        startDate: now,
        endDate: now,
        totalReadings: this.readings.length
      },
      patterns: [],
      recommendations: [],
      insights: [{
        id: `insight_insufficient_data_${now.getTime()}`,
        type: 'opportunity',
        title: 'Insufficient Data for Pattern Detection',
        description: `We need at least ${this.minDataPoints} energy readings to detect meaningful patterns. You currently have ${this.readings.length} readings.`,
        significance: 'high',
        data: { currentReadings: this.readings.length, requiredReadings: this.minDataPoints }
      }],
      confidence: 0,
      nextAnalysisDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    };
  }
}
