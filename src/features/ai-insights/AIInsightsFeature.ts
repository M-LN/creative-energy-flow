// AI Insights Feature - AI-powered pattern analysis and recommendations
import { EventSystem, EVENTS } from '@/core/EventSystem';
import { StateManager } from '@/core/StateManager';
import type { AIInsight, EnergyLevel, SocialBatteryEntry } from '@/shared/types';
import * as tf from '@tensorflow/tfjs';

export class AIInsightsFeature {
  private static instance: AIInsightsFeature;
  private eventSystem: EventSystem;
  private stateManager: StateManager;
  private isInitialized = false;
  private model: tf.LayersModel | null = null;
  private isTraining = false;

  private constructor() {
    this.eventSystem = EventSystem.getInstance();
    this.stateManager = StateManager.getInstance();
  }

  public static getInstance(): AIInsightsFeature {
    if (!AIInsightsFeature.instance) {
      AIInsightsFeature.instance = new AIInsightsFeature();
    }
    return AIInsightsFeature.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Set up TensorFlow.js backend
      await tf.ready();
      console.log('TensorFlow.js backend:', tf.getBackend());
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Initialize AI model
      await this.initializeModel();
      
      // Start periodic analysis
      this.startPeriodicAnalysis();
      
      this.isInitialized = true;
      this.eventSystem.emit('feature:ai-insights-ready', {}, 'AIInsightsFeature');
      
    } catch (error) {
      this.eventSystem.emit(EVENTS.ERROR_OCCURRED, {
        type: 'ai-insights-initialization-error',
        error: (error as Error).message,
      }, 'AIInsightsFeature');
      throw error;
    }
  }

  private setupEventListeners(): void {
    // Listen for analysis requests
    this.eventSystem.subscribe('ai:process-data', (payload) => {
      this.processData(payload.data);
    });

    this.eventSystem.subscribe('ai:analyze-energy-pattern', (payload) => {
      this.analyzeEnergyPattern(payload.data);
    });

    this.eventSystem.subscribe('ai:analyze-social-pattern', (payload) => {
      this.analyzeSocialPattern(payload.data);
    });

    // Listen for model training requests
    this.eventSystem.subscribe('ai:train-model', () => {
      this.trainModel();
    });

    // Listen for external updates
    this.eventSystem.subscribe('ai-insights:external-update', (payload) => {
      this.handleExternalUpdate(payload.data);
    });
  }

  private async initializeModel(): Promise<void> {
    try {
      // Create a simple neural network for energy pattern prediction
      this.model = tf.sequential({
        layers: [
          tf.layers.dense({
            inputShape: [10], // Features: time of day, energy types, social interactions, etc.
            units: 16,
            activation: 'relu',
            name: 'hidden1'
          }),
          tf.layers.dropout({ rate: 0.2 }),
          tf.layers.dense({
            units: 8,
            activation: 'relu',
            name: 'hidden2'
          }),
          tf.layers.dense({
            units: 4, // Output: predicted energy levels for each type
            activation: 'linear',
            name: 'output'
          })
        ]
      });

      // Compile the model
      this.model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'meanSquaredError',
        metrics: ['mse']
      });

      console.log('AI model initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize AI model:', error);
      throw error;
    }
  }

  private startPeriodicAnalysis(): void {
    // Run analysis every 30 minutes
    setInterval(() => {
      this.performPeriodicAnalysis();
    }, 30 * 60 * 1000);
  }

  private async performPeriodicAnalysis(): Promise<void> {
    try {
      const energyData = this.stateManager.getEnergyData();
      const socialData = this.stateManager.getSocialBatteryData();
      
      if (energyData.length < 5 && socialData.length < 5) {
        return; // Not enough data for meaningful analysis
      }

      // Generate insights based on recent data
      const insights = await this.generateInsights();
      
      insights.forEach(insight => {
        this.stateManager.addAIInsight(insight);
        this.eventSystem.emit(EVENTS.AI_INSIGHT_GENERATED, insight, 'AIInsightsFeature');
      });
      
    } catch (error) {
      this.eventSystem.emit(EVENTS.ERROR_OCCURRED, {
        type: 'periodic-analysis-error',
        error: (error as Error).message,
      }, 'AIInsightsFeature');
    }
  }

  private processData(data: any): void {
    try {
      switch (data.type) {
        case 'energy-pattern':
          this.analyzeEnergyPattern(data.data);
          break;
        case 'social-pattern':
          this.analyzeSocialPattern(data.data);
          break;
        case 'chart-interaction':
          this.analyzeChartInteraction(data.data);
          break;
        default:
          console.warn('Unknown data type for AI processing:', data.type);
      }
    } catch (error) {
      this.eventSystem.emit(EVENTS.ERROR_OCCURRED, {
        type: 'ai-data-processing-error',
        error: (error as Error).message,
        data,
      }, 'AIInsightsFeature');
    }
  }

  private async analyzeEnergyPattern(data: any): Promise<void> {
    const { newEntry, recentEntries } = data;
    
    // Detect patterns in energy data
    const patterns = this.detectEnergyPatterns(recentEntries);
    
    // Generate predictions
    const predictions = await this.predictEnergyLevels(newEntry);
    
    // Create insights
    const insights = this.createEnergyInsights(patterns, predictions, newEntry);
    
    insights.forEach(insight => {
      this.stateManager.addAIInsight(insight);
      this.eventSystem.emit(EVENTS.AI_INSIGHT_GENERATED, insight, 'AIInsightsFeature');
    });
  }

  private async analyzeSocialPattern(data: any): Promise<void> {
    const { newEntry, recentEntries } = data;
    
    // Detect social battery patterns
    const patterns = this.detectSocialPatterns(recentEntries);
    
    // Create insights
    const insights = this.createSocialInsights(patterns, newEntry);
    
    insights.forEach(insight => {
      this.stateManager.addAIInsight(insight);
      this.eventSystem.emit(EVENTS.AI_INSIGHT_GENERATED, insight, 'AIInsightsFeature');
    });
  }

  private analyzeChartInteraction(data: any): void {
    // Analyze what charts users focus on to understand their priorities
    const insight: AIInsight = {
      id: `chart-insight-${Date.now()}`,
      timestamp: new Date(),
      type: 'pattern',
      title: 'Chart Usage Pattern',
      content: `You've been focusing on ${data.viewType} charts, suggesting interest in ${this.getChartFocusInsight(data.viewType)}.`,
      confidence: 0.7,
      actionable: true,
      relatedData: [data.viewType],
    };
    
    this.stateManager.addAIInsight(insight);
    this.eventSystem.emit(EVENTS.AI_INSIGHT_GENERATED, insight, 'AIInsightsFeature');
  }

  private getChartFocusInsight(viewType: string): string {
    const insights: { [key: string]: string } = {
      'energy-trends': 'understanding your energy patterns over time',
      'energy-types': 'balancing different types of energy',
      'social-trends': 'managing your social battery effectively',
      'social-interactions': 'optimizing your social interaction mix',
    };
    
    return insights[viewType] || 'data analysis and self-improvement';
  }

  private detectEnergyPatterns(energyData: EnergyLevel[]): Array<{
    type: string;
    pattern: string;
    confidence: number;
    description: string;
  }> {
    const patterns: Array<{
      type: string;
      pattern: string;
      confidence: number;
      description: string;
    }> = [];
    
    if (energyData.length < 3) return patterns;
    
    // Detect time-of-day patterns
    const hourlyData = this.groupEnergyByHour(energyData);
    const peakHour = this.findPeakEnergyHour(hourlyData);
    
    if (peakHour.confidence > 0.6) {
      patterns.push({
        type: 'temporal',
        pattern: 'peak-hour',
        confidence: peakHour.confidence,
        description: `Your energy typically peaks around ${peakHour.hour}:00`,
      });
    }
    
    // Detect weekly patterns
    const weeklyData = this.groupEnergyByWeekday(energyData);
    const peakDay = this.findPeakEnergyDay(weeklyData);
    
    if (peakDay.confidence > 0.6) {
      patterns.push({
        type: 'weekly',
        pattern: 'peak-day',
        confidence: peakDay.confidence,
        description: `Your energy is typically highest on ${peakDay.day}`,
      });
    }
    
    // Detect type correlations
    const typeCorrelations = this.analyzeEnergyTypeCorrelations(energyData);
    
    typeCorrelations.forEach(correlation => {
      if (Math.abs(correlation.coefficient) > 0.5) {
        patterns.push({
          type: 'correlation',
          pattern: 'type-correlation',
          confidence: Math.abs(correlation.coefficient),
          description: `${correlation.type1} and ${correlation.type2} energy levels are ${correlation.coefficient > 0 ? 'positively' : 'negatively'} correlated`,
        });
      }
    });
    
    return patterns;
  }

  private detectSocialPatterns(socialData: SocialBatteryEntry[]): Array<{
    type: string;
    pattern: string;
    confidence: number;
    description: string;
  }> {
    const patterns: Array<{
      type: string;
      pattern: string;
      confidence: number;
      description: string;
    }> = [];
    
    if (socialData.length < 3) return patterns;
    
    // Detect interaction type preferences
    const interactionStats = this.analyzeSocialInteractionStats(socialData);
    const bestInteraction = interactionStats.reduce((best, current) => 
      current.averageLevel > best.averageLevel ? current : best
    );
    
    if (bestInteraction.averageLevel > 6) {
      patterns.push({
        type: 'preference',
        pattern: 'optimal-interaction',
        confidence: 0.8,
        description: `${bestInteraction.type} interactions tend to maintain your social battery best (avg: ${bestInteraction.averageLevel.toFixed(1)})`,
      });
    }
    
    // Detect recovery patterns
    const recoveryPattern = this.analyzeRecoveryPatterns(socialData);
    if (recoveryPattern.confidence > 0.6) {
      patterns.push({
        type: 'recovery',
        pattern: 'recharge-time',
        confidence: recoveryPattern.confidence,
        description: recoveryPattern.description,
      });
    }
    
    return patterns;
  }

  private async predictEnergyLevels(currentEntry: EnergyLevel): Promise<{
    creative: number;
    physical: number;
    mental: number;
    emotional: number;
  }> {
    if (!this.model) {
      return { creative: 5, physical: 5, mental: 5, emotional: 5 };
    }
    
    try {
      // Create feature vector from current data
      const features = this.createFeatureVector(currentEntry);
      const input = tf.tensor2d([features]);
      
      // Make prediction
      const prediction = this.model.predict(input) as tf.Tensor;
      const values = await prediction.data();
      
      // Clean up tensors
      input.dispose();
      prediction.dispose();
      
      return {
        creative: Math.max(1, Math.min(10, values[0])),
        physical: Math.max(1, Math.min(10, values[1])),
        mental: Math.max(1, Math.min(10, values[2])),
        emotional: Math.max(1, Math.min(10, values[3])),
      };
      
    } catch (error) {
      console.error('Prediction error:', error);
      return { creative: 5, physical: 5, mental: 5, emotional: 5 };
    }
  }

  private createFeatureVector(entry: EnergyLevel): number[] {
    const hour = entry.timestamp.getHours();
    const dayOfWeek = entry.timestamp.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6 ? 1 : 0;
    
    // Create normalized feature vector
    return [
      hour / 24,                           // Hour of day (0-1)
      dayOfWeek / 7,                       // Day of week (0-1)
      isWeekend,                           // Is weekend (0 or 1)
      entry.level / 10,                    // Current energy level (0-1)
      entry.type === 'creative' ? 1 : 0,  // Energy type flags
      entry.type === 'physical' ? 1 : 0,
      entry.type === 'mental' ? 1 : 0,
      entry.type === 'emotional' ? 1 : 0,
      entry.activities ? entry.activities.length / 5 : 0, // Number of activities (normalized)
      Math.random() * 0.1,                // Small random component for variability
    ];
  }

  private createEnergyInsights(
    patterns: Array<{ type: string; pattern: string; confidence: number; description: string }>,
    predictions: { creative: number; physical: number; mental: number; emotional: number },
    _currentEntry: EnergyLevel
  ): AIInsight[] {
    const insights: AIInsight[] = [];
    
    // Pattern-based insights
    patterns.forEach(pattern => {
      if (pattern.confidence > 0.7) {
        insights.push({
          id: `pattern-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          timestamp: new Date(),
          type: 'pattern',
          title: `Energy Pattern Detected`,
          content: pattern.description,
          confidence: pattern.confidence,
          actionable: true,
          relatedData: [pattern.type, pattern.pattern],
        });
      }
    });
    
    // Prediction-based insights
    const highestPredicted = Object.entries(predictions).reduce((a, b) => a[1] > b[1] ? a : b);
    const lowestPredicted = Object.entries(predictions).reduce((a, b) => a[1] < b[1] ? a : b);
    
    if (highestPredicted[1] > 7) {
      insights.push({
        id: `prediction-high-${Date.now()}`,
        timestamp: new Date(),
        type: 'prediction',
        title: 'High Energy Period Predicted',
        content: `Your ${highestPredicted[0]} energy is predicted to be high (${highestPredicted[1].toFixed(1)}/10). This might be a good time for challenging tasks.`,
        confidence: 0.75,
        actionable: true,
        relatedData: [highestPredicted[0]],
      });
    }
    
    if (lowestPredicted[1] < 4) {
      insights.push({
        id: `prediction-low-${Date.now()}`,
        timestamp: new Date(),
        type: 'recommendation',
        title: 'Low Energy Period Predicted',
        content: `Your ${lowestPredicted[0]} energy might be low (${lowestPredicted[1].toFixed(1)}/10). Consider lighter activities or rest.`,
        confidence: 0.75,
        actionable: true,
        relatedData: [lowestPredicted[0]],
      });
    }
    
    return insights;
  }

  private createSocialInsights(
    patterns: Array<{ type: string; pattern: string; confidence: number; description: string }>,
    _currentEntry: SocialBatteryEntry
  ): AIInsight[] {
    const insights: AIInsight[] = [];
    
    patterns.forEach(pattern => {
      if (pattern.confidence > 0.6) {
        insights.push({
          id: `social-pattern-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          timestamp: new Date(),
          type: 'pattern',
          title: 'Social Pattern Detected',
          content: pattern.description,
          confidence: pattern.confidence,
          actionable: true,
          relatedData: [pattern.type, _currentEntry.interactionType],
        });
      }
    });
    
    // Current level insights
    if (_currentEntry.level <= 3) {
      insights.push({
        id: `social-low-${Date.now()}`,
        timestamp: new Date(),
        type: 'alert',
        title: 'Low Social Battery Alert',
        content: 'Your social battery is running low. Consider taking some alone time to recharge.',
        confidence: 0.9,
        actionable: true,
        relatedData: ['social-battery', 'recharge'],
      });
    }
    
    return insights;
  }

  private async generateInsights(): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];
    const energyData = this.stateManager.getEnergyData();
    const socialData = this.stateManager.getSocialBatteryData();
    
    // Weekly summary insights
    const weeklyInsight = this.generateWeeklySummary(energyData, socialData);
    if (weeklyInsight) {
      insights.push(weeklyInsight);
    }
    
    // Correlation insights
    const correlationInsight = this.generateCorrelationInsight(energyData, socialData);
    if (correlationInsight) {
      insights.push(correlationInsight);
    }
    
    // Recommendation insights
    const recommendations = this.generateRecommendations(energyData, socialData);
    insights.push(...recommendations);
    
    return insights;
  }

  private generateWeeklySummary(energyData: EnergyLevel[], socialData: SocialBatteryEntry[]): AIInsight | null {
    if (energyData.length < 5 && socialData.length < 5) return null;
    
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentEnergy = energyData.filter(e => e.timestamp > lastWeek);
    const recentSocial = socialData.filter(s => s.timestamp > lastWeek);
    
    const avgEnergy = recentEnergy.length > 0 ? 
      recentEnergy.reduce((sum, e) => sum + e.level, 0) / recentEnergy.length : 0;
    const avgSocial = recentSocial.length > 0 ? 
      recentSocial.reduce((sum, s) => sum + s.level, 0) / recentSocial.length : 0;
    
    let content = 'This week: ';
    if (avgEnergy > 0) content += `Average energy: ${avgEnergy.toFixed(1)}/10. `;
    if (avgSocial > 0) content += `Average social battery: ${avgSocial.toFixed(1)}/10. `;
    
    if (avgEnergy > 7 || avgSocial > 7) {
      content += 'You\'re doing well! Keep up the good energy management.';
    } else if (avgEnergy < 5 || avgSocial < 5) {
      content += 'Consider focusing on activities that boost your energy and social battery.';
    }
    
    return {
      id: `weekly-summary-${Date.now()}`,
      timestamp: new Date(),
      type: 'pattern',
      title: 'Weekly Summary',
      content,
      confidence: 0.8,
      actionable: true,
      relatedData: ['weekly-summary'],
    };
  }

  private generateCorrelationInsight(energyData: EnergyLevel[], socialData: SocialBatteryEntry[]): AIInsight | null {
    // Simple correlation analysis between energy and social data
    if (energyData.length < 5 || socialData.length < 5) return null;
    
    // Find energy and social entries on the same day
    const correlationData: { energy: number; social: number }[] = [];
    
    energyData.forEach(energy => {
      const sameDay = socialData.find(social => 
        social.timestamp.toDateString() === energy.timestamp.toDateString()
      );
      if (sameDay) {
        correlationData.push({ energy: energy.level, social: sameDay.level });
      }
    });
    
    if (correlationData.length < 3) return null;
    
    const correlation = this.calculateCorrelation(
      correlationData.map(d => d.energy),
      correlationData.map(d => d.social)
    );
    
    if (Math.abs(correlation) > 0.4) {
      const direction = correlation > 0 ? 'positively' : 'negatively';
      return {
        id: `correlation-${Date.now()}`,
        timestamp: new Date(),
        type: 'pattern',
        title: 'Energy-Social Correlation',
        content: `Your energy and social battery levels are ${direction} correlated (${(correlation * 100).toFixed(0)}%). ${correlation > 0 ? 'High energy days tend to coincide with good social battery levels.' : 'When your energy is high, your social battery tends to be lower, or vice versa.'}`,
        confidence: Math.abs(correlation),
        actionable: true,
        relatedData: ['correlation', 'energy', 'social'],
      };
    }
    
    return null;
  }

  private generateRecommendations(energyData: EnergyLevel[], socialData: SocialBatteryEntry[]): AIInsight[] {
    const recommendations: AIInsight[] = [];
    
    // Energy-based recommendations
    if (energyData.length > 0) {
      const recentEnergy = energyData.slice(-5);
      const avgRecent = recentEnergy.reduce((sum, e) => sum + e.level, 0) / recentEnergy.length;
      
      if (avgRecent < 5) {
        recommendations.push({
          id: `rec-energy-${Date.now()}`,
          timestamp: new Date(),
          type: 'recommendation',
          title: 'Energy Boost Recommendation',
          content: 'Your recent energy levels have been low. Try activities that energize you: exercise, creative projects, or spending time in nature.',
          confidence: 0.7,
          actionable: true,
          relatedData: ['energy-boost'],
        });
      }
    }
    
    // Social-based recommendations
    if (socialData.length > 0) {
      const recentSocial = socialData.slice(-3);
      const avgRecent = recentSocial.reduce((sum, s) => sum + s.level, 0) / recentSocial.length;
      
      if (avgRecent < 4) {
        recommendations.push({
          id: `rec-social-${Date.now()}`,
          timestamp: new Date(),
          type: 'recommendation',
          title: 'Social Battery Recharge',
          content: 'Your social battery needs recharging. Schedule some alone time, engage in solo hobbies, or spend time in quiet environments.',
          confidence: 0.8,
          actionable: true,
          relatedData: ['social-recharge'],
        });
      }
    }
    
    return recommendations;
  }

  // Helper methods
  private groupEnergyByHour(energyData: EnergyLevel[]): Map<number, number[]> {
    const hourlyData = new Map<number, number[]>();
    
    energyData.forEach(entry => {
      const hour = entry.timestamp.getHours();
      if (!hourlyData.has(hour)) {
        hourlyData.set(hour, []);
      }
      hourlyData.get(hour)!.push(entry.level);
    });
    
    return hourlyData;
  }

  private findPeakEnergyHour(hourlyData: Map<number, number[]>): { hour: number; confidence: number } {
    let peakHour = 12;
    let peakAverage = 0;
    let confidence = 0;
    
    hourlyData.forEach((levels, hour) => {
      if (levels.length < 2) return;
      
      const average = levels.reduce((sum, level) => sum + level, 0) / levels.length;
      if (average > peakAverage) {
        peakAverage = average;
        peakHour = hour;
        confidence = Math.min(levels.length / 5, 1); // Confidence based on data points
      }
    });
    
    return { hour: peakHour, confidence };
  }

  private groupEnergyByWeekday(energyData: EnergyLevel[]): Map<string, number[]> {
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weeklyData = new Map<string, number[]>();
    
    energyData.forEach(entry => {
      const day = weekdays[entry.timestamp.getDay()];
      if (!weeklyData.has(day)) {
        weeklyData.set(day, []);
      }
      weeklyData.get(day)!.push(entry.level);
    });
    
    return weeklyData;
  }

  private findPeakEnergyDay(weeklyData: Map<string, number[]>): { day: string; confidence: number } {
    let peakDay = 'Monday';
    let peakAverage = 0;
    let confidence = 0;
    
    weeklyData.forEach((levels, day) => {
      if (levels.length < 2) return;
      
      const average = levels.reduce((sum, level) => sum + level, 0) / levels.length;
      if (average > peakAverage) {
        peakAverage = average;
        peakDay = day;
        confidence = Math.min(levels.length / 3, 1);
      }
    });
    
    return { day: peakDay, confidence };
  }

  private analyzeEnergyTypeCorrelations(energyData: EnergyLevel[]): Array<{
    type1: string;
    type2: string;
    coefficient: number;
  }> {
    const types = ['creative', 'physical', 'mental', 'emotional'];
    const correlations: Array<{ type1: string; type2: string; coefficient: number }> = [];
    
    for (let i = 0; i < types.length; i++) {
      for (let j = i + 1; j < types.length; j++) {
        const type1Data = energyData.filter(e => e.type === types[i]).map(e => e.level);
        const type2Data = energyData.filter(e => e.type === types[j]).map(e => e.level);
        
        if (type1Data.length > 2 && type2Data.length > 2) {
          const correlation = this.calculateCorrelation(type1Data, type2Data);
          correlations.push({
            type1: types[i],
            type2: types[j],
            coefficient: correlation,
          });
        }
      }
    }
    
    return correlations;
  }

  private analyzeSocialInteractionStats(socialData: SocialBatteryEntry[]): Array<{
    type: string;
    averageLevel: number;
    count: number;
  }> {
    const stats = new Map<string, { sum: number; count: number }>();
    
    socialData.forEach(entry => {
      if (!stats.has(entry.interactionType)) {
        stats.set(entry.interactionType, { sum: 0, count: 0 });
      }
      const stat = stats.get(entry.interactionType)!;
      stat.sum += entry.level;
      stat.count += 1;
    });
    
    return Array.from(stats.entries()).map(([type, data]) => ({
      type,
      averageLevel: data.sum / data.count,
      count: data.count,
    }));
  }

  private analyzeRecoveryPatterns(socialData: SocialBatteryEntry[]): { confidence: number; description: string } {
    // Simple recovery pattern analysis
    const soloInteractions = socialData.filter(entry => entry.interactionType === 'solo');
    
    if (soloInteractions.length < 2) {
      return { confidence: 0, description: 'Not enough solo time data for analysis' };
    }
    
    const avgSoloLevel = soloInteractions.reduce((sum, entry) => sum + entry.level, 0) / soloInteractions.length;
    
    if (avgSoloLevel > 7) {
      return {
        confidence: 0.8,
        description: `Solo time effectively recharges your social battery (avg: ${avgSoloLevel.toFixed(1)}/10)`,
      };
    }
    
    return { confidence: 0.5, description: 'Solo time has moderate impact on social battery recovery' };
  }

  private calculateCorrelation(x: number[], y: number[]): number {
    const n = Math.min(x.length, y.length);
    if (n < 2) return 0;
    
    const xSliced = x.slice(0, n);
    const ySliced = y.slice(0, n);
    
    const meanX = xSliced.reduce((sum, val) => sum + val, 0) / n;
    const meanY = ySliced.reduce((sum, val) => sum + val, 0) / n;
    
    let numerator = 0;
    let denomX = 0;
    let denomY = 0;
    
    for (let i = 0; i < n; i++) {
      const deltaX = xSliced[i] - meanX;
      const deltaY = ySliced[i] - meanY;
      
      numerator += deltaX * deltaY;
      denomX += deltaX * deltaX;
      denomY += deltaY * deltaY;
    }
    
    const denominator = Math.sqrt(denomX * denomY);
    return denominator === 0 ? 0 : numerator / denominator;
  }

  private async trainModel(): Promise<void> {
    if (!this.model || this.isTraining) return;
    
    this.isTraining = true;
    
    try {
      const energyData = this.stateManager.getEnergyData();
      if (energyData.length < 10) {
        console.log('Not enough data to train model');
        return;
      }
      
      // Prepare training data
      const features: number[][] = [];
      const labels: number[][] = [];
      
      energyData.forEach(entry => {
        features.push(this.createFeatureVector(entry));
        
        // Create target vector (one-hot encoded energy types with levels)
        const target = [0, 0, 0, 0];
        const typeIndex = ['creative', 'physical', 'mental', 'emotional'].indexOf(entry.type);
        target[typeIndex] = entry.level;
        labels.push(target);
      });
      
      const xs = tf.tensor2d(features);
      const ys = tf.tensor2d(labels);
      
      // Train model
      await this.model.fit(xs, ys, {
        epochs: 10,
        batchSize: 4,
        validationSplit: 0.2,
        verbose: 0,
      });
      
      // Clean up tensors
      xs.dispose();
      ys.dispose();
      
      this.eventSystem.emit('ai:model-trained', {
        trainingDataSize: energyData.length,
        timestamp: new Date(),
      }, 'AIInsightsFeature');
      
    } catch (error) {
      this.eventSystem.emit(EVENTS.ERROR_OCCURRED, {
        type: 'model-training-error',
        error: (error as Error).message,
      }, 'AIInsightsFeature');
    } finally {
      this.isTraining = false;
    }
  }

  private handleExternalUpdate(data: any): void {
    console.log('AI insights external update:', data);
  }

  // Public API methods
  public async generateInsight(prompt: string): Promise<AIInsight> {
    const insight: AIInsight = {
      id: `custom-insight-${Date.now()}`,
      timestamp: new Date(),
      type: 'recommendation',
      title: 'Custom Insight',
      content: `Based on your request "${prompt}", here's a personalized recommendation: Consider tracking this aspect more closely to gain better insights.`,
      confidence: 0.6,
      actionable: true,
      relatedData: ['custom'],
    };
    
    this.stateManager.addAIInsight(insight);
    this.eventSystem.emit(EVENTS.AI_INSIGHT_GENERATED, insight, 'AIInsightsFeature');
    
    return insight;
  }

  public getInsights(): AIInsight[] {
    return this.stateManager.getAIInsights();
  }

  public getInsightsByType(type: AIInsight['type']): AIInsight[] {
    return this.stateManager.getAIInsights().filter(insight => insight.type === type);
  }

  public async requestAnalysis(): Promise<void> {
    await this.performPeriodicAnalysis();
  }

  public clearInsights(): void {
    // Clear insights from state manager
    const state = this.stateManager.getState();
    state.aiInsights.length = 0;
    this.stateManager.subscribe(() => {}); // Trigger state update
  }

  public getFeatureStatus(): {
    isInitialized: boolean;
    modelLoaded: boolean;
    isTraining: boolean;
    totalInsights: number;
    lastAnalysis: Date | null;
    tensorflowBackend: string;
  } {
    return {
      isInitialized: this.isInitialized,
      modelLoaded: this.model !== null,
      isTraining: this.isTraining,
      totalInsights: this.stateManager.getAIInsights().length,
      lastAnalysis: new Date(),
      tensorflowBackend: tf.getBackend(),
    };
  }
}