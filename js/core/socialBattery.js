// Social Battery management system
import StorageManager from '../utils/storage.js';

class SocialBattery {
  constructor() {
    this.storage = new StorageManager();
    this.currentLevel = this.storage.getLocalData('socialBatteryLevel', 60);
    this.socialHistory = [];
    this.listeners = [];
    this.interactionTypes = {
      'small_talk': { drain: 5, recovery: 0 },
      'deep_conversation': { drain: 15, recovery: 5 },
      'meeting': { drain: 20, recovery: 0 },
      'presentation': { drain: 30, recovery: 0 },
      'social_event': { drain: 25, recovery: 10 },
      'family_time': { drain: 10, recovery: 15 },
      'alone_time': { drain: 0, recovery: 20 },
      'creative_work': { drain: 5, recovery: 10 },
      'meditation': { drain: 0, recovery: 15 }
    };
    this.init();
  }

  async init() {
    await this.loadHistory();
    this.startTracking();
  }

  async loadHistory() {
    this.socialHistory = await this.storage.getSocialHistory(30);
  }

  // Social battery level management
  setSocialLevel(level, source = 'manual') {
    const previousLevel = this.currentLevel;
    this.currentLevel = Math.max(0, Math.min(100, level));
    
    const socialData = {
      level: this.currentLevel,
      previousLevel,
      change: this.currentLevel - previousLevel,
      source,
      context: this.getSocialContext(),
      peopleCount: this.storage.getLocalData('currentPeopleCount', 0),
      environment: this.storage.getLocalData('currentEnvironment', 'unknown'),
      energyLevel: this.storage.getLocalData('currentEnergy', 75)
    };

    this.storage.storeSocialData(socialData);
    this.storage.setLocalData('socialBatteryLevel', this.currentLevel);
    this.notifyListeners('socialLevelChanged', socialData);
    
    return socialData;
  }

  getCurrentLevel() {
    return this.currentLevel;
  }

  // Social interaction tracking
  recordInteraction(type, duration, peopleCount, environment = 'unknown', notes = '') {
    const interactionData = this.interactionTypes[type] || { drain: 10, recovery: 0 };
    
    // Calculate actual drain/recovery based on multiple factors
    const durationMultiplier = Math.max(0.5, Math.min(3, duration / 60)); // Duration in minutes
    const peopleMultiplier = Math.max(1, Math.log10(peopleCount + 1) * 2);
    const environmentMultiplier = this.getEnvironmentMultiplier(environment);
    const energyMultiplier = this.getEnergyMultiplier();

    const actualDrain = interactionData.drain * durationMultiplier * peopleMultiplier * environmentMultiplier * energyMultiplier;
    const actualRecovery = interactionData.recovery * durationMultiplier;

    const netChange = actualRecovery - actualDrain;

    const interaction = {
      type,
      duration,
      peopleCount,
      environment,
      notes,
      plannedDrain: interactionData.drain,
      actualDrain,
      plannedRecovery: interactionData.recovery,
      actualRecovery,
      netChange,
      timestamp: Date.now(),
      beforeLevel: this.currentLevel
    };

    this.setSocialLevel(this.currentLevel + netChange, 'interaction');
    interaction.afterLevel = this.currentLevel;
    
    this.notifyListeners('socialInteraction', interaction);
    return interaction;
  }

  getEnvironmentMultiplier(environment) {
    const multipliers = {
      'home': 0.7,
      'familiar_place': 0.8,
      'office': 1.0,
      'cafe': 1.1,
      'restaurant': 1.2,
      'party': 1.5,
      'conference': 1.4,
      'unknown': 1.0
    };
    return multipliers[environment] || 1.0;
  }

  getEnergyMultiplier() {
    const currentEnergy = this.storage.getLocalData('currentEnergy', 75);
    if (currentEnergy >= 80) return 0.8; // High energy = less social drain
    if (currentEnergy >= 60) return 1.0; // Normal energy
    if (currentEnergy >= 40) return 1.2; // Low energy = more social drain
    return 1.5; // Very low energy = much more social drain
  }

  // Social recovery activities
  recordRecovery(activity, duration, effectiveness = 1.0) {
    const baseRecovery = this.interactionTypes[activity]?.recovery || 10;
    const actualRecovery = baseRecovery * (duration / 60) * effectiveness;

    const recovery = {
      activity,
      duration,
      effectiveness,
      baseRecovery,
      actualRecovery,
      timestamp: Date.now(),
      beforeLevel: this.currentLevel
    };

    this.setSocialLevel(this.currentLevel + actualRecovery, 'recovery');
    recovery.afterLevel = this.currentLevel;
    
    this.notifyListeners('socialRecovery', recovery);
    return recovery;
  }

  // Social battery predictions
  predictDrainForActivity(type, duration, peopleCount, environment = 'unknown') {
    const interactionData = this.interactionTypes[type] || { drain: 10, recovery: 0 };
    
    const durationMultiplier = Math.max(0.5, Math.min(3, duration / 60));
    const peopleMultiplier = Math.max(1, Math.log10(peopleCount + 1) * 2);
    const environmentMultiplier = this.getEnvironmentMultiplier(environment);
    const energyMultiplier = this.getEnergyMultiplier();

    const predictedDrain = interactionData.drain * durationMultiplier * peopleMultiplier * environmentMultiplier * energyMultiplier;
    const predictedRecovery = interactionData.recovery * durationMultiplier;
    const netChange = predictedRecovery - predictedDrain;

    return {
      predictedDrain,
      predictedRecovery,
      netChange,
      resultingLevel: Math.max(0, Math.min(100, this.currentLevel + netChange)),
      recommendation: this.getRecommendationForPrediction(this.currentLevel + netChange)
    };
  }

  getRecommendationForPrediction(resultingLevel) {
    if (resultingLevel >= 70) return 'go_ahead';
    if (resultingLevel >= 40) return 'proceed_with_caution';
    if (resultingLevel >= 20) return 'consider_shorter_duration';
    return 'recommend_decline';
  }

  // Social patterns and analytics
  getSocialPatterns() {
    if (this.socialHistory.length < 7) return null;

    return {
      dailyAverage: this.calculateSocialDailyAverage(),
      interactionPatterns: this.calculateInteractionPatterns(),
      recoveryPatterns: this.calculateSocialRecoveryPatterns(),
      optimalInteractionTimes: this.calculateOptimalTimes(),
      socialEnergyCorrelation: this.calculateEnergyCorrelation()
    };
  }

  calculateSocialDailyAverage() {
    const dailyData = {};
    
    this.socialHistory.forEach(entry => {
      const date = entry.date;
      if (!dailyData[date]) {
        dailyData[date] = { levels: [], interactions: 0, total: 0, count: 0 };
      }
      dailyData[date].levels.push(entry.level);
      dailyData[date].total += entry.level;
      dailyData[date].count += 1;
      if (entry.source === 'interaction') {
        dailyData[date].interactions += 1;
      }
    });

    return Object.keys(dailyData).map(date => ({
      date,
      average: dailyData[date].total / dailyData[date].count,
      interactions: dailyData[date].interactions,
      min: Math.min(...dailyData[date].levels),
      max: Math.max(...dailyData[date].levels)
    }));
  }

  calculateInteractionPatterns() {
    const interactions = this.socialHistory.filter(entry => entry.source === 'interaction');
    
    if (interactions.length === 0) return null;

    const typeStats = {};
    const environmentStats = {};
    const timeStats = {};

    interactions.forEach(interaction => {
      // Type analysis
      const type = interaction.type || 'unknown';
      if (!typeStats[type]) {
        typeStats[type] = { count: 0, totalDrain: 0, totalDuration: 0 };
      }
      typeStats[type].count += 1;
      typeStats[type].totalDrain += Math.abs(interaction.change);
      
      // Environment analysis
      const env = interaction.environment || 'unknown';
      if (!environmentStats[env]) {
        environmentStats[env] = { count: 0, totalDrain: 0 };
      }
      environmentStats[env].count += 1;
      environmentStats[env].totalDrain += Math.abs(interaction.change);
      
      // Time analysis
      const hour = new Date(interaction.timestamp).getHours();
      if (!timeStats[hour]) {
        timeStats[hour] = { count: 0, totalDrain: 0 };
      }
      timeStats[hour].count += 1;
      timeStats[hour].totalDrain += Math.abs(interaction.change);
    });

    return {
      mostDrainingType: this.findMostDraining(typeStats),
      preferredEnvironment: this.findLeastDraining(environmentStats),
      peakInteractionHours: this.findPeakHours(timeStats)
    };
  }

  calculateSocialRecoveryPatterns() {
    const recoveries = this.socialHistory.filter(entry => 
      entry.source === 'recovery' && entry.change > 0
    );

    if (recoveries.length === 0) return null;

    return {
      averageRecovery: recoveries.reduce((sum, r) => sum + r.change, 0) / recoveries.length,
      bestRecoveryActivity: this.findMostEffectiveSocialRecovery(recoveries),
      recoveryFrequency: recoveries.length / this.socialHistory.length
    };
  }

  calculateOptimalTimes() {
    const hourlyData = {};
    
    this.socialHistory.forEach(entry => {
      const hour = new Date(entry.timestamp).getHours();
      if (!hourlyData[hour]) {
        hourlyData[hour] = { levels: [], count: 0 };
      }
      hourlyData[hour].levels.push(entry.level);
      hourlyData[hour].count += 1;
    });

    return Object.keys(hourlyData)
      .map(hour => ({
        hour: parseInt(hour),
        averageLevel: hourlyData[hour].levels.reduce((sum, level) => sum + level, 0) / hourlyData[hour].levels.length,
        count: hourlyData[hour].count
      }))
      .sort((a, b) => b.averageLevel - a.averageLevel)
      .slice(0, 5); // Top 5 optimal hours
  }

  calculateEnergyCorrelation() {
    const correlationData = this.socialHistory.filter(entry => 
      entry.energyLevel !== undefined
    );

    if (correlationData.length < 10) return null;

    const correlation = this.calculateCorrelation(
      correlationData.map(entry => entry.level),
      correlationData.map(entry => entry.energyLevel)
    );

    return {
      correlation,
      strength: Math.abs(correlation) > 0.7 ? 'strong' : Math.abs(correlation) > 0.4 ? 'moderate' : 'weak',
      direction: correlation > 0 ? 'positive' : 'negative'
    };
  }

  calculateCorrelation(x, y) {
    const n = x.length;
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
    const sumY2 = y.reduce((sum, val) => sum + val * val, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  findMostDraining(stats) {
    let mostDraining = null;
    let highestDrain = 0;

    Object.keys(stats).forEach(key => {
      const avgDrain = stats[key].totalDrain / stats[key].count;
      if (avgDrain > highestDrain) {
        highestDrain = avgDrain;
        mostDraining = key;
      }
    });

    return { type: mostDraining, averageDrain: highestDrain };
  }

  findLeastDraining(stats) {
    let leastDraining = null;
    let lowestDrain = Infinity;

    Object.keys(stats).forEach(key => {
      const avgDrain = stats[key].totalDrain / stats[key].count;
      if (avgDrain < lowestDrain) {
        lowestDrain = avgDrain;
        leastDraining = key;
      }
    });

    return { environment: leastDraining, averageDrain: lowestDrain };
  }

  findPeakHours(timeStats) {
    return Object.keys(timeStats)
      .map(hour => ({
        hour: parseInt(hour),
        count: timeStats[hour].count,
        averageDrain: timeStats[hour].totalDrain / timeStats[hour].count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }

  findMostEffectiveSocialRecovery(recoveries) {
    const activityMap = {};
    
    recoveries.forEach(recovery => {
      const activity = recovery.activity;
      if (!activityMap[activity]) {
        activityMap[activity] = { total: 0, count: 0 };
      }
      activityMap[activity].total += recovery.change;
      activityMap[activity].count += 1;
    });

    let bestActivity = null;
    let bestAverage = 0;

    Object.keys(activityMap).forEach(activity => {
      const average = activityMap[activity].total / activityMap[activity].count;
      if (average > bestAverage) {
        bestAverage = average;
        bestActivity = activity;
      }
    });

    return { activity: bestActivity, averageEffect: bestAverage };
  }

  getSocialContext() {
    const now = new Date();
    return {
      hour: now.getHours(),
      dayOfWeek: now.getDay(),
      isWeekend: now.getDay() === 0 || now.getDay() === 6,
      timeOfDay: this.getTimeOfDay(now.getHours())
    };
  }

  getTimeOfDay(hour) {
    if (hour < 6) return 'early_morning';
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  }

  startTracking() {
    // Track natural social battery recovery during alone time
    setInterval(() => {
      this.trackNaturalRecovery();
    }, 60 * 60 * 1000); // Every hour
  }

  trackNaturalRecovery() {
    const currentPeopleCount = this.storage.getLocalData('currentPeopleCount', 0);
    
    if (currentPeopleCount === 0 && this.currentLevel < 90) {
      // Natural recovery when alone
      this.setSocialLevel(this.currentLevel + 2, 'natural_recovery');
    }
  }

  // Event listeners
  addEventListener(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  removeEventListener(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  notifyListeners(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  // Export data for AI training
  exportTrainingData() {
    return {
      socialHistory: this.socialHistory,
      patterns: this.getSocialPatterns(),
      currentLevel: this.currentLevel,
      interactionTypes: this.interactionTypes
    };
  }
}

export default SocialBattery;