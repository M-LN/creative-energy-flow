import { EnergyLevel, EnergyInsight, EnergyPattern, EnergyPrediction, EnergyType } from '../types/energy';

export class AIInsightsEngine {
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
