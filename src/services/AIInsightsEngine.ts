import { EnergyLevel, EnergyInsight, EnergyPattern, EnergyPrediction, EnergyType } from '../types/energy';
import { CreativeConstraint } from './CreativeConstraintEngine';

export interface PersonalizedConstraint extends CreativeConstraint {
  personalizedReason: string;
  adaptedDifficulty: 'easy' | 'medium' | 'hard';
  estimatedEnergyImpact: number;
  aiConfidence: number;
}

export interface SmartRecommendation {
  id: string;
  type: 'activity' | 'timing' | 'break' | 'creative' | 'optimization';
  title: string;
  description: string;
  confidence: number;
  energyImpact: 'boost' | 'maintain' | 'restore';
  icon: string;
  actionable: boolean;
  timeRelevant?: boolean;
  estimatedMinutes?: number;
}

export interface AIEnergyPrediction {
  predictedEnergy: number;
  confidence: number;
  factors: string[];
  recommendation: string;
  timeframe: string;
  accuracy: number;
}

export class AIInsightsEngine {
  private static energyHistory: EnergyLevel[] = [];

  // Initialize with historical data
  static initialize(energyData: EnergyLevel[]) {
    this.energyHistory = [...energyData];
  }

  // ADVANCED AI FEATURE: Smart Energy Prediction
  static predictNextEnergyLevel(timeframe: 'next-hour' | 'next-day' | 'next-week' = 'next-hour'): AIEnergyPrediction {
    const data = this.energyHistory;
    if (data.length < 3) {
      return {
        predictedEnergy: 75,
        confidence: 0.3,
        factors: ['Insufficient data - need more energy logs'],
        recommendation: 'Continue logging your energy to unlock AI predictions!',
        timeframe,
        accuracy: 30
      };
    }

    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();
    
    // Advanced pattern matching
    const similarContextData = data.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      const hourDiff = Math.abs(entryDate.getHours() - currentHour);
      const dayMatch = entryDate.getDay() === currentDay;
      
      return timeframe === 'next-hour' ? hourDiff <= 1 :
             timeframe === 'next-day' ? dayMatch :
             true; // next-week uses all data
    });

    // Machine learning-inspired prediction
    let prediction = this.calculateWeightedAverage(similarContextData);
    const factors: string[] = [];
    let confidence = 0.5;

    // Factor 1: Recent trend analysis
    const recentTrend = this.calculateTrendStrength(data.slice(-7));
    prediction += recentTrend * 10;
    factors.push(recentTrend > 0 ? '📈 Recent upward energy trend detected' : '📉 Recent downward trend identified');

    // Factor 2: Circadian rhythm patterns
    const circadianAdjustment = this.getCircadianAdjustment(currentHour);
    prediction += circadianAdjustment;
    if (Math.abs(circadianAdjustment) > 5) {
      factors.push(`🕐 Circadian rhythm ${circadianAdjustment > 0 ? 'boost' : 'dip'} expected at this time`);
    }

    // Factor 3: Weekly pattern recognition
    const weeklyPattern = this.getWeeklyPattern(currentDay);
    prediction += weeklyPattern;
    if (Math.abs(weeklyPattern) > 3) {
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][currentDay];
      factors.push(`📅 ${dayName} typically shows ${weeklyPattern > 0 ? 'higher' : 'lower'} energy levels`);
    }

    // Factor 4: Historical accuracy boost
    if (similarContextData.length >= 5) {
      confidence += 0.3;
      factors.push(`🎯 Based on ${similarContextData.length} similar time periods`);
    }

    // Bounds checking and final adjustments
    prediction = Math.max(10, Math.min(100, Math.round(prediction)));
    confidence = Math.min(0.95, confidence + (data.length * 0.01));

    const recommendation = this.generateSmartRecommendation(prediction);

    return {
      predictedEnergy: prediction,
      confidence,
      factors,
      recommendation,
      timeframe,
      accuracy: Math.round(confidence * 100)
    };
  }

  // ADVANCED AI FEATURE: Personalized Creative Constraints
  static generatePersonalizedConstraints(currentEnergy: number): PersonalizedConstraint[] {
    const baseConstraints: CreativeConstraint[] = [
      {
        id: 'ai-color-harmony',
        title: 'Intelligent Color Palette',
        description: 'Create using colors that match your current energy vibe',
        difficulty: 'easy',
        duration: 15,
        type: 'visual',
        energyLevel: 'medium',
        tags: ['ai-generated', 'color', 'mood'],
        dateGenerated: new Date()
      },
      {
        id: 'ai-micro-story',
        title: 'Energy-Driven Narrative',
        description: 'Write a story that reflects your current emotional state',
        difficulty: 'medium',
        duration: 12,
        type: 'writing',
        energyLevel: 'low',
        tags: ['ai-generated', 'narrative', 'emotions'],
        dateGenerated: new Date()
      },
      {
        id: 'ai-adaptive-design',
        title: 'Mood-Responsive Design',
        description: 'Design something that adapts to different energy levels',
        difficulty: 'hard',
        duration: 25,
        type: 'digital',
        energyLevel: 'high',
        tags: ['ai-generated', 'adaptive', 'design'],
        dateGenerated: new Date()
      },
      {
        id: 'ai-sound-energy',
        title: 'Sonic Energy Expression',
        description: 'Create sounds or music that represent your energy flow',
        difficulty: 'medium',
        duration: 20,
        type: 'music',
        energyLevel: 'medium',
        tags: ['ai-generated', 'sound', 'energy'],
        dateGenerated: new Date()
      }
    ];

    return baseConstraints.map(constraint => {
      const aiPersonalization = this.personalizeConstraint(constraint, currentEnergy);
      return {
        ...constraint,
        ...aiPersonalization
      };
    });
  }

  // ADVANCED AI FEATURE: Smart Recommendations Engine
  static generateSmartRecommendations(currentEnergy: number): SmartRecommendation[] {
    const recommendations: SmartRecommendation[] = [];
    const now = new Date();
    const currentHour = now.getHours();
    
    // AI-driven time-based recommendations
    if (currentHour >= 6 && currentHour <= 10 && currentEnergy >= 70) {
      recommendations.push({
        id: 'ai-morning-power',
        type: 'timing',
        title: 'AI-Detected Power Hour',
        description: 'Your morning energy is peak! Perfect for your most challenging creative work.',
        confidence: 0.9,
        energyImpact: 'boost',
        icon: '🚀',
        actionable: true,
        timeRelevant: true,
        estimatedMinutes: 45
      });
    }

    // Energy-adaptive activity suggestions
    if (currentEnergy >= 85) {
      recommendations.push({
        id: 'ai-high-energy',
        type: 'creative',
        title: 'High-Energy Creative Sprint',
        description: 'Your energy is exceptional! Try complex problem-solving or learning new skills.',
        confidence: 0.85,
        energyImpact: 'maintain',
        icon: '⚡',
        actionable: true,
        estimatedMinutes: 60
      });
    } else if (currentEnergy >= 60) {
      recommendations.push({
        id: 'ai-balanced-work',
        type: 'activity',
        title: 'Balanced Creative Flow',
        description: 'Good energy for focused creative work with regular breaks.',
        confidence: 0.8,
        energyImpact: 'maintain',
        icon: '🎯',
        actionable: true,
        estimatedMinutes: 30
      });
    } else if (currentEnergy >= 30) {
      recommendations.push({
        id: 'ai-gentle-creative',
        type: 'creative',
        title: 'Gentle Creative Activities',
        description: 'Perfect energy for organizing, sketching, or light creative tasks.',
        confidence: 0.85,
        energyImpact: 'restore',
        icon: '🌸',
        actionable: true,
        estimatedMinutes: 20
      });
    } else {
      recommendations.push({
        id: 'ai-restore-energy',
        type: 'break',
        title: 'Energy Restoration Time',
        description: 'Take a mindful break, hydrate, or do gentle stretching to recharge.',
        confidence: 0.9,
        energyImpact: 'restore',
        icon: '🧘‍♀️',
        actionable: true,
        estimatedMinutes: 15
      });
    }

    // AI-driven optimization tips
    const patterns = this.detectPatterns(this.energyHistory);
    if (patterns.length > 0) {
      const bestPattern = patterns.reduce((best, current) => 
        current.confidence > best.confidence ? current : best
      );

      recommendations.push({
        id: 'ai-pattern-optimization',
        type: 'optimization',
        title: 'AI-Discovered Energy Pattern',
        description: `I've found your energy peaks during ${bestPattern.type} periods. Schedule important work then!`,
        confidence: bestPattern.confidence,
        energyImpact: 'boost',
        icon: '📊',
        actionable: true
      });
    }

    return recommendations.slice(0, 3); // Return top 3 AI recommendations
  }

  // Helper methods for AI calculations
  private static calculateWeightedAverage(data: EnergyLevel[]): number {
    if (data.length === 0) return 75;
    
    // Weight recent entries more heavily
    let totalWeight = 0;
    let weightedSum = 0;
    
    data.forEach((entry, index) => {
      const weight = Math.pow(1.1, index); // More recent = higher weight
      weightedSum += entry.overall * weight;
      totalWeight += weight;
    });
    
    return weightedSum / totalWeight;
  }

  private static calculateTrendStrength(data: EnergyLevel[]): number {
    if (data.length < 3) return 0;
    
    let trendSum = 0;
    for (let i = 1; i < data.length; i++) {
      trendSum += data[i].overall - data[i - 1].overall;
    }
    
    return trendSum / (data.length - 1) / 100; // Normalize
  }

  private static getCircadianAdjustment(hour: number): number {
    // Based on natural circadian rhythms
    const circadianPattern = [
      -15, -20, -25, -20, -15, -10,  // 0-5: Night/early morning dip
      5, 15, 20, 15, 10, 5,          // 6-11: Morning boost
      0, -5, -15, -10, -5, 0,        // 12-17: Afternoon dip and recovery
      5, 10, 5, 0, -5, -10           // 18-23: Evening decline
    ];
    return circadianPattern[hour] || 0;
  }

  private static getWeeklyPattern(dayOfWeek: number): number {
    // General weekly energy patterns
    const weeklyPattern = [
      -5,  // Sunday: Lower energy
      5,   // Monday: Monday motivation
      10,  // Tuesday: Peak productivity
      8,   // Wednesday: Still strong
      5,   // Thursday: Slight decline
      -2,  // Friday: Weekend anticipation
      -8   // Saturday: Recovery day
    ];
    return weeklyPattern[dayOfWeek] || 0;
  }

  private static personalizeConstraint(constraint: CreativeConstraint, currentEnergy: number): {
    personalizedReason: string;
    adaptedDifficulty: 'easy' | 'medium' | 'hard';
    estimatedEnergyImpact: number;
    aiConfidence: number;
  } {
    let adaptedDifficulty = constraint.difficulty;
    let personalizedReason = '';
    let estimatedEnergyImpact = 5;
    let aiConfidence = 0.7;

    // AI-driven difficulty adaptation
    if (currentEnergy >= 80) {
      adaptedDifficulty = constraint.difficulty === 'easy' ? 'medium' : 
                         constraint.difficulty === 'medium' ? 'hard' : 'hard';
      personalizedReason = '🤖 AI boosted difficulty - your energy can handle the challenge!';
      estimatedEnergyImpact = 15;
      aiConfidence = 0.9;
    } else if (currentEnergy <= 40) {
      adaptedDifficulty = constraint.difficulty === 'hard' ? 'medium' : 
                         constraint.difficulty === 'medium' ? 'easy' : 'easy';
      personalizedReason = '🤖 AI simplified for gentle creative flow at your energy level.';
      estimatedEnergyImpact = -10;
      aiConfidence = 0.85;
    } else {
      personalizedReason = '🤖 AI determined this is perfectly matched to your current energy!';
      aiConfidence = 0.8;
    }

    return {
      personalizedReason,
      adaptedDifficulty,
      estimatedEnergyImpact,
      aiConfidence
    };
  }

  private static generateSmartRecommendation(predictedEnergy: number): string {
    if (predictedEnergy >= 90) {
      return '🚀 Exceptional energy predicted! Perfect for ambitious projects or learning new skills.';
    } else if (predictedEnergy >= 75) {
      return '⚡ High energy expected! Ideal for challenging creative work and problem-solving.';
    } else if (predictedEnergy >= 60) {
      return '🎯 Good energy levels predicted. Great for focused work and creative constraints.';
    } else if (predictedEnergy >= 45) {
      return '🌸 Moderate energy expected. Perfect for organizing, light creative tasks, or planning.';
    } else if (predictedEnergy >= 30) {
      return '🧘‍♀️ Lower energy predicted. Time for gentle activities, reflection, or restoration.';
    } else {
      return '💤 Very low energy expected. Prioritize rest, hydration, and self-care.';
    }
  }
  // Generate AI insights from energy data
  static generateInsights(data: EnergyLevel[]): EnergyInsight[] {
    const insights: EnergyInsight[] = [];
    
    if (data.length < 7) {
      return []; // Need at least a week of data for meaningful insights
    }

    // Pattern detection
    const patterns = this.detectPatterns(data);
    patterns.forEach(pattern => {
      insights.push(this.createInsightFromPattern(pattern));
    });

    // Anomaly detection
    const anomalies = this.detectAnomalies(data);
    anomalies.forEach(anomaly => {
      insights.push(anomaly);
    });

    // Recommendations
    const recommendations = this.generateRecommendations(data);
    recommendations.forEach(rec => {
      insights.push(rec);
    });

    // Achievements
    const achievements = this.detectAchievements(data);
    achievements.forEach(achievement => {
      insights.push(achievement);
    });

    return insights.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Detect energy patterns
  private static detectPatterns(data: EnergyLevel[]): EnergyPattern[] {
    const patterns: EnergyPattern[] = [];
    
    // Weekly pattern detection
    const weeklyPattern = this.analyzeWeeklyPattern(data);
    if (weeklyPattern) patterns.push(weeklyPattern);
    
    // Daily pattern detection
    const dailyPattern = this.analyzeDailyPattern(data);
    if (dailyPattern) patterns.push(dailyPattern);
    
    return patterns;
  }

  private static analyzeWeeklyPattern(data: EnergyLevel[]): EnergyPattern | null {
    const dayOfWeekData: { [key: number]: number[] } = {};
    
    data.forEach(entry => {
      const dayOfWeek = entry.timestamp.getDay();
      if (!dayOfWeekData[dayOfWeek]) {
        dayOfWeekData[dayOfWeek] = [];
      }
      dayOfWeekData[dayOfWeek].push(entry.overall);
    });

    const weeklyAverages = Object.keys(dayOfWeekData).map(day => {
      const values = dayOfWeekData[parseInt(day)];
      return values.reduce((sum, val) => sum + val, 0) / values.length;
    });

    // Check if there's a significant pattern
    const variance = this.calculateVariance(weeklyAverages);
    if (variance > 100) { // Significant weekly variation
      return {
        type: 'weekly',
        pattern: weeklyAverages,
        confidence: Math.min(variance / 200, 1),
        trend: this.determineTrend(weeklyAverages)
      };
    }

    return null;
  }

  private static analyzeDailyPattern(data: EnergyLevel[]): EnergyPattern | null {
    const hourlyData: { [key: number]: number[] } = {};
    
    data.forEach(entry => {
      const hour = entry.timestamp.getHours();
      if (!hourlyData[hour]) {
        hourlyData[hour] = [];
      }
      hourlyData[hour].push(entry.overall);
    });

    const hourlyAverages = Object.keys(hourlyData).map(hour => {
      const values = hourlyData[parseInt(hour)];
      return values.reduce((sum, val) => sum + val, 0) / values.length;
    });

    if (hourlyAverages.length > 3) {
      return {
        type: 'daily',
        pattern: hourlyAverages,
        confidence: 0.8,
        trend: this.determineTrend(hourlyAverages)
      };
    }

    return null;
  }

  // Detect anomalies in energy data
  private static detectAnomalies(data: EnergyLevel[]): EnergyInsight[] {
    const insights: EnergyInsight[] = [];
    const recentData = data.slice(-14); // Last 2 weeks
    
    if (recentData.length < 7) return insights;

    const overallAverage = recentData.reduce((sum, entry) => sum + entry.overall, 0) / recentData.length;
    const threshold = 25; // 25 points deviation

    recentData.forEach(entry => {
      if (Math.abs(entry.overall - overallAverage) > threshold) {
        insights.push({
          id: `anomaly-${entry.timestamp.getTime()}`,
          type: 'anomaly',
          title: entry.overall > overallAverage ? 'Energy Spike Detected' : 'Energy Dip Detected',
          description: `Your energy was ${entry.overall > overallAverage ? 'significantly higher' : 'significantly lower'} than usual (${Math.round(entry.overall)}% vs ${Math.round(overallAverage)}% average)`,
          timestamp: entry.timestamp,
          importance: Math.abs(entry.overall - overallAverage) > 35 ? 'high' : 'medium',
          data: { deviation: entry.overall - overallAverage, average: overallAverage }
        });
      }
    });

    return insights;
  }

  // Generate personalized recommendations
  private static generateRecommendations(data: EnergyLevel[]): EnergyInsight[] {
    const recommendations: EnergyInsight[] = [];
    const recentData = data.slice(-7); // Last week
    
    if (recentData.length < 3) return recommendations;

    // Analyze energy types
    const energyAverages = {
      physical: recentData.reduce((sum, entry) => sum + entry.physical, 0) / recentData.length,
      mental: recentData.reduce((sum, entry) => sum + entry.mental, 0) / recentData.length,
      emotional: recentData.reduce((sum, entry) => sum + entry.emotional, 0) / recentData.length,
      creative: recentData.reduce((sum, entry) => sum + entry.creative, 0) / recentData.length
    };

    // Find lowest energy type
    const lowestType = Object.keys(energyAverages).reduce((a, b) => 
      energyAverages[a as EnergyType] < energyAverages[b as EnergyType] ? a : b
    ) as EnergyType;

    const recommendations_map = {
      physical: [
        'Consider taking short breaks for light exercise or stretching',
        'Try a 10-minute walk to boost your physical energy',
        'Ensure you\'re getting adequate sleep and hydration'
      ],
      mental: [
        'Take breaks between mentally demanding tasks',
        'Try the Pomodoro technique for better focus',
        'Consider meditation or mindfulness exercises'
      ],
      emotional: [
        'Connect with friends or loved ones',
        'Practice gratitude or journaling',
        'Consider activities that bring you joy'
      ],
      creative: [
        'Change your environment or workspace',
        'Try a new creative activity or hobby',
        'Take inspiration from art, music, or nature'
      ]
    };

    if (energyAverages[lowestType] < 60) {
      const recommendationText = recommendations_map[lowestType][Math.floor(Math.random() * recommendations_map[lowestType].length)];
      
      recommendations.push({
        id: `rec-${lowestType}-${Date.now()}`,
        type: 'recommendation',
        title: `Boost Your ${lowestType.charAt(0).toUpperCase() + lowestType.slice(1)} Energy`,
        description: recommendationText,
        timestamp: new Date(),
        importance: energyAverages[lowestType] < 40 ? 'high' : 'medium',
        data: { energyType: lowestType, currentLevel: energyAverages[lowestType] }
      });
    }

    return recommendations;
  }

  // Detect achievements
  private static detectAchievements(data: EnergyLevel[]): EnergyInsight[] {
    const achievements: EnergyInsight[] = [];
    
    // Check for consistency streaks
    const consistentDays = this.calculateConsistentDays(data);
    if (consistentDays >= 7) {
      achievements.push({
        id: `achievement-consistency-${Date.now()}`,
        type: 'achievement',
        title: `${consistentDays} Day Consistency Streak!`,
        description: `You've maintained consistent energy tracking for ${consistentDays} days. Great job!`,
        timestamp: new Date(),
        importance: 'medium',
        data: { streak: consistentDays }
      });
    }

    // Check for high energy weeks
    const recentWeek = data.slice(-7);
    if (recentWeek.length >= 7) {
      const weekAverage = recentWeek.reduce((sum, entry) => sum + entry.overall, 0) / recentWeek.length;
      if (weekAverage >= 80) {
        achievements.push({
          id: `achievement-high-energy-${Date.now()}`,
          type: 'achievement',
          title: 'High Energy Week!',
          description: `Your average energy this week was ${Math.round(weekAverage)}%. You're on fire! 🔥`,
          timestamp: new Date(),
          importance: 'high',
          data: { weekAverage }
        });
      }
    }

    return achievements;
  }

  // Generate energy predictions
  static generatePredictions(data: EnergyLevel[]): EnergyPrediction[] {
    if (data.length < 14) return []; // Need at least 2 weeks of data

    const predictions: EnergyPrediction[] = [];
    const recent = data.slice(-14);
    
    // Simple trend-based prediction for next 3 days
    for (let i = 1; i <= 3; i++) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + i);
      
      const predicted = this.predictEnergyForDate(recent, futureDate);
      
      predictions.push({
        timestamp: futureDate,
        predictedEnergy: predicted,
        confidence: Math.max(0.3, 0.9 - (i * 0.2)), // Confidence decreases with distance
        factors: this.identifyPredictionFactors(recent, futureDate)
      });
    }

    return predictions;
  }

  // Helper methods
  private static calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private static determineTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' | 'cyclical' {
    const first = values.slice(0, Math.floor(values.length / 2));
    const last = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = first.reduce((sum, val) => sum + val, 0) / first.length;
    const lastAvg = last.reduce((sum, val) => sum + val, 0) / last.length;
    
    const difference = lastAvg - firstAvg;
    
    if (Math.abs(difference) < 5) return 'stable';
    if (difference > 0) return 'increasing';
    return 'decreasing';
  }

  private static calculateConsistentDays(data: EnergyLevel[]): number {
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      
      const hasEntry = data.some(entry => 
        entry.timestamp.toDateString() === checkDate.toDateString()
      );
      
      if (hasEntry) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  private static predictEnergyForDate(historical: EnergyLevel[], targetDate: Date): EnergyLevel {
    // Simple prediction based on day of week patterns
    const dayOfWeek = targetDate.getDay();
    
    const similarEntries = historical.filter(entry => 
      entry.timestamp.getDay() === dayOfWeek
    );
    
    if (similarEntries.length === 0) {
      // Fallback to overall average
      const avg = historical.reduce((sum, entry) => ({
        physical: sum.physical + entry.physical,
        mental: sum.mental + entry.mental,
        emotional: sum.emotional + entry.emotional,
        creative: sum.creative + entry.creative,
        overall: sum.overall + entry.overall
      }), { physical: 0, mental: 0, emotional: 0, creative: 0, overall: 0 });
      
      const count = historical.length;
      return {
        timestamp: targetDate,
        physical: avg.physical / count,
        mental: avg.mental / count,
        emotional: avg.emotional / count,
        creative: avg.creative / count,
        overall: avg.overall / count
      };
    }
    
    // Average similar entries
    const prediction = similarEntries.reduce((sum, entry) => ({
      physical: sum.physical + entry.physical,
      mental: sum.mental + entry.mental,
      emotional: sum.emotional + entry.emotional,
      creative: sum.creative + entry.creative,
      overall: sum.overall + entry.overall
    }), { physical: 0, mental: 0, emotional: 0, creative: 0, overall: 0 });
    
    const count = similarEntries.length;
    return {
      timestamp: targetDate,
      physical: prediction.physical / count,
      mental: prediction.mental / count,
      emotional: prediction.emotional / count,
      creative: prediction.creative / count,
      overall: prediction.overall / count
    };
  }

  private static identifyPredictionFactors(data: EnergyLevel[], targetDate: Date): string[] {
    const factors: string[] = [];
    
    const dayOfWeek = targetDate.getDay();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    factors.push(`Day of week: ${dayNames[dayOfWeek]}`);
    
    const recentTrend = this.determineTrend(data.slice(-7).map(d => d.overall));
    factors.push(`Recent trend: ${recentTrend}`);
    
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      factors.push('Weekend patterns applied');
    } else {
      factors.push('Weekday patterns applied');
    }
    
    return factors;
  }

  private static createInsightFromPattern(pattern: EnergyPattern): EnergyInsight {
    const patternDescriptions = {
      weekly: 'Your energy follows a weekly pattern',
      daily: 'Your energy has consistent daily rhythms',
      monthly: 'Your energy varies by month',
      seasonal: 'Your energy follows seasonal changes'
    };

    const trendDescriptions = {
      increasing: 'and is trending upward',
      decreasing: 'and is trending downward',
      stable: 'and remains relatively stable',
      cyclical: 'with cyclical variations'
    };

    return {
      id: `pattern-${pattern.type}-${Date.now()}`,
      type: 'pattern',
      title: `${pattern.type.charAt(0).toUpperCase() + pattern.type.slice(1)} Pattern Detected`,
      description: `${patternDescriptions[pattern.type]} ${trendDescriptions[pattern.trend]}.`,
      timestamp: new Date(),
      importance: pattern.confidence > 0.7 ? 'high' : 'medium',
      data: pattern
    };
  }
}
