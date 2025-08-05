// Energy Optimizer - Smart task scheduling based on energy patterns
import StorageManager from '../utils/storage.js';

class EnergyOptimizer {
  constructor(aiConstraintEngine) {
    this.aiEngine = aiConstraintEngine;
    this.storage = new StorageManager();
    this.optimizationHistory = [];
    this.learningData = [];
    this.listeners = [];
    this.init();
  }

  async init() {
    await this.loadOptimizationHistory();
    this.startLearning();
  }

  async loadOptimizationHistory() {
    try {
      this.optimizationHistory = await this.storage.getAll('optimizations') || [];
    } catch (error) {
      console.error('Failed to load optimization history:', error);
      this.optimizationHistory = [];
    }
  }

  // Main optimization functions
  async optimizeEnergySchedule(tasks, timeHorizon = 24) {
    const optimization = {
      id: Date.now(),
      timestamp: Date.now(),
      originalTasks: [...tasks],
      timeHorizon,
      currentEnergy: this.aiEngine.energyTracker.getCurrentEnergy(),
      currentSocial: this.aiEngine.socialBattery.getCurrentLevel()
    };

    try {
      // Analyze current energy patterns
      const energyPatterns = this.aiEngine.energyTracker.getEnergyPatterns();
      const energyForecast = await this.generateEnergyForecast(timeHorizon);
      
      // Categorize tasks by energy requirements
      const categorizedTasks = this.categorizeTasks(tasks);
      
      // Generate optimal schedule
      const optimizedSchedule = await this.generateOptimalSchedule(
        categorizedTasks, 
        energyForecast, 
        timeHorizon
      );
      
      // Calculate energy efficiency metrics
      const efficiencyMetrics = this.calculateEfficiencyMetrics(
        tasks, 
        optimizedSchedule, 
        energyForecast
      );
      
      optimization.result = {
        optimizedSchedule,
        energyForecast,
        efficiencyMetrics,
        recommendations: this.generateEnergyRecommendations(optimizedSchedule, energyForecast)
      };
      
      // Store optimization for learning
      await this.storage.store('optimizations', optimization);
      this.optimizationHistory.push(optimization);
      
      this.notifyListeners('optimizationComplete', optimization.result);
      
      return optimization.result;
    } catch (error) {
      console.error('Energy optimization failed:', error);
      optimization.error = error.message;
      return this.generateFallbackSchedule(tasks);
    }
  }

  async generateEnergyForecast(hours) {
    const forecast = [];
    const currentTime = new Date();
    
    for (let i = 0; i < hours; i++) {
      const futureTime = new Date(currentTime.getTime() + i * 60 * 60 * 1000);
      const prediction = await this.aiEngine.predictEnergyLevel(i, []);
      
      forecast.push({
        hour: i,
        time: futureTime,
        predictedEnergy: prediction.predictedLevel,
        confidence: prediction.confidence,
        factors: prediction.factors,
        recommendation: this.getHourlyRecommendation(prediction.predictedLevel, futureTime.getHours())
      });
    }
    
    return forecast;
  }

  getHourlyRecommendation(energyLevel, hour) {
    if (energyLevel >= 80) {
      return {
        type: 'high_energy',
        activity: 'challenging_tasks',
        description: 'Optimal time for demanding or creative work'
      };
    } else if (energyLevel >= 60) {
      return {
        type: 'moderate_energy',
        activity: 'routine_tasks',
        description: 'Good time for regular tasks and meetings'
      };
    } else if (energyLevel >= 40) {
      return {
        type: 'low_energy',
        activity: 'light_tasks',
        description: 'Focus on simple, low-demand activities'
      };
    } else {
      return {
        type: 'recovery_needed',
        activity: 'rest',
        description: 'Time for recovery and energy restoration'
      };
    }
  }

  categorizeTasks(tasks) {
    return {
      highEnergy: tasks.filter(task => (task.energyRequirement || 50) >= 70),
      moderateEnergy: tasks.filter(task => {
        const req = task.energyRequirement || 50;
        return req >= 40 && req < 70;
      }),
      lowEnergy: tasks.filter(task => (task.energyRequirement || 50) < 40),
      recovery: tasks.filter(task => task.type === 'recovery' || task.energyRecovery > 0)
    };
  }

  async generateOptimalSchedule(categorizedTasks, energyForecast, timeHorizon) {
    const schedule = [];
    const usedTaskIds = new Set();
    
    // Sort energy forecast periods by energy level (highest first)
    const sortedPeriods = [...energyForecast].sort((a, b) => b.predictedEnergy - a.predictedEnergy);
    
    // Schedule high-energy tasks during peak energy periods
    for (const period of sortedPeriods) {
      if (period.predictedEnergy >= 70) {
        const availableTask = categorizedTasks.highEnergy.find(task => 
          !usedTaskIds.has(task.id) && this.isTaskSchedulable(task, period)
        );
        
        if (availableTask) {
          schedule.push(this.createScheduleItem(availableTask, period, 'optimal_energy_match'));
          usedTaskIds.add(availableTask.id);
        }
      }
    }
    
    // Schedule moderate-energy tasks during moderate periods
    for (const period of energyForecast) {
      if (period.predictedEnergy >= 40 && period.predictedEnergy < 70) {
        const availableTask = categorizedTasks.moderateEnergy.find(task => 
          !usedTaskIds.has(task.id) && this.isTaskSchedulable(task, period)
        );
        
        if (availableTask) {
          schedule.push(this.createScheduleItem(availableTask, period, 'moderate_energy_match'));
          usedTaskIds.add(availableTask.id);
        }
      }
    }
    
    // Schedule low-energy tasks and recovery during low periods
    for (const period of energyForecast) {
      if (period.predictedEnergy < 40) {
        const recoveryTask = categorizedTasks.recovery.find(task => 
          !usedTaskIds.has(task.id)
        );
        
        if (recoveryTask) {
          schedule.push(this.createScheduleItem(recoveryTask, period, 'recovery_optimization'));
          usedTaskIds.add(recoveryTask.id);
        } else {
          const lowEnergyTask = categorizedTasks.lowEnergy.find(task => 
            !usedTaskIds.has(task.id) && this.isTaskSchedulable(task, period)
          );
          
          if (lowEnergyTask) {
            schedule.push(this.createScheduleItem(lowEnergyTask, period, 'low_energy_match'));
            usedTaskIds.add(lowEnergyTask.id);
          }
        }
      }
    }
    
    // Handle unscheduled tasks
    const unscheduledTasks = [
      ...categorizedTasks.highEnergy,
      ...categorizedTasks.moderateEnergy,
      ...categorizedTasks.lowEnergy,
      ...categorizedTasks.recovery
    ].filter(task => !usedTaskIds.has(task.id));
    
    for (const task of unscheduledTasks) {
      const suggestedTime = this.findBestAlternativeTime(task, energyForecast, schedule);
      schedule.push({
        ...this.createScheduleItem(task, null, 'alternative_scheduling'),
        suggestedTime,
        scheduled: false,
        reason: 'no_optimal_slot_available'
      });
    }
    
    return schedule.sort((a, b) => (a.scheduledTime || new Date()).getTime() - (b.scheduledTime || new Date()).getTime());
  }

  isTaskSchedulable(task, period) {
    // Check if task can be scheduled during this period
    const energyGap = (task.energyRequirement || 50) - period.predictedEnergy;
    
    // Allow some flexibility, but not too much
    return energyGap <= 20;
  }

  createScheduleItem(task, period, optimizationType) {
    return {
      taskId: task.id,
      task: { ...task },
      scheduledTime: period ? period.time : null,
      predictedEnergy: period ? period.predictedEnergy : null,
      energyMatch: period ? this.calculateEnergyMatch(task, period) : 0,
      optimizationType,
      efficiency: this.calculateTaskEfficiency(task, period),
      bufferTime: this.calculateBufferTime(task),
      scheduled: true
    };
  }

  calculateEnergyMatch(task, period) {
    const requiredEnergy = task.energyRequirement || 50;
    const availableEnergy = period.predictedEnergy;
    
    if (availableEnergy >= requiredEnergy) {
      // Perfect match or better
      return 100 - Math.min(50, availableEnergy - requiredEnergy);
    } else {
      // Energy deficit
      const deficit = requiredEnergy - availableEnergy;
      return Math.max(0, 100 - deficit * 2);
    }
  }

  calculateTaskEfficiency(task, period) {
    if (!period) return 0;
    
    const energyMatch = this.calculateEnergyMatch(task, period);
    const timeMatch = this.calculateTimeMatch(task, period);
    const typeMatch = this.calculateTypeMatch(task, period);
    
    return (energyMatch * 0.5 + timeMatch * 0.3 + typeMatch * 0.2);
  }

  calculateTimeMatch(task, period) {
    const hour = period.time.getHours();
    
    if (task.preferredTime) {
      const preferredHours = Array.isArray(task.preferredTime) ? task.preferredTime : [task.preferredTime];
      return preferredHours.includes(hour) ? 100 : 50;
    }
    
    // Default time preferences based on task type
    if (task.type === 'creative' && hour >= 9 && hour <= 12) return 90;
    if (task.type === 'administrative' && hour >= 14 && hour <= 17) return 80;
    if (task.type === 'social' && hour >= 10 && hour <= 16) return 85;
    if (task.type === 'recovery' && (hour >= 21 || hour <= 7)) return 95;
    
    return 60; // Neutral time
  }

  calculateTypeMatch(task, period) {
    const recommendation = period.recommendation;
    
    if (task.type === 'recovery' && recommendation.type === 'recovery_needed') return 100;
    if ((task.energyRequirement || 50) >= 70 && recommendation.type === 'high_energy') return 100;
    if ((task.energyRequirement || 50) >= 40 && recommendation.type === 'moderate_energy') return 90;
    if ((task.energyRequirement || 50) < 40 && recommendation.type === 'low_energy') return 85;
    
    return 50;
  }

  calculateBufferTime(task) {
    // Calculate recommended buffer time based on task characteristics
    const baseBuffer = 15; // minutes
    
    let buffer = baseBuffer;
    
    if (task.type === 'social') buffer += 15; // Extra recovery time after social tasks
    if ((task.energyRequirement || 50) >= 70) buffer += 10; // Extra recovery after high-energy tasks
    if (task.complexity === 'high') buffer += 10;
    if (task.stressLevel && task.stressLevel >= 7) buffer += 20;
    
    return Math.min(60, buffer); // Cap at 60 minutes
  }

  findBestAlternativeTime(task, energyForecast, existingSchedule) {
    // Find the best alternative time for unscheduled tasks
    const scores = energyForecast.map(period => ({
      period,
      score: this.calculateTaskEfficiency(task, period),
      conflicts: this.checkTimeConflicts(period.time, existingSchedule)
    })).filter(item => item.conflicts === 0);
    
    scores.sort((a, b) => b.score - a.score);
    
    return scores.length > 0 ? {
      time: scores[0].period.time,
      score: scores[0].score,
      reason: 'best_available_alternative'
    } : {
      time: null,
      score: 0,
      reason: 'no_suitable_time_found'
    };
  }

  checkTimeConflicts(time, schedule) {
    return schedule.filter(item => {
      if (!item.scheduledTime) return false;
      const timeDiff = Math.abs(item.scheduledTime.getTime() - time.getTime());
      return timeDiff < (item.task.estimatedDuration || 60) * 60 * 1000;
    }).length;
  }

  calculateEfficiencyMetrics(originalTasks, optimizedSchedule, energyForecast) {
    const scheduledTasks = optimizedSchedule.filter(item => item.scheduled);
    const unscheduledTasks = optimizedSchedule.filter(item => !item.scheduled);
    
    const totalEnergyMatch = scheduledTasks.reduce((sum, item) => sum + item.energyMatch, 0);
    const averageEnergyMatch = scheduledTasks.length > 0 ? totalEnergyMatch / scheduledTasks.length : 0;
    
    const totalEfficiency = scheduledTasks.reduce((sum, item) => sum + item.efficiency, 0);
    const averageEfficiency = scheduledTasks.length > 0 ? totalEfficiency / scheduledTasks.length : 0;
    
    const energyWaste = this.calculateEnergyWaste(optimizedSchedule, energyForecast);
    const energyConservation = 100 - energyWaste;
    
    return {
      scheduledCount: scheduledTasks.length,
      unscheduledCount: unscheduledTasks.length,
      schedulingRate: (scheduledTasks.length / originalTasks.length) * 100,
      averageEnergyMatch,
      averageEfficiency,
      energyConservation,
      energyWaste,
      optimizationScore: (averageEnergyMatch + averageEfficiency + energyConservation) / 3,
      recommendations: this.generateEfficiencyRecommendations(averageEnergyMatch, averageEfficiency, energyConservation)
    };
  }

  calculateEnergyWaste(schedule, energyForecast) {
    let totalWaste = 0;
    let totalPeriods = 0;
    
    energyForecast.forEach(period => {
      const scheduledItem = schedule.find(item => 
        item.scheduledTime && 
        Math.abs(item.scheduledTime.getTime() - period.time.getTime()) < 30 * 60 * 1000
      );
      
      if (scheduledItem) {
        const energyUsed = scheduledItem.task.energyRequirement || 50;
        const energyAvailable = period.predictedEnergy;
        
        if (energyAvailable > energyUsed) {
          const waste = energyAvailable - energyUsed;
          totalWaste += waste;
        }
      } else {
        // Unused high-energy periods are wasted
        if (period.predictedEnergy > 70) {
          totalWaste += (period.predictedEnergy - 70) * 0.5;
        }
      }
      
      totalPeriods++;
    });
    
    return totalPeriods > 0 ? (totalWaste / totalPeriods) : 0;
  }

  generateEnergyRecommendations(schedule, energyForecast) {
    const recommendations = [];
    
    // Identify peak energy periods without demanding tasks
    const peakPeriods = energyForecast.filter(period => 
      period.predictedEnergy >= 80 && 
      !schedule.some(item => 
        item.scheduledTime && 
        Math.abs(item.scheduledTime.getTime() - period.time.getTime()) < 30 * 60 * 1000 &&
        (item.task.energyRequirement || 50) >= 70
      )
    );
    
    if (peakPeriods.length > 0) {
      recommendations.push({
        type: 'energy_optimization',
        priority: 'medium',
        title: 'Unused Peak Energy Periods',
        description: `You have ${peakPeriods.length} high-energy periods that could be used for challenging tasks`,
        action: 'Consider scheduling important or creative work during these times',
        periods: peakPeriods.map(p => p.time)
      });
    }
    
    // Identify low energy periods with demanding tasks
    const problematicScheduling = schedule.filter(item => 
      item.scheduledTime && 
      item.predictedEnergy < 60 && 
      (item.task.energyRequirement || 50) >= 70
    );
    
    if (problematicScheduling.length > 0) {
      recommendations.push({
        type: 'energy_mismatch',
        priority: 'high',
        title: 'Energy-Task Mismatch',
        description: `${problematicScheduling.length} demanding tasks are scheduled during low-energy periods`,
        action: 'Consider rescheduling these tasks to higher energy periods',
        tasks: problematicScheduling.map(item => item.task.title || item.task.id)
      });
    }
    
    // Recovery recommendations
    const consecutiveHighEnergyTasks = this.findConsecutiveHighEnergyTasks(schedule);
    if (consecutiveHighEnergyTasks.length > 0) {
      recommendations.push({
        type: 'recovery_needed',
        priority: 'medium',
        title: 'Recovery Buffer Needed',
        description: 'Multiple demanding tasks are scheduled consecutively',
        action: 'Add recovery breaks between demanding tasks',
        sequences: consecutiveHighEnergyTasks
      });
    }
    
    return recommendations;
  }

  findConsecutiveHighEnergyTasks(schedule) {
    const highEnergyItems = schedule
      .filter(item => item.scheduled && (item.task.energyRequirement || 50) >= 70)
      .sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime());
    
    const sequences = [];
    let currentSequence = [];
    
    for (let i = 0; i < highEnergyItems.length; i++) {
      const current = highEnergyItems[i];
      const previous = highEnergyItems[i - 1];
      
      if (previous && 
          current.scheduledTime.getTime() - previous.scheduledTime.getTime() < 2 * 60 * 60 * 1000) {
        if (currentSequence.length === 0) {
          currentSequence.push(previous);
        }
        currentSequence.push(current);
      } else {
        if (currentSequence.length >= 2) {
          sequences.push([...currentSequence]);
        }
        currentSequence = [];
      }
    }
    
    if (currentSequence.length >= 2) {
      sequences.push(currentSequence);
    }
    
    return sequences;
  }

  generateEfficiencyRecommendations(energyMatch, efficiency, conservation) {
    const recommendations = [];
    
    if (energyMatch < 70) {
      recommendations.push({
        type: 'energy_matching',
        description: 'Improve energy-task matching by scheduling demanding tasks during peak energy periods'
      });
    }
    
    if (efficiency < 60) {
      recommendations.push({
        type: 'overall_efficiency',
        description: 'Consider adjusting task timing preferences and energy requirements'
      });
    }
    
    if (conservation < 70) {
      recommendations.push({
        type: 'energy_conservation',
        description: 'Add more tasks during high-energy periods to avoid energy waste'
      });
    }
    
    return recommendations;
  }

  generateFallbackSchedule(tasks) {
    // Simple fallback when optimization fails
    const currentTime = new Date();
    
    return {
      optimizedSchedule: tasks.map((task, index) => ({
        taskId: task.id,
        task: { ...task },
        scheduledTime: new Date(currentTime.getTime() + index * 60 * 60 * 1000),
        predictedEnergy: 50,
        energyMatch: 50,
        optimizationType: 'fallback',
        efficiency: 50,
        bufferTime: 15,
        scheduled: true
      })),
      energyForecast: [],
      efficiencyMetrics: {
        scheduledCount: tasks.length,
        unscheduledCount: 0,
        schedulingRate: 100,
        averageEnergyMatch: 50,
        averageEfficiency: 50,
        energyConservation: 50,
        optimizationScore: 50
      },
      recommendations: [{
        type: 'fallback_notice',
        priority: 'low',
        title: 'Using Basic Scheduling',
        description: 'Advanced optimization unavailable, using simple time-based scheduling',
        action: 'Check AI system status for full optimization features'
      }]
    };
  }

  // Learning and improvement
  startLearning() {
    // Track optimization success
    setInterval(() => {
      this.evaluateOptimizationSuccess();
    }, 60 * 60 * 1000); // Every hour
  }

  async evaluateOptimizationSuccess() {
    const recentOptimizations = this.optimizationHistory.slice(-10);
    
    for (const optimization of recentOptimizations) {
      if (!optimization.evaluated && optimization.timestamp < Date.now() - 24 * 60 * 60 * 1000) {
        const success = await this.measureOptimizationSuccess(optimization);
        optimization.evaluated = true;
        optimization.success = success;
        
        // Store learning data
        this.learningData.push({
          optimization,
          success,
          timestamp: Date.now()
        });
        
        // Update optimization in storage
        await this.storage.store('optimizations', optimization);
      }
    }
  }

  async measureOptimizationSuccess(optimization) {
    // Measure how well the optimization worked in practice
    const scheduledTime = optimization.timestamp;
    const endTime = scheduledTime + optimization.timeHorizon * 60 * 60 * 1000;
    
    // Get actual energy data from the period
    const actualEnergyData = await this.storage.getAll('energyData', 'timestamp');
    const periodData = actualEnergyData.filter(entry => 
      entry.timestamp >= scheduledTime && entry.timestamp <= endTime
    );
    
    if (periodData.length === 0) return null;
    
    // Calculate success metrics
    const predictedAverage = optimization.result.energyForecast.reduce((sum, f) => sum + f.predictedEnergy, 0) / optimization.result.energyForecast.length;
    const actualAverage = periodData.reduce((sum, d) => sum + d.level, 0) / periodData.length;
    
    const predictionAccuracy = 100 - Math.abs(predictedAverage - actualAverage);
    
    // Check if scheduled tasks were actually completed
    const taskCompletionRate = 0.8; // Placeholder - would need task completion tracking
    
    // Overall success score
    const successScore = (predictionAccuracy * 0.4 + taskCompletionRate * 100 * 0.6);
    
    return {
      predictionAccuracy,
      taskCompletionRate,
      successScore,
      predictedAverage,
      actualAverage
    };
  }

  // Public API
  async optimizeForNextDays(days = 3) {
    const tasks = await this.getAllPendingTasks();
    return this.optimizeEnergySchedule(tasks, days * 24);
  }

  async getAllPendingTasks() {
    try {
      const allTasks = await this.storage.getAll('tasks');
      return allTasks.filter(task => 
        !task.completed && 
        (!task.deadline || new Date(task.deadline) > new Date())
      );
    } catch (error) {
      console.error('Failed to get pending tasks:', error);
      return [];
    }
  }

  getOptimizationStats() {
    const recentOptimizations = this.optimizationHistory.slice(-30);
    const evaluatedOptimizations = recentOptimizations.filter(opt => opt.evaluated && opt.success);
    
    if (evaluatedOptimizations.length === 0) return null;
    
    const averageSuccess = evaluatedOptimizations.reduce((sum, opt) => sum + opt.success.successScore, 0) / evaluatedOptimizations.length;
    const averageAccuracy = evaluatedOptimizations.reduce((sum, opt) => sum + opt.success.predictionAccuracy, 0) / evaluatedOptimizations.length;
    
    return {
      totalOptimizations: this.optimizationHistory.length,
      evaluatedOptimizations: evaluatedOptimizations.length,
      averageSuccess,
      averageAccuracy,
      lastOptimization: this.optimizationHistory[this.optimizationHistory.length - 1]?.timestamp
    };
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

export default EnergyOptimizer;