// Social Battery Feature - Social interaction energy management
import { EventSystem, EVENTS } from '@/core/EventSystem';
import { StateManager } from '@/core/StateManager';
import type { SocialBatteryEntry } from '@/shared/types';

export class SocialBatteryFeature {
  private static instance: SocialBatteryFeature;
  private eventSystem: EventSystem;
  private stateManager: StateManager;
  private isInitialized = false;

  private constructor() {
    this.eventSystem = EventSystem.getInstance();
    this.stateManager = StateManager.getInstance();
  }

  public static getInstance(): SocialBatteryFeature {
    if (!SocialBatteryFeature.instance) {
      SocialBatteryFeature.instance = new SocialBatteryFeature();
    }
    return SocialBatteryFeature.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Set up event listeners
      this.setupEventListeners();
      
      // Initialize social battery database
      await this.initializeDatabase();
      
      // Set up social battery monitoring
      this.setupSocialBatteryMonitoring();
      
      this.isInitialized = true;
      this.eventSystem.emit('feature:social-battery-ready', {}, 'SocialBatteryFeature');
      
    } catch (error) {
      this.eventSystem.emit(EVENTS.ERROR_OCCURRED, {
        type: 'social-battery-initialization-error',
        error: (error as Error).message,
      }, 'SocialBatteryFeature');
      throw error;
    }
  }

  private setupEventListeners(): void {
    // Listen for social battery logging requests
    this.eventSystem.subscribe(EVENTS.SOCIAL_BATTERY_LOGGED, (payload) => {
      this.handleSocialBatteryLogged(payload.data);
    });

    // Listen for social battery updates
    this.eventSystem.subscribe(EVENTS.SOCIAL_BATTERY_UPDATED, (payload) => {
      this.handleSocialBatteryUpdated(payload.data);
    });

    // Listen for external updates from other features
    this.eventSystem.subscribe('social-battery:external-update', (payload) => {
      this.handleExternalUpdate(payload.data);
    });

    // Listen for energy changes to correlate with social patterns
    this.eventSystem.subscribe(EVENTS.ENERGY_LOGGED, (payload) => {
      this.correlateSocialAndEnergyData(payload.data);
    });
  }

  private async initializeDatabase(): Promise<void> {
    // In a real app, this would set up IndexedDB for offline storage
    console.log('Social battery database initialized');
  }

  private setupSocialBatteryMonitoring(): void {
    // Set up automatic social battery level detection based on calendar events, etc.
    // For now, we'll just monitor for patterns
    this.startPatternAnalysis();
  }

  private startPatternAnalysis(): void {
    // Analyze social patterns every hour
    setInterval(() => {
      this.analyzeSocialPatterns();
    }, 60 * 60 * 1000);
  }

  private analyzeSocialPatterns(): void {
    const recentEntries = this.getRecentSocialBatteryEntries(7);
    
    if (recentEntries.length < 3) return;

    // Detect patterns in social battery drain and recharge
    const patterns = this.detectSocialPatterns(recentEntries);
    
    if (patterns.length > 0) {
      this.eventSystem.emit('social:patterns-detected', {
        patterns,
        recommendation: this.generateSocialRecommendations(patterns),
      }, 'SocialBatteryFeature');
    }
  }

  private detectSocialPatterns(entries: SocialBatteryEntry[]): Array<{
    type: 'drain' | 'recharge';
    interactionType: SocialBatteryEntry['interactionType'];
    averageLevel: number;
    frequency: number;
  }> {
    const patterns: Map<string, { levels: number[], count: number }> = new Map();

    entries.forEach(entry => {
      const key = `${entry.interactionType}`;
      if (!patterns.has(key)) {
        patterns.set(key, { levels: [], count: 0 });
      }
      const pattern = patterns.get(key)!;
      pattern.levels.push(entry.level);
      pattern.count++;
    });

    return Array.from(patterns.entries()).map(([key, data]) => {
      const averageLevel = data.levels.reduce((sum, level) => sum + level, 0) / data.levels.length;
      return {
        type: averageLevel < 5 ? 'drain' as const : 'recharge' as const,
        interactionType: key as SocialBatteryEntry['interactionType'],
        averageLevel,
        frequency: data.count,
      };
    });
  }

  private generateSocialRecommendations(patterns: Array<{
    type: 'drain' | 'recharge';
    interactionType: SocialBatteryEntry['interactionType'];
    averageLevel: number;
    frequency: number;
  }>): string[] {
    const recommendations: string[] = [];

    patterns.forEach(pattern => {
      if (pattern.type === 'drain' && pattern.frequency > 2) {
        switch (pattern.interactionType) {
          case 'large-group':
            recommendations.push('Consider limiting large group interactions when your social battery is low');
            break;
          case 'public':
            recommendations.push('Schedule recovery time after public speaking or presentations');
            break;
          case 'small-group':
            recommendations.push('Try shorter small group sessions to preserve social energy');
            break;
        }
      } else if (pattern.type === 'recharge') {
        switch (pattern.interactionType) {
          case 'solo':
            recommendations.push('Continue prioritizing solo time - it\'s effectively recharging your social battery');
            break;
          case 'small-group':
            recommendations.push('Small group interactions seem to energize you - consider more of these');
            break;
        }
      }
    });

    return recommendations;
  }

  private handleSocialBatteryLogged(socialData: SocialBatteryEntry): void {
    try {
      // Validate social battery data
      this.validateSocialBatteryData(socialData);
      
      // Add to state manager
      this.stateManager.addSocialBatteryEntry(socialData);
      
      // Emit success event
      this.eventSystem.emit('social:logged-success', {
        social: socialData,
        message: 'Social battery level logged successfully',
      }, 'SocialBatteryFeature');
      
      // Check for social battery warnings
      this.checkSocialBatteryWarnings(socialData);
      
      // Trigger insights analysis
      this.triggerInsightsAnalysis(socialData);
      
    } catch (error) {
      this.eventSystem.emit(EVENTS.ERROR_OCCURRED, {
        type: 'social-battery-logging-error',
        error: (error as Error).message,
        data: socialData,
      }, 'SocialBatteryFeature');
    }
  }

  private handleSocialBatteryUpdated(socialData: SocialBatteryEntry): void {
    try {
      this.validateSocialBatteryData(socialData);
      // Note: StateManager doesn't have updateSocialBatteryEntry method yet
      // For now, we'll emit an event for future implementation
      this.eventSystem.emit('social:update-requested', socialData, 'SocialBatteryFeature');
      
    } catch (error) {
      this.eventSystem.emit(EVENTS.ERROR_OCCURRED, {
        type: 'social-battery-update-error',
        error: (error as Error).message,
        data: socialData,
      }, 'SocialBatteryFeature');
    }
  }

  private handleExternalUpdate(data: any): void {
    // Handle updates from other features
    console.log('External update received:', data);
  }

  private correlateSocialAndEnergyData(energyData: any): void {
    // Correlate energy levels with recent social interactions
    const recentSocial = this.getRecentSocialBatteryEntries(1);
    
    if (recentSocial.length > 0) {
      const correlation = this.calculateSocialEnergyCorrelation(energyData, recentSocial[0]);
      
      if (Math.abs(correlation) > 0.3) { // Significant correlation
        this.eventSystem.emit('social:energy-correlation-detected', {
          energyData,
          socialData: recentSocial[0],
          correlation,
        }, 'SocialBatteryFeature');
      }
    }
  }

  private calculateSocialEnergyCorrelation(energyData: any, socialData: SocialBatteryEntry): number {
    // Simple correlation calculation between social battery and energy levels
    // In a real app, this would be more sophisticated
    const energyLevel = energyData.level;
    const socialLevel = socialData.level;
    
    // Normalize to -1 to 1 scale
    const normalizedEnergy = (energyLevel - 5.5) / 4.5;
    const normalizedSocial = (socialLevel - 5.5) / 4.5;
    
    return normalizedEnergy * normalizedSocial;
  }

  private checkSocialBatteryWarnings(socialData: SocialBatteryEntry): void {
    if (socialData.level <= 2) {
      this.eventSystem.emit('social:low-battery-warning', {
        level: socialData.level,
        message: 'Your social battery is critically low. Consider some alone time to recharge.',
        recommendations: [
          'Take a break from social interactions',
          'Find a quiet space to decompress',
          'Engage in solo activities you enjoy',
          'Practice deep breathing or meditation'
        ],
      }, 'SocialBatteryFeature');
    } else if (socialData.level <= 4) {
      this.eventSystem.emit('social:moderate-battery-warning', {
        level: socialData.level,
        message: 'Your social battery is running low. Plan some recovery time.',
        recommendations: [
          'Limit new social commitments',
          'Choose smaller, more intimate gatherings',
          'Schedule downtime after social events'
        ],
      }, 'SocialBatteryFeature');
    }
  }

  private validateSocialBatteryData(socialData: SocialBatteryEntry): void {
    if (!socialData.id) {
      throw new Error('Social battery entry must have an ID');
    }
    
    if (!socialData.timestamp || !(socialData.timestamp instanceof Date)) {
      throw new Error('Social battery entry must have a valid timestamp');
    }
    
    if (typeof socialData.level !== 'number' || socialData.level < 1 || socialData.level > 10) {
      throw new Error('Social battery level must be a number between 1 and 10');
    }
    
    if (!['solo', 'small-group', 'large-group', 'public'].includes(socialData.interactionType)) {
      throw new Error('Interaction type must be solo, small-group, large-group, or public');
    }
  }

  private triggerInsightsAnalysis(socialData: SocialBatteryEntry): void {
    // Trigger AI analysis of social patterns
    this.eventSystem.emit('ai:analyze-social-pattern', {
      newEntry: socialData,
      recentEntries: this.getRecentSocialBatteryEntries(7),
    }, 'SocialBatteryFeature');
  }

  // Public API methods
  public logSocialBattery(socialData: Omit<SocialBatteryEntry, 'id' | 'timestamp'>): void {
    const entry: SocialBatteryEntry = {
      id: `social-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...socialData,
    };
    
    this.eventSystem.emit(EVENTS.SOCIAL_BATTERY_LOGGED, entry, 'SocialBatteryFeature');
  }

  public updateSocialBattery(socialData: SocialBatteryEntry): void {
    this.eventSystem.emit(EVENTS.SOCIAL_BATTERY_UPDATED, socialData, 'SocialBatteryFeature');
  }

  public getSocialBatteryHistory(): SocialBatteryEntry[] {
    return this.stateManager.getSocialBatteryData();
  }

  public getSocialBatteryByDateRange(startDate: Date, endDate: Date): SocialBatteryEntry[] {
    return this.stateManager.getSocialBatteryDataByDateRange(startDate, endDate);
  }

  public getRecentSocialBatteryEntries(days: number): SocialBatteryEntry[] {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));
    return this.getSocialBatteryByDateRange(startDate, endDate);
  }

  public getLastSocialBatteryEntry(): SocialBatteryEntry | null {
    const socialData = this.stateManager.getSocialBatteryData();
    if (socialData.length === 0) return null;
    
    return socialData.reduce((latest, current) => 
      current.timestamp > latest.timestamp ? current : latest
    );
  }

  public getAverageSocialBatteryLevel(interactionType?: SocialBatteryEntry['interactionType']): number {
    const socialData = this.stateManager.getSocialBatteryData();
    const filteredData = interactionType ? 
      socialData.filter(s => s.interactionType === interactionType) : socialData;
    
    if (filteredData.length === 0) return 0;
    
    const sum = filteredData.reduce((total, entry) => total + entry.level, 0);
    return sum / filteredData.length;
  }

  public getSocialBatteryTrends(days: number = 30): {
    interactionType: SocialBatteryEntry['interactionType'];
    trend: 'improving' | 'declining' | 'stable';
    change: number;
    frequency: number;
  }[] {
    const recentData = this.getRecentSocialBatteryEntries(days);
    const types: SocialBatteryEntry['interactionType'][] = ['solo', 'small-group', 'large-group', 'public'];
    
    return types.map(type => {
      const typeData = recentData.filter(s => s.interactionType === type);
      
      if (typeData.length < 2) {
        return { interactionType: type, trend: 'stable', change: 0, frequency: typeData.length };
      }
      
      // Calculate trend
      const midpoint = Math.floor(typeData.length / 2);
      const firstHalf = typeData.slice(0, midpoint);
      const secondHalf = typeData.slice(midpoint);
      
      const firstAvg = firstHalf.reduce((sum, s) => sum + s.level, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, s) => sum + s.level, 0) / secondHalf.length;
      
      const change = secondAvg - firstAvg;
      const trend = Math.abs(change) < 0.5 ? 'stable' : 
                   change > 0 ? 'improving' : 'declining';
      
      return { interactionType: type, trend, change, frequency: typeData.length };
    });
  }

  public getSocialBatteryInsights(): {
    mostDraining: SocialBatteryEntry['interactionType'] | null;
    mostRecharging: SocialBatteryEntry['interactionType'] | null;
    optimalLevel: number;
    averageRecoveryTime: number; // in hours
  } {
    const socialData = this.stateManager.getSocialBatteryData();
    
    if (socialData.length === 0) {
      return {
        mostDraining: null,
        mostRecharging: null,
        optimalLevel: 0,
        averageRecoveryTime: 0,
      };
    }

    // Calculate averages by interaction type
    const typeAverages = new Map<SocialBatteryEntry['interactionType'], number>();
    const typeCounts = new Map<SocialBatteryEntry['interactionType'], number>();
    
    socialData.forEach(entry => {
      const current = typeAverages.get(entry.interactionType) || 0;
      const count = typeCounts.get(entry.interactionType) || 0;
      
      typeAverages.set(entry.interactionType, current + entry.level);
      typeCounts.set(entry.interactionType, count + 1);
    });

    // Calculate final averages
    typeAverages.forEach((total, type) => {
      const count = typeCounts.get(type) || 1;
      typeAverages.set(type, total / count);
    });

    // Find most draining and recharging
    let mostDraining: SocialBatteryEntry['interactionType'] | null = null;
    let mostRecharging: SocialBatteryEntry['interactionType'] | null = null;
    let lowestAverage = 10;
    let highestAverage = 0;

    typeAverages.forEach((average, type) => {
      if (average < lowestAverage) {
        lowestAverage = average;
        mostDraining = type;
      }
      if (average > highestAverage) {
        highestAverage = average;
        mostRecharging = type;
      }
    });

    // Calculate optimal level (overall average)
    const optimalLevel = socialData.reduce((sum, entry) => sum + entry.level, 0) / socialData.length;

    // Calculate average recovery time (simplified)
    const averageRecoveryTime = 2; // Placeholder - would need more complex calculation

    return {
      mostDraining,
      mostRecharging,
      optimalLevel,
      averageRecoveryTime,
    };
  }

  public exportSocialBatteryData(): string {
    const socialData = this.stateManager.getSocialBatteryData();
    return JSON.stringify(socialData, null, 2);
  }

  public importSocialBatteryData(jsonData: string): void {
    try {
      const socialEntries: SocialBatteryEntry[] = JSON.parse(jsonData);
      
      socialEntries.forEach(entry => {
        entry.timestamp = new Date(entry.timestamp);
        this.validateSocialBatteryData(entry);
        this.stateManager.addSocialBatteryEntry(entry);
      });
      
      this.eventSystem.emit('social:import-success', {
        count: socialEntries.length,
        message: `Successfully imported ${socialEntries.length} social battery entries`,
      }, 'SocialBatteryFeature');
      
    } catch (error) {
      this.eventSystem.emit(EVENTS.ERROR_OCCURRED, {
        type: 'social-battery-import-error',
        error: (error as Error).message,
      }, 'SocialBatteryFeature');
    }
  }

  public getFeatureStatus(): {
    isInitialized: boolean;
    totalEntries: number;
    lastEntry: Date | null;
    averageLevel: number;
    currentTrend: 'improving' | 'declining' | 'stable';
  } {
    const socialData = this.stateManager.getSocialBatteryData();
    const lastEntry = this.getLastSocialBatteryEntry();
    
    // Calculate current trend (last 7 days vs previous 7 days)
    const recent = this.getRecentSocialBatteryEntries(7);
    const previous = this.getSocialBatteryByDateRange(
      new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );
    
    let currentTrend: 'improving' | 'declining' | 'stable' = 'stable';
    
    if (recent.length > 0 && previous.length > 0) {
      const recentAvg = recent.reduce((sum, e) => sum + e.level, 0) / recent.length;
      const previousAvg = previous.reduce((sum, e) => sum + e.level, 0) / previous.length;
      const change = recentAvg - previousAvg;
      
      currentTrend = Math.abs(change) < 0.5 ? 'stable' : 
                   change > 0 ? 'improving' : 'declining';
    }
    
    return {
      isInitialized: this.isInitialized,
      totalEntries: socialData.length,
      lastEntry: lastEntry ? lastEntry.timestamp : null,
      averageLevel: this.getAverageSocialBatteryLevel(),
      currentTrend,
    };
  }
}