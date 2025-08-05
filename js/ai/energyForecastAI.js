// Energy Forecast AI - Predictive energy modeling for planning
import StorageManager from '../utils/storage.js';

class EnergyForecastAI {
  constructor(aiConstraintEngine) {
    this.aiEngine = aiConstraintEngine;
    this.storage = new StorageManager();
    this.forecastModels = new Map();
    this.forecastHistory = [];
    this.accuracyMetrics = {
      shortTerm: [], // 1-6 hours
      mediumTerm: [], // 6-24 hours
      longTerm: [] // 1-7 days
    };
    this.listeners = [];
    this.externalFactors = {
      weather: null,
      sleep: null,
      activity: null,
      stress: null,
      nutrition: null
    };
    this.init();
  }

  async init() {
    await this.loadForecastHistory();
    await this.initializeForecastModels();
    this.startContinuousForecasting();
    this.startAccuracyTracking();
  }

  async loadForecastHistory() {
    try {
      this.forecastHistory = await this.storage.getAll('energyForecasts') || [];
    } catch (error) {
      console.error('Failed to load forecast history:', error);
      this.forecastHistory = [];
    }
  }

  async initializeForecastModels() {
    // Initialize different forecasting models
    this.forecastModels.set('neural', await this.createNeuralForecastModel());
    this.forecastModels.set('regression', this.createRegressionModel());
    this.forecastModels.set('pattern', this.createPatternBasedModel());
    this.forecastModels.set('ensemble', this.createEnsembleModel());
  }

  async createNeuralForecastModel() {
    if (typeof tf === 'undefined') return null;
    
    // LSTM-based model for time series forecasting
    const model = tf.sequential({
      layers: [
        tf.layers.lstm({
          units: 64,
          returnSequences: true,
          inputShape: [24, 8] // 24 hours, 8 features
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.lstm({
          units: 32,
          returnSequences: false
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 16, activation: 'relu' }),
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

  createRegressionModel() {
    // Simple linear regression for baseline predictions
    return {
      type: 'regression',
      coefficients: {
        timeOfDay: 0.3,
        dayOfWeek: 0.1,
        recentEnergy: 0.4,
        sleepQuality: 0.2,
        weatherEffect: 0.1,
        stressLevel: -0.15,
        activityLevel: 0.05
      },
      intercept: 50
    };
  }

  createPatternBasedModel() {
    // Pattern recognition based on historical data
    return {
      type: 'pattern',
      weeklyPatterns: new Map(),
      dailyPatterns: new Map(),
      seasonalPatterns: new Map(),
      personalityFactors: {
        chronotype: 'unknown', // morning/evening person
        energyVariability: 'medium',
        recoveryRate: 'average'
      }
    };
  }

  createEnsembleModel() {
    // Combines multiple models for better accuracy
    return {
      type: 'ensemble',
      weights: {
        neural: 0.4,
        regression: 0.3,
        pattern: 0.3
      },
      performanceHistory: []
    };
  }

  // Core forecasting methods
  async generateEnergyForecast(hoursAhead, includeProbabilities = false) {
    const forecast = {
      id: Date.now(),
      timestamp: Date.now(),
      hoursAhead,
      baselineLevel: this.aiEngine.energyTracker.getCurrentEnergy(),
      predictions: [],
      confidence: 0,
      methodology: 'ensemble',
      externalFactors: { ...this.externalFactors },
      includeProbabilities
    };

    try {
      // Generate predictions using multiple models
      const neuralPredictions = await this.generateNeuralPredictions(hoursAhead);
      const regressionPredictions = this.generateRegressionPredictions(hoursAhead);
      const patternPredictions = this.generatePatternPredictions(hoursAhead);
      
      // Combine predictions using ensemble method
      const ensemblePredictions = this.combineModelPredictions(
        neuralPredictions,
        regressionPredictions,
        patternPredictions
      );

      // Add probability distributions if requested
      if (includeProbabilities) {
        ensemblePredictions.forEach(prediction => {
          prediction.probabilityDistribution = this.calculateProbabilityDistribution(prediction);
        });
      }

      forecast.predictions = ensemblePredictions;
      forecast.confidence = this.calculateForecastConfidence(ensemblePredictions);
      forecast.insights = this.generateForecastInsights(ensemblePredictions);
      forecast.recommendations = this.generateForecastRecommendations(ensemblePredictions);

      // Store forecast for accuracy tracking
      await this.storage.store('energyForecasts', forecast);
      this.forecastHistory.push(forecast);

      this.notifyListeners('forecastGenerated', forecast);
      
      return forecast;
    } catch (error) {
      console.error('Energy forecast generation failed:', error);
      return this.generateFallbackForecast(hoursAhead);
    }
  }

  async generateNeuralPredictions(hoursAhead) {
    const model = this.forecastModels.get('neural');
    if (!model || typeof tf === 'undefined') {
      return this.generateRegressionPredictions(hoursAhead); // Fallback
    }

    try {
      const inputData = await this.prepareNeuralInputData();
      const predictions = [];

      for (let hour = 1; hour <= hoursAhead; hour++) {
        const input = this.createHourlyInputTensor(inputData, hour);
        const prediction = model.predict(input);
        const predictedValue = await prediction.data();
        
        predictions.push({
          hour,
          time: new Date(Date.now() + hour * 60 * 60 * 1000),
          predictedEnergy: predictedValue[0] * 100,
          model: 'neural',
          confidence: this.calculateNeuralConfidence(predictedValue[0])
        });

        input.dispose();
        prediction.dispose();
      }

      return predictions;
    } catch (error) {
      console.error('Neural prediction failed:', error);
      return this.generateRegressionPredictions(hoursAhead);
    }
  }

  async prepareNeuralInputData() {
    const energyHistory = await this.storage.getEnergyHistory(7); // Last 7 days
    const currentTime = new Date();
    
    // Prepare 24-hour sequences for the last few days
    const sequences = [];
    
    for (let day = 6; day >= 0; day--) {
      const dayStart = new Date(currentTime);
      dayStart.setDate(dayStart.getDate() - day);
      dayStart.setHours(0, 0, 0, 0);
      
      const daySequence = [];
      
      for (let hour = 0; hour < 24; hour++) {
        const hourTime = new Date(dayStart.getTime() + hour * 60 * 60 * 1000);
        const hourData = this.findEnergyDataForHour(energyHistory, hourTime);
        
        daySequence.push([
          (hourData?.level || 50) / 100, // Normalized energy level
          hour / 24, // Time of day
          hourTime.getDay() / 7, // Day of week
          (hourData?.sleep || 7) / 10, // Sleep quality
          (hourData?.stress || 5) / 10, // Stress level
          (hourData?.mood === 'positive' ? 1 : hourData?.mood === 'negative' ? -1 : 0), // Mood
          this.getWeatherEffect(hourTime) / 100, // Weather effect
          this.getActivityEffect(hourTime) / 100 // Activity effect
        ]);
      }
      
      sequences.push(daySequence);
    }
    
    return sequences;
  }

  createHourlyInputTensor(sequences, targetHour) {
    // Use the most recent 24-hour sequence as input
    const recentSequence = sequences[sequences.length - 1];
    
    // Adjust for prediction hour
    const futureTime = new Date(Date.now() + targetHour * 60 * 60 * 1000);
    const adjustedSequence = recentSequence.map((hourData, index) => {
      // Modify time-based features for future prediction
      const adjustedHourData = [...hourData];
      adjustedHourData[1] = ((index + targetHour) % 24) / 24; // Adjusted time of day
      adjustedHourData[2] = futureTime.getDay() / 7; // Adjusted day of week
      return adjustedHourData;
    });
    
    return tf.tensor3d([adjustedSequence]);
  }

  calculateNeuralConfidence(predictedValue) {
    // Calculate confidence based on prediction certainty and model performance
    const baseConfidence = 0.8;
    const predictionUncertainty = Math.abs(predictedValue - 0.5) * 2; // Distance from middle
    const confidenceAdjustment = predictionUncertainty * 0.2;
    
    return Math.max(0.4, Math.min(0.95, baseConfidence + confidenceAdjustment));
  }

  generateRegressionPredictions(hoursAhead) {
    const model = this.forecastModels.get('regression');
    const predictions = [];
    const currentEnergy = this.aiEngine.energyTracker.getCurrentEnergy();
    
    for (let hour = 1; hour <= hoursAhead; hour++) {
      const futureTime = new Date(Date.now() + hour * 60 * 60 * 1000);
      const features = this.extractRegressionFeatures(futureTime, currentEnergy, hour);
      
      let predictedEnergy = model.intercept;
      Object.keys(model.coefficients).forEach(feature => {
        predictedEnergy += features[feature] * model.coefficients[feature];
      });
      
      // Add time-based decay
      const decayFactor = this.calculateEnergyDecay(hour);
      predictedEnergy *= decayFactor;
      
      predictions.push({
        hour,
        time: futureTime,
        predictedEnergy: Math.max(0, Math.min(100, predictedEnergy)),
        model: 'regression',
        confidence: this.calculateRegressionConfidence(hour),
        features
      });
    }
    
    return predictions;
  }

  extractRegressionFeatures(futureTime, currentEnergy, hour) {
    return {
      timeOfDay: this.getTimeOfDayEffect(futureTime.getHours()),
      dayOfWeek: this.getDayOfWeekEffect(futureTime.getDay()),
      recentEnergy: currentEnergy,
      sleepQuality: this.externalFactors.sleep?.quality || 7,
      weatherEffect: this.getWeatherEffect(futureTime),
      stressLevel: this.externalFactors.stress?.level || 5,
      activityLevel: this.getActivityEffect(futureTime)
    };
  }

  getTimeOfDayEffect(hour) {
    // Energy patterns throughout the day
    const effects = {
      6: 20, 7: 40, 8: 60, 9: 80, 10: 85, 11: 80,
      12: 70, 13: 60, 14: 50, 15: 55, 16: 65, 17: 70,
      18: 65, 19: 60, 20: 50, 21: 40, 22: 30, 23: 20,
      0: 10, 1: 5, 2: 5, 3: 5, 4: 10, 5: 15
    };
    return effects[hour] || 50;
  }

  getDayOfWeekEffect(dayOfWeek) {
    // Monday=1, Sunday=0
    const effects = [60, 70, 75, 80, 85, 65, 55]; // Sun-Sat
    return effects[dayOfWeek] || 70;
  }

  getWeatherEffect(time) {
    if (!this.externalFactors.weather) return 50;
    
    const weather = this.externalFactors.weather;
    let effect = 50;
    
    // Sunny weather boost
    if (weather.condition === 'sunny') effect += 15;
    else if (weather.condition === 'cloudy') effect += 5;
    else if (weather.condition === 'rainy') effect -= 10;
    else if (weather.condition === 'stormy') effect -= 20;
    
    // Temperature effects
    if (weather.temperature >= 20 && weather.temperature <= 25) effect += 10;
    else if (weather.temperature < 10 || weather.temperature > 30) effect -= 15;
    
    return Math.max(0, Math.min(100, effect));
  }

  getActivityEffect(time) {
    if (!this.externalFactors.activity) return 50;
    
    const activity = this.externalFactors.activity;
    const hour = time.getHours();
    
    // Activity scheduling effects
    if (activity.scheduledExercise && this.isNearTime(hour, activity.exerciseTime)) {
      return 70; // Energy boost from exercise
    }
    
    if (activity.previousIntenseActivity && hour - activity.previousIntenseActivity < 2) {
      return 30; // Energy dip after intense activity
    }
    
    return 50;
  }

  calculateEnergyDecay(hour) {
    // Natural energy decay over time without intervention
    const decayRate = 0.02; // 2% per hour
    return Math.max(0.6, 1 - (hour * decayRate));
  }

  calculateRegressionConfidence(hour) {
    // Confidence decreases with prediction distance
    if (hour <= 6) return 0.85;
    if (hour <= 24) return 0.75;
    if (hour <= 72) return 0.60;
    return 0.45;
  }

  generatePatternPredictions(hoursAhead) {
    const model = this.forecastModels.get('pattern');
    const predictions = [];
    
    for (let hour = 1; hour <= hoursAhead; hour++) {
      const futureTime = new Date(Date.now() + hour * 60 * 60 * 1000);
      const patternPrediction = this.findSimilarPatterns(futureTime);
      
      predictions.push({
        hour,
        time: futureTime,
        predictedEnergy: patternPrediction.energy,
        model: 'pattern',
        confidence: patternPrediction.confidence,
        similarPatterns: patternPrediction.patterns,
        patternStrength: patternPrediction.strength
      });
    }
    
    return predictions;
  }

  findSimilarPatterns(targetTime) {
    const energyHistory = this.aiEngine.energyTracker.exportTrainingData().energyHistory;
    const targetHour = targetTime.getHours();
    const targetDay = targetTime.getDay();
    
    // Find similar time periods
    const similarPeriods = energyHistory.filter(entry => {
      const entryTime = new Date(entry.timestamp);
      const hourMatch = Math.abs(entryTime.getHours() - targetHour) <= 1;
      const dayMatch = entryTime.getDay() === targetDay;
      return hourMatch && dayMatch;
    });
    
    if (similarPeriods.length === 0) {
      return {
        energy: 50,
        confidence: 0.3,
        patterns: [],
        strength: 'weak'
      };
    }
    
    // Calculate average and confidence
    const avgEnergy = similarPeriods.reduce((sum, period) => sum + period.level, 0) / similarPeriods.length;
    const variance = this.calculateVariance(similarPeriods.map(p => p.level));
    const confidence = Math.max(0.4, Math.min(0.9, 1 - (variance / 1000)));
    
    return {
      energy: avgEnergy,
      confidence,
      patterns: similarPeriods.slice(0, 5), // Top 5 similar patterns
      strength: variance < 100 ? 'strong' : variance < 300 ? 'medium' : 'weak'
    };
  }

  combineModelPredictions(neuralPreds, regressionPreds, patternPreds) {
    const ensembleModel = this.forecastModels.get('ensemble');
    const combinedPredictions = [];
    
    const maxLength = Math.max(
      neuralPreds?.length || 0,
      regressionPreds?.length || 0,
      patternPreds?.length || 0
    );
    
    for (let i = 0; i < maxLength; i++) {
      const neural = neuralPreds?.[i];
      const regression = regressionPreds?.[i];
      const pattern = patternPreds?.[i];
      
      // Weighted ensemble prediction
      let combinedEnergy = 0;
      let totalWeight = 0;
      let combinedConfidence = 0;
      let confidenceCount = 0;
      
      if (neural) {
        combinedEnergy += neural.predictedEnergy * ensembleModel.weights.neural;
        combinedConfidence += neural.confidence;
        totalWeight += ensembleModel.weights.neural;
        confidenceCount++;
      }
      
      if (regression) {
        combinedEnergy += regression.predictedEnergy * ensembleModel.weights.regression;
        combinedConfidence += regression.confidence;
        totalWeight += ensembleModel.weights.regression;
        confidenceCount++;
      }
      
      if (pattern) {
        combinedEnergy += pattern.predictedEnergy * ensembleModel.weights.pattern;
        combinedConfidence += pattern.confidence;
        totalWeight += ensembleModel.weights.pattern;
        confidenceCount++;
      }
      
      if (totalWeight > 0) {
        combinedEnergy /= totalWeight;
        combinedConfidence /= confidenceCount;
      } else {
        combinedEnergy = 50; // Default
        combinedConfidence = 0.5;
      }
      
      const time = regression?.time || pattern?.time || new Date(Date.now() + (i + 1) * 60 * 60 * 1000);
      
      combinedPredictions.push({
        hour: i + 1,
        time,
        predictedEnergy: Math.max(0, Math.min(100, combinedEnergy)),
        confidence: combinedConfidence,
        model: 'ensemble',
        modelContributions: {
          neural: neural?.predictedEnergy || null,
          regression: regression?.predictedEnergy || null,
          pattern: pattern?.predictedEnergy || null
        },
        uncertainty: this.calculatePredictionUncertainty([neural, regression, pattern].filter(Boolean))
      });
    }
    
    return combinedPredictions;
  }

  calculatePredictionUncertainty(predictions) {
    if (predictions.length < 2) return 20; // High uncertainty with single model
    
    const energyValues = predictions.map(p => p.predictedEnergy);
    const variance = this.calculateVariance(energyValues);
    
    return Math.min(50, Math.sqrt(variance)); // Cap uncertainty at 50%
  }

  calculateProbabilityDistribution(prediction) {
    // Generate probability distribution around the prediction
    const mean = prediction.predictedEnergy;
    const uncertainty = prediction.uncertainty || 15;
    const distribution = {};
    
    // Create bins for energy levels
    for (let energy = 0; energy <= 100; energy += 10) {
      const probability = this.gaussianProbability(energy, mean, uncertainty);
      distribution[energy] = probability;
    }
    
    // Normalize probabilities to sum to 1
    const totalProbability = Object.values(distribution).reduce((sum, prob) => sum + prob, 0);
    Object.keys(distribution).forEach(energy => {
      distribution[energy] /= totalProbability;
    });
    
    return distribution;
  }

  gaussianProbability(x, mean, standardDeviation) {
    return Math.exp(-0.5 * Math.pow((x - mean) / standardDeviation, 2)) / 
           (standardDeviation * Math.sqrt(2 * Math.PI));
  }

  calculateForecastConfidence(predictions) {
    if (predictions.length === 0) return 0;
    
    const avgConfidence = predictions.reduce((sum, pred) => sum + pred.confidence, 0) / predictions.length;
    const maxUncertainty = Math.max(...predictions.map(p => p.uncertainty || 0));
    
    // Reduce confidence based on uncertainty
    const uncertaintyPenalty = maxUncertainty / 100;
    return Math.max(0.2, Math.min(0.95, avgConfidence - uncertaintyPenalty));
  }

  generateForecastInsights(predictions) {
    const insights = [];
    
    // Energy trend analysis
    const shortTerm = predictions.slice(0, 6); // Next 6 hours
    const mediumTerm = predictions.slice(6, 24); // 6-24 hours
    const longTerm = predictions.slice(24); // Beyond 24 hours
    
    // Short-term insights
    if (shortTerm.length > 0) {
      const trend = this.calculateEnergyTrend(shortTerm);
      insights.push({
        type: 'short_term_trend',
        timeframe: '6 hours',
        trend: trend.direction,
        magnitude: trend.magnitude,
        description: this.describeTrend(trend, 'short-term'),
        significance: trend.magnitude > 15 ? 'high' : 'medium'
      });
    }
    
    // Peak energy periods
    const peakPeriods = this.identifyPeakEnergyPeriods(predictions);
    if (peakPeriods.length > 0) {
      insights.push({
        type: 'peak_energy_periods',
        periods: peakPeriods,
        description: `${peakPeriods.length} high-energy periods identified`,
        significance: 'high'
      });
    }
    
    // Low energy warnings
    const lowEnergyPeriods = this.identifyLowEnergyPeriods(predictions);
    if (lowEnergyPeriods.length > 0) {
      insights.push({
        type: 'low_energy_warnings',
        periods: lowEnergyPeriods,
        description: `${lowEnergyPeriods.length} low-energy periods predicted`,
        significance: 'high'
      });
    }
    
    // Pattern insights
    const patternInsight = this.analyzeEnergyPatterns(predictions);
    if (patternInsight) {
      insights.push(patternInsight);
    }
    
    return insights;
  }

  calculateEnergyTrend(predictions) {
    if (predictions.length < 2) return { direction: 'stable', magnitude: 0 };
    
    const first = predictions[0].predictedEnergy;
    const last = predictions[predictions.length - 1].predictedEnergy;
    const change = last - first;
    
    return {
      direction: change > 5 ? 'increasing' : change < -5 ? 'decreasing' : 'stable',
      magnitude: Math.abs(change),
      rate: change / predictions.length // Change per hour
    };
  }

  describeTrend(trend, timeframe) {
    if (trend.direction === 'increasing') {
      return `Energy is expected to ${trend.magnitude > 20 ? 'significantly' : 'gradually'} increase over the ${timeframe}`;
    } else if (trend.direction === 'decreasing') {
      return `Energy is expected to ${trend.magnitude > 20 ? 'significantly' : 'gradually'} decrease over the ${timeframe}`;
    } else {
      return `Energy levels are expected to remain relatively stable over the ${timeframe}`;
    }
  }

  identifyPeakEnergyPeriods(predictions) {
    const peaks = [];
    
    predictions.forEach(prediction => {
      if (prediction.predictedEnergy >= 75) {
        peaks.push({
          time: prediction.time,
          energy: prediction.predictedEnergy,
          confidence: prediction.confidence,
          duration: 1 // Assuming 1-hour periods
        });
      }
    });
    
    // Merge adjacent peak periods
    return this.mergeAdjacentPeriods(peaks);
  }

  identifyLowEnergyPeriods(predictions) {
    const lows = [];
    
    predictions.forEach(prediction => {
      if (prediction.predictedEnergy <= 30) {
        lows.push({
          time: prediction.time,
          energy: prediction.predictedEnergy,
          confidence: prediction.confidence,
          severity: prediction.predictedEnergy <= 20 ? 'critical' : 'moderate'
        });
      }
    });
    
    return this.mergeAdjacentPeriods(lows);
  }

  mergeAdjacentPeriods(periods) {
    if (periods.length === 0) return [];
    
    const merged = [];
    let currentPeriod = { ...periods[0] };
    
    for (let i = 1; i < periods.length; i++) {
      const nextPeriod = periods[i];
      const timeDiff = (nextPeriod.time.getTime() - currentPeriod.time.getTime()) / (1000 * 60 * 60);
      
      if (timeDiff <= 1.5) { // Merge if within 1.5 hours
        currentPeriod.endTime = nextPeriod.time;
        currentPeriod.duration = (currentPeriod.endTime.getTime() - currentPeriod.time.getTime()) / (1000 * 60 * 60);
        currentPeriod.averageEnergy = (currentPeriod.energy + nextPeriod.energy) / 2;
      } else {
        merged.push(currentPeriod);
        currentPeriod = { ...nextPeriod };
      }
    }
    
    merged.push(currentPeriod);
    return merged;
  }

  analyzeEnergyPatterns(predictions) {
    const hourlyAverages = new Map();
    
    predictions.forEach(prediction => {
      const hour = prediction.time.getHours();
      if (!hourlyAverages.has(hour)) {
        hourlyAverages.set(hour, []);
      }
      hourlyAverages.get(hour).push(prediction.predictedEnergy);
    });
    
    // Find peak and low hours
    let peakHour = 0;
    let lowHour = 0;
    let maxEnergy = 0;
    let minEnergy = 100;
    
    hourlyAverages.forEach((energyLevels, hour) => {
      const avgEnergy = energyLevels.reduce((sum, level) => sum + level, 0) / energyLevels.length;
      
      if (avgEnergy > maxEnergy) {
        maxEnergy = avgEnergy;
        peakHour = hour;
      }
      
      if (avgEnergy < minEnergy) {
        minEnergy = avgEnergy;
        lowHour = hour;
      }
    });
    
    if (maxEnergy - minEnergy > 20) {
      return {
        type: 'daily_pattern',
        peakHour,
        lowHour,
        energyRange: maxEnergy - minEnergy,
        description: `Peak energy expected around ${peakHour}:00, lowest around ${lowHour}:00`,
        significance: 'medium'
      };
    }
    
    return null;
  }

  generateForecastRecommendations(predictions) {
    const recommendations = [];
    
    // Task scheduling recommendations
    const peakPeriods = this.identifyPeakEnergyPeriods(predictions);
    if (peakPeriods.length > 0) {
      recommendations.push({
        type: 'task_scheduling',
        priority: 'high',
        title: 'Optimal Task Timing',
        description: 'Schedule demanding tasks during predicted peak energy periods',
        periods: peakPeriods.map(p => ({
          time: p.time,
          energy: p.energy,
          suggestion: 'Creative work, important meetings, challenging projects'
        }))
      });
    }
    
    // Recovery recommendations
    const lowPeriods = this.identifyLowEnergyPeriods(predictions);
    if (lowPeriods.length > 0) {
      recommendations.push({
        type: 'recovery_planning',
        priority: 'high',
        title: 'Energy Recovery Needed',
        description: 'Plan recovery activities during predicted low energy periods',
        periods: lowPeriods.map(p => ({
          time: p.time,
          energy: p.energy,
          suggestion: 'Rest, light activities, avoid demanding tasks'
        }))
      });
    }
    
    // Proactive energy management
    const overallTrend = this.calculateEnergyTrend(predictions);
    if (overallTrend.direction === 'decreasing' && overallTrend.magnitude > 20) {
      recommendations.push({
        type: 'proactive_management',
        priority: 'medium',
        title: 'Declining Energy Trend',
        description: 'Take proactive steps to prevent energy depletion',
        actions: [
          'Increase sleep quality',
          'Add energy-boosting activities',
          'Reduce energy-draining commitments',
          'Schedule earlier recovery breaks'
        ]
      });
    }
    
    // External factor recommendations
    if (this.externalFactors.weather?.condition === 'rainy') {
      recommendations.push({
        type: 'weather_adaptation',
        priority: 'low',
        title: 'Weather Impact',
        description: 'Rainy weather may affect energy levels',
        actions: [
          'Consider indoor activities',
          'Add light therapy if available',
          'Plan extra recovery time'
        ]
      });
    }
    
    return recommendations;
  }

  // External factor integration
  updateWeatherData(weatherData) {
    this.externalFactors.weather = {
      condition: weatherData.condition,
      temperature: weatherData.temperature,
      humidity: weatherData.humidity,
      pressure: weatherData.pressure,
      timestamp: Date.now()
    };
    
    this.notifyListeners('externalFactorUpdated', { type: 'weather', data: weatherData });
  }

  updateSleepData(sleepData) {
    this.externalFactors.sleep = {
      quality: sleepData.quality, // 1-10 scale
      duration: sleepData.duration, // hours
      bedtime: sleepData.bedtime,
      wakeTime: sleepData.wakeTime,
      timestamp: Date.now()
    };
    
    this.notifyListeners('externalFactorUpdated', { type: 'sleep', data: sleepData });
  }

  updateActivityData(activityData) {
    this.externalFactors.activity = {
      scheduledExercise: activityData.scheduledExercise,
      exerciseTime: activityData.exerciseTime,
      intensity: activityData.intensity,
      type: activityData.type,
      timestamp: Date.now()
    };
    
    this.notifyListeners('externalFactorUpdated', { type: 'activity', data: activityData });
  }

  updateStressData(stressData) {
    this.externalFactors.stress = {
      level: stressData.level, // 1-10 scale
      sources: stressData.sources,
      managementActions: stressData.managementActions,
      timestamp: Date.now()
    };
    
    this.notifyListeners('externalFactorUpdated', { type: 'stress', data: stressData });
  }

  updateNutritionData(nutritionData) {
    this.externalFactors.nutrition = {
      lastMeal: nutritionData.lastMeal,
      hydration: nutritionData.hydration,
      caffeine: nutritionData.caffeine,
      supplements: nutritionData.supplements,
      timestamp: Date.now()
    };
    
    this.notifyListeners('externalFactorUpdated', { type: 'nutrition', data: nutritionData });
  }

  // Model training and improvement
  async trainForecastModels() {
    const energyData = this.aiEngine.energyTracker.exportTrainingData();
    
    if (energyData.energyHistory.length > 200) {
      await this.trainNeuralModel(energyData);
      this.updateRegressionModel(energyData);
      this.updatePatternModel(energyData);
      this.optimizeEnsembleWeights();
    }
  }

  async trainNeuralModel(data) {
    const model = this.forecastModels.get('neural');
    if (!model || typeof tf === 'undefined') return;
    
    try {
      const trainingData = await this.prepareNeuralTrainingData(data);
      
      if (trainingData.xs.length > 50) {
        const xs = tf.tensor3d(trainingData.xs);
        const ys = tf.tensor2d(trainingData.ys);
        
        await model.fit(xs, ys, {
          epochs: 100,
          batchSize: 32,
          validationSplit: 0.2,
          verbose: 0,
          callbacks: {
            onEpochEnd: (epoch, logs) => {
              if (epoch % 20 === 0) {
                console.log(`Neural model training - Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}`);
              }
            }
          }
        });
        
        // Save trained model
        const modelData = await model.save(tf.io.withSaveHandler(async (artifacts) => artifacts));
        await this.storage.storeAIModel('energyForecast', modelData);
        
        xs.dispose();
        ys.dispose();
      }
    } catch (error) {
      console.error('Neural model training failed:', error);
    }
  }

  async prepareNeuralTrainingData(data) {
    const sequences = [];
    const targets = [];
    const history = data.energyHistory.sort((a, b) => a.timestamp - b.timestamp);
    
    // Create sequences of 24 hours to predict next hour
    for (let i = 24; i < history.length; i++) {
      const sequence = [];
      
      // Look back 24 hours
      for (let j = i - 24; j < i; j++) {
        const entry = history[j];
        const time = new Date(entry.timestamp);
        
        sequence.push([
          entry.level / 100,
          time.getHours() / 24,
          time.getDay() / 7,
          (entry.sleep || 7) / 10,
          (entry.stress || 5) / 10,
          (entry.mood === 'positive' ? 1 : entry.mood === 'negative' ? -1 : 0),
          this.getWeatherEffect(time) / 100,
          this.getActivityEffect(time) / 100
        ]);
      }
      
      sequences.push(sequence);
      targets.push([history[i].level / 100]);
    }
    
    return { xs: sequences, ys: targets };
  }

  updateRegressionModel(data) {
    // Update regression coefficients based on recent data
    const model = this.forecastModels.get('regression');
    const recentData = data.energyHistory.slice(-100); // Last 100 entries
    
    // Simple coefficient adjustment based on correlation analysis
    const correlations = this.calculateFeatureCorrelations(recentData);
    
    Object.keys(model.coefficients).forEach(feature => {
      if (correlations[feature] !== undefined) {
        // Adjust coefficient slightly towards correlation
        const adjustment = (correlations[feature] - model.coefficients[feature]) * 0.1;
        model.coefficients[feature] += adjustment;
      }
    });
  }

  calculateFeatureCorrelations(data) {
    // Calculate correlations between features and energy levels
    // This is a simplified implementation
    return {
      timeOfDay: 0.3,
      dayOfWeek: 0.1,
      recentEnergy: 0.6,
      sleepQuality: 0.4,
      weatherEffect: 0.15,
      stressLevel: -0.25,
      activityLevel: 0.1
    };
  }

  updatePatternModel(data) {
    const model = this.forecastModels.get('pattern');
    
    // Update daily patterns
    const dailyPatterns = this.extractDailyPatterns(data.energyHistory);
    dailyPatterns.forEach((pattern, hour) => {
      model.dailyPatterns.set(hour, pattern);
    });
    
    // Update weekly patterns
    const weeklyPatterns = this.extractWeeklyPatterns(data.energyHistory);
    weeklyPatterns.forEach((pattern, day) => {
      model.weeklyPatterns.set(day, pattern);
    });
  }

  extractDailyPatterns(history) {
    const hourlyData = new Map();
    
    history.forEach(entry => {
      const hour = new Date(entry.timestamp).getHours();
      if (!hourlyData.has(hour)) {
        hourlyData.set(hour, []);
      }
      hourlyData.get(hour).push(entry.level);
    });
    
    const patterns = new Map();
    hourlyData.forEach((levels, hour) => {
      patterns.set(hour, {
        average: levels.reduce((sum, level) => sum + level, 0) / levels.length,
        variance: this.calculateVariance(levels),
        count: levels.length
      });
    });
    
    return patterns;
  }

  extractWeeklyPatterns(history) {
    const dailyData = new Map();
    
    history.forEach(entry => {
      const day = new Date(entry.timestamp).getDay();
      if (!dailyData.has(day)) {
        dailyData.set(day, []);
      }
      dailyData.get(day).push(entry.level);
    });
    
    const patterns = new Map();
    dailyData.forEach((levels, day) => {
      patterns.set(day, {
        average: levels.reduce((sum, level) => sum + level, 0) / levels.length,
        variance: this.calculateVariance(levels),
        count: levels.length
      });
    });
    
    return patterns;
  }

  optimizeEnsembleWeights() {
    const model = this.forecastModels.get('ensemble');
    const recentPerformance = model.performanceHistory.slice(-20); // Last 20 forecasts
    
    if (recentPerformance.length < 10) return; // Need more data
    
    // Calculate average accuracy for each model
    const accuracies = {
      neural: 0,
      regression: 0,
      pattern: 0
    };
    
    recentPerformance.forEach(performance => {
      Object.keys(accuracies).forEach(modelType => {
        if (performance[modelType]) {
          accuracies[modelType] += performance[modelType].accuracy;
        }
      });
    });
    
    // Normalize and update weights
    const totalAccuracy = Object.values(accuracies).reduce((sum, acc) => sum + acc, 0);
    if (totalAccuracy > 0) {
      Object.keys(accuracies).forEach(modelType => {
        model.weights[modelType] = accuracies[modelType] / totalAccuracy;
      });
    }
  }

  // Accuracy tracking and validation
  startAccuracyTracking() {
    // Track forecast accuracy every hour
    setInterval(() => {
      this.evaluateForecastAccuracy();
    }, 60 * 60 * 1000);
  }

  async evaluateForecastAccuracy() {
    const now = Date.now();
    const unevaluatedForecasts = this.forecastHistory.filter(forecast => 
      !forecast.evaluated && 
      forecast.timestamp < now - 60 * 60 * 1000 // At least 1 hour old
    );
    
    for (const forecast of unevaluatedForecasts) {
      const accuracy = await this.calculateForecastAccuracy(forecast);
      if (accuracy) {
        forecast.evaluated = true;
        forecast.accuracy = accuracy;
        
        // Store accuracy metrics
        this.updateAccuracyMetrics(forecast, accuracy);
        
        // Update ensemble model performance
        this.updateEnsemblePerformance(forecast, accuracy);
      }
    }
  }

  async calculateForecastAccuracy(forecast) {
    const actualData = await this.storage.getEnergyHistory(1); // Last day
    const accuracyResults = [];
    
    forecast.predictions.forEach(prediction => {
      const predictionTime = prediction.time.getTime();
      const actualEntry = this.findEnergyDataForHour(actualData, prediction.time);
      
      if (actualEntry) {
        const error = Math.abs(prediction.predictedEnergy - actualEntry.level);
        const accuracy = Math.max(0, 100 - error);
        
        accuracyResults.push({
          hour: prediction.hour,
          predicted: prediction.predictedEnergy,
          actual: actualEntry.level,
          error,
          accuracy,
          model: prediction.model
        });
      }
    });
    
    if (accuracyResults.length === 0) return null;
    
    const overallAccuracy = accuracyResults.reduce((sum, result) => sum + result.accuracy, 0) / accuracyResults.length;
    const averageError = accuracyResults.reduce((sum, result) => sum + result.error, 0) / accuracyResults.length;
    
    return {
      overallAccuracy,
      averageError,
      results: accuracyResults,
      forecastHorizon: Math.max(...accuracyResults.map(r => r.hour))
    };
  }

  updateAccuracyMetrics(forecast, accuracy) {
    const horizon = accuracy.forecastHorizon;
    
    if (horizon <= 6) {
      this.accuracyMetrics.shortTerm.push(accuracy.overallAccuracy);
    } else if (horizon <= 24) {
      this.accuracyMetrics.mediumTerm.push(accuracy.overallAccuracy);
    } else {
      this.accuracyMetrics.longTerm.push(accuracy.overallAccuracy);
    }
    
    // Keep only recent metrics
    Object.keys(this.accuracyMetrics).forEach(term => {
      if (this.accuracyMetrics[term].length > 50) {
        this.accuracyMetrics[term] = this.accuracyMetrics[term].slice(-50);
      }
    });
  }

  updateEnsemblePerformance(forecast, accuracy) {
    const ensembleModel = this.forecastModels.get('ensemble');
    
    const performance = {
      timestamp: forecast.timestamp,
      overallAccuracy: accuracy.overallAccuracy
    };
    
    // Calculate individual model accuracies
    ['neural', 'regression', 'pattern'].forEach(modelType => {
      const modelResults = accuracy.results.filter(r => r.model === modelType);
      if (modelResults.length > 0) {
        performance[modelType] = {
          accuracy: modelResults.reduce((sum, r) => sum + r.accuracy, 0) / modelResults.length,
          count: modelResults.length
        };
      }
    });
    
    ensembleModel.performanceHistory.push(performance);
    
    // Keep only recent performance data
    if (ensembleModel.performanceHistory.length > 100) {
      ensembleModel.performanceHistory = ensembleModel.performanceHistory.slice(-100);
    }
  }

  // Continuous forecasting
  startContinuousForecasting() {
    // Generate new forecasts every 4 hours
    setInterval(async () => {
      await this.generateEnergyForecast(24); // 24-hour forecast
    }, 4 * 60 * 60 * 1000);
    
    // Generate initial forecast
    this.generateEnergyForecast(72); // 3-day forecast
  }

  // Utility methods
  findEnergyDataForHour(history, targetTime) {
    const targetHour = targetTime.getTime();
    const tolerance = 30 * 60 * 1000; // 30 minutes
    
    return history.find(entry => 
      Math.abs(entry.timestamp - targetHour) < tolerance
    );
  }

  calculateVariance(values) {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  }

  isNearTime(currentHour, targetHour) {
    return Math.abs(currentHour - targetHour) <= 1;
  }

  generateFallbackForecast(hoursAhead) {
    const predictions = [];
    const currentEnergy = this.aiEngine.energyTracker.getCurrentEnergy();
    
    for (let hour = 1; hour <= hoursAhead; hour++) {
      const futureTime = new Date(Date.now() + hour * 60 * 60 * 1000);
      const timeEffect = this.getTimeOfDayEffect(futureTime.getHours());
      const decayFactor = this.calculateEnergyDecay(hour);
      
      const predictedEnergy = Math.max(0, Math.min(100, 
        (currentEnergy * decayFactor + timeEffect) / 2
      ));
      
      predictions.push({
        hour,
        time: futureTime,
        predictedEnergy,
        confidence: 0.5,
        model: 'fallback'
      });
    }
    
    return {
      id: Date.now(),
      timestamp: Date.now(),
      hoursAhead,
      baselineLevel: currentEnergy,
      predictions,
      confidence: 0.5,
      methodology: 'fallback',
      insights: [],
      recommendations: []
    };
  }

  // Public API
  async getForecast(hours = 24, includeProbabilities = false) {
    return this.generateEnergyForecast(hours, includeProbabilities);
  }

  async getShortTermForecast() {
    return this.generateEnergyForecast(6, false);
  }

  async getLongTermForecast() {
    return this.generateEnergyForecast(168, true); // 7 days with probabilities
  }

  getAccuracyMetrics() {
    const calculateAverage = (arr) => arr.length > 0 ? arr.reduce((sum, val) => sum + val, 0) / arr.length : 0;
    
    return {
      shortTerm: {
        average: calculateAverage(this.accuracyMetrics.shortTerm),
        count: this.accuracyMetrics.shortTerm.length,
        recent: this.accuracyMetrics.shortTerm.slice(-10)
      },
      mediumTerm: {
        average: calculateAverage(this.accuracyMetrics.mediumTerm),
        count: this.accuracyMetrics.mediumTerm.length,
        recent: this.accuracyMetrics.mediumTerm.slice(-10)
      },
      longTerm: {
        average: calculateAverage(this.accuracyMetrics.longTerm),
        count: this.accuracyMetrics.longTerm.length,
        recent: this.accuracyMetrics.longTerm.slice(-10)
      }
    };
  }

  getModelWeights() {
    return this.forecastModels.get('ensemble').weights;
  }

  updateModelWeight(model, weight) {
    const ensembleModel = this.forecastModels.get('ensemble');
    if (ensembleModel.weights[model] !== undefined) {
      ensembleModel.weights[model] = Math.max(0, Math.min(1, weight));
      
      // Normalize weights
      const totalWeight = Object.values(ensembleModel.weights).reduce((sum, w) => sum + w, 0);
      Object.keys(ensembleModel.weights).forEach(modelType => {
        ensembleModel.weights[modelType] /= totalWeight;
      });
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

export default EnergyForecastAI;