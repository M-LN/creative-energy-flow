// Core AI Constraint Engine for energy-based scheduling and optimization
import EnergyTracker from '../core/energyTracker.js';
import SocialBattery from '../core/socialBattery.js';
import StorageManager from '../utils/storage.js';

class AIConstraintEngine {
  constructor() {
    this.energyTracker = new EnergyTracker();
    this.socialBattery = new SocialBattery();
    this.storage = new StorageManager();
    this.models = new Map();
    this.constraints = {
      minEnergyLevel: 20,
      minSocialLevel: 15,
      maxDailyDrain: 80,
      maxConsecutiveSocialHours: 4,
      recoveryBufferTime: 30, // minutes
      creativePeakHours: [9, 10, 11], // Default creative peak hours
      socialPeakHours: [14, 15, 16, 17], // Default social peak hours
      strictMode: false
    };
    this.recommendations = [];
    this.insights = [];
    this.init();
  }

  async init() {
    await this.loadConstraints();
    await this.initializeAIModels();
    this.startContinuousAnalysis();
  }

  async loadConstraints() {
    const savedConstraints = this.storage.getLocalData('aiConstraints');
    if (savedConstraints) {
      this.constraints = { ...this.constraints, ...savedConstraints };
    }
  }

  async saveConstraints() {
    this.storage.setLocalData('aiConstraints', this.constraints);
  }

  // AI Model Management
  async initializeAIModels() {
    try {
      // Initialize TensorFlow.js models for different aspects
      await this.loadEnergyPredictionModel();
      await this.loadSocialPatternModel();
      await this.loadScheduleOptimizationModel();
      await this.loadTaskPriorityModel();
    } catch (error) {
      console.error('Failed to initialize AI models:', error);
      // Fallback to rule-based systems
      this.initializeRuleBasedSystems();
    }
  }

  async loadEnergyPredictionModel() {
    // Try to load pre-trained model or create a simple neural network
    try {
      const savedModel = await this.storage.getAIModel('energyPrediction');
      if (savedModel) {
        this.models.set('energyPrediction', await tf.loadLayersModel(tf.io.fromMemory(savedModel.data)));
      } else {
        this.models.set('energyPrediction', this.createEnergyPredictionModel());
      }
    } catch (error) {
      console.error('Energy prediction model error:', error);
      this.models.set('energyPrediction', null);
    }
  }

  async loadSocialPatternModel() {
    try {
      const savedModel = await this.storage.getAIModel('socialPattern');
      if (savedModel) {
        this.models.set('socialPattern', await tf.loadLayersModel(tf.io.fromMemory(savedModel.data)));
      } else {
        this.models.set('socialPattern', this.createSocialPatternModel());
      }
    } catch (error) {
      console.error('Social pattern model error:', error);
      this.models.set('socialPattern', null);
    }
  }

  async loadScheduleOptimizationModel() {
    try {
      const savedModel = await this.storage.getAIModel('scheduleOptimization');
      if (savedModel) {
        this.models.set('scheduleOptimization', await tf.loadLayersModel(tf.io.fromMemory(savedModel.data)));
      } else {
        this.models.set('scheduleOptimization', this.createScheduleOptimizationModel());
      }
    } catch (error) {
      console.error('Schedule optimization model error:', error);
      this.models.set('scheduleOptimization', null);
    }
  }

  async loadTaskPriorityModel() {
    try {
      const savedModel = await this.storage.getAIModel('taskPriority');
      if (savedModel) {
        this.models.set('taskPriority', await tf.loadLayersModel(tf.io.fromMemory(savedModel.data)));
      } else {
        this.models.set('taskPriority', this.createTaskPriorityModel());
      }
    } catch (error) {
      console.error('Task priority model error:', error);
      this.models.set('taskPriority', null);
    }
  }

  createEnergyPredictionModel() {
    if (typeof tf === 'undefined') return null;
    
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [7], units: 32, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 16, activation: 'relu' }),
        tf.layers.dense({ units: 8, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' })
      ]
    });

    model.compile({
      optimizer: 'adam',
      loss: 'meanSquaredError',
      metrics: ['mae']
    });

    return model;
  }

  createSocialPatternModel() {
    if (typeof tf === 'undefined') return null;
    
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [6], units: 24, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 12, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' })
      ]
    });

    model.compile({
      optimizer: 'adam',
      loss: 'meanSquaredError',
      metrics: ['mae']
    });

    return model;
  }

  createScheduleOptimizationModel() {
    if (typeof tf === 'undefined') return null;
    
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [10], units: 64, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 16, activation: 'relu' }),
        tf.layers.dense({ units: 4, activation: 'softmax' }) // 4 priority levels
      ]
    });

    model.compile({
      optimizer: 'adam',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  createTaskPriorityModel() {
    if (typeof tf === 'undefined') return null;
    
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [8], units: 32, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 16, activation: 'relu' }),
        tf.layers.dense({ units: 3, activation: 'softmax' }) // low, medium, high priority
      ]
    });

    model.compile({
      optimizer: 'adam',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  initializeRuleBasedSystems() {
    // Fallback rule-based systems when AI models aren't available
    this.models.set('energyPrediction', 'rule-based');
    this.models.set('socialPattern', 'rule-based');
    this.models.set('scheduleOptimization', 'rule-based');
    this.models.set('taskPriority', 'rule-based');
  }

  // Core AI Analysis Functions
  async analyzeCurrentState() {
    const currentEnergy = this.energyTracker.getCurrentEnergy();
    const currentSocial = this.socialBattery.getCurrentLevel();
    const energyPatterns = this.energyTracker.getEnergyPatterns();
    const socialPatterns = this.socialBattery.getSocialPatterns();

    const analysis = {
      timestamp: Date.now(),
      currentEnergy,
      currentSocial,
      energyPatterns,
      socialPatterns,
      constraints: this.constraints,
      riskFactors: this.identifyRiskFactors(currentEnergy, currentSocial),
      opportunities: this.identifyOpportunities(currentEnergy, currentSocial, energyPatterns, socialPatterns)
    };

    return analysis;
  }

  identifyRiskFactors(currentEnergy, currentSocial) {
    const risks = [];

    if (currentEnergy < this.constraints.minEnergyLevel) {
      risks.push({
        type: 'low_energy',
        severity: 'high',
        description: 'Energy level below minimum threshold',
        recommendation: 'Schedule recovery time immediately'
      });
    }

    if (currentSocial < this.constraints.minSocialLevel) {
      risks.push({
        type: 'social_depletion',
        severity: 'high',
        description: 'Social battery critically low',
        recommendation: 'Avoid social interactions, focus on recovery'
      });
    }

    if (currentEnergy < 40 && currentSocial < 40) {
      risks.push({
        type: 'dual_depletion',
        severity: 'critical',
        description: 'Both energy and social battery are low',
        recommendation: 'Clear schedule for full recovery day'
      });
    }

    return risks;
  }

  identifyOpportunities(currentEnergy, currentSocial, energyPatterns, socialPatterns) {
    const opportunities = [];
    const currentHour = new Date().getHours();

    if (currentEnergy > 75) {
      opportunities.push({
        type: 'high_energy_window',
        description: 'Optimal time for challenging tasks',
        recommendation: 'Schedule important or creative work',
        timeWindow: 120 // minutes
      });
    }

    if (currentSocial > 70) {
      opportunities.push({
        type: 'social_energy_available',
        description: 'Good time for social interactions',
        recommendation: 'Schedule meetings or social activities',
        timeWindow: 180
      });
    }

    if (this.constraints.creativePeakHours.includes(currentHour) && currentEnergy > 60) {
      opportunities.push({
        type: 'creative_peak',
        description: 'Peak creative hours with good energy',
        recommendation: 'Focus on creative or strategic work',
        timeWindow: 90
      });
    }

    return opportunities;
  }

  // Energy Prediction
  async predictEnergyLevel(hoursAhead, plannedActivities = []) {
    const model = this.models.get('energyPrediction');
    
    if (model && model !== 'rule-based' && typeof tf !== 'undefined') {
      return this.aiPredictEnergy(model, hoursAhead, plannedActivities);
    } else {
      return this.ruleBasedEnergyPrediction(hoursAhead, plannedActivities);
    }
  }

  async aiPredictEnergy(model, hoursAhead, plannedActivities) {
    try {
      const currentEnergy = this.energyTracker.getCurrentEnergy();
      const currentSocial = this.socialBattery.getCurrentLevel();
      const currentHour = new Date().getHours();
      const dayOfWeek = new Date().getDay();
      const plannedDrain = plannedActivities.reduce((sum, activity) => sum + (activity.energyDrain || 0), 0);
      const plannedRecovery = plannedActivities.reduce((sum, activity) => sum + (activity.energyRecovery || 0), 0);

      const inputTensor = tf.tensor2d([[
        currentEnergy / 100,
        currentSocial / 100,
        currentHour / 24,
        dayOfWeek / 7,
        hoursAhead / 24,
        plannedDrain / 100,
        plannedRecovery / 100
      ]]);

      const prediction = model.predict(inputTensor);
      const predictedLevel = await prediction.data();
      
      inputTensor.dispose();
      prediction.dispose();

      return {
        predictedLevel: predictedLevel[0] * 100,
        confidence: 0.8, // Placeholder confidence
        factors: {
          naturalDecay: hoursAhead * 2,
          plannedDrain,
          plannedRecovery,
          timeOfDayEffect: this.getTimeOfDayEnergyEffect(new Date().getHours() + hoursAhead)
        }
      };
    } catch (error) {
      console.error('AI energy prediction failed:', error);
      return this.ruleBasedEnergyPrediction(hoursAhead, plannedActivities);
    }
  }

  ruleBasedEnergyPrediction(hoursAhead, plannedActivities) {
    let predictedLevel = this.energyTracker.getCurrentEnergy();
    
    // Natural decay over time
    const naturalDecay = hoursAhead * 1.5;
    predictedLevel -= naturalDecay;
    
    // Time of day effects
    const futureHour = (new Date().getHours() + hoursAhead) % 24;
    const timeEffect = this.getTimeOfDayEnergyEffect(futureHour);
    predictedLevel += timeEffect;
    
    // Planned activities impact
    const plannedDrain = plannedActivities.reduce((sum, activity) => sum + (activity.energyDrain || 0), 0);
    const plannedRecovery = plannedActivities.reduce((sum, activity) => sum + (activity.energyRecovery || 0), 0);
    
    predictedLevel = predictedLevel - plannedDrain + plannedRecovery;
    
    return {
      predictedLevel: Math.max(0, Math.min(100, predictedLevel)),
      confidence: 0.6,
      factors: {
        naturalDecay,
        timeEffect,
        plannedDrain,
        plannedRecovery
      }
    };
  }

  getTimeOfDayEnergyEffect(hour) {
    // Energy patterns throughout the day
    if (hour >= 6 && hour <= 9) return 10; // Morning boost
    if (hour >= 10 && hour <= 12) return 5; // Late morning
    if (hour >= 13 && hour <= 15) return -10; // Afternoon dip
    if (hour >= 16 && hour <= 18) return 0; // Late afternoon
    if (hour >= 19 && hour <= 21) return -5; // Evening
    if (hour >= 22 || hour <= 5) return -15; // Night time
    return 0;
  }

  // Social Battery Prediction
  async predictSocialLevel(hoursAhead, plannedInteractions = []) {
    const model = this.models.get('socialPattern');
    
    if (model && model !== 'rule-based' && typeof tf !== 'undefined') {
      return this.aiPredictSocial(model, hoursAhead, plannedInteractions);
    } else {
      return this.ruleBasedSocialPrediction(hoursAhead, plannedInteractions);
    }
  }

  async aiPredictSocial(model, hoursAhead, plannedInteractions) {
    try {
      const currentSocial = this.socialBattery.getCurrentLevel();
      const currentEnergy = this.energyTracker.getCurrentEnergy();
      const currentHour = new Date().getHours();
      const plannedDrain = plannedInteractions.reduce((sum, interaction) => sum + (interaction.socialDrain || 0), 0);
      const plannedRecovery = plannedInteractions.reduce((sum, interaction) => sum + (interaction.socialRecovery || 0), 0);
      const peopleCount = plannedInteractions.reduce((sum, interaction) => sum + (interaction.peopleCount || 0), 0);

      const inputTensor = tf.tensor2d([[
        currentSocial / 100,
        currentEnergy / 100,
        currentHour / 24,
        hoursAhead / 24,
        plannedDrain / 100,
        peopleCount / 10
      ]]);

      const prediction = model.predict(inputTensor);
      const predictedLevel = await prediction.data();
      
      inputTensor.dispose();
      prediction.dispose();

      return {
        predictedLevel: predictedLevel[0] * 100,
        confidence: 0.8,
        factors: {
          naturalRecovery: hoursAhead * 1,
          plannedDrain,
          plannedRecovery
        }
      };
    } catch (error) {
      console.error('AI social prediction failed:', error);
      return this.ruleBasedSocialPrediction(hoursAhead, plannedInteractions);
    }
  }

  ruleBasedSocialPrediction(hoursAhead, plannedInteractions) {
    let predictedLevel = this.socialBattery.getCurrentLevel();
    
    // Natural recovery when alone
    const aloneTime = hoursAhead - plannedInteractions.reduce((sum, interaction) => sum + (interaction.duration || 0), 0);
    const naturalRecovery = Math.max(0, aloneTime * 1.5);
    predictedLevel += naturalRecovery;
    
    // Planned interactions impact
    const plannedDrain = plannedInteractions.reduce((sum, interaction) => sum + (interaction.socialDrain || 0), 0);
    const plannedRecovery = plannedInteractions.reduce((sum, interaction) => sum + (interaction.socialRecovery || 0), 0);
    
    predictedLevel = predictedLevel - plannedDrain + plannedRecovery;
    
    return {
      predictedLevel: Math.max(0, Math.min(100, predictedLevel)),
      confidence: 0.6,
      factors: {
        naturalRecovery,
        plannedDrain,
        plannedRecovery
      }
    };
  }

  // Task and Schedule Optimization
  async optimizeTaskSequence(tasks) {
    const optimizedTasks = [];
    const sortedTasks = [...tasks].sort((a, b) => this.calculateTaskPriority(b) - this.calculateTaskPriority(a));
    
    let currentTime = new Date();
    let runningEnergyLevel = this.energyTracker.getCurrentEnergy();
    let runningSocialLevel = this.socialBattery.getCurrentLevel();

    for (const task of sortedTasks) {
      const energyPrediction = await this.predictEnergyLevel(1, [task]);
      const socialPrediction = await this.predictSocialLevel(1, [task]);
      
      if (this.isTaskFeasible(task, runningEnergyLevel, runningSocialLevel, energyPrediction, socialPrediction)) {
        const optimizedTask = {
          ...task,
          scheduledTime: new Date(currentTime),
          energyForecast: energyPrediction,
          socialForecast: socialPrediction,
          priority: this.calculateTaskPriority(task)
        };
        
        optimizedTasks.push(optimizedTask);
        
        // Update running levels
        runningEnergyLevel = energyPrediction.predictedLevel;
        runningSocialLevel = socialPrediction.predictedLevel;
        
        // Advance time
        currentTime = new Date(currentTime.getTime() + (task.estimatedDuration || 60) * 60 * 1000);
      } else {
        // Suggest alternative time or modifications
        const alternative = this.suggestTaskAlternative(task, runningEnergyLevel, runningSocialLevel);
        optimizedTasks.push({
          ...task,
          scheduledTime: null,
          alternative,
          feasible: false
        });
      }
    }

    return optimizedTasks;
  }

  calculateTaskPriority(task) {
    const model = this.models.get('taskPriority');
    
    if (model && model !== 'rule-based' && typeof tf !== 'undefined') {
      return this.aiCalculateTaskPriority(model, task);
    } else {
      return this.ruleBasedTaskPriority(task);
    }
  }

  ruleBasedTaskPriority(task) {
    let priority = task.basePriority || 50;
    
    // Urgency factor
    if (task.deadline) {
      const daysUntilDeadline = (new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24);
      if (daysUntilDeadline <= 1) priority += 30;
      else if (daysUntilDeadline <= 3) priority += 20;
      else if (daysUntilDeadline <= 7) priority += 10;
    }
    
    // Energy requirement vs current level
    const currentEnergy = this.energyTracker.getCurrentEnergy();
    const energyGap = (task.energyRequirement || 50) - currentEnergy;
    if (energyGap > 30) priority -= 20;
    else if (energyGap > 10) priority -= 10;
    else if (energyGap < -20) priority += 10;
    
    // Time of day optimization
    const currentHour = new Date().getHours();
    if (task.type === 'creative' && this.constraints.creativePeakHours.includes(currentHour)) {
      priority += 15;
    }
    if (task.type === 'social' && this.constraints.socialPeakHours.includes(currentHour)) {
      priority += 15;
    }
    
    return Math.max(0, Math.min(100, priority));
  }

  isTaskFeasible(task, currentEnergy, currentSocial, energyForecast, socialForecast) {
    // Check if task can be completed without violating constraints
    const energyAfterTask = energyForecast.predictedLevel;
    const socialAfterTask = socialForecast.predictedLevel;
    
    if (energyAfterTask < this.constraints.minEnergyLevel && this.constraints.strictMode) {
      return false;
    }
    
    if (socialAfterTask < this.constraints.minSocialLevel && this.constraints.strictMode) {
      return false;
    }
    
    if ((task.energyRequirement || 50) > currentEnergy + 20) {
      return false;
    }
    
    return true;
  }

  suggestTaskAlternative(task, currentEnergy, currentSocial) {
    const alternatives = [];
    
    if ((task.energyRequirement || 50) > currentEnergy) {
      alternatives.push({
        type: 'energy_recovery',
        suggestion: 'Take a break to restore energy before attempting this task',
        estimatedRecoveryTime: Math.ceil((task.energyRequirement - currentEnergy) / 10) * 15 // minutes
      });
    }
    
    if ((task.socialRequirement || 0) > currentSocial) {
      alternatives.push({
        type: 'social_recovery',
        suggestion: 'Schedule some alone time before social interactions',
        estimatedRecoveryTime: Math.ceil((task.socialRequirement - currentSocial) / 5) * 30 // minutes
      });
    }
    
    // Suggest optimal timing
    const optimalHour = this.findOptimalTimeForTask(task);
    if (optimalHour) {
      alternatives.push({
        type: 'timing_optimization',
        suggestion: `This task would be better scheduled around ${optimalHour}:00`,
        optimalTime: optimalHour
      });
    }
    
    return alternatives;
  }

  findOptimalTimeForTask(task) {
    // Find the best time based on task type and historical patterns
    if (task.type === 'creative') {
      return this.constraints.creativePeakHours[0];
    }
    if (task.type === 'social') {
      return this.constraints.socialPeakHours[0];
    }
    
    // For other tasks, find time when energy is typically highest
    const energyPatterns = this.energyTracker.getEnergyPatterns();
    if (energyPatterns && energyPatterns.timeOfDayPatterns) {
      const sortedHours = energyPatterns.timeOfDayPatterns
        .sort((a, b) => b.average - a.average);
      return sortedHours[0]?.hour;
    }
    
    return null;
  }

  // Continuous analysis and recommendations
  startContinuousAnalysis() {
    // Run analysis every 15 minutes
    setInterval(async () => {
      await this.performPeriodicAnalysis();
    }, 15 * 60 * 1000);
    
    // Initial analysis
    this.performPeriodicAnalysis();
  }

  async performPeriodicAnalysis() {
    try {
      const analysis = await this.analyzeCurrentState();
      const newRecommendations = this.generateRecommendations(analysis);
      const newInsights = this.generateInsights(analysis);
      
      this.recommendations = newRecommendations;
      this.insights = newInsights;
      
      // Store insights for historical analysis
      await this.storage.store('insights', {
        id: Date.now(),
        timestamp: Date.now(),
        analysis,
        recommendations: newRecommendations,
        insights: newInsights
      });
      
      this.notifyListeners('analysisComplete', {
        analysis,
        recommendations: newRecommendations,
        insights: newInsights
      });
    } catch (error) {
      console.error('Periodic analysis failed:', error);
    }
  }

  generateRecommendations(analysis) {
    const recommendations = [];
    const { currentEnergy, currentSocial, riskFactors, opportunities } = analysis;
    
    // Process risk factors
    riskFactors.forEach(risk => {
      recommendations.push({
        id: `risk_${Date.now()}_${Math.random()}`,
        type: 'warning',
        priority: risk.severity === 'critical' ? 'high' : 'medium',
        title: `${risk.type.replace('_', ' ').toUpperCase()} Alert`,
        description: risk.description,
        action: risk.recommendation,
        timestamp: Date.now()
      });
    });
    
    // Process opportunities
    opportunities.forEach(opportunity => {
      recommendations.push({
        id: `opportunity_${Date.now()}_${Math.random()}`,
        type: 'opportunity',
        priority: 'medium',
        title: opportunity.type.replace('_', ' ').toUpperCase(),
        description: opportunity.description,
        action: opportunity.recommendation,
        timeWindow: opportunity.timeWindow,
        timestamp: Date.now()
      });
    });
    
    // General optimization recommendations
    if (currentEnergy > 75 && currentSocial > 70) {
      recommendations.push({
        id: `optimal_${Date.now()}`,
        type: 'optimization',
        priority: 'low',
        title: 'Optimal Performance Window',
        description: 'Both energy and social battery are high',
        action: 'Consider tackling your most important or challenging tasks',
        timestamp: Date.now()
      });
    }
    
    return recommendations.slice(0, 5); // Limit to top 5 recommendations
  }

  generateInsights(analysis) {
    const insights = [];
    const { energyPatterns, socialPatterns } = analysis;
    
    // Energy insights
    if (energyPatterns) {
      const weeklyTrend = energyPatterns.weeklyTrend;
      if (weeklyTrend) {
        insights.push({
          id: `energy_trend_${Date.now()}`,
          type: 'trend',
          title: 'Energy Trend',
          value: `${weeklyTrend.trendDirection === 'improving' ? '+' : ''}${weeklyTrend.trend.toFixed(1)}`,
          description: `Your energy is ${weeklyTrend.trendDirection} this week`,
          category: 'energy'
        });
      }
    }
    
    // Social insights
    if (socialPatterns) {
      const dailyAverage = socialPatterns.dailyAverage;
      if (dailyAverage && dailyAverage.length > 0) {
        const recentAverage = dailyAverage.slice(-7).reduce((sum, day) => sum + day.average, 0) / 7;
        insights.push({
          id: `social_average_${Date.now()}`,
          type: 'average',
          title: 'Weekly Social Average',
          value: `${recentAverage.toFixed(1)}%`,
          description: 'Your average social battery level this week',
          category: 'social'
        });
      }
    }
    
    return insights;
  }

  // Constraint management
  updateConstraints(newConstraints) {
    this.constraints = { ...this.constraints, ...newConstraints };
    this.saveConstraints();
    
    // Trigger re-analysis with new constraints
    this.performPeriodicAnalysis();
  }

  getConstraints() {
    return { ...this.constraints };
  }

  // Event listeners
  addEventListener(event, callback) {
    if (!this.listeners) this.listeners = {};
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  removeEventListener(event, callback) {
    if (this.listeners && this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  notifyListeners(event, data) {
    if (this.listeners && this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  // Public getters
  getCurrentRecommendations() {
    return [...this.recommendations];
  }

  getCurrentInsights() {
    return [...this.insights];
  }

  // Model training
  async trainModels() {
    const energyData = this.energyTracker.exportTrainingData();
    const socialData = this.socialBattery.exportTrainingData();
    
    if (energyData.energyHistory.length > 100) {
      await this.trainEnergyModel(energyData);
    }
    
    if (socialData.socialHistory.length > 100) {
      await this.trainSocialModel(socialData);
    }
  }

  async trainEnergyModel(data) {
    const model = this.models.get('energyPrediction');
    if (!model || model === 'rule-based' || typeof tf === 'undefined') return;
    
    try {
      // Prepare training data
      const trainingData = this.prepareEnergyTrainingData(data);
      
      if (trainingData.xs.length > 50) {
        const xs = tf.tensor2d(trainingData.xs);
        const ys = tf.tensor2d(trainingData.ys);
        
        await model.fit(xs, ys, {
          epochs: 50,
          batchSize: 32,
          validationSplit: 0.2,
          verbose: 0
        });
        
        // Save trained model
        const modelData = await model.save(tf.io.withSaveHandler(async (artifacts) => artifacts));
        await this.storage.storeAIModel('energyPrediction', modelData);
        
        xs.dispose();
        ys.dispose();
      }
    } catch (error) {
      console.error('Energy model training failed:', error);
    }
  }

  prepareEnergyTrainingData(data) {
    const xs = [];
    const ys = [];
    
    const history = data.energyHistory.sort((a, b) => a.timestamp - b.timestamp);
    
    for (let i = 0; i < history.length - 1; i++) {
      const current = history[i];
      const next = history[i + 1];
      
      const timeDiff = (next.timestamp - current.timestamp) / (1000 * 60 * 60); // hours
      if (timeDiff <= 24) { // Only use data within 24 hours
        const currentHour = new Date(current.timestamp).getHours();
        const dayOfWeek = new Date(current.timestamp).getDay();
        
        xs.push([
          current.level / 100,
          current.mood === 'positive' ? 1 : current.mood === 'negative' ? -1 : 0,
          current.stress / 10,
          current.sleep / 10,
          currentHour / 24,
          dayOfWeek / 7,
          timeDiff / 24
        ]);
        
        ys.push([next.level / 100]);
      }
    }
    
    return { xs, ys };
  }

  async trainSocialModel(data) {
    const model = this.models.get('socialPattern');
    if (!model || model === 'rule-based' || typeof tf === 'undefined') return;
    
    try {
      const trainingData = this.prepareSocialTrainingData(data);
      
      if (trainingData.xs.length > 50) {
        const xs = tf.tensor2d(trainingData.xs);
        const ys = tf.tensor2d(trainingData.ys);
        
        await model.fit(xs, ys, {
          epochs: 50,
          batchSize: 32,
          validationSplit: 0.2,
          verbose: 0
        });
        
        const modelData = await model.save(tf.io.withSaveHandler(async (artifacts) => artifacts));
        await this.storage.storeAIModel('socialPattern', modelData);
        
        xs.dispose();
        ys.dispose();
      }
    } catch (error) {
      console.error('Social model training failed:', error);
    }
  }

  prepareSocialTrainingData(data) {
    const xs = [];
    const ys = [];
    
    const history = data.socialHistory.sort((a, b) => a.timestamp - b.timestamp);
    
    for (let i = 0; i < history.length - 1; i++) {
      const current = history[i];
      const next = history[i + 1];
      
      const timeDiff = (next.timestamp - current.timestamp) / (1000 * 60 * 60);
      if (timeDiff <= 24) {
        const currentHour = new Date(current.timestamp).getHours();
        
        xs.push([
          current.level / 100,
          current.energyLevel / 100,
          current.peopleCount / 10,
          currentHour / 24,
          timeDiff / 24,
          current.environment === 'home' ? 1 : 0
        ]);
        
        ys.push([next.level / 100]);
      }
    }
    
    return { xs, ys };
  }
}

export default AIConstraintEngine;