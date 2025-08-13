import { openAIService } from './OpenAIService';
import { AIAssistantEngine } from './AIAssistantEngine';
import { EnergyLevel } from '../types/energy';

export interface ProactiveInsight {
  id: string;
  type: 'morning_greeting' | 'energy_trend' | 'optimization_tip' | 'pattern_alert' | 'achievement';
  title: string;
  content: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: Date;
  actionable: boolean;
  suggestedActions?: string[];
  energyData?: {
    current: EnergyLevel;
    trend: string;
    confidence: number;
  };
}

export class ProactiveInsightsEngine {
  private static lastInsightGeneration: Date | null = null;
  private static dailyInsights: ProactiveInsight[] = [];
  
  // Generate smart daily insights when app opens
  static async generateDailyInsights(energyData: EnergyLevel[]): Promise<ProactiveInsight[]> {
    const now = new Date();
    const lastGeneration = this.lastInsightGeneration;
    
    // Only generate new insights if it's a new day or first time
    if (lastGeneration && this.isSameDay(lastGeneration, now)) {
      return this.dailyInsights;
    }
    
    const insights: ProactiveInsight[] = [];
    
    try {
      // 1. Morning greeting with personalized energy forecast
      if (this.isMorningTime(now)) {
        try {
          const morningInsight = await this.generateMorningInsight(energyData);
          if (morningInsight) insights.push(morningInsight);
        } catch (error) {
          console.error('Error generating morning insight:', error);
        }
      }
      
      // 2. Weekly energy trend analysis
      try {
        const trendInsight = await this.generateTrendInsight(energyData);
        if (trendInsight) insights.push(trendInsight);
      } catch (error) {
        console.error('Error generating trend insight:', error);
      }
      
      // 3. Optimization recommendations
      try {
        const optimizationInsight = await this.generateOptimizationInsight(energyData);
        if (optimizationInsight) insights.push(optimizationInsight);
      } catch (error) {
        console.error('Error generating optimization insight:', error);
      }
      
      // 4. Pattern-based predictions
      try {
        const patternInsight = await this.generatePatternInsight(energyData);
        if (patternInsight) insights.push(patternInsight);
      } catch (error) {
        console.error('Error generating pattern insight:', error);
      }
      
      // 5. Achievement recognition
      try {
        const achievementInsight = await this.generateAchievementInsight(energyData);
        if (achievementInsight) insights.push(achievementInsight);
      } catch (error) {
        console.error('Error generating achievement insight:', error);
      }
      
      this.dailyInsights = insights;
      this.lastInsightGeneration = now;
      
    } catch (error) {
      console.error('Error generating proactive insights:', error);
      // Return fallback insights
      return this.getFallbackInsights(energyData);
    }
    
    return insights;
  }
  
  // Generate personalized morning greeting
  private static async generateMorningInsight(energyData: EnergyLevel[]): Promise<ProactiveInsight | null> {
    if (energyData.length === 0) return null;
    
    const recentData = energyData.slice(-7); // Last week
    const yesterday = energyData[energyData.length - 1];
    
    const context = {
      timeOfDay: 'morning',
      yesterdayEnergy: yesterday,
      weeklyPattern: this.analyzeWeeklyPattern(recentData),
      dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' })
    };
    
    if (openAIService.isReady()) {
      try {
        const prompt = `Generate a personalized morning greeting for an energy tracking app user. 
        Context: ${JSON.stringify(context)}
        
        Create a friendly, encouraging message that:
        1. Greets them appropriately for the day/time
        2. Gives insights about their energy patterns
        3. Suggests optimal activities for today
        4. Keeps it concise (1-2 sentences)
        
        Examples: 
        "Good morning! Your creative energy typically peaks around 10 AM on ${context.dayOfWeek}s - perfect timing for your most important work."
        "Morning! Your energy has been trending upward this week (+12%) - today looks great for tackling challenging projects."`;
        
        const response = await openAIService.generateResponse(prompt, context);
        
        return {
          id: `morning-${Date.now()}`,
          type: 'morning_greeting',
          title: 'Good Morning!',
          content: response,
          priority: 'high',
          timestamp: new Date(),
          actionable: true,
          suggestedActions: ['View energy dashboard', 'Plan your day', 'Set energy goals', 'Start energy tracking'],
          energyData: {
            current: yesterday,
            trend: context.weeklyPattern.trend,
            confidence: 0.8
          }
        };
        
      } catch (error) {
        console.error('Error generating morning insight:', error);
      }
    }
    
    // Fallback morning insight
    return {
      id: `morning-fallback-${Date.now()}`,
      type: 'morning_greeting',
      title: 'Good Morning!',
      content: `Ready to optimize your energy today? Your ${this.getHighestEnergyType(yesterday)} energy was strongest yesterday.`,
      priority: 'medium',
      timestamp: new Date(),
      actionable: true,
      suggestedActions: ['Check energy levels', 'Plan your day'],
      energyData: {
        current: yesterday,
        trend: 'stable',
        confidence: 0.6
      }
    };
  }
  
  // Generate weekly trend insights
  private static async generateTrendInsight(energyData: EnergyLevel[]): Promise<ProactiveInsight | null> {
    if (energyData.length < 7) return null;
    
    const recentWeek = energyData.slice(-7);
    const previousWeek = energyData.slice(-14, -7);
    
    const trends = this.calculateEnergyTrends(recentWeek, previousWeek);
    
    if (openAIService.isReady()) {
      try {
        const prompt = `Analyze this week's energy trends and provide insights:
        ${JSON.stringify(trends)}
        
        Generate a brief insight (1-2 sentences) highlighting:
        1. The most significant trend (positive or concerning)
        2. What it means for the user
        3. Keep it encouraging and actionable`;
        
        const response = await openAIService.generateResponse(prompt, trends);
        
        return {
          id: `trend-${Date.now()}`,
          type: 'energy_trend',
          title: 'Weekly Energy Trend',
          content: response,
          priority: 'medium',
          timestamp: new Date(),
          actionable: true,
          suggestedActions: ['View detailed analytics', 'Adjust daily routine', 'Track results']
        };
        
      } catch (error) {
        console.error('Error generating trend insight:', error);
      }
    }
    
    // Fallback trend insight
    const strongestTrend = this.getStrongestTrend(trends);
    return {
      id: `trend-fallback-${Date.now()}`,
      type: 'energy_trend',
      title: 'Weekly Energy Trend',
      content: `Your ${strongestTrend.type} energy has ${strongestTrend.direction} ${Math.abs(strongestTrend.change)}% this week!`,
      priority: 'medium',
      timestamp: new Date(),
      actionable: true,
      suggestedActions: ['View analytics dashboard']
    };
  }
  
  // Generate optimization recommendations
  private static async generateOptimizationInsight(energyData: EnergyLevel[]): Promise<ProactiveInsight | null> {
    if (energyData.length < 5) return null;
    
    const patterns = AIAssistantEngine.getDiscoveredPatterns();
    const recentData = energyData.slice(-5);
    
    const optimizationContext = {
      patterns: patterns.slice(0, 3), // Top 3 patterns
      recentEnergyLevels: recentData,
      timeOfDay: new Date().getHours(),
      dayOfWeek: new Date().getDay()
    };
    
    if (openAIService.isReady()) {
      try {
        const prompt = `Based on the user's energy patterns, suggest one specific optimization for today:
        ${JSON.stringify(optimizationContext)}
        
        Provide a practical, actionable suggestion (1 sentence) for optimizing energy today.
        Focus on timing, activities, or energy management.`;
        
        const response = await openAIService.generateResponse(prompt, optimizationContext);
        
        return {
          id: `optimization-${Date.now()}`,
          type: 'optimization_tip',
          title: 'Energy Optimization Tip',
          content: response,
          priority: 'high',
          timestamp: new Date(),
          actionable: true,
          suggestedActions: ['Apply suggestion', 'Track results', 'View energy dashboard']
        };
        
      } catch (error) {
        console.error('Error generating optimization insight:', error);
      }
    }
    
    // Fallback optimization
    const currentHour = new Date().getHours();
    let suggestion = "Track your energy levels regularly to identify your optimal work times.";
    
    if (currentHour >= 9 && currentHour <= 11) {
      suggestion = "Morning hours are typically great for focused, creative work - make the most of this time!";
    } else if (currentHour >= 14 && currentHour <= 16) {
      suggestion = "Afternoon energy dips are normal - consider a short break or light activity.";
    }
    
    return {
      id: `optimization-fallback-${Date.now()}`,
      type: 'optimization_tip',
      title: 'Energy Optimization Tip',
      content: suggestion,
      priority: 'medium',
      timestamp: new Date(),
      actionable: true,
      suggestedActions: ['Apply suggestion', 'Track results', 'Plan your day']
    };
  }
  
  // Generate pattern-based insights
  private static async generatePatternInsight(energyData: EnergyLevel[]): Promise<ProactiveInsight | null> {
    const patterns = AIAssistantEngine.getDiscoveredPatterns();
    if (patterns.length === 0) return null;
    
    const highConfidencePattern = patterns.find(p => p.confidence > 0.8);
    if (!highConfidencePattern) return null;
    
    return {
      id: `pattern-${Date.now()}`,
      type: 'pattern_alert',
      title: 'Pattern Detected',
      content: `Pattern insight: ${highConfidencePattern.title}. ${highConfidencePattern.description}`,
      priority: highConfidencePattern.impact === 'high' ? 'high' : 'medium',
      timestamp: new Date(),
      actionable: highConfidencePattern.actionable,
      suggestedActions: highConfidencePattern.suggestions?.slice(0, 3) || ['Apply suggestion', 'View detailed analytics', 'Track results']
    };
  }
  
  // Generate achievement recognition
  private static async generateAchievementInsight(energyData: EnergyLevel[]): Promise<ProactiveInsight | null> {
    if (energyData.length < 7) return null;
    
    const recentWeek = energyData.slice(-7);
    const averageEnergy = recentWeek.reduce((sum, day) => sum + day.overall, 0) / recentWeek.length;
    
    // Check for achievements
    if (averageEnergy > 75) {
      return {
        id: `achievement-${Date.now()}`,
        type: 'achievement',
        title: 'Great Energy Week!',
        content: `Outstanding! Your average energy this week is ${Math.round(averageEnergy)}/100 - keep up the excellent energy management!`,
        priority: 'high',
        timestamp: new Date(),
        actionable: true,
        suggestedActions: ['View detailed analytics', 'Maintain current routine', 'Set higher goals']
      };
    }
    
    // Check for consistency
    const energyVariance = this.calculateVariance(recentWeek.map(d => d.overall));
    if (energyVariance < 200) { // Low variance = consistent
      return {
        id: `consistency-${Date.now()}`,
        type: 'achievement',
        title: 'Consistent Energy!',
        content: 'Your energy levels have been remarkably consistent this week - excellent stability!',
        priority: 'medium',
        timestamp: new Date(),
        actionable: true,
        suggestedActions: ['Maintain routine', 'Build on this stability', 'Track results']
      };
    }
    
    return null;
  }
  
  // Helper methods
  private static isSameDay(date1: Date, date2: Date): boolean {
    return date1.toDateString() === date2.toDateString();
  }
  
  private static isMorningTime(date: Date): boolean {
    const hour = date.getHours();
    return hour >= 6 && hour <= 12;
  }
  
  private static getHighestEnergyType(energy: EnergyLevel): string {
    const types = {
      physical: energy.physical,
      mental: energy.mental,
      emotional: energy.emotional,
      creative: energy.creative
    };
    
    return Object.entries(types).reduce((a, b) => types[a[0] as keyof typeof types] > types[b[0] as keyof typeof types] ? a : b)[0];
  }
  
  private static analyzeWeeklyPattern(data: EnergyLevel[]): { trend: string; strength: number } {
    if (data.length < 3) return { trend: 'insufficient_data', strength: 0 };
    
    const recent = data.slice(-3).reduce((sum, d) => sum + d.overall, 0) / 3;
    const earlier = data.slice(0, -3).reduce((sum, d) => sum + d.overall, 0) / (data.length - 3);
    
    const change = recent - earlier;
    
    if (Math.abs(change) < 5) return { trend: 'stable', strength: Math.abs(change) };
    return { trend: change > 0 ? 'improving' : 'declining', strength: Math.abs(change) };
  }
  
  private static calculateEnergyTrends(recent: EnergyLevel[], previous: EnergyLevel[]) {
    const recentAvg = {
      physical: recent.reduce((sum, d) => sum + d.physical, 0) / recent.length,
      mental: recent.reduce((sum, d) => sum + d.mental, 0) / recent.length,
      emotional: recent.reduce((sum, d) => sum + d.emotional, 0) / recent.length,
      creative: recent.reduce((sum, d) => sum + d.creative, 0) / recent.length,
    };
    
    const previousAvg = {
      physical: previous.reduce((sum, d) => sum + d.physical, 0) / previous.length,
      mental: previous.reduce((sum, d) => sum + d.mental, 0) / previous.length,
      emotional: previous.reduce((sum, d) => sum + d.emotional, 0) / previous.length,
      creative: previous.reduce((sum, d) => sum + d.creative, 0) / previous.length,
    };
    
    return {
      physical: { change: recentAvg.physical - previousAvg.physical, current: recentAvg.physical },
      mental: { change: recentAvg.mental - previousAvg.mental, current: recentAvg.mental },
      emotional: { change: recentAvg.emotional - previousAvg.emotional, current: recentAvg.emotional },
      creative: { change: recentAvg.creative - previousAvg.creative, current: recentAvg.creative },
    };
  }
  
  private static getStrongestTrend(trends: any): { type: string; change: number; direction: string } {
    const entries = Object.entries(trends).map(([type, data]: [string, any]) => ({
      type,
      change: data.change,
      direction: data.change > 0 ? 'increased' : 'decreased'
    }));
    
    return entries.reduce((strongest, current) => 
      Math.abs(current.change) > Math.abs(strongest.change) ? current : strongest
    );
  }
  
  private static calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  }
  
  private static getFallbackInsights(energyData: EnergyLevel[]): ProactiveInsight[] {
    const now = new Date();
    const insights: ProactiveInsight[] = [];
    
    if (energyData.length > 0) {
      const latest = energyData[energyData.length - 1];
      insights.push({
        id: `fallback-${Date.now()}`,
        type: 'morning_greeting',
        title: 'Welcome Back!',
        content: `Ready to track your energy today? Your last reading showed ${Math.round(latest.overall)}/100 overall energy.`,
        priority: 'medium',
        timestamp: now,
        actionable: true,
        suggestedActions: ['Log current energy', 'Review patterns'],
        energyData: {
          current: latest,
          trend: 'stable',
          confidence: 0.5
        }
      });
    }
    
    return insights;
  }
}
