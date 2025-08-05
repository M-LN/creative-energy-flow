// Task Priority AI - AI-powered task prioritization based on energy
import StorageManager from '../utils/storage.js';

class TaskPriorityAI {
  constructor(aiConstraintEngine) {
    this.aiEngine = aiConstraintEngine;
    this.storage = new StorageManager();
    this.priorityWeights = {
      deadline: 0.25,
      energyAlignment: 0.20,
      importance: 0.20,
      complexity: 0.15,
      dependencies: 0.10,
      userPreference: 0.10
    };
    this.taskHistory = [];
    this.completionPatterns = new Map();
    this.listeners = [];
    this.init();
  }

  async init() {
    await this.loadTaskHistory();
    await this.loadUserPreferences();
    this.startPatternAnalysis();
  }

  async loadTaskHistory() {
    try {
      this.taskHistory = await this.storage.getAll('tasks') || [];
      this.analyzeCompletionPatterns();
    } catch (error) {
      console.error('Failed to load task history:', error);
      this.taskHistory = [];
    }
  }

  async loadUserPreferences() {
    this.userPreferences = this.storage.getLocalData('taskPreferences', {
      preferredWorkingHours: [9, 10, 11, 14, 15, 16],
      avoidedHours: [12, 13, 17, 18, 19],
      taskTypePreferences: {
        creative: 'morning',
        administrative: 'afternoon',
        analytical: 'morning',
        social: 'midday'
      },
      energyThresholds: {
        high: 70,
        medium: 40,
        low: 20
      }
    });
  }

  // Core prioritization algorithm
  async prioritizeTasks(tasks, timeHorizon = 24) {
    const prioritizedTasks = [];
    const currentTime = new Date();
    
    for (const task of tasks) {
      const priority = await this.calculateTaskPriority(task, currentTime);
      const energyAlignment = await this.calculateEnergyAlignment(task);
      const optimalTiming = await this.findOptimalExecutionTime(task, timeHorizon);
      const dependencies = this.analyzeDependencies(task, tasks);
      
      const prioritizedTask = {
        ...task,
        calculatedPriority: priority.score,
        priorityFactors: priority.factors,
        energyAlignment,
        optimalTiming,
        dependencies,
        recommendation: this.generateTaskRecommendation(task, priority, energyAlignment, optimalTiming),
        aiConfidence: this.calculateConfidence(priority, energyAlignment, optimalTiming)
      };
      
      prioritizedTasks.push(prioritizedTask);
    }
    
    // Sort by calculated priority (highest first)
    prioritizedTasks.sort((a, b) => b.calculatedPriority - a.calculatedPriority);
    
    // Apply context-aware adjustments
    const contextAdjustedTasks = this.applyContextualAdjustments(prioritizedTasks);
    
    // Store prioritization for learning
    await this.storePrioritization(tasks, contextAdjustedTasks);
    
    this.notifyListeners('tasksPrioritized', contextAdjustedTasks);
    
    return contextAdjustedTasks;
  }

  async calculateTaskPriority(task, currentTime) {
    const factors = {
      deadline: this.calculateDeadlinePriority(task, currentTime),
      energyAlignment: await this.calculateEnergyAlignmentScore(task),
      importance: this.calculateImportancePriority(task),
      complexity: this.calculateComplexityPriority(task),
      dependencies: this.calculateDependencyPriority(task),
      userPreference: this.calculateUserPreferencePriority(task)
    };
    
    // Calculate weighted score
    let score = 0;
    Object.keys(factors).forEach(factor => {
      score += factors[factor] * this.priorityWeights[factor];
    });
    
    // Apply urgency multiplier
    const urgencyMultiplier = this.calculateUrgencyMultiplier(task, currentTime);
    score *= urgencyMultiplier;
    
    // Normalize to 0-100 scale
    score = Math.max(0, Math.min(100, score));
    
    return {
      score: Math.round(score),
      factors,
      urgencyMultiplier
    };
  }

  calculateDeadlinePriority(task, currentTime) {
    if (!task.deadline) return 50; // Neutral score for tasks without deadlines
    
    const deadline = new Date(task.deadline);
    const timeUntilDeadline = deadline.getTime() - currentTime.getTime();
    const daysUntilDeadline = timeUntilDeadline / (1000 * 60 * 60 * 24);
    
    if (daysUntilDeadline < 0) return 100; // Overdue
    if (daysUntilDeadline < 1) return 95;  // Due today
    if (daysUntilDeadline < 3) return 85;  // Due in next 3 days
    if (daysUntilDeadline < 7) return 70;  // Due this week
    if (daysUntilDeadline < 14) return 55; // Due in next 2 weeks
    if (daysUntilDeadline < 30) return 40; // Due this month
    
    return 30; // Due later
  }

  async calculateEnergyAlignmentScore(task) {
    const currentEnergy = this.aiEngine.energyTracker.getCurrentEnergy();
    const taskEnergyRequirement = task.energyRequirement || 50;
    
    // Calculate how well current energy matches task requirements
    const energyDifference = Math.abs(currentEnergy - taskEnergyRequirement);
    const alignmentScore = Math.max(0, 100 - energyDifference);
    
    // Bonus for high-energy tasks during peak energy times
    const currentHour = new Date().getHours();
    const energyPatterns = this.aiEngine.energyTracker.getEnergyPatterns();
    
    if (energyPatterns && energyPatterns.timeOfDayPatterns) {
      const currentHourPattern = energyPatterns.timeOfDayPatterns.find(p => p.hour === currentHour);
      if (currentHourPattern && currentHourPattern.average > 70 && taskEnergyRequirement > 70) {
        return Math.min(100, alignmentScore + 15); // Bonus for optimal timing
      }
    }
    
    return alignmentScore;
  }

  calculateImportancePriority(task) {
    // Multiple importance indicators
    let importance = task.importance || 50; // Base importance
    
    // Adjust based on task attributes
    if (task.category === 'urgent') importance += 20;
    if (task.category === 'important') importance += 15;
    if (task.impact === 'high') importance += 15;
    if (task.impact === 'medium') importance += 5;
    if (task.tags && task.tags.includes('critical')) importance += 20;
    if (task.tags && task.tags.includes('strategic')) importance += 10;
    
    // Project-based importance
    if (task.projectId) {
      const projectImportance = this.getProjectImportance(task.projectId);
      importance += projectImportance * 0.3;
    }
    
    // Stakeholder importance
    if (task.stakeholder) {
      const stakeholderImportance = this.getStakeholderImportance(task.stakeholder);
      importance += stakeholderImportance * 0.2;
    }
    
    return Math.max(0, Math.min(100, importance));
  }

  calculateComplexityPriority(task) {
    const complexity = task.complexity || 'medium';
    const estimatedDuration = task.estimatedDuration || 60; // minutes
    const currentEnergy = this.aiEngine.energyTracker.getCurrentEnergy();
    
    let complexityScore = 50;
    
    // Adjust based on complexity level
    if (complexity === 'low') {
      complexityScore = 70; // Easy tasks get higher priority when energy is low
      if (currentEnergy < 40) complexityScore += 20;
    } else if (complexity === 'medium') {
      complexityScore = 60;
      if (currentEnergy >= 60) complexityScore += 10;
    } else if (complexity === 'high') {
      complexityScore = 40; // Hard tasks need good energy
      if (currentEnergy >= 80) complexityScore += 30;
      else if (currentEnergy < 50) complexityScore -= 20;
    }
    
    // Duration adjustment
    if (estimatedDuration > 180) { // 3+ hours
      if (currentEnergy >= 70) complexityScore += 10;
      else complexityScore -= 15;
    } else if (estimatedDuration < 30) { // Quick tasks
      complexityScore += 10; // Quick wins
    }
    
    return Math.max(0, Math.min(100, complexityScore));
  }

  calculateDependencyPriority(task) {
    let dependencyScore = 50; // Base score
    
    // Check if task is blocking others
    const blockingCount = this.getBlockingTasksCount(task);
    if (blockingCount > 0) {
      dependencyScore += blockingCount * 15; // Higher priority if blocking others
    }
    
    // Check if task is blocked by others
    const blockedBy = this.getBlockingDependencies(task);
    if (blockedBy.length > 0) {
      const completedDependencies = blockedBy.filter(dep => dep.completed).length;
      const dependencyProgress = completedDependencies / blockedBy.length;
      
      if (dependencyProgress === 1) {
        dependencyScore += 20; // All dependencies complete, ready to go
      } else if (dependencyProgress >= 0.75) {
        dependencyScore += 10; // Most dependencies complete
      } else if (dependencyProgress < 0.25) {
        dependencyScore -= 30; // Most dependencies incomplete
      }
    }
    
    // Sequential task priority
    if (task.isSequential) {
      const previousTask = this.getPreviousSequentialTask(task);
      if (previousTask && previousTask.completed) {
        dependencyScore += 25; // Ready for next step
      } else if (previousTask && !previousTask.completed) {
        dependencyScore -= 40; // Wait for previous step
      }
    }
    
    return Math.max(0, Math.min(100, dependencyScore));
  }

  calculateUserPreferencePriority(task) {
    let preferenceScore = 50;
    
    // Task type preferences
    const taskType = task.type || 'general';
    const typePreference = this.userPreferences.taskTypePreferences[taskType];
    const currentTimeOfDay = this.getTimeOfDay();
    
    if (typePreference === currentTimeOfDay) {
      preferenceScore += 20;
    } else if (typePreference) {
      preferenceScore -= 10;
    }
    
    // Working hours preference
    const currentHour = new Date().getHours();
    if (this.userPreferences.preferredWorkingHours.includes(currentHour)) {
      preferenceScore += 15;
    } else if (this.userPreferences.avoidedHours.includes(currentHour)) {
      preferenceScore -= 20;
    }
    
    // Personal priority rating
    if (task.personalPriority) {
      preferenceScore += (task.personalPriority - 5) * 5; // Scale personal rating
    }
    
    // Historical completion preference
    const completionPattern = this.getTaskCompletionPattern(task);
    if (completionPattern) {
      preferenceScore += completionPattern.successRate * 0.2;
    }
    
    return Math.max(0, Math.min(100, preferenceScore));
  }

  calculateUrgencyMultiplier(task, currentTime) {
    let multiplier = 1.0;
    
    // Deadline urgency
    if (task.deadline) {
      const timeUntilDeadline = new Date(task.deadline).getTime() - currentTime.getTime();
      const hoursUntilDeadline = timeUntilDeadline / (1000 * 60 * 60);
      
      if (hoursUntilDeadline < 0) multiplier = 1.5;      // Overdue
      else if (hoursUntilDeadline < 6) multiplier = 1.3; // Due very soon
      else if (hoursUntilDeadline < 24) multiplier = 1.2; // Due today
      else if (hoursUntilDeadline < 72) multiplier = 1.1; // Due soon
    }
    
    // External pressure indicators
    if (task.tags && task.tags.includes('urgent')) multiplier += 0.2;
    if (task.escalated) multiplier += 0.3;
    if (task.customerFacing) multiplier += 0.15;
    
    // Opportunity window
    if (task.timeWindow && this.isInOptimalTimeWindow(task.timeWindow)) {
      multiplier += 0.2;
    }
    
    return Math.min(2.0, multiplier); // Cap at 2x multiplier
  }

  async calculateEnergyAlignment(task) {
    const currentEnergy = this.aiEngine.energyTracker.getCurrentEnergy();
    const currentSocial = this.aiEngine.socialBattery.getCurrentLevel();
    const taskRequirements = {
      energy: task.energyRequirement || 50,
      social: task.socialRequirement || 0,
      focus: task.focusRequirement || 50
    };
    
    // Calculate energy gaps
    const energyGap = taskRequirements.energy - currentEnergy;
    const socialGap = taskRequirements.social - currentSocial;
    
    // Energy alignment score
    let alignmentScore = 100;
    
    if (energyGap > 0) {
      alignmentScore -= energyGap * 1.5; // Penalty for energy deficit
    } else {
      alignmentScore += Math.min(20, Math.abs(energyGap) * 0.5); // Bonus for energy surplus
    }
    
    if (socialGap > 0) {
      alignmentScore -= socialGap * 1.2; // Penalty for social deficit
    }
    
    // Time-based energy prediction
    const energyForecast = await this.aiEngine.predictEnergyLevel(2, []); // 2 hours ahead
    const futureAlignment = this.calculateFutureEnergyAlignment(taskRequirements, energyForecast);
    
    return {
      currentAlignment: Math.max(0, Math.min(100, alignmentScore)),
      futureAlignment,
      energyGap,
      socialGap,
      recommendation: this.getAlignmentRecommendation(energyGap, socialGap, futureAlignment)
    };
  }

  calculateFutureEnergyAlignment(requirements, forecast) {
    const predictedEnergy = forecast.predictedLevel;
    const futureEnergyGap = requirements.energy - predictedEnergy;
    
    let futureScore = 100;
    if (futureEnergyGap > 0) {
      futureScore -= futureEnergyGap * 1.5;
    } else {
      futureScore += Math.min(20, Math.abs(futureEnergyGap) * 0.5);
    }
    
    return {
      score: Math.max(0, Math.min(100, futureScore)),
      predictedEnergy,
      gap: futureEnergyGap,
      timing: futureScore > 70 ? 'optimal' : futureScore > 50 ? 'acceptable' : 'poor'
    };
  }

  getAlignmentRecommendation(energyGap, socialGap, futureAlignment) {
    if (energyGap <= 0 && socialGap <= 0) {
      return {
        action: 'execute_now',
        message: 'Optimal energy and social levels for this task',
        timing: 'immediate'
      };
    }
    
    if (energyGap > 20) {
      return {
        action: 'wait_for_energy',
        message: 'Wait for higher energy levels before starting',
        timing: futureAlignment.timing === 'optimal' ? 'later_today' : 'tomorrow'
      };
    }
    
    if (socialGap > 15) {
      return {
        action: 'recover_social',
        message: 'Take some alone time before social tasks',
        timing: 'after_recovery'
      };
    }
    
    return {
      action: 'proceed_with_caution',
      message: 'Task can be attempted but may be challenging',
      timing: 'current_with_breaks'
    };
  }

  async findOptimalExecutionTime(task, timeHorizon) {
    const candidates = [];
    const currentTime = new Date();
    
    // Check next 24-hour windows within time horizon
    for (let hour = 0; hour < timeHorizon; hour++) {
      const candidateTime = new Date(currentTime.getTime() + hour * 60 * 60 * 1000);
      const candidateHour = candidateTime.getHours();
      
      // Skip non-working hours unless task allows it
      if (!task.allowsNonWorkingHours && (candidateHour < 8 || candidateHour > 20)) {
        continue;
      }
      
      const energyPrediction = await this.aiEngine.predictEnergyLevel(hour, []);
      const socialPrediction = await this.aiEngine.predictSocialLevel(hour, []);
      
      const suitability = this.calculateTimeSuitability(
        task,
        candidateTime,
        energyPrediction.predictedLevel,
        socialPrediction.predictedLevel
      );
      
      candidates.push({
        time: candidateTime,
        hour: candidateHour,
        energyLevel: energyPrediction.predictedLevel,
        socialLevel: socialPrediction.predictedLevel,
        suitability,
        confidence: Math.min(energyPrediction.confidence, socialPrediction.confidence)
      });
    }
    
    // Sort by suitability and return top candidates
    candidates.sort((a, b) => b.suitability - a.suitability);
    
    return {
      optimal: candidates[0] || null,
      alternatives: candidates.slice(1, 4), // Top 3 alternatives
      allCandidates: candidates
    };
  }

  calculateTimeSuitability(task, time, energyLevel, socialLevel) {
    let suitability = 0;
    
    // Energy match (40%)
    const energyRequirement = task.energyRequirement || 50;
    const energyMatch = Math.max(0, 100 - Math.abs(energyLevel - energyRequirement));
    suitability += energyMatch * 0.4;
    
    // Social requirement match (20%)
    const socialRequirement = task.socialRequirement || 0;
    const socialMatch = socialRequirement === 0 ? 100 : Math.max(0, socialLevel - socialRequirement + 50);
    suitability += socialMatch * 0.2;
    
    // Time preferences (25%)
    const hour = time.getHours();
    const timeMatch = this.calculateTimePreferenceMatch(task, hour);
    suitability += timeMatch * 0.25;
    
    // Task type alignment (15%)
    const typeMatch = this.calculateTaskTypeTimeAlignment(task.type, hour);
    suitability += typeMatch * 0.15;
    
    return Math.round(suitability);
  }

  calculateTimePreferenceMatch(task, hour) {
    // User's preferred working hours
    if (this.userPreferences.preferredWorkingHours.includes(hour)) {
      return 100;
    }
    
    // Task-specific time preferences
    if (task.preferredHours && task.preferredHours.includes(hour)) {
      return 100;
    }
    
    // Avoided hours
    if (this.userPreferences.avoidedHours.includes(hour)) {
      return 20;
    }
    
    // General working hours
    if (hour >= 9 && hour <= 17) {
      return 80;
    }
    
    return 50; // Neutral for other times
  }

  calculateTaskTypeTimeAlignment(taskType, hour) {
    const alignments = {
      creative: { peak: [9, 10, 11], good: [8, 14, 15], poor: [12, 13, 16, 17, 18] },
      analytical: { peak: [9, 10, 11, 14], good: [8, 15, 16], poor: [12, 13, 17, 18] },
      administrative: { peak: [14, 15, 16], good: [9, 10, 11, 17], poor: [12, 13, 18, 19] },
      social: { peak: [10, 11, 14, 15], good: [9, 16, 17], poor: [12, 13, 18, 19] },
      routine: { peak: [14, 15, 16, 17], good: [9, 10, 11], poor: [12, 13] }
    };
    
    const alignment = alignments[taskType] || alignments.routine;
    
    if (alignment.peak.includes(hour)) return 100;
    if (alignment.good.includes(hour)) return 75;
    if (alignment.poor.includes(hour)) return 30;
    
    return 60; // Default
  }

  analyzeDependencies(task, allTasks) {
    const dependencies = {
      blockedBy: [],
      blocking: [],
      sequential: null,
      ready: true
    };
    
    // Find tasks this task depends on
    if (task.dependencies) {
      dependencies.blockedBy = task.dependencies.map(depId => 
        allTasks.find(t => t.id === depId)
      ).filter(Boolean);
      
      dependencies.ready = dependencies.blockedBy.every(dep => dep.completed);
    }
    
    // Find tasks that depend on this task
    dependencies.blocking = allTasks.filter(t => 
      t.dependencies && t.dependencies.includes(task.id)
    );
    
    // Sequential task analysis
    if (task.sequenceId) {
      const sequenceTasks = allTasks.filter(t => t.sequenceId === task.sequenceId);
      sequenceTasks.sort((a, b) => (a.sequenceOrder || 0) - (b.sequenceOrder || 0));
      
      const currentIndex = sequenceTasks.findIndex(t => t.id === task.id);
      if (currentIndex > 0) {
        dependencies.sequential = {
          previous: sequenceTasks[currentIndex - 1],
          next: sequenceTasks[currentIndex + 1] || null,
          position: currentIndex + 1,
          total: sequenceTasks.length
        };
        
        dependencies.ready = dependencies.ready && sequenceTasks[currentIndex - 1].completed;
      }
    }
    
    return dependencies;
  }

  applyContextualAdjustments(prioritizedTasks) {
    const adjustedTasks = [...prioritizedTasks];
    const currentEnergy = this.aiEngine.energyTracker.getCurrentEnergy();
    const currentSocial = this.aiEngine.socialBattery.getCurrentLevel();
    
    // Energy-based adjustments
    if (currentEnergy < 40) {
      // Boost low-energy tasks when energy is low
      adjustedTasks.forEach(task => {
        if ((task.energyAlignment?.energyGap || 0) <= 0) {
          task.calculatedPriority += 10;
        }
      });
    } else if (currentEnergy > 75) {
      // Boost high-energy tasks when energy is high
      adjustedTasks.forEach(task => {
        if ((task.task?.energyRequirement || 50) > 70) {
          task.calculatedPriority += 15;
        }
      });
    }
    
    // Social battery adjustments
    if (currentSocial < 30) {
      // Deprioritize social tasks when social battery is low
      adjustedTasks.forEach(task => {
        if ((task.task?.socialRequirement || 0) > 20) {
          task.calculatedPriority -= 20;
        }
      });
    }
    
    // Time-of-day adjustments
    const currentHour = new Date().getHours();
    adjustedTasks.forEach(task => {
      const optimalHour = task.optimalTiming?.optimal?.hour;
      if (optimalHour && Math.abs(optimalHour - currentHour) <= 1) {
        task.calculatedPriority += 5; // Bonus for being at optimal time
      }
    });
    
    // Re-sort after adjustments
    adjustedTasks.sort((a, b) => b.calculatedPriority - a.calculatedPriority);
    
    return adjustedTasks;
  }

  generateTaskRecommendation(task, priority, energyAlignment, optimalTiming) {
    const recommendations = [];
    
    // Priority-based recommendations
    if (priority.score >= 90) {
      recommendations.push({
        type: 'high_priority',
        message: 'This task requires immediate attention',
        action: 'Start as soon as possible'
      });
    } else if (priority.score <= 30) {
      recommendations.push({
        type: 'low_priority',
        message: 'This task can be delayed',
        action: 'Consider rescheduling or delegating'
      });
    }
    
    // Energy-based recommendations
    if (energyAlignment.energyGap > 20) {
      recommendations.push({
        type: 'energy_mismatch',
        message: 'Task requires more energy than currently available',
        action: energyAlignment.recommendation.message
      });
    }
    
    // Timing recommendations
    if (optimalTiming.optimal && optimalTiming.optimal.suitability > 80) {
      const optimalTime = optimalTiming.optimal.time;
      const hoursUntilOptimal = (optimalTime.getTime() - Date.now()) / (1000 * 60 * 60);
      
      if (hoursUntilOptimal > 0 && hoursUntilOptimal <= 8) {
        recommendations.push({
          type: 'timing_optimization',
          message: `Optimal execution time is ${optimalTime.toLocaleTimeString()}`,
          action: 'Consider waiting for optimal energy conditions'
        });
      }
    }
    
    // Dependency recommendations
    if (task.dependencies && !task.dependencies.ready) {
      recommendations.push({
        type: 'dependency_block',
        message: 'Task is blocked by incomplete dependencies',
        action: 'Complete prerequisite tasks first'
      });
    }
    
    return recommendations.length > 0 ? recommendations[0] : {
      type: 'ready',
      message: 'Task is ready for execution',
      action: 'Proceed when convenient'
    };
  }

  calculateConfidence(priority, energyAlignment, optimalTiming) {
    let confidence = 100;
    
    // Reduce confidence for uncertain predictions
    if (priority.factors.deadline === 50) confidence -= 10; // No deadline
    if (!optimalTiming.optimal) confidence -= 15; // No optimal time found
    if (energyAlignment.currentAlignment < 50) confidence -= 10; // Poor energy alignment
    
    // Increase confidence for strong indicators
    if (priority.score > 80) confidence += 5;
    if (energyAlignment.currentAlignment > 80) confidence += 5;
    if (optimalTiming.optimal && optimalTiming.optimal.confidence > 0.8) confidence += 5;
    
    return Math.max(50, Math.min(100, confidence));
  }

  // Learning and pattern analysis
  analyzeCompletionPatterns() {
    const completedTasks = this.taskHistory.filter(task => task.completed);
    
    completedTasks.forEach(task => {
      const pattern = this.completionPatterns.get(task.type) || {
        count: 0,
        totalTime: 0,
        energyLevels: [],
        successRate: 100,
        optimalHours: []
      };
      
      pattern.count += 1;
      if (task.actualDuration) pattern.totalTime += task.actualDuration;
      if (task.completionEnergyLevel) pattern.energyLevels.push(task.completionEnergyLevel);
      if (task.completionHour) pattern.optimalHours.push(task.completionHour);
      
      this.completionPatterns.set(task.type, pattern);
    });
  }

  getTaskCompletionPattern(task) {
    return this.completionPatterns.get(task.type || 'general');
  }

  async storePrioritization(originalTasks, prioritizedTasks) {
    const prioritization = {
      id: Date.now(),
      timestamp: Date.now(),
      originalTasks: originalTasks.map(t => ({ id: t.id, title: t.title })),
      prioritizedTasks: prioritizedTasks.map(t => ({
        id: t.id,
        priority: t.calculatedPriority,
        factors: t.priorityFactors
      })),
      context: {
        energyLevel: this.aiEngine.energyTracker.getCurrentEnergy(),
        socialLevel: this.aiEngine.socialBattery.getCurrentLevel(),
        timeOfDay: new Date().getHours()
      }
    };
    
    await this.storage.store('prioritizations', prioritization);
  }

  startPatternAnalysis() {
    // Analyze patterns every hour
    setInterval(() => {
      this.analyzeCompletionPatterns();
      this.updatePriorityWeights();
    }, 60 * 60 * 1000);
  }

  updatePriorityWeights() {
    // Adjust priority weights based on user behavior and completion patterns
    const recentCompletions = this.taskHistory.filter(task => 
      task.completed && 
      task.completedAt > Date.now() - (7 * 24 * 60 * 60 * 1000) // Last week
    );
    
    if (recentCompletions.length < 5) return; // Need more data
    
    // Analyze which factors led to successful completions
    const factorAnalysis = this.analyzePriorityFactorSuccess(recentCompletions);
    
    // Adjust weights slightly based on success patterns
    Object.keys(factorAnalysis).forEach(factor => {
      if (this.priorityWeights[factor]) {
        const adjustment = (factorAnalysis[factor] - 0.5) * 0.1; // Small adjustments
        this.priorityWeights[factor] = Math.max(0.05, Math.min(0.4, 
          this.priorityWeights[factor] + adjustment
        ));
      }
    });
    
    // Normalize weights to sum to 1
    const totalWeight = Object.values(this.priorityWeights).reduce((sum, w) => sum + w, 0);
    Object.keys(this.priorityWeights).forEach(factor => {
      this.priorityWeights[factor] /= totalWeight;
    });
    
    // Save updated weights
    this.storage.setLocalData('priorityWeights', this.priorityWeights);
  }

  analyzePriorityFactorSuccess(completions) {
    // Placeholder for factor analysis
    // Would analyze correlation between priority factors and successful completion
    return {
      deadline: 0.6,
      energyAlignment: 0.7,
      importance: 0.5,
      complexity: 0.4,
      dependencies: 0.6,
      userPreference: 0.8
    };
  }

  // Utility methods
  getProjectImportance(projectId) {
    const projects = this.storage.getLocalData('projects', {});
    return projects[projectId]?.importance || 50;
  }

  getStakeholderImportance(stakeholder) {
    const stakeholders = this.storage.getLocalData('stakeholders', {});
    return stakeholders[stakeholder]?.importance || 50;
  }

  getBlockingTasksCount(task) {
    return this.taskHistory.filter(t => 
      t.dependencies && t.dependencies.includes(task.id) && !t.completed
    ).length;
  }

  getBlockingDependencies(task) {
    if (!task.dependencies) return [];
    return task.dependencies.map(depId => 
      this.taskHistory.find(t => t.id === depId)
    ).filter(Boolean);
  }

  getPreviousSequentialTask(task) {
    if (!task.sequenceId || !task.sequenceOrder) return null;
    return this.taskHistory.find(t => 
      t.sequenceId === task.sequenceId && 
      t.sequenceOrder === task.sequenceOrder - 1
    );
  }

  getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }

  isInOptimalTimeWindow(timeWindow) {
    const currentHour = new Date().getHours();
    return timeWindow.start <= currentHour && currentHour <= timeWindow.end;
  }

  // Public API
  async getTopPriorityTasks(count = 5) {
    const allTasks = await this.storage.getAll('tasks');
    const pendingTasks = allTasks.filter(task => !task.completed);
    const prioritized = await this.prioritizeTasks(pendingTasks);
    return prioritized.slice(0, count);
  }

  async getSuggestedNextTask() {
    const topTasks = await this.getTopPriorityTasks(3);
    const currentEnergy = this.aiEngine.energyTracker.getCurrentEnergy();
    const currentSocial = this.aiEngine.socialBattery.getCurrentLevel();
    
    // Find the best task for current conditions
    const suitable = topTasks.filter(task => 
      task.energyAlignment.currentAlignment > 60 &&
      (task.task.socialRequirement || 0) <= currentSocial
    );
    
    return suitable[0] || topTasks[0] || null;
  }

  getPriorityWeights() {
    return { ...this.priorityWeights };
  }

  updatePriorityWeight(factor, weight) {
    if (this.priorityWeights[factor] !== undefined) {
      this.priorityWeights[factor] = Math.max(0, Math.min(1, weight));
      this.storage.setLocalData('priorityWeights', this.priorityWeights);
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
}

export default TaskPriorityAI;