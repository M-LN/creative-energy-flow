// Core energy tracking system
import StorageManager from '../utils/storage.js';

class EnergyTracker {
  constructor() {
    this.storage = new StorageManager();
    this.currentEnergy = this.storage.getLocalData('currentEnergy', 75);
    this.energyHistory = [];
    this.listeners = [];
    this.init();
  }

  async init() {
    await this.loadHistory();
    this.startTracking();
  }

  async loadHistory() {
    this.energyHistory = await this.storage.getEnergyHistory(30);
  }

  // Energy level management
  setEnergyLevel(level, source = 'manual') {
    const previousLevel = this.currentEnergy;
    this.currentEnergy = Math.max(0, Math.min(100, level));
    
    const energyData = {
      level: this.currentEnergy,
      previousLevel,
      change: this.currentEnergy - previousLevel,
      source,
      context: this.getCurrentContext(),
      mood: this.storage.getLocalData('currentMood', 'neutral'),
      stress: this.storage.getLocalData('currentStress', 3),
      sleep: this.storage.getLocalData('lastSleepQuality', 7)
    };

    this.storage.storeEnergyData(energyData);
    this.storage.setLocalData('currentEnergy', this.currentEnergy);
    this.notifyListeners('energyChanged', energyData);
    
    return energyData;
  }

  getCurrentEnergy() {
    return this.currentEnergy;
  }

  // Energy consumption tracking
  consumeEnergy(amount, activity, type = 'task') {
    const consumption = {
      amount,
      activity,
      type,
      timestamp: Date.now(),
      beforeLevel: this.currentEnergy
    };

    this.setEnergyLevel(this.currentEnergy - amount, 'consumption');
    consumption.afterLevel = this.currentEnergy;
    
    this.notifyListeners('energyConsumed', consumption);
    return consumption;
  }

  // Energy restoration tracking
  restoreEnergy(amount, activity, type = 'break') {
    const restoration = {
      amount,
      activity,
      type,
      timestamp: Date.now(),
      beforeLevel: this.currentEnergy
    };

    this.setEnergyLevel(this.currentEnergy + amount, 'restoration');
    restoration.afterLevel = this.currentEnergy;
    
    this.notifyListeners('energyRestored', restoration);
    return restoration;
  }

  // Energy patterns and analytics
  getEnergyPatterns() {
    if (this.energyHistory.length < 7) return null;

    const patterns = {
      dailyAverage: this.calculateDailyAverage(),
      weeklyTrend: this.calculateWeeklyTrend(),
      timeOfDayPatterns: this.calculateTimePatterns(),
      recoveryPatterns: this.calculateRecoveryPatterns(),
      drainPatterns: this.calculateDrainPatterns()
    };

    return patterns;
  }

  calculateDailyAverage() {
    const dailyData = {};
    
    this.energyHistory.forEach(entry => {
      const date = entry.date;
      if (!dailyData[date]) {
        dailyData[date] = { levels: [], total: 0, count: 0 };
      }
      dailyData[date].levels.push(entry.level);
      dailyData[date].total += entry.level;
      dailyData[date].count += 1;
    });

    const dailyAverages = Object.keys(dailyData).map(date => ({
      date,
      average: dailyData[date].total / dailyData[date].count,
      min: Math.min(...dailyData[date].levels),
      max: Math.max(...dailyData[date].levels),
      variance: this.calculateVariance(dailyData[date].levels)
    }));

    return dailyAverages;
  }

  calculateWeeklyTrend() {
    const dailyAverages = this.calculateDailyAverage();
    if (dailyAverages.length < 7) return null;

    const recent7Days = dailyAverages.slice(-7);
    const earlier7Days = dailyAverages.slice(-14, -7);

    if (earlier7Days.length === 0) return null;

    const recentAvg = recent7Days.reduce((sum, day) => sum + day.average, 0) / recent7Days.length;
    const earlierAvg = earlier7Days.reduce((sum, day) => sum + day.average, 0) / earlier7Days.length;

    return {
      currentWeekAverage: recentAvg,
      previousWeekAverage: earlierAvg,
      trend: recentAvg - earlierAvg,
      trendDirection: recentAvg > earlierAvg ? 'improving' : 'declining'
    };
  }

  calculateTimePatterns() {
    const hourlyData = {};
    
    this.energyHistory.forEach(entry => {
      const hour = new Date(entry.timestamp).getHours();
      if (!hourlyData[hour]) {
        hourlyData[hour] = { levels: [], total: 0, count: 0 };
      }
      hourlyData[hour].levels.push(entry.level);
      hourlyData[hour].total += entry.level;
      hourlyData[hour].count += 1;
    });

    return Object.keys(hourlyData).map(hour => ({
      hour: parseInt(hour),
      average: hourlyData[hour].total / hourlyData[hour].count,
      count: hourlyData[hour].count
    })).sort((a, b) => a.hour - b.hour);
  }

  calculateRecoveryPatterns() {
    const recoveries = this.energyHistory.filter(entry => 
      entry.source === 'restoration' && entry.change > 0
    );

    if (recoveries.length === 0) return null;

    return {
      averageRecovery: recoveries.reduce((sum, r) => sum + r.change, 0) / recoveries.length,
      bestRecoveryActivity: this.findMostEffectiveActivity(recoveries, 'activity'),
      recoveryFrequency: recoveries.length / this.energyHistory.length
    };
  }

  calculateDrainPatterns() {
    const drains = this.energyHistory.filter(entry => 
      entry.source === 'consumption' && entry.change < 0
    );

    if (drains.length === 0) return null;

    return {
      averageDrain: Math.abs(drains.reduce((sum, d) => sum + d.change, 0) / drains.length),
      biggestDrainActivity: this.findMostDrainingActivity(drains, 'activity'),
      drainFrequency: drains.length / this.energyHistory.length
    };
  }

  findMostEffectiveActivity(activities, field) {
    const activityMap = {};
    
    activities.forEach(activity => {
      const key = activity[field];
      if (!activityMap[key]) {
        activityMap[key] = { total: 0, count: 0 };
      }
      activityMap[key].total += activity.change;
      activityMap[key].count += 1;
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

  findMostDrainingActivity(activities, field) {
    const activityMap = {};
    
    activities.forEach(activity => {
      const key = activity[field];
      if (!activityMap[key]) {
        activityMap[key] = { total: 0, count: 0 };
      }
      activityMap[key].total += Math.abs(activity.change);
      activityMap[key].count += 1;
    });

    let worstActivity = null;
    let worstAverage = 0;

    Object.keys(activityMap).forEach(activity => {
      const average = activityMap[activity].total / activityMap[activity].count;
      if (average > worstAverage) {
        worstAverage = average;
        worstActivity = activity;
      }
    });

    return { activity: worstActivity, averageEffect: worstAverage };
  }

  calculateVariance(values) {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  }

  getCurrentContext() {
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

  // Automatic energy tracking
  startTracking() {
    // Track energy decay over time
    setInterval(() => {
      this.trackNaturalDecay();
    }, 30 * 60 * 1000); // Every 30 minutes
  }

  trackNaturalDecay() {
    const now = new Date();
    const hour = now.getHours();
    
    // Natural energy decay patterns
    let decayAmount = 0;
    
    if (hour >= 22 || hour <= 6) {
      decayAmount = 2; // Night time decay
    } else if (hour >= 14 && hour <= 16) {
      decayAmount = 3; // Afternoon dip
    } else {
      decayAmount = 1; // Normal decay
    }

    if (this.currentEnergy > 10) {
      this.setEnergyLevel(this.currentEnergy - decayAmount, 'natural_decay');
    }
  }

  // Event listeners for real-time updates
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
      energyHistory: this.energyHistory,
      patterns: this.getEnergyPatterns(),
      currentLevel: this.currentEnergy
    };
  }
}

export default EnergyTracker;