import { 
  SocialInteraction, 
  InteractionType, 
  SocialContext, 
  RecoveryRecommendation
} from '../types';

// Social battery calculation utilities
export class SocialBatteryCalculator {
  
  // Calculate energy drain based on interaction
  static calculateEnergyDrain(interaction: SocialInteraction): number {
    const baseIntensity = interaction.intensity / 10; // normalize to 0-1
    const durationFactor = Math.min(interaction.duration / 60, 3); // max 3x for long interactions
    const peopleFactor = Math.min(interaction.peopleCount / 10, 2); // max 2x for large groups
    const enjoymentReduction = (11 - interaction.enjoyment) / 10; // less enjoyable = more draining
    
    // Context multipliers
    const contextMultiplier = this.getContextMultiplier(interaction.context);
    
    // Type-specific drain rates (base percentage points)
    const typeDrain = this.getTypeDrainRate(interaction.type);
    
    const totalDrain = typeDrain * baseIntensity * durationFactor * peopleFactor * enjoymentReduction * contextMultiplier;
    
    return Math.min(Math.max(totalDrain, 1), 50); // min 1%, max 50% drain per interaction
  }
  
  private static getContextMultiplier(context: SocialContext): number {
    switch (context) {
      case SocialContext.WORK: return 1.3;
      case SocialContext.PUBLIC: return 1.5;
      case SocialContext.PERSONAL: return 0.8;
      case SocialContext.INTIMATE: return 0.6;
      default: return 1.0;
    }
  }
  
  private static getTypeDrainRate(type: InteractionType): number {
    switch (type) {
      case InteractionType.WORK_MEETING: return 25;
      case InteractionType.PUBLIC_EVENT: return 30;
      case InteractionType.SOCIAL_GATHERING: return 20;
      case InteractionType.ONLINE_MEETING: return 15;
      case InteractionType.PHONE_CALL: return 10;
      case InteractionType.CLOSE_FRIENDS: return 8;
      case InteractionType.FAMILY_TIME: return 12;
      case InteractionType.SOLO_TIME: return -15; // recovery
      default: return 15;
    }
  }
  
  // Calculate recovery over time
  static calculateRecovery(
    currentLevel: number, 
    hoursElapsed: number, 
    baseRecoveryRate: number = 8 // % per hour
  ): number {
    const recovery = baseRecoveryRate * hoursElapsed;
    return Math.min(currentLevel + recovery, 100);
  }
  
  // Estimate recovery time to reach target level
  static estimateRecoveryTime(
    currentLevel: number, 
    targetLevel: number, 
    recoveryRate: number = 8
  ): number {
    if (currentLevel >= targetLevel) return 0;
    return Math.ceil((targetLevel - currentLevel) / recoveryRate);
  }
  
  // Calculate personal limits based on historical data
  static calculatePersonalLimits(interactions: SocialInteraction[]) {
    const recentInteractions = interactions.filter(
      i => Date.now() - i.timestamp.getTime() < 30 * 24 * 60 * 60 * 1000 // last 30 days
    );
    
    if (recentInteractions.length === 0) {
      return {
        dailyInteractionLimit: 240, // 4 hours default
        weeklyInteractionLimit: 1200, // 20 hours default
        recoveryTimeNeeded: 8, // 8 hours default
        optimalSocialLevel: 70 // 70% default
      };
    }
    
    // Calculate averages and patterns
    const dailyTotals = this.groupInteractionsByDay(recentInteractions);
    const averageDailyTime = dailyTotals.reduce((sum, day) => sum + day.totalTime, 0) / dailyTotals.length;
    
    return {
      dailyInteractionLimit: Math.ceil(averageDailyTime * 1.2), // 20% buffer
      weeklyInteractionLimit: Math.ceil(averageDailyTime * 7 * 1.1), // 10% buffer
      recoveryTimeNeeded: this.calculateAverageRecoveryTime(recentInteractions),
      optimalSocialLevel: this.calculateOptimalLevel(recentInteractions)
    };
  }
  
  private static groupInteractionsByDay(interactions: SocialInteraction[]) {
    const days = new Map<string, { totalTime: number, energyLevels: number[] }>();
    
    interactions.forEach(interaction => {
      const dayKey = interaction.timestamp.toDateString();
      if (!days.has(dayKey)) {
        days.set(dayKey, { totalTime: 0, energyLevels: [] });
      }
      const day = days.get(dayKey)!;
      day.totalTime += interaction.duration;
      day.energyLevels.push(interaction.energyAfter);
    });
    
    return Array.from(days.values());
  }
  
  private static calculateAverageRecoveryTime(interactions: SocialInteraction[]): number {
    // Simplified: assume 8-12 hours based on interaction intensity
    const avgIntensity = interactions.reduce((sum, i) => sum + i.intensity, 0) / interactions.length;
    return Math.ceil(6 + (avgIntensity / 10) * 6); // 6-12 hours based on intensity
  }
  
  private static calculateOptimalLevel(interactions: SocialInteraction[]): number {
    // Find the energy level that correlates with highest enjoyment
    const enjoymentByEnergyLevel = new Map<number, number[]>();
    
    interactions.forEach(interaction => {
      const energyRange = Math.floor(interaction.energyBefore / 10) * 10; // group by 10s
      if (!enjoymentByEnergyLevel.has(energyRange)) {
        enjoymentByEnergyLevel.set(energyRange, []);
      }
      enjoymentByEnergyLevel.get(energyRange)!.push(interaction.enjoyment);
    });
    
    let bestLevel = 70;
    let bestEnjoyment = 0;
    
    enjoymentByEnergyLevel.forEach((enjoyments, level) => {
      const avgEnjoyment = enjoyments.reduce((sum, e) => sum + e, 0) / enjoyments.length;
      if (avgEnjoyment > bestEnjoyment) {
        bestEnjoyment = avgEnjoyment;
        bestLevel = level + 5; // middle of range
      }
    });
    
    return bestLevel;
  }
}

// Recovery recommendation engine
export class RecoveryRecommendationEngine {
  
  static generateRecommendations(
    currentLevel: number,
    recentInteractions: SocialInteraction[],
    timeOfDay: number // 0-23
  ): RecoveryRecommendation[] {
    const recommendations: RecoveryRecommendation[] = [];
    
    if (currentLevel < 30) {
      recommendations.push(...this.getUrgentRecommendations(timeOfDay));
    } else if (currentLevel < 50) {
      recommendations.push(...this.getMediumPriorityRecommendations(timeOfDay));
    } else if (currentLevel < 70) {
      recommendations.push(...this.getLowPriorityRecommendations(timeOfDay));
    }
    
    // Add personalized recommendations based on history
    recommendations.push(...this.getPersonalizedRecommendations(recentInteractions));
    
    return recommendations.slice(0, 5); // limit to top 5
  }
  
  private static getUrgentRecommendations(timeOfDay: number): RecoveryRecommendation[] {
    const isEvening = timeOfDay >= 18;
    
    return [
      {
        id: 'urgent-solo-time',
        type: 'immediate',
        activity: 'Take immediate solo time',
        description: 'Find a quiet space for 15-30 minutes. No phones, no people.',
        estimatedBenefit: 15,
        duration: 20,
        priority: 'urgent'
      },
      {
        id: 'urgent-nature',
        type: 'immediate',
        activity: isEvening ? 'Evening walk alone' : 'Get some fresh air',
        description: 'Step outside for fresh air and natural light. Even 10 minutes helps.',
        estimatedBenefit: 12,
        duration: 15,
        priority: 'urgent'
      },
      {
        id: 'urgent-boundaries',
        type: 'immediate',
        activity: 'Set immediate boundaries',
        description: 'Politely decline any non-essential social interactions for the next 2 hours.',
        estimatedBenefit: 10,
        duration: 0,
        priority: 'urgent'
      }
    ];
  }
  
  private static getMediumPriorityRecommendations(timeOfDay: number): RecoveryRecommendation[] {
    return [
      {
        id: 'medium-creative-time',
        type: 'short_term',
        activity: 'Engage in solo creative activity',
        description: 'Draw, write, or work on a personal project for 30 minutes.',
        estimatedBenefit: 20,
        duration: 30,
        priority: 'high'
      },
      {
        id: 'medium-mindfulness',
        type: 'immediate',
        activity: 'Practice mindfulness',
        description: 'Try a 10-minute guided meditation or breathing exercise.',
        estimatedBenefit: 15,
        duration: 10,
        priority: 'medium'
      }
    ];
  }
  
  private static getLowPriorityRecommendations(timeOfDay: number): RecoveryRecommendation[] {
    return [
      {
        id: 'low-hobby',
        type: 'short_term',
        activity: 'Pursue a hobby',
        description: 'Spend time on an activity you enjoy doing alone.',
        estimatedBenefit: 10,
        duration: 45,
        priority: 'medium'
      },
      {
        id: 'low-organize',
        type: 'short_term',
        activity: 'Organize your space',
        description: 'Tidy up your environment while listening to calming music.',
        estimatedBenefit: 8,
        duration: 30,
        priority: 'low'
      }
    ];
  }
  
  private static getPersonalizedRecommendations(interactions: SocialInteraction[]): RecoveryRecommendation[] {
    // Analyze what recovery activities worked best in the past
    // This is a simplified version - in a real app, you'd track recovery effectiveness
    return [
      {
        id: 'personal-effective',
        type: 'short_term',
        activity: 'Your most effective recovery method',
        description: 'Based on your history, solo creative time works best for you.',
        estimatedBenefit: 25,
        duration: 45,
        priority: 'high'
      }
    ];
  }
}

// Date and time utilities
export class DateUtils {
  static getStartOfWeek(date: Date = new Date()): Date {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
  }
  
  static getStartOfDay(date: Date = new Date()): Date {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    return startOfDay;
  }
  
  static formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }
  
  static getTimeUntil(targetDate: Date): string {
    const now = new Date();
    const diff = targetDate.getTime() - now.getTime();
    
    if (diff <= 0) return 'Now';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours === 0) return `${minutes}m`;
    return `${hours}h ${minutes}m`;
  }
}