import { EnergyLevel } from '../types/energy';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    confidence?: number;
    sources?: string[];
    actionItems?: string[];
    patterns?: PatternInsight[];
  };
  feedback?: MessageFeedback;
}

export interface MessageFeedback {
  rating: 'helpful' | 'not-helpful' | 'very-helpful' | null;
  isFavorite: boolean;
  accuracyRating?: number; // 1-5 for predictions
  userNotes?: string;
  timestamp: Date;
}

export interface LearningAnalytics {
  totalInteractions: number;
  helpfulResponsesRatio: number;
  favoriteInsights: string[];
  predictionAccuracy: number;
  topCategories: string[];
  improvementAreas: string[];
  confidenceScore: number;
}

export interface UserPreferences {
  communicationStyle: 'detailed' | 'concise' | 'adaptive';
  preferredInsights: string[];
  goalPriorities: string[];
  expertiseLevel: 'beginner' | 'intermediate' | 'advanced';
  lastUpdated: Date;
}

export interface PatternInsight {
  id: string;
  type: 'trend' | 'correlation' | 'anomaly' | 'cycle' | 'seasonal';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  timeframe: string;
  data: {
    values: number[];
    timestamps: Date[];
    relatedMetrics?: string[];
  };
  actionable: boolean;
  suggestions?: string[];
}

export interface PersonalizedCoachingPlan {
  id: string;
  title: string;
  description: string;
  goals: CoachingGoal[];
  strategies: CoachingStrategy[];
  timeline: string;
  currentPhase: string;
  progressMetrics: ProgressMetric[];
  nextSteps: string[];
}

export interface CoachingGoal {
  id: string;
  title: string;
  description: string;
  category: 'energy-optimization' | 'pattern-improvement' | 'habit-formation' | 'burnout-prevention';
  targetMetric: string;
  currentValue: number;
  targetValue: number;
  deadline: Date;
  progress: number; // 0-100
}

export interface CoachingStrategy {
  id: string;
  title: string;
  description: string;
  type: 'behavioral' | 'environmental' | 'cognitive' | 'physiological';
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedImpact: number; // 1-10
  implementation: string[];
  tracking: string;
}

export interface ProgressMetric {
  id: string;
  name: string;
  unit: string;
  currentValue: number;
  targetValue: number;
  trend: 'improving' | 'stable' | 'declining';
  confidence: number;
}

export class AIAssistantEngine {
  private static energyData: EnergyLevel[] = [];
  private static chatHistory: ChatMessage[] = [];
  private static discoveredPatterns: PatternInsight[] = [];
  private static coachingPlan: PersonalizedCoachingPlan | null = null;
  private static userPreferences: UserPreferences = {
    communicationStyle: 'adaptive',
    preferredInsights: [],
    goalPriorities: [],
    expertiseLevel: 'beginner',
    lastUpdated: new Date()
  };
  private static learningAnalytics: LearningAnalytics = {
    totalInteractions: 0,
    helpfulResponsesRatio: 0,
    favoriteInsights: [],
    predictionAccuracy: 0,
    topCategories: [],
    improvementAreas: [],
    confidenceScore: 0.5
  };

  static initialize(data: EnergyLevel[]): void {
    this.energyData = [...data].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    this.discoverPatterns();
    this.generateCoachingPlan();
  }

  // Natural Language Processing & Chat Interface
  static async processUserMessage(message: string): Promise<ChatMessage> {
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    this.chatHistory.push(userMessage);

    // Analyze the user's intent and generate response
    const intent = this.analyzeUserIntent(message);
    const response = await this.generateResponse(intent, message);

    const assistantMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: response.content,
      timestamp: new Date(),
      metadata: {
        confidence: response.confidence,
        sources: response.sources,
        actionItems: response.actionItems,
        patterns: response.relevantPatterns,
      },
    };

    this.chatHistory.push(assistantMessage);
    return assistantMessage;
  }

  // Feedback & Learning System
  static provideFeedback(messageId: string, feedback: Partial<MessageFeedback>): void {
    const message = this.chatHistory.find(msg => msg.id === messageId);
    if (!message) return;

    message.feedback = {
      ...message.feedback,
      ...feedback,
      timestamp: new Date()
    } as MessageFeedback;

    this.updateLearningAnalytics();
    this.updateUserPreferences(feedback);
  }

  static toggleFavoriteInsight(messageId: string): void {
    const message = this.chatHistory.find(msg => msg.id === messageId);
    if (!message) return;

    if (!message.feedback) {
      message.feedback = {
        rating: null,
        isFavorite: true,
        timestamp: new Date()
      };
    } else {
      message.feedback.isFavorite = !message.feedback.isFavorite;
    }

    this.updateLearningAnalytics();
  }

  static ratePredictionAccuracy(messageId: string, accuracyRating: number): void {
    this.provideFeedback(messageId, { accuracyRating });
  }

  private static updateLearningAnalytics(): void {
    const totalMessages = this.chatHistory.filter(msg => msg.role === 'assistant').length;
    const ratedMessages = this.chatHistory.filter(msg => msg.role === 'assistant' && msg.feedback?.rating);
    const helpfulMessages = ratedMessages.filter(msg => 
      msg.feedback?.rating === 'helpful' || msg.feedback?.rating === 'very-helpful'
    );

    this.learningAnalytics.totalInteractions = totalMessages;
    this.learningAnalytics.helpfulResponsesRatio = ratedMessages.length > 0 ? 
      (helpfulMessages.length / ratedMessages.length) * 100 : 0;
    
    this.learningAnalytics.favoriteInsights = this.chatHistory
      .filter(msg => msg.feedback?.isFavorite)
      .map(msg => msg.content.slice(0, 100));

    const accuracyRatings = this.chatHistory
      .filter(msg => msg.feedback?.accuracyRating)
      .map(msg => msg.feedback!.accuracyRating!);
    
    this.learningAnalytics.predictionAccuracy = accuracyRatings.length > 0 ?
      (accuracyRatings.reduce((sum, rating) => sum + rating, 0) / accuracyRatings.length) * 20 : 0;

    // Calculate confidence score based on feedback
    const baseConfidence = 0.5;
    const feedbackBoost = this.learningAnalytics.helpfulResponsesRatio / 200; // 0-0.5
    const accuracyBoost = this.learningAnalytics.predictionAccuracy / 200; // 0-0.5
    
    this.learningAnalytics.confidenceScore = Math.min(1.0, 
      baseConfidence + feedbackBoost + accuracyBoost
    );
  }

  private static updateUserPreferences(feedback: Partial<MessageFeedback>): void {
    // Update preferences based on feedback patterns
    if (feedback.rating === 'very-helpful' || feedback.isFavorite) {
      // Learn from highly rated content
      this.userPreferences.lastUpdated = new Date();
      
      // This is where we'd implement sophisticated preference learning
      // For now, we'll update the expertise level based on interaction complexity
      if (this.learningAnalytics.totalInteractions > 20) {
        this.userPreferences.expertiseLevel = 'intermediate';
      }
      if (this.learningAnalytics.totalInteractions > 50) {
        this.userPreferences.expertiseLevel = 'advanced';
      }
    }
  }

  static getLearningAnalytics(): LearningAnalytics {
    return { ...this.learningAnalytics };
  }

  static getUserPreferences(): UserPreferences {
    return { ...this.userPreferences };
  }

  private static analyzeUserIntent(message: string): {
    type: 'question' | 'request' | 'goal-setting' | 'pattern-inquiry' | 'coaching-request';
    category: 'energy-analysis' | 'pattern-discovery' | 'prediction' | 'optimization' | 'general';
    entities: string[];
    timeframe?: string;
    energyType?: string;
  } {
    const lowerMessage = message.toLowerCase();
    
    // Intent classification
    let type: 'question' | 'request' | 'goal-setting' | 'pattern-inquiry' | 'coaching-request' = 'question';
    
    if (lowerMessage.includes('help me') || lowerMessage.includes('how can i') || lowerMessage.includes('suggest')) {
      type = 'coaching-request';
    } else if (lowerMessage.includes('pattern') || lowerMessage.includes('trend') || lowerMessage.includes('correlation')) {
      type = 'pattern-inquiry';
    } else if (lowerMessage.includes('want to') || lowerMessage.includes('goal') || lowerMessage.includes('improve')) {
      type = 'goal-setting';
    } else if (lowerMessage.includes('what') || lowerMessage.includes('when') || lowerMessage.includes('why') || lowerMessage.includes('how')) {
      type = 'question';
    } else {
      type = 'request';
    }

    // Category classification
    let category: 'energy-analysis' | 'pattern-discovery' | 'prediction' | 'optimization' | 'general' = 'general';
    
    if (lowerMessage.includes('energy') || lowerMessage.includes('level')) {
      category = 'energy-analysis';
    } else if (lowerMessage.includes('pattern') || lowerMessage.includes('correlation') || lowerMessage.includes('trend')) {
      category = 'pattern-discovery';
    } else if (lowerMessage.includes('predict') || lowerMessage.includes('forecast') || lowerMessage.includes('will be')) {
      category = 'prediction';
    } else if (lowerMessage.includes('optimize') || lowerMessage.includes('improve') || lowerMessage.includes('better')) {
      category = 'optimization';
    }

    // Extract entities
    const entities = this.extractEntities(message);
    const timeframe = this.extractTimeframe(message);
    const energyType = this.extractEnergyType(message);

    return { type, category, entities, timeframe, energyType };
  }

  private static extractEntities(message: string): string[] {
    const entities: string[] = [];
    const lowerMessage = message.toLowerCase();

    // Time-related entities
    const timeEntities = ['morning', 'afternoon', 'evening', 'night', 'today', 'yesterday', 'week', 'month', 'weekend', 'weekday'];
    timeEntities.forEach(entity => {
      if (lowerMessage.includes(entity)) entities.push(entity);
    });

    // Energy-related entities
    const energyEntities = ['physical', 'mental', 'emotional', 'creative', 'overall', 'tired', 'energetic', 'drained', 'motivated'];
    energyEntities.forEach(entity => {
      if (lowerMessage.includes(entity)) entities.push(entity);
    });

    // Activity entities
    const activityEntities = ['work', 'exercise', 'sleep', 'rest', 'creative', 'social', 'focus', 'productivity'];
    activityEntities.forEach(entity => {
      if (lowerMessage.includes(entity)) entities.push(entity);
    });

    return entities;
  }

  private static extractTimeframe(message: string): string | undefined {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('this week') || lowerMessage.includes('past week')) return 'week';
    if (lowerMessage.includes('this month') || lowerMessage.includes('past month')) return 'month';
    if (lowerMessage.includes('today')) return 'day';
    if (lowerMessage.includes('yesterday')) return 'yesterday';
    if (lowerMessage.includes('last 7 days')) return '7-days';
    if (lowerMessage.includes('last 30 days')) return '30-days';
    
    return undefined;
  }

  private static extractEnergyType(message: string): string | undefined {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('physical')) return 'physical';
    if (lowerMessage.includes('mental')) return 'mental';
    if (lowerMessage.includes('emotional')) return 'emotional';
    if (lowerMessage.includes('creative')) return 'creative';
    if (lowerMessage.includes('overall')) return 'overall';
    
    return undefined;
  }

  private static async generateResponse(intent: any, originalMessage: string): Promise<{
    content: string;
    confidence: number;
    sources: string[];
    actionItems: string[];
    relevantPatterns: PatternInsight[];
  }> {
    const response = {
      content: '',
      confidence: 0.8,
      sources: [] as string[],
      actionItems: [] as string[],
      relevantPatterns: [] as PatternInsight[],
    };

    switch (intent.category) {
      case 'energy-analysis':
        response.content = await this.generateEnergyAnalysisResponse(intent, originalMessage);
        response.sources = ['Energy data analysis', 'Historical patterns'];
        break;

      case 'pattern-discovery':
        response.content = await this.generatePatternDiscoveryResponse(intent, originalMessage);
        response.relevantPatterns = this.getRelevantPatterns(intent);
        response.sources = ['Pattern analysis', 'Correlation detection'];
        break;

      case 'prediction':
        response.content = await this.generatePredictionResponse(intent, originalMessage);
        response.sources = ['Predictive modeling', 'Trend analysis'];
        break;

      case 'optimization':
        response.content = await this.generateOptimizationResponse(intent, originalMessage);
        response.actionItems = this.generateActionItems(intent);
        response.sources = ['Optimization algorithms', 'Best practices'];
        break;

      default:
        response.content = await this.generateGeneralResponse(intent, originalMessage);
        response.sources = ['General knowledge', 'User data'];
        break;
    }

    return response;
  }

  private static async generateEnergyAnalysisResponse(intent: any, message: string): Promise<string> {
    if (!this.energyData.length) {
      return "I don't have enough energy data to analyze yet. Start logging your energy levels, and I'll be able to provide detailed insights about your patterns!";
    }

    const timeframe = intent.timeframe || 'week';
    const energyType = intent.energyType || 'overall';
    const recentData = this.getRecentData(timeframe);

    if (recentData.length === 0) {
      return `I don't have enough data for the ${timeframe} timeframe. Let me analyze your overall patterns instead.`;
    }

    const stats = this.calculateEnergyStats(recentData, energyType);
    const trend = this.calculateTrend(recentData, energyType);

    let response = `Here's your ${energyType} energy analysis for the past ${timeframe}:\n\n`;
    
    response += `📊 **Energy Statistics:**\n`;
    response += `• Average: ${stats.average}/100\n`;
    response += `• Peak: ${stats.max}/100\n`;
    response += `• Lowest: ${stats.min}/100\n`;
    response += `• Variability: ${stats.variability.toFixed(1)}\n\n`;

    response += `📈 **Trend Analysis:**\n`;
    if (trend > 5) {
      response += `✅ Your ${energyType} energy is trending upward (+${trend.toFixed(1)}%). Great progress!\n`;
    } else if (trend < -5) {
      response += `📉 Your ${energyType} energy is declining (${trend.toFixed(1)}%). Let's identify ways to reverse this trend.\n`;
    } else {
      response += `➡️ Your ${energyType} energy levels are relatively stable (${trend >= 0 ? '+' : ''}${trend.toFixed(1)}%).\n`;
    }

    // Add personalized insights
    const insights = this.getPersonalizedInsights(recentData, energyType);
    if (insights.length > 0) {
      response += `\n💡 **Key Insights:**\n`;
      insights.forEach(insight => {
        response += `• ${insight}\n`;
      });
    }

    return response;
  }

  private static async generatePatternDiscoveryResponse(intent: any, message: string): Promise<string> {
    const relevantPatterns = this.getRelevantPatterns(intent);
    
    if (relevantPatterns.length === 0) {
      return "I haven't discovered any significant patterns yet. As you log more energy data, I'll be able to identify interesting correlations and trends in your energy levels!";
    }

    let response = `🔍 **Pattern Discovery Results:**\n\n`;
    
    relevantPatterns.slice(0, 3).forEach((pattern, index) => {
      response += `${index + 1}. **${pattern.title}** (${pattern.confidence}% confidence)\n`;
      response += `   ${pattern.description}\n`;
      
      if (pattern.suggestions && pattern.suggestions.length > 0) {
        response += `   💡 Suggestion: ${pattern.suggestions[0]}\n`;
      }
      response += `\n`;
    });

    if (relevantPatterns.length > 3) {
      response += `*...and ${relevantPatterns.length - 3} more patterns discovered*\n\n`;
    }

    response += `Would you like me to dive deeper into any of these patterns or help you create an action plan based on these insights?`;

    return response;
  }

  private static async generatePredictionResponse(intent: any, message: string): Promise<string> {
    if (this.energyData.length < 7) {
      return "I need at least a week of data to make reliable predictions. Keep logging your energy levels, and I'll be able to forecast your future energy patterns!";
    }

    const energyType = intent.energyType || 'overall';
    const timeframe = intent.timeframe || 'next-day';

    // Simple prediction based on recent trends and patterns
    const prediction = this.generatePrediction(energyType, timeframe);

    let response = `🔮 **Energy Prediction for ${timeframe}:**\n\n`;
    
    response += `**${energyType.charAt(0).toUpperCase() + energyType.slice(1)} Energy Forecast:**\n`;
    response += `• Predicted Level: ${prediction.predictedLevel}/100\n`;
    response += `• Confidence: ${prediction.confidence}%\n`;
    response += `• Expected Range: ${prediction.range.min}-${prediction.range.max}/100\n\n`;

    response += `**Key Factors Influencing This Prediction:**\n`;
    prediction.factors.forEach(factor => {
      response += `• ${factor}\n`;
    });

    response += `\n**Recommendations:**\n`;
    prediction.recommendations.forEach(rec => {
      response += `• ${rec}\n`;
    });

    return response;
  }

  private static async generateOptimizationResponse(intent: any, message: string): Promise<string> {
    const optimizations = this.generateOptimizationSuggestions(intent);
    
    let response = `🎯 **Personalized Energy Optimization Plan:**\n\n`;
    
    optimizations.forEach((opt, index) => {
      response += `${index + 1}. **${opt.title}**\n`;
      response += `   Impact: ${opt.impact}/10 | Difficulty: ${opt.difficulty}\n`;
      response += `   ${opt.description}\n\n`;
    });

    response += `Would you like me to create a detailed implementation plan for any of these optimizations?`;

    return response;
  }

  private static async generateGeneralResponse(intent: any, message: string): Promise<string> {
    const responses = [
      "I'm here to help you understand and optimize your energy patterns! Ask me about your energy trends, patterns, or how to improve your energy levels.",
      "I can analyze your energy data, discover patterns, make predictions, and provide personalized coaching. What would you like to explore?",
      "Let's dive into your energy data! I can help you understand when you're most energetic, identify patterns, and suggest optimizations.",
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Advanced Pattern Recognition
  private static discoverPatterns(): void {
    if (this.energyData.length < 7) return;

    this.discoveredPatterns = [];

    // Circadian rhythm patterns
    const circadianPattern = this.detectCircadianPattern();
    if (circadianPattern) this.discoveredPatterns.push(circadianPattern);

    // Weekly patterns
    const weeklyPattern = this.detectWeeklyPattern();
    if (weeklyPattern) this.discoveredPatterns.push(weeklyPattern);

    // Energy type correlations
    const correlationPatterns = this.detectEnergyCorrelations();
    this.discoveredPatterns.push(...correlationPatterns);

    // Trend patterns
    const trendPatterns = this.detectTrendPatterns();
    this.discoveredPatterns.push(...trendPatterns);

    // Anomaly detection
    const anomalies = this.detectAnomalies();
    this.discoveredPatterns.push(...anomalies);
  }

  private static detectCircadianPattern(): PatternInsight | null {
    const hourlyAverages = new Map<number, number[]>();
    
    this.energyData.forEach(entry => {
      const hour = entry.timestamp.getHours();
      if (!hourlyAverages.has(hour)) {
        hourlyAverages.set(hour, []);
      }
      hourlyAverages.get(hour)!.push(entry.overall);
    });

    const hourlyData: { hour: number; average: number; count: number }[] = [];
    hourlyAverages.forEach((values, hour) => {
      const average = values.reduce((sum, val) => sum + val, 0) / values.length;
      hourlyData.push({ hour, average, count: values.length });
    });

    if (hourlyData.length < 6) return null;

    const peakHour = hourlyData.reduce((peak, current) => 
      current.average > peak.average ? current : peak
    );

    const lowHour = hourlyData.reduce((low, current) => 
      current.average < low.average ? current : low
    );

    const amplitude = peakHour.average - lowHour.average;
    
    if (amplitude < 15) return null;

    return {
      id: 'circadian-rhythm',
      type: 'cycle',
      title: 'Daily Energy Rhythm Detected',
      description: `Your energy peaks around ${this.formatHour(peakHour.hour)} (${peakHour.average.toFixed(1)}/100) and dips around ${this.formatHour(lowHour.hour)} (${lowHour.average.toFixed(1)}/100).`,
      confidence: Math.min(95, 60 + (amplitude / 2)),
      impact: amplitude > 30 ? 'high' : amplitude > 20 ? 'medium' : 'low',
      timeframe: 'Daily',
      data: {
        values: hourlyData.map(d => d.average),
        timestamps: hourlyData.map(d => new Date(2024, 0, 1, d.hour)),
      },
      actionable: true,
      suggestions: [
        `Schedule your most important tasks around ${this.formatHour(peakHour.hour)} when your energy is highest`,
        `Plan lighter activities or rest periods around ${this.formatHour(lowHour.hour)}`,
        `Consider adjusting your sleep schedule to optimize your natural energy rhythm`,
      ],
    };
  }

  private static detectWeeklyPattern(): PatternInsight | null {
    const dayAverages = new Map<number, number[]>();
    
    this.energyData.forEach(entry => {
      const dayOfWeek = entry.timestamp.getDay();
      if (!dayAverages.has(dayOfWeek)) {
        dayAverages.set(dayOfWeek, []);
      }
      dayAverages.get(dayOfWeek)!.push(entry.overall);
    });

    const weeklyData: { day: number; average: number; name: string }[] = [];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    dayAverages.forEach((values, day) => {
      const average = values.reduce((sum, val) => sum + val, 0) / values.length;
      weeklyData.push({ day, average, name: dayNames[day] });
    });

    if (weeklyData.length < 5) return null;

    const bestDay = weeklyData.reduce((best, current) => 
      current.average > best.average ? current : best
    );

    const worstDay = weeklyData.reduce((worst, current) => 
      current.average < worst.average ? current : worst
    );

    const weeklyVariation = bestDay.average - worstDay.average;
    
    if (weeklyVariation < 10) return null;

    return {
      id: 'weekly-pattern',
      type: 'cycle',
      title: 'Weekly Energy Pattern Identified',
      description: `Your energy is typically highest on ${bestDay.name}s (${bestDay.average.toFixed(1)}/100) and lowest on ${worstDay.name}s (${worstDay.average.toFixed(1)}/100).`,
      confidence: Math.min(90, 50 + (weeklyVariation / 2)),
      impact: weeklyVariation > 25 ? 'high' : weeklyVariation > 15 ? 'medium' : 'low',
      timeframe: 'Weekly',
      data: {
        values: weeklyData.map(d => d.average),
        timestamps: weeklyData.map(d => new Date(2024, 0, d.day + 1)),
      },
      actionable: true,
      suggestions: [
        `Plan your most challenging tasks for ${bestDay.name}s when your energy is naturally higher`,
        `Consider scheduling lighter workloads or self-care activities on ${worstDay.name}s`,
        `Prepare for ${worstDay.name}s with energy-boosting activities or earlier bedtimes`,
      ],
    };
  }

  private static detectEnergyCorrelations(): PatternInsight[] {
    const patterns: PatternInsight[] = [];
    const energyTypes = ['physical', 'mental', 'emotional', 'creative'] as const;
    
    for (let i = 0; i < energyTypes.length; i++) {
      for (let j = i + 1; j < energyTypes.length; j++) {
        const correlation = this.calculateCorrelation(energyTypes[i], energyTypes[j]);
        
        if (Math.abs(correlation) > 0.6) {
          const isPositive = correlation > 0;
          patterns.push({
            id: `correlation-${energyTypes[i]}-${energyTypes[j]}`,
            type: 'correlation',
            title: `${energyTypes[i].charAt(0).toUpperCase() + energyTypes[i].slice(1)} & ${energyTypes[j].charAt(0).toUpperCase() + energyTypes[j].slice(1)} Energy Correlation`,
            description: `Your ${energyTypes[i]} and ${energyTypes[j]} energy levels are ${isPositive ? 'strongly connected' : 'inversely related'} (${Math.abs(correlation).toFixed(2)} correlation).`,
            confidence: Math.min(95, 50 + Math.abs(correlation) * 50),
            impact: Math.abs(correlation) > 0.8 ? 'high' : 'medium',
            timeframe: 'Overall',
            data: {
              values: [correlation],
              timestamps: [new Date()],
              relatedMetrics: [energyTypes[i], energyTypes[j]],
            },
            actionable: true,
            suggestions: [
              isPositive 
                ? `Focus on activities that boost both ${energyTypes[i]} and ${energyTypes[j]} energy simultaneously`
                : `When ${energyTypes[i]} energy is low, pay extra attention to maintaining ${energyTypes[j]} energy`,
            ],
          });
        }
      }
    }
    
    return patterns;
  }

  private static detectTrendPatterns(): PatternInsight[] {
    const patterns: PatternInsight[] = [];
    const energyTypes = ['overall', 'physical', 'mental', 'emotional', 'creative'] as const;
    
    energyTypes.forEach(energyType => {
      const trend = this.calculateTrend(this.energyData, energyType);
      const absTrend = Math.abs(trend);
      
      if (absTrend > 5) {
        patterns.push({
          id: `trend-${energyType}`,
          type: 'trend',
          title: `${energyType.charAt(0).toUpperCase() + energyType.slice(1)} Energy Trend`,
          description: `Your ${energyType} energy is ${trend > 0 ? 'increasing' : 'decreasing'} by ${absTrend.toFixed(1)}% over time.`,
          confidence: Math.min(90, 50 + absTrend * 2),
          impact: absTrend > 15 ? 'high' : absTrend > 10 ? 'medium' : 'low',
          timeframe: 'Long-term',
          data: {
            values: this.energyData.map(d => (d as any)[energyType]),
            timestamps: this.energyData.map(d => d.timestamp),
          },
          actionable: true,
          suggestions: trend > 0 
            ? [`Great progress! Keep up the habits that are boosting your ${energyType} energy`]
            : [`Consider strategies to reverse the declining ${energyType} energy trend`],
        });
      }
    });
    
    return patterns;
  }

  private static detectAnomalies(): PatternInsight[] {
    const patterns: PatternInsight[] = [];
    
    // Find significant energy spikes or drops
    const overallValues = this.energyData.map(d => d.overall);
    const mean = overallValues.reduce((sum, val) => sum + val, 0) / overallValues.length;
    const stdDev = Math.sqrt(overallValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / overallValues.length);
    
    const anomalies = this.energyData.filter(entry => 
      Math.abs(entry.overall - mean) > 2 * stdDev
    );

    if (anomalies.length > 0 && anomalies.length < this.energyData.length * 0.1) {
      const isSpike = anomalies[0].overall > mean;
      patterns.push({
        id: 'energy-anomaly',
        type: 'anomaly',
        title: `Energy ${isSpike ? 'Spike' : 'Drop'} Detected`,
        description: `Detected ${anomalies.length} significant energy ${isSpike ? 'spike' : 'drop'}${anomalies.length > 1 ? 's' : ''} that deviate from your normal pattern.`,
        confidence: 85,
        impact: 'medium',
        timeframe: 'Specific instances',
        data: {
          values: anomalies.map(a => a.overall),
          timestamps: anomalies.map(a => a.timestamp),
        },
        actionable: true,
        suggestions: [
          `Reflect on what was different during these ${isSpike ? 'high-energy' : 'low-energy'} periods`,
          isSpike 
            ? 'Try to replicate the conditions that led to these energy spikes'
            : 'Identify potential triggers for these energy drops to avoid them',
        ],
      });
    }
    
    return patterns;
  }

  // Helper methods
  private static formatHour(hour: number): string {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  }

  private static calculateCorrelation(type1: string, type2: string): number {
    const values1 = this.energyData.map(d => (d as any)[type1]);
    const values2 = this.energyData.map(d => (d as any)[type2]);
    
    const mean1 = values1.reduce((sum, val) => sum + val, 0) / values1.length;
    const mean2 = values2.reduce((sum, val) => sum + val, 0) / values2.length;
    
    let numerator = 0;
    let denominator1 = 0;
    let denominator2 = 0;
    
    for (let i = 0; i < values1.length; i++) {
      const diff1 = values1[i] - mean1;
      const diff2 = values2[i] - mean2;
      numerator += diff1 * diff2;
      denominator1 += diff1 * diff1;
      denominator2 += diff2 * diff2;
    }
    
    const denominator = Math.sqrt(denominator1 * denominator2);
    return denominator === 0 ? 0 : numerator / denominator;
  }

  private static calculateTrend(data: EnergyLevel[], energyType: string): number {
    if (data.length < 2) return 0;
    
    const values = data.map(d => (d as any)[energyType]);
    const first = values.slice(0, Math.ceil(values.length / 3)).reduce((sum, val) => sum + val, 0) / Math.ceil(values.length / 3);
    const last = values.slice(-Math.ceil(values.length / 3)).reduce((sum, val) => sum + val, 0) / Math.ceil(values.length / 3);
    
    return ((last - first) / first) * 100;
  }

  private static getRecentData(timeframe: string): EnergyLevel[] {
    const now = new Date();
    let cutoffDate: Date;
    
    switch (timeframe) {
      case 'day':
        cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    return this.energyData.filter(entry => entry.timestamp >= cutoffDate);
  }

  private static calculateEnergyStats(data: EnergyLevel[], energyType: string): {
    average: number;
    min: number;
    max: number;
    variability: number;
  } {
    const values = data.map(d => (d as any)[energyType]);
    
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const variance = values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / values.length;
    const variability = Math.sqrt(variance);
    
    return { average: Math.round(average), min, max, variability };
  }

  private static getPersonalizedInsights(data: EnergyLevel[], energyType: string): string[] {
    const insights: string[] = [];
    const stats = this.calculateEnergyStats(data, energyType);
    
    if (stats.variability > 20) {
      insights.push("Your energy levels are quite variable - consider identifying what causes these fluctuations");
    }
    
    if (stats.average < 40) {
      insights.push("Your average energy is below optimal - let's work on strategies to boost it");
    } else if (stats.average > 80) {
      insights.push("Excellent! Your energy levels are consistently high");
    }
    
    return insights;
  }

  private static getRelevantPatterns(intent: any): PatternInsight[] {
    if (intent.energyType) {
      return this.discoveredPatterns.filter(pattern => 
        pattern.title.toLowerCase().includes(intent.energyType) ||
        pattern.data.relatedMetrics?.includes(intent.energyType)
      );
    }
    
    if (intent.timeframe) {
      return this.discoveredPatterns.filter(pattern => 
        pattern.timeframe.toLowerCase().includes(intent.timeframe)
      );
    }
    
    return this.discoveredPatterns.slice(0, 5);
  }

  private static generatePrediction(energyType: string, timeframe: string): {
    predictedLevel: number;
    confidence: number;
    range: { min: number; max: number };
    factors: string[];
    recommendations: string[];
  } {
    // Simple prediction based on recent trends and patterns
    const recentData = this.getRecentData('week');
    const trend = this.calculateTrend(recentData, energyType);
    const stats = this.calculateEnergyStats(recentData, energyType);
    
    let predictedLevel = stats.average;
    
    // Apply trend
    if (timeframe.includes('day')) {
      predictedLevel += trend * 0.1;
    } else if (timeframe.includes('week')) {
      predictedLevel += trend * 0.5;
    }
    
    // Apply circadian pattern if available
    const circadianPattern = this.discoveredPatterns.find(p => p.id === 'circadian-rhythm');
    if (circadianPattern && timeframe.includes('hour')) {
      const hour = new Date().getHours();
      // Simplified circadian adjustment
      const circadianBoost = Math.sin((hour - 6) * Math.PI / 12) * 10;
      predictedLevel += circadianBoost;
    }
    
    predictedLevel = Math.max(0, Math.min(100, Math.round(predictedLevel)));
    
    const confidence = Math.max(60, 90 - stats.variability);
    const range = {
      min: Math.max(0, predictedLevel - Math.round(stats.variability)),
      max: Math.min(100, predictedLevel + Math.round(stats.variability)),
    };
    
    const factors = [
      `Recent ${energyType} energy trend (${trend > 0 ? '+' : ''}${trend.toFixed(1)}%)`,
      `Historical average (${stats.average}/100)`,
      `Energy variability factor (±${stats.variability.toFixed(1)})`,
    ];
    
    const recommendations = [];
    if (predictedLevel < 50) {
      recommendations.push("Consider scheduling lighter activities or rest periods");
      recommendations.push("Focus on energy-boosting practices like good sleep or light exercise");
    } else if (predictedLevel > 75) {
      recommendations.push("Great time for challenging or important tasks");
      recommendations.push("Consider tackling projects that require high focus");
    }
    
    return { predictedLevel, confidence: Math.round(confidence), range, factors, recommendations };
  }

  private static generateOptimizationSuggestions(intent: any): Array<{
    title: string;
    description: string;
    impact: number;
    difficulty: string;
  }> {
    const suggestions = [];
    
    // Based on discovered patterns
    const circadianPattern = this.discoveredPatterns.find(p => p.type === 'cycle' && p.id === 'circadian-rhythm');
    if (circadianPattern) {
      suggestions.push({
        title: "Optimize Your Daily Schedule",
        description: "Align your most important tasks with your natural energy peaks",
        impact: 8,
        difficulty: "Easy",
      });
    }
    
    const trendPatterns = this.discoveredPatterns.filter(p => p.type === 'trend');
    if (trendPatterns.some(p => p.description.includes('decreasing'))) {
      suggestions.push({
        title: "Reverse Declining Energy Trends",
        description: "Implement targeted strategies to address declining energy patterns",
        impact: 9,
        difficulty: "Medium",
      });
    }
    
    // General optimizations
    suggestions.push(
      {
        title: "Establish Energy Tracking Habits",
        description: "Build consistent daily energy logging to improve prediction accuracy",
        impact: 7,
        difficulty: "Easy",
      },
      {
        title: "Create Energy-Based Task Planning",
        description: "Match task difficulty with predicted energy levels",
        impact: 8,
        difficulty: "Medium",
      }
    );
    
    return suggestions.slice(0, 4);
  }

  private static generateActionItems(intent: any): string[] {
    const items = [
      "Track energy levels consistently for better insights",
      "Identify your peak energy times and schedule important tasks accordingly",
      "Monitor factors that influence your energy patterns",
    ];
    
    // Add specific action items based on patterns
    const weeklyPattern = this.discoveredPatterns.find(p => p.id === 'weekly-pattern');
    if (weeklyPattern) {
      items.push("Plan weekly schedule around discovered energy patterns");
    }
    
    return items.slice(0, 3);
  }

  // Personalized AI Coach
  private static generateCoachingPlan(): void {
    if (this.energyData.length < 7) return;

    const goals = this.generateCoachingGoals();
    const strategies = this.generateCoachingStrategies();
    
    this.coachingPlan = {
      id: `coaching-plan-${Date.now()}`,
      title: "Personalized Energy Optimization Plan",
      description: "A tailored plan to optimize your energy levels based on your unique patterns",
      goals,
      strategies,
      timeline: "4 weeks",
      currentPhase: "Assessment & Foundation",
      progressMetrics: this.generateProgressMetrics(),
      nextSteps: [
        "Continue consistent energy tracking",
        "Implement first coaching strategy",
        "Monitor pattern changes",
      ],
    };
  }

  private static generateCoachingGoals(): CoachingGoal[] {
    const goals: CoachingGoal[] = [];
    const stats = this.calculateEnergyStats(this.energyData, 'overall');
    
    if (stats.average < 70) {
      goals.push({
        id: 'increase-average-energy',
        title: 'Boost Overall Energy',
        description: 'Increase your average daily energy level',
        category: 'energy-optimization',
        targetMetric: 'Average Overall Energy',
        currentValue: stats.average,
        targetValue: Math.min(85, stats.average + 15),
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        progress: 0,
      });
    }
    
    if (stats.variability > 20) {
      goals.push({
        id: 'stabilize-energy',
        title: 'Stabilize Energy Levels',
        description: 'Reduce energy fluctuations for more consistent performance',
        category: 'pattern-improvement',
        targetMetric: 'Energy Variability',
        currentValue: stats.variability,
        targetValue: Math.max(10, stats.variability - 5),
        deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        progress: 0,
      });
    }
    
    return goals;
  }

  private static generateCoachingStrategies(): CoachingStrategy[] {
    const strategies: CoachingStrategy[] = [];
    
    // Basic strategies
    strategies.push(
      {
        id: 'consistent-tracking',
        title: 'Consistent Energy Tracking',
        description: 'Build the habit of regular energy monitoring',
        type: 'behavioral',
        difficulty: 'easy',
        estimatedImpact: 7,
        implementation: [
          'Set daily reminders for energy logging',
          'Track energy at consistent times',
          'Note environmental and activity factors',
        ],
        tracking: 'Daily energy entries logged',
      },
      {
        id: 'schedule-optimization',
        title: 'Peak-Energy Task Scheduling',
        description: 'Align important tasks with your natural energy peaks',
        type: 'behavioral',
        difficulty: 'medium',
        estimatedImpact: 8,
        implementation: [
          'Identify your peak energy hours',
          'Schedule challenging tasks during peaks',
          'Reserve low-energy times for easier activities',
        ],
        tracking: 'Tasks completed during peak energy hours',
      }
    );
    
    return strategies;
  }

  private static generateProgressMetrics(): ProgressMetric[] {
    return [
      {
        id: 'average-energy',
        name: 'Average Daily Energy',
        unit: '/100',
        currentValue: this.calculateEnergyStats(this.energyData, 'overall').average,
        targetValue: 75,
        trend: 'stable',
        confidence: 85,
      },
      {
        id: 'tracking-consistency',
        name: 'Tracking Consistency',
        unit: '%',
        currentValue: 85,
        targetValue: 95,
        trend: 'improving',
        confidence: 90,
      },
    ];
  }

  // Public getters
  static getChatHistory(): ChatMessage[] {
    return [...this.chatHistory];
  }

  static getDiscoveredPatterns(): PatternInsight[] {
    return [...this.discoveredPatterns];
  }

  static getCoachingPlan(): PersonalizedCoachingPlan | null {
    return this.coachingPlan;
  }

  static clearChatHistory(): void {
    this.chatHistory = [];
  }
}
