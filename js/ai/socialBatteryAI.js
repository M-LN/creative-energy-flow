// Social Battery AI - Intelligent social interaction recommendations
import StorageManager from '../utils/storage.js';

class SocialBatteryAI {
  constructor(aiConstraintEngine) {
    this.aiEngine = aiConstraintEngine;
    this.storage = new StorageManager();
    this.socialRecommendations = [];
    this.interactionPredictions = new Map();
    this.listeners = [];
    this.socialLearningData = [];
    this.init();
  }

  async init() {
    await this.loadSocialHistory();
    this.startSocialAnalysis();
  }

  async loadSocialHistory() {
    try {
      this.socialHistory = await this.storage.getSocialHistory(60); // 60 days
    } catch (error) {
      console.error('Failed to load social history:', error);
      this.socialHistory = [];
    }
  }

  // Core social interaction analysis
  async analyzeSocialContext(plannedInteractions = []) {
    const currentLevel = this.aiEngine.socialBattery.getCurrentLevel();
    const currentEnergy = this.aiEngine.energyTracker.getCurrentEnergy();
    const socialPatterns = this.aiEngine.socialBattery.getSocialPatterns();
    
    const analysis = {
      timestamp: Date.now(),
      currentSocialLevel: currentLevel,
      currentEnergyLevel: currentEnergy,
      socialRisk: this.calculateSocialRisk(currentLevel, plannedInteractions),
      interactionCapacity: this.calculateInteractionCapacity(currentLevel, currentEnergy),
      optimalInteractionWindows: await this.findOptimalInteractionWindows(),
      socialRecoveryNeeds: this.assessRecoveryNeeds(currentLevel, socialPatterns),
      recommendations: this.generateSocialRecommendations(currentLevel, currentEnergy, plannedInteractions)
    };

    return analysis;
  }

  calculateSocialRisk(currentLevel, plannedInteractions) {
    const totalPlannedDrain = plannedInteractions.reduce((sum, interaction) => {
      return sum + this.predictInteractionDrain(interaction);
    }, 0);

    const projectedLevel = currentLevel - totalPlannedDrain;
    
    let riskLevel = 'low';
    let riskScore = 0;
    
    if (projectedLevel < 10) {
      riskLevel = 'critical';
      riskScore = 90;
    } else if (projectedLevel < 25) {
      riskLevel = 'high';
      riskScore = 70;
    } else if (projectedLevel < 50) {
      riskLevel = 'moderate';
      riskScore = 40;
    } else {
      riskScore = Math.max(0, 30 - projectedLevel);
    }

    return {
      level: riskLevel,
      score: riskScore,
      projectedLevel,
      totalPlannedDrain,
      warnings: this.generateRiskWarnings(riskLevel, projectedLevel, plannedInteractions)
    };
  }

  predictInteractionDrain(interaction) {
    const baseTypes = {
      'small_talk': 5,
      'deep_conversation': 15,
      'meeting': 20,
      'presentation': 30,
      'social_event': 25,
      'family_time': 10,
      'networking': 25,
      'conflict_resolution': 35,
      'performance_review': 30
    };

    const baseDrain = baseTypes[interaction.type] || 15;
    const duration = interaction.duration || 60; // minutes
    const peopleCount = interaction.peopleCount || 1;
    const environment = interaction.environment || 'office';

    // Duration multiplier
    const durationMultiplier = Math.sqrt(duration / 60);
    
    // People multiplier (logarithmic scaling)
    const peopleMultiplier = 1 + Math.log10(peopleCount);
    
    // Environment multiplier
    const environmentMultipliers = {
      'home': 0.7,
      'familiar_place': 0.8,
      'office': 1.0,
      'cafe': 1.1,
      'restaurant': 1.2,
      'conference': 1.4,
      'party': 1.6,
      'unknown': 1.2
    };
    const environmentMultiplier = environmentMultipliers[environment] || 1.0;

    // Energy impact (lower energy = higher social drain)
    const currentEnergy = this.aiEngine.energyTracker.getCurrentEnergy();
    const energyMultiplier = currentEnergy < 40 ? 1.5 : currentEnergy < 60 ? 1.2 : 1.0;

    // Time of day impact
    const hour = new Date(interaction.startTime || Date.now()).getHours();
    const timeMultiplier = this.getTimeOfDaySocialMultiplier(hour);

    const totalDrain = baseDrain * durationMultiplier * peopleMultiplier * 
                      environmentMultiplier * energyMultiplier * timeMultiplier;

    return Math.round(totalDrain);
  }

  getTimeOfDaySocialMultiplier(hour) {
    // Social energy varies throughout the day
    if (hour >= 9 && hour <= 11) return 0.8;  // Morning - fresh and social
    if (hour >= 12 && hour <= 14) return 1.0; // Lunch time - normal
    if (hour >= 15 && hour <= 17) return 0.9; // Afternoon - good for meetings
    if (hour >= 18 && hour <= 20) return 1.1; // Evening - more draining
    if (hour >= 21 || hour <= 8) return 1.3;  // Night/early morning - very draining
    return 1.0;
  }

  calculateInteractionCapacity(socialLevel, energyLevel) {
    // Calculate how many and what types of interactions are sustainable
    const baseCapacity = Math.floor(socialLevel / 20); // Each 20 points = 1 moderate interaction
    const energyAdjustment = energyLevel < 50 ? -1 : energyLevel > 75 ? 1 : 0;
    
    const totalCapacity = Math.max(0, baseCapacity + energyAdjustment);
    
    return {
      lightInteractions: totalCapacity * 3,      // Small talk, brief check-ins
      moderateInteractions: totalCapacity,       // Regular meetings, conversations
      intensiveInteractions: Math.floor(totalCapacity / 2), // Deep conversations, presentations
      remainingCapacity: socialLevel,
      recommendations: this.generateCapacityRecommendations(totalCapacity, socialLevel, energyLevel)
    };
  }

  generateCapacityRecommendations(capacity, socialLevel, energyLevel) {
    const recommendations = [];
    
    if (capacity === 0) {
      recommendations.push({
        type: 'capacity_depleted',
        priority: 'high',
        message: 'Social battery too low for interactions',
        action: 'Schedule recovery time before taking meetings'
      });
    } else if (capacity === 1) {
      recommendations.push({
        type: 'limited_capacity',
        priority: 'medium',
        message: 'Limited social capacity available',
        action: 'Choose most important interaction only'
      });
    } else if (capacity >= 3 && energyLevel > 70) {
      recommendations.push({
        type: 'high_capacity',
        priority: 'low',
        message: 'Good social capacity available',
        action: 'Good time for networking or team meetings'
      });
    }
    
    return recommendations;
  }

  async findOptimalInteractionWindows(hours = 24) {
    const windows = [];
    const currentTime = new Date();
    
    for (let i = 0; i < hours; i++) {
      const futureTime = new Date(currentTime.getTime() + i * 60 * 60 * 1000);
      const hour = futureTime.getHours();
      
      const socialPrediction = await this.aiEngine.predictSocialLevel(i, []);
      const energyPrediction = await this.aiEngine.predictEnergyLevel(i, []);
      
      const capacity = this.calculateInteractionCapacity(
        socialPrediction.predictedLevel, 
        energyPrediction.predictedLevel
      );
      
      if (capacity.moderateInteractions > 0) {
        windows.push({
          startTime: futureTime,
          duration: 60, // 1 hour window
          socialLevel: socialPrediction.predictedLevel,
          energyLevel: energyPrediction.predictedLevel,
          capacity: capacity.moderateInteractions,
          quality: this.calculateWindowQuality(
            socialPrediction.predictedLevel, 
            energyPrediction.predictedLevel, 
            hour
          ),
          recommendedTypes: this.getRecommendedInteractionTypes(
            socialPrediction.predictedLevel, 
            energyPrediction.predictedLevel
          )
        });
      }
    }
    
    return windows.sort((a, b) => b.quality - a.quality).slice(0, 5); // Top 5 windows
  }

  calculateWindowQuality(socialLevel, energyLevel, hour) {
    let quality = 0;
    
    // Social level contribution (40%)
    quality += (socialLevel / 100) * 40;
    
    // Energy level contribution (30%)
    quality += (energyLevel / 100) * 30;
    
    // Time of day contribution (20%)
    if (hour >= 9 && hour <= 17) quality += 20;      // Business hours
    else if (hour >= 18 && hour <= 20) quality += 10; // Early evening
    else quality += 5; // Other times
    
    // Combined level bonus (10%)
    if (socialLevel > 70 && energyLevel > 70) quality += 10;
    
    return Math.round(quality);
  }

  getRecommendedInteractionTypes(socialLevel, energyLevel) {
    const types = [];
    
    if (socialLevel >= 80 && energyLevel >= 70) {
      types.push('presentation', 'networking', 'team_meeting', 'social_event');
    } else if (socialLevel >= 60 && energyLevel >= 50) {
      types.push('meeting', 'deep_conversation', 'collaboration');
    } else if (socialLevel >= 40) {
      types.push('one_on_one', 'small_talk', 'brief_checkin');
    } else {
      types.push('asynchronous_communication', 'email', 'text');
    }
    
    return types;
  }

  assessRecoveryNeeds(currentLevel, socialPatterns) {
    const recovery = {
      immediate: currentLevel < 25,
      recommended: currentLevel < 50,
      timeNeeded: this.calculateRecoveryTime(currentLevel),
      bestActivities: this.getRecoveryActivities(currentLevel, socialPatterns),
      schedule: this.generateRecoverySchedule(currentLevel)
    };
    
    return recovery;
  }

  calculateRecoveryTime(currentLevel) {
    if (currentLevel >= 70) return 0;
    if (currentLevel >= 50) return 30; // 30 minutes
    if (currentLevel >= 25) return 60; // 1 hour
    return 120; // 2 hours for severe depletion
  }

  getRecoveryActivities(currentLevel, socialPatterns) {
    const activities = [
      { name: 'alone_time', recovery: 20, duration: 60 },
      { name: 'meditation', recovery: 15, duration: 30 },
      { name: 'creative_work', recovery: 10, duration: 90 },
      { name: 'nature_walk', recovery: 12, duration: 45 },
      { name: 'reading', recovery: 8, duration: 60 },
      { name: 'listening_to_music', recovery: 6, duration: 30 }
    ];
    
    // Personalize based on patterns
    if (socialPatterns && socialPatterns.recoveryPatterns) {
      const bestActivity = socialPatterns.recoveryPatterns.bestRecoveryActivity;
      if (bestActivity) {
        const activity = activities.find(a => a.name === bestActivity.activity);
        if (activity) {
          activity.recovery = bestActivity.averageEffect;
          activities.sort((a, b) => b.recovery - a.recovery);
        }
      }
    }
    
    return activities.slice(0, 3); // Top 3 activities
  }

  generateRecoverySchedule(currentLevel) {
    const schedule = [];
    const recoveryTime = this.calculateRecoveryTime(currentLevel);
    
    if (recoveryTime > 0) {
      const startTime = new Date();
      
      if (recoveryTime >= 120) {
        // Long recovery - break it into segments
        schedule.push({
          activity: 'alone_time',
          duration: 60,
          startTime: new Date(startTime),
          priority: 'high'
        });
        schedule.push({
          activity: 'meditation',
          duration: 30,
          startTime: new Date(startTime.getTime() + 60 * 60 * 1000),
          priority: 'medium'
        });
        schedule.push({
          activity: 'light_activity',
          duration: 30,
          startTime: new Date(startTime.getTime() + 90 * 60 * 1000),
          priority: 'low'
        });
      } else {
        schedule.push({
          activity: 'focused_recovery',
          duration: recoveryTime,
          startTime: new Date(startTime),
          priority: 'high'
        });
      }
    }
    
    return schedule;
  }

  generateSocialRecommendations(socialLevel, energyLevel, plannedInteractions) {
    const recommendations = [];
    
    // Risk-based recommendations
    const socialRisk = this.calculateSocialRisk(socialLevel, plannedInteractions);
    
    if (socialRisk.level === 'critical') {
      recommendations.push({
        type: 'urgent_recovery',
        priority: 'critical',
        title: 'Critical Social Battery Level',
        message: 'Immediate recovery needed',
        action: 'Cancel non-essential social interactions and schedule recovery time',
        impact: 'high'
      });
    } else if (socialRisk.level === 'high') {
      recommendations.push({
        type: 'recovery_warning',
        priority: 'high',
        title: 'Social Battery Running Low',
        message: 'Recovery recommended soon',
        action: 'Limit new social commitments and plan recovery activities',
        impact: 'medium'
      });
    }
    
    // Opportunity-based recommendations
    if (socialLevel > 70 && energyLevel > 60) {
      recommendations.push({
        type: 'social_opportunity',
        priority: 'low',
        title: 'Good Time for Social Activities',
        message: 'Both social and energy levels are good',
        action: 'Consider networking, team activities, or important conversations',
        impact: 'positive'
      });
    }
    
    // Optimization recommendations
    const upcomingMeetings = plannedInteractions.filter(interaction => 
      new Date(interaction.startTime) > new Date() &&
      new Date(interaction.startTime) < new Date(Date.now() + 24 * 60 * 60 * 1000)
    );
    
    if (upcomingMeetings.length > 3) {
      recommendations.push({
        type: 'meeting_optimization',
        priority: 'medium',
        title: 'High Meeting Load Detected',
        message: `${upcomingMeetings.length} meetings scheduled in next 24 hours`,
        action: 'Consider consolidating, rescheduling, or delegating some meetings',
        impact: 'efficiency'
      });
    }
    
    // Preventive recommendations
    const consecutiveMeetings = this.findConsecutiveMeetings(upcomingMeetings);
    if (consecutiveMeetings.length > 0) {
      recommendations.push({
        type: 'buffer_time',
        priority: 'medium',
        title: 'Consecutive Meetings Detected',
        message: 'Multiple meetings scheduled back-to-back',
        action: 'Add 15-30 minute buffers between meetings for recovery',
        impact: 'sustainability'
      });
    }
    
    return recommendations;
  }

  findConsecutiveMeetings(meetings) {
    const sortedMeetings = meetings.sort((a, b) => 
      new Date(a.startTime) - new Date(b.startTime)
    );
    
    const consecutive = [];
    
    for (let i = 0; i < sortedMeetings.length - 1; i++) {
      const current = sortedMeetings[i];
      const next = sortedMeetings[i + 1];
      
      const currentEnd = new Date(current.startTime).getTime() + (current.duration || 60) * 60 * 1000;
      const nextStart = new Date(next.startTime).getTime();
      
      if (nextStart - currentEnd < 15 * 60 * 1000) { // Less than 15 minutes gap
        consecutive.push([current, next]);
      }
    }
    
    return consecutive;
  }

  generateRiskWarnings(riskLevel, projectedLevel, plannedInteractions) {
    const warnings = [];
    
    if (riskLevel === 'critical') {
      warnings.push({
        type: 'overcommitment',
        message: 'Current schedule may lead to social battery depletion',
        severity: 'high'
      });
      
      const highDrainInteractions = plannedInteractions.filter(i => 
        this.predictInteractionDrain(i) > 25
      );
      
      if (highDrainInteractions.length > 0) {
        warnings.push({
          type: 'high_drain_activities',
          message: `${highDrainInteractions.length} high-drain activities detected`,
          activities: highDrainInteractions.map(i => i.title || i.type),
          severity: 'medium'
        });
      }
    }
    
    if (projectedLevel < 15) {
      warnings.push({
        type: 'burnout_risk',
        message: 'High risk of social burnout',
        severity: 'critical'
      });
    }
    
    return warnings;
  }

  // Social interaction suggestions
  async suggestOptimalMeetingTime(meetingDetails, timeRange = 7) {
    const suggestions = [];
    const currentTime = new Date();
    
    for (let day = 0; day < timeRange; day++) {
      for (let hour = 9; hour <= 17; hour++) {
        const candidateTime = new Date(currentTime);
        candidateTime.setDate(candidateTime.getDate() + day);
        candidateTime.setHours(hour, 0, 0, 0);
        
        const hoursAhead = (candidateTime.getTime() - currentTime.getTime()) / (1000 * 60 * 60);
        
        const socialPrediction = await this.aiEngine.predictSocialLevel(hoursAhead, []);
        const energyPrediction = await this.aiEngine.predictEnergyLevel(hoursAhead, []);
        
        const projectedDrain = this.predictInteractionDrain({
          ...meetingDetails,
          startTime: candidateTime
        });
        
        const resultingSocialLevel = socialPrediction.predictedLevel - projectedDrain;
        
        if (resultingSocialLevel >= 20) { // Minimum viable level
          const quality = this.calculateMeetingQuality(
            socialPrediction.predictedLevel,
            energyPrediction.predictedLevel,
            hour,
            meetingDetails
          );
          
          suggestions.push({
            time: candidateTime,
            socialLevel: socialPrediction.predictedLevel,
            energyLevel: energyPrediction.predictedLevel,
            resultingSocialLevel,
            projectedDrain,
            quality,
            suitability: this.getMeetingSuitability(resultingSocialLevel, quality)
          });
        }
      }
    }
    
    return suggestions
      .sort((a, b) => b.quality - a.quality)
      .slice(0, 5); // Top 5 suggestions
  }

  calculateMeetingQuality(socialLevel, energyLevel, hour, meetingDetails) {
    let quality = 0;
    
    // Social level (40%)
    quality += (socialLevel / 100) * 40;
    
    // Energy level (30%)
    quality += (energyLevel / 100) * 30;
    
    // Time appropriateness (20%)
    if (meetingDetails.type === 'presentation' && hour >= 10 && hour <= 14) {
      quality += 20;
    } else if (meetingDetails.type === 'deep_conversation' && hour >= 9 && hour <= 11) {
      quality += 20;
    } else if (hour >= 9 && hour <= 17) {
      quality += 15;
    } else {
      quality += 5;
    }
    
    // Meeting type alignment (10%)
    const typeBonus = this.getTypeAlignmentBonus(meetingDetails.type, socialLevel, energyLevel);
    quality += typeBonus;
    
    return Math.round(quality);
  }

  getTypeAlignmentBonus(meetingType, socialLevel, energyLevel) {
    if (meetingType === 'presentation' && socialLevel >= 80 && energyLevel >= 70) {
      return 10;
    }
    if (meetingType === 'one_on_one' && socialLevel >= 50) {
      return 8;
    }
    if (meetingType === 'team_meeting' && socialLevel >= 60 && energyLevel >= 60) {
      return 9;
    }
    return 5;
  }

  getMeetingSuitability(resultingLevel, quality) {
    if (quality >= 80 && resultingLevel >= 50) return 'optimal';
    if (quality >= 60 && resultingLevel >= 30) return 'good';
    if (quality >= 40 && resultingLevel >= 20) return 'acceptable';
    return 'poor';
  }

  // Learning and adaptation
  async recordInteractionOutcome(interaction, actualDrain, userSatisfaction) {
    const predictedDrain = this.predictInteractionDrain(interaction);
    const accuracy = 100 - Math.abs(predictedDrain - actualDrain);
    
    const learningPoint = {
      interaction,
      predictedDrain,
      actualDrain,
      accuracy,
      userSatisfaction,
      timestamp: Date.now(),
      context: {
        preInteractionSocialLevel: interaction.preLevel,
        preInteractionEnergyLevel: interaction.preEnergyLevel,
        timeOfDay: new Date(interaction.startTime).getHours(),
        dayOfWeek: new Date(interaction.startTime).getDay()
      }
    };
    
    this.socialLearningData.push(learningPoint);
    
    // Store for future analysis
    await this.storage.store('socialLearning', learningPoint);
    
    // Adapt predictions if significant deviation
    if (accuracy < 60) {
      this.adaptPredictionModel(learningPoint);
    }
  }

  adaptPredictionModel(learningPoint) {
    // Simple adaptive adjustment
    const { interaction, predictedDrain, actualDrain } = learningPoint;
    const difference = actualDrain - predictedDrain;
    
    // Store adjustment factors for similar interactions
    const adjustmentKey = `${interaction.type}_${interaction.environment}_${Math.floor(interaction.peopleCount / 5) * 5}`;
    
    let adjustments = this.storage.getLocalData('socialAdjustments', {});
    if (!adjustments[adjustmentKey]) {
      adjustments[adjustmentKey] = { total: 0, count: 0 };
    }
    
    adjustments[adjustmentKey].total += difference;
    adjustments[adjustmentKey].count += 1;
    
    this.storage.setLocalData('socialAdjustments', adjustments);
  }

  // Analysis and insights
  async generateSocialInsights() {
    const patterns = this.aiEngine.socialBattery.getSocialPatterns();
    const recentHistory = await this.storage.getSocialHistory(14); // Last 2 weeks
    
    const insights = {
      socialEfficiency: this.calculateSocialEfficiency(recentHistory),
      interactionOptimization: this.analyzereactionOptimization(patterns),
      recoveryEffectiveness: this.analyzeRecoveryEffectiveness(patterns),
      riskPatterns: this.identifyRiskPatterns(recentHistory),
      recommendations: this.generatePersonalizedRecommendations(patterns, recentHistory)
    };
    
    return insights;
  }

  calculateSocialEfficiency(history) {
    if (history.length === 0) return null;
    
    const interactions = history.filter(entry => entry.source === 'interaction');
    const recoveries = history.filter(entry => entry.source === 'recovery');
    
    const totalDrain = interactions.reduce((sum, i) => sum + Math.abs(i.change), 0);
    const totalRecovery = recoveries.reduce((sum, r) => sum + r.change, 0);
    
    const efficiency = totalRecovery > 0 ? (totalRecovery / (totalDrain + totalRecovery)) * 100 : 0;
    
    return {
      efficiency: Math.round(efficiency),
      totalInteractions: interactions.length,
      totalRecoveries: recoveries.length,
      averageDrain: interactions.length > 0 ? totalDrain / interactions.length : 0,
      averageRecovery: recoveries.length > 0 ? totalRecovery / recoveries.length : 0
    };
  }

  analyzereactionOptimization(patterns) {
    if (!patterns || !patterns.interactionPatterns) return null;
    
    const { mostDrainingType, preferredEnvironment, peakInteractionHours } = patterns.interactionPatterns;
    
    return {
      avoidableTypes: mostDrainingType ? [mostDrainingType.type] : [],
      optimalEnvironments: preferredEnvironment ? [preferredEnvironment.environment] : [],
      bestTimes: peakInteractionHours ? peakInteractionHours.map(h => h.hour) : [],
      suggestions: [
        `Consider limiting ${mostDrainingType?.type || 'high-drain'} interactions`,
        `Schedule important meetings in ${preferredEnvironment?.environment || 'preferred'} environments`,
        `Peak social performance at ${peakInteractionHours?.[0]?.hour || 'morning'} hours`
      ]
    };
  }

  analyzeRecoveryEffectiveness(patterns) {
    if (!patterns || !patterns.recoveryPatterns) return null;
    
    const { averageRecovery, bestRecoveryActivity, recoveryFrequency } = patterns.recoveryPatterns;
    
    return {
      averageRecovery,
      bestActivity: bestRecoveryActivity?.activity,
      effectiveness: bestRecoveryActivity?.averageEffect,
      frequency: recoveryFrequency,
      recommendation: this.getRecoveryRecommendation(averageRecovery, recoveryFrequency)
    };
  }

  getRecoveryRecommendation(averageRecovery, frequency) {
    if (averageRecovery < 10) {
      return 'Consider more effective recovery activities';
    }
    if (frequency < 0.3) {
      return 'Increase frequency of recovery activities';
    }
    if (averageRecovery > 15 && frequency > 0.4) {
      return 'Good recovery pattern, maintain current approach';
    }
    return 'Balanced recovery approach, minor optimization possible';
  }

  identifyRiskPatterns(history) {
    const risks = [];
    
    // Check for declining trends
    const weeklyLevels = this.getWeeklyAverages(history);
    if (weeklyLevels.length >= 2) {
      const trend = weeklyLevels[weeklyLevels.length - 1] - weeklyLevels[weeklyLevels.length - 2];
      if (trend < -10) {
        risks.push({
          type: 'declining_trend',
          severity: 'medium',
          description: 'Social battery levels are declining',
          value: trend
        });
      }
    }
    
    // Check for frequent depletion
    const depletionEvents = history.filter(entry => entry.level < 20).length;
    if (depletionEvents > 3) {
      risks.push({
        type: 'frequent_depletion',
        severity: 'high',
        description: 'Social battery frequently drops below 20%',
        value: depletionEvents
      });
    }
    
    return risks;
  }

  getWeeklyAverages(history) {
    const weeklyData = {};
    
    history.forEach(entry => {
      const week = Math.floor((Date.now() - entry.timestamp) / (7 * 24 * 60 * 60 * 1000));
      if (!weeklyData[week]) {
        weeklyData[week] = { total: 0, count: 0 };
      }
      weeklyData[week].total += entry.level;
      weeklyData[week].count += 1;
    });
    
    return Object.keys(weeklyData)
      .sort((a, b) => a - b)
      .map(week => weeklyData[week].total / weeklyData[week].count);
  }

  generatePersonalizedRecommendations(patterns, history) {
    const recommendations = [];
    
    // Based on patterns
    if (patterns && patterns.optimalInteractionTimes) {
      const bestHours = patterns.optimalInteractionTimes.slice(0, 2);
      recommendations.push({
        type: 'timing_optimization',
        priority: 'medium',
        message: `Schedule important interactions between ${bestHours.map(h => h.hour).join(' and ')} hours`,
        impact: 'efficiency'
      });
    }
    
    // Based on recent performance
    const recentEfficiency = this.calculateSocialEfficiency(history);
    if (recentEfficiency && recentEfficiency.efficiency < 60) {
      recommendations.push({
        type: 'efficiency_improvement',
        priority: 'high',
        message: 'Focus on improving social energy recovery ratio',
        action: 'Increase recovery activities after social interactions',
        impact: 'sustainability'
      });
    }
    
    return recommendations;
  }

  // Continuous monitoring
  startSocialAnalysis() {
    // Analyze social state every 30 minutes
    setInterval(async () => {
      const analysis = await this.analyzeSocialContext();
      this.socialRecommendations = analysis.recommendations;
      
      this.notifyListeners('socialAnalysisUpdate', analysis);
    }, 30 * 60 * 1000);
  }

  // Public API
  getCurrentSocialRecommendations() {
    return [...this.socialRecommendations];
  }

  async getOptimalMeetingTimes(meetingDetails) {
    return this.suggestOptimalMeetingTime(meetingDetails);
  }

  async getSocialForecast(hours = 24) {
    const forecast = [];
    
    for (let i = 0; i < hours; i++) {
      const prediction = await this.aiEngine.predictSocialLevel(i, []);
      const capacity = this.calculateInteractionCapacity(
        prediction.predictedLevel,
        this.aiEngine.energyTracker.getCurrentEnergy()
      );
      
      forecast.push({
        hour: i,
        time: new Date(Date.now() + i * 60 * 60 * 1000),
        predictedLevel: prediction.predictedLevel,
        capacity: capacity.moderateInteractions,
        quality: this.calculateWindowQuality(
          prediction.predictedLevel,
          this.aiEngine.energyTracker.getCurrentEnergy(),
          new Date().getHours() + i
        )
      });
    }
    
    return forecast;
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
}

export default SocialBatteryAI;