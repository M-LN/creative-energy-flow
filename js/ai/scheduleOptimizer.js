// Schedule Optimizer - Calendar integration with energy constraints
import StorageManager from '../utils/storage.js';

class ScheduleOptimizer {
  constructor(aiConstraintEngine) {
    this.aiEngine = aiConstraintEngine;
    this.storage = new StorageManager();
    this.calendarIntegrations = new Map();
    this.optimizedSchedules = [];
    this.constraints = {
      maxDailyMeetings: 6,
      maxConsecutiveMeetings: 3,
      minBufferTime: 15, // minutes
      maxMeetingDuration: 120, // minutes
      energyThresholds: {
        meeting: 40,
        presentation: 70,
        creative: 65,
        administrative: 30
      },
      socialThresholds: {
        teamMeeting: 50,
        oneOnOne: 30,
        presentation: 60,
        networking: 70
      }
    };
    this.listeners = [];
    this.init();
  }

  async init() {
    await this.loadConstraints();
    await this.loadCalendarData();
    this.startScheduleMonitoring();
  }

  async loadConstraints() {
    const savedConstraints = this.storage.getLocalData('scheduleConstraints');
    if (savedConstraints) {
      this.constraints = { ...this.constraints, ...savedConstraints };
    }
  }

  async loadCalendarData() {
    try {
      const events = await this.storage.getAll('events');
      this.processCalendarEvents(events);
    } catch (error) {
      console.error('Failed to load calendar data:', error);
    }
  }

  // Core schedule optimization
  async optimizeSchedule(timeRange = 7, events = []) {
    const optimization = {
      id: Date.now(),
      timestamp: Date.now(),
      timeRange,
      originalEvents: [...events],
      constraints: { ...this.constraints }
    };

    try {
      // Get energy and social forecasts
      const energyForecast = await this.generateEnergyForecast(timeRange * 24);
      const socialForecast = await this.generateSocialForecast(timeRange * 24);
      
      // Analyze current schedule conflicts
      const conflicts = this.analyzeScheduleConflicts(events, energyForecast, socialForecast);
      
      // Generate optimized schedule
      const optimizedEvents = await this.generateOptimizedSchedule(
        events, 
        energyForecast, 
        socialForecast,
        conflicts
      );
      
      // Calculate optimization metrics
      const metrics = this.calculateOptimizationMetrics(events, optimizedEvents, energyForecast);
      
      // Generate recommendations
      const recommendations = this.generateScheduleRecommendations(
        optimizedEvents, 
        conflicts, 
        metrics
      );

      optimization.result = {
        optimizedEvents,
        energyForecast,
        socialForecast,
        conflicts,
        metrics,
        recommendations,
        bufferTimes: this.calculateOptimalBufferTimes(optimizedEvents),
        recoveryWindows: this.identifyRecoveryWindows(optimizedEvents, energyForecast)
      };

      // Store optimization
      await this.storage.store('scheduleOptimizations', optimization);
      this.optimizedSchedules.push(optimization);

      this.notifyListeners('scheduleOptimized', optimization.result);
      
      return optimization.result;
    } catch (error) {
      console.error('Schedule optimization failed:', error);
      optimization.error = error.message;
      return this.generateFallbackSchedule(events);
    }
  }

  async generateEnergyForecast(hours) {
    const forecast = [];
    
    for (let i = 0; i < hours; i++) {
      const prediction = await this.aiEngine.predictEnergyLevel(i, []);
      const time = new Date(Date.now() + i * 60 * 60 * 1000);
      
      forecast.push({
        hour: i,
        time,
        predictedEnergy: prediction.predictedLevel,
        confidence: prediction.confidence,
        suitability: this.calculateHourSuitability(prediction.predictedLevel, time),
        recommendation: this.getEnergyRecommendation(prediction.predictedLevel, time.getHours())
      });
    }
    
    return forecast;
  }

  async generateSocialForecast(hours) {
    const forecast = [];
    
    for (let i = 0; i < hours; i++) {
      const prediction = await this.aiEngine.predictSocialLevel(i, []);
      const time = new Date(Date.now() + i * 60 * 60 * 1000);
      
      forecast.push({
        hour: i,
        time,
        predictedSocial: prediction.predictedLevel,
        confidence: prediction.confidence,
        capacity: this.calculateSocialCapacity(prediction.predictedLevel),
        recommendation: this.getSocialRecommendation(prediction.predictedLevel, time.getHours())
      });
    }
    
    return forecast;
  }

  calculateHourSuitability(energyLevel, time) {
    const hour = time.getHours();
    const dayOfWeek = time.getDay();
    
    let suitability = {
      meetings: 0,
      creative: 0,
      administrative: 0,
      social: 0
    };

    // Base suitability on energy level
    if (energyLevel >= 80) {
      suitability.creative = 90;
      suitability.meetings = 85;
      suitability.social = 80;
      suitability.administrative = 70;
    } else if (energyLevel >= 60) {
      suitability.meetings = 80;
      suitability.administrative = 85;
      suitability.social = 75;
      suitability.creative = 70;
    } else if (energyLevel >= 40) {
      suitability.administrative = 70;
      suitability.meetings = 60;
      suitability.social = 50;
      suitability.creative = 40;
    } else {
      suitability.administrative = 40;
      suitability.meetings = 30;
      suitability.social = 20;
      suitability.creative = 20;
    }

    // Adjust for time of day
    if (hour >= 9 && hour <= 11) {
      suitability.creative += 10;
      suitability.meetings += 5;
    } else if (hour >= 14 && hour <= 16) {
      suitability.meetings += 10;
      suitability.administrative += 5;
    } else if (hour >= 17 && hour <= 19) {
      suitability.administrative += 10;
      suitability.social -= 10;
    }

    // Weekend adjustments
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      suitability.meetings -= 30;
      suitability.administrative -= 20;
      suitability.creative += 10;
    }

    // Normalize to 0-100
    Object.keys(suitability).forEach(key => {
      suitability[key] = Math.max(0, Math.min(100, suitability[key]));
    });

    return suitability;
  }

  calculateSocialCapacity(socialLevel) {
    return {
      maxMeetings: Math.floor(socialLevel / 15),
      maxPeople: Math.floor(socialLevel / 10),
      maxDuration: Math.floor(socialLevel * 2), // minutes
      types: this.getSuitableMeetingTypes(socialLevel)
    };
  }

  getSuitableMeetingTypes(socialLevel) {
    const types = [];
    
    if (socialLevel >= 70) {
      types.push('presentation', 'teamMeeting', 'networking', 'brainstorming');
    }
    if (socialLevel >= 50) {
      types.push('meeting', 'collaboration', 'interview');
    }
    if (socialLevel >= 30) {
      types.push('oneOnOne', 'checkin', 'review');
    }
    if (socialLevel >= 10) {
      types.push('briefUpdate', 'statusCall');
    }
    
    return types;
  }

  getEnergyRecommendation(energyLevel, hour) {
    if (energyLevel >= 80) {
      return {
        type: 'peak_performance',
        activities: ['creative work', 'important meetings', 'presentations'],
        message: 'Optimal time for demanding tasks'
      };
    } else if (energyLevel >= 60) {
      return {
        type: 'good_performance',
        activities: ['meetings', 'collaboration', 'analysis'],
        message: 'Good time for standard work activities'
      };
    } else if (energyLevel >= 40) {
      return {
        type: 'moderate_performance',
        activities: ['administrative tasks', 'email', 'planning'],
        message: 'Suitable for routine activities'
      };
    } else {
      return {
        type: 'low_performance',
        activities: ['breaks', 'light admin', 'recovery'],
        message: 'Consider rest or light activities'
      };
    }
  }

  getSocialRecommendation(socialLevel, hour) {
    if (socialLevel >= 70) {
      return {
        type: 'high_social_capacity',
        activities: ['team meetings', 'networking', 'presentations'],
        message: 'Great time for social interactions'
      };
    } else if (socialLevel >= 50) {
      return {
        type: 'moderate_social_capacity',
        activities: ['one-on-ones', 'small meetings', 'collaboration'],
        message: 'Good for focused social activities'
      };
    } else if (socialLevel >= 30) {
      return {
        type: 'limited_social_capacity',
        activities: ['brief check-ins', 'email', 'async communication'],
        message: 'Limit social interactions'
      };
    } else {
      return {
        type: 'social_recovery_needed',
        activities: ['alone time', 'focused work', 'breaks'],
        message: 'Avoid social interactions, focus on recovery'
      };
    }
  }

  analyzeScheduleConflicts(events, energyForecast, socialForecast) {
    const conflicts = [];

    events.forEach(event => {
      const eventStart = new Date(event.startTime);
      const eventHour = Math.floor((eventStart.getTime() - Date.now()) / (1000 * 60 * 60));
      
      if (eventHour >= 0 && eventHour < energyForecast.length) {
        const energyData = energyForecast[eventHour];
        const socialData = socialForecast[eventHour];
        
        const conflict = this.checkEventConflicts(event, energyData, socialData);
        if (conflict.hasConflict) {
          conflicts.push({
            event,
            ...conflict,
            severity: this.calculateConflictSeverity(conflict)
          });
        }
      }
    });

    // Check for consecutive meeting conflicts
    const consecutiveConflicts = this.findConsecutiveMeetingConflicts(events);
    conflicts.push(...consecutiveConflicts);

    // Check for daily overload
    const overloadConflicts = this.findDailyOverloadConflicts(events, energyForecast, socialForecast);
    conflicts.push(...overloadConflicts);

    return conflicts;
  }

  checkEventConflicts(event, energyData, socialData) {
    const conflicts = {
      hasConflict: false,
      energyConflict: false,
      socialConflict: false,
      details: []
    };

    // Check energy requirements
    const requiredEnergy = this.getEventEnergyRequirement(event);
    if (requiredEnergy > energyData.predictedEnergy) {
      conflicts.hasConflict = true;
      conflicts.energyConflict = true;
      conflicts.details.push({
        type: 'energy_deficit',
        required: requiredEnergy,
        available: energyData.predictedEnergy,
        deficit: requiredEnergy - energyData.predictedEnergy
      });
    }

    // Check social requirements
    const requiredSocial = this.getEventSocialRequirement(event);
    if (requiredSocial > socialData.predictedSocial) {
      conflicts.hasConflict = true;
      conflicts.socialConflict = true;
      conflicts.details.push({
        type: 'social_deficit',
        required: requiredSocial,
        available: socialData.predictedSocial,
        deficit: requiredSocial - socialData.predictedSocial
      });
    }

    // Check time appropriateness
    const timeConflict = this.checkTimeAppropriateness(event, energyData.time);
    if (timeConflict) {
      conflicts.hasConflict = true;
      conflicts.details.push(timeConflict);
    }

    return conflicts;
  }

  getEventEnergyRequirement(event) {
    const baseRequirements = {
      meeting: 40,
      presentation: 70,
      interview: 60,
      brainstorming: 65,
      review: 35,
      training: 55,
      workshop: 60,
      conference: 50
    };

    let requirement = baseRequirements[event.type] || 45;
    
    // Adjust for duration
    const duration = event.duration || 60;
    if (duration > 120) requirement += 15;
    else if (duration > 60) requirement += 8;
    
    // Adjust for number of attendees
    const attendees = event.attendees?.length || 1;
    if (attendees > 10) requirement += 10;
    else if (attendees > 5) requirement += 5;
    
    // Adjust for importance
    if (event.importance === 'high') requirement += 10;
    else if (event.importance === 'low') requirement -= 10;

    return Math.max(20, Math.min(100, requirement));
  }

  getEventSocialRequirement(event) {
    const baseRequirements = {
      presentation: 60,
      teamMeeting: 50,
      networking: 70,
      interview: 55,
      oneOnOne: 30,
      brainstorming: 55,
      training: 45,
      conference: 65
    };

    let requirement = baseRequirements[event.type] || 40;
    
    // Adjust for attendees
    const attendees = event.attendees?.length || 1;
    requirement += Math.min(30, attendees * 3);
    
    // Adjust for external vs internal
    if (event.external) requirement += 15;
    
    // Adjust for meeting format
    if (event.format === 'video') requirement += 5;
    else if (event.format === 'inPerson') requirement += 10;

    return Math.max(0, Math.min(100, requirement));
  }

  checkTimeAppropriateness(event, eventTime) {
    const hour = eventTime.getHours();
    const dayOfWeek = eventTime.getDay();
    
    // Check for inappropriate times
    if (hour < 8 || hour > 19) {
      return {
        type: 'inappropriate_time',
        message: 'Meeting scheduled outside normal working hours',
        severity: 'medium'
      };
    }
    
    if ((dayOfWeek === 0 || dayOfWeek === 6) && event.type !== 'personal') {
      return {
        type: 'weekend_meeting',
        message: 'Business meeting scheduled on weekend',
        severity: 'high'
      };
    }
    
    // Check for lunch time conflicts
    if (hour >= 12 && hour <= 13 && event.duration > 30) {
      return {
        type: 'lunch_conflict',
        message: 'Meeting conflicts with lunch time',
        severity: 'low'
      };
    }
    
    return null;
  }

  findConsecutiveMeetingConflicts(events) {
    const conflicts = [];
    const sortedEvents = events
      .filter(e => e.type !== 'personal')
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    for (let i = 0; i < sortedEvents.length - 1; i++) {
      const current = sortedEvents[i];
      const next = sortedEvents[i + 1];
      
      const currentEnd = new Date(current.startTime).getTime() + (current.duration || 60) * 60 * 1000;
      const nextStart = new Date(next.startTime).getTime();
      const gap = (nextStart - currentEnd) / (1000 * 60); // minutes
      
      if (gap < this.constraints.minBufferTime) {
        conflicts.push({
          type: 'consecutive_meetings',
          events: [current, next],
          gap,
          requiredBuffer: this.constraints.minBufferTime,
          severity: this.calculateConsecutiveSeverity(gap, current, next),
          hasConflict: true,
          details: [{
            type: 'insufficient_buffer',
            message: `Only ${gap} minutes between meetings, need ${this.constraints.minBufferTime}`,
            required: this.constraints.minBufferTime,
            available: gap
          }]
        });
      }
    }

    return conflicts;
  }

  findDailyOverloadConflicts(events, energyForecast, socialForecast) {
    const conflicts = [];
    const dailyGroups = this.groupEventsByDay(events);
    
    Object.keys(dailyGroups).forEach(date => {
      const dayEvents = dailyGroups[date];
      const meetingEvents = dayEvents.filter(e => e.type !== 'personal');
      
      // Check meeting count
      if (meetingEvents.length > this.constraints.maxDailyMeetings) {
        conflicts.push({
          type: 'daily_overload',
          date,
          events: dayEvents,
          meetingCount: meetingEvents.length,
          maxAllowed: this.constraints.maxDailyMeetings,
          hasConflict: true,
          severity: 'high',
          details: [{
            type: 'too_many_meetings',
            message: `${meetingEvents.length} meetings scheduled, maximum is ${this.constraints.maxDailyMeetings}`
          }]
        });
      }
      
      // Check total social drain
      const totalSocialDrain = this.calculateDailySocialDrain(dayEvents);
      const avgDailySocial = this.getAverageDailySocialLevel(date, socialForecast);
      
      if (totalSocialDrain > avgDailySocial * 0.8) {
        conflicts.push({
          type: 'social_overload',
          date,
          events: dayEvents,
          totalSocialDrain,
          availableSocial: avgDailySocial,
          hasConflict: true,
          severity: 'medium',
          details: [{
            type: 'social_battery_depletion',
            message: 'Daily schedule may exhaust social battery'
          }]
        });
      }
    });

    return conflicts;
  }

  calculateConflictSeverity(conflict) {
    let severity = 'low';
    
    if (conflict.energyConflict || conflict.socialConflict) {
      const maxDeficit = Math.max(
        ...conflict.details
          .filter(d => d.deficit)
          .map(d => d.deficit)
      );
      
      if (maxDeficit > 30) severity = 'high';
      else if (maxDeficit > 15) severity = 'medium';
    }
    
    return severity;
  }

  calculateConsecutiveSeverity(gap, current, next) {
    if (gap < 0) return 'critical'; // Overlapping meetings
    if (gap < 5) return 'high';
    if (gap < 10) return 'medium';
    return 'low';
  }

  async generateOptimizedSchedule(events, energyForecast, socialForecast, conflicts) {
    const optimizedEvents = [...events];
    const reschedulingCandidates = [];
    
    // Identify events that need rescheduling
    conflicts.forEach(conflict => {
      if (conflict.severity === 'high' || conflict.severity === 'critical') {
        if (conflict.event) {
          reschedulingCandidates.push({
            event: conflict.event,
            reason: conflict.type,
            conflict
          });
        } else if (conflict.events) {
          conflict.events.forEach(event => {
            reschedulingCandidates.push({
              event,
              reason: conflict.type,
              conflict
            });
          });
        }
      }
    });

    // Find better times for problematic events
    for (const candidate of reschedulingCandidates) {
      const betterTime = await this.findBetterEventTime(
        candidate.event,
        energyForecast,
        socialForecast,
        optimizedEvents
      );
      
      if (betterTime) {
        const eventIndex = optimizedEvents.findIndex(e => e.id === candidate.event.id);
        if (eventIndex !== -1) {
          optimizedEvents[eventIndex] = {
            ...optimizedEvents[eventIndex],
            originalStartTime: optimizedEvents[eventIndex].startTime,
            startTime: betterTime.time,
            optimizationReason: betterTime.reason,
            optimizationScore: betterTime.score,
            rescheduled: true
          };
        }
      }
    }

    // Add buffer times
    this.addOptimalBufferTimes(optimizedEvents);
    
    // Add recovery blocks for high-drain periods
    const recoveryBlocks = this.generateRecoveryBlocks(optimizedEvents, energyForecast, socialForecast);
    optimizedEvents.push(...recoveryBlocks);

    return optimizedEvents.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  }

  async findBetterEventTime(event, energyForecast, socialForecast, existingEvents) {
    const candidates = [];
    const eventDuration = event.duration || 60;
    const requiredEnergy = this.getEventEnergyRequirement(event);
    const requiredSocial = this.getEventSocialRequirement(event);
    
    // Check next 7 days for better slots
    for (let hour = 0; hour < energyForecast.length && hour < 168; hour++) { // 7 days
      const candidateTime = new Date(Date.now() + hour * 60 * 60 * 1000);
      const candidateHour = candidateTime.getHours();
      
      // Skip non-business hours unless event allows it
      if (!event.allowNonBusinessHours && (candidateHour < 8 || candidateHour > 18)) {
        continue;
      }
      
      // Check for existing conflicts
      const hasConflict = this.checkTimeSlotConflict(candidateTime, eventDuration, existingEvents);
      if (hasConflict) continue;
      
      const energyData = energyForecast[hour];
      const socialData = socialForecast[hour];
      
      // Check if this time meets requirements
      if (energyData.predictedEnergy >= requiredEnergy && 
          socialData.predictedSocial >= requiredSocial) {
        
        const score = this.calculateTimeSlotScore(
          event,
          candidateTime,
          energyData,
          socialData
        );
        
        candidates.push({
          time: candidateTime,
          score,
          energyLevel: energyData.predictedEnergy,
          socialLevel: socialData.predictedSocial,
          reason: 'better_energy_social_alignment'
        });
      }
    }
    
    // Return best candidate
    candidates.sort((a, b) => b.score - a.score);
    return candidates[0] || null;
  }

  checkTimeSlotConflict(startTime, duration, existingEvents) {
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
    
    return existingEvents.some(event => {
      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(eventStart.getTime() + (event.duration || 60) * 60 * 1000);
      
      return (startTime < eventEnd && endTime > eventStart);
    });
  }

  calculateTimeSlotScore(event, time, energyData, socialData) {
    let score = 0;
    
    // Energy alignment (40%)
    const energyRequirement = this.getEventEnergyRequirement(event);
    const energyMatch = Math.max(0, 100 - Math.abs(energyData.predictedEnergy - energyRequirement));
    score += energyMatch * 0.4;
    
    // Social alignment (30%)
    const socialRequirement = this.getEventSocialRequirement(event);
    const socialMatch = Math.max(0, 100 - Math.abs(socialData.predictedSocial - socialRequirement));
    score += socialMatch * 0.3;
    
    // Time appropriateness (20%)
    const timeScore = this.calculateTimeAppropriatenessScore(event, time);
    score += timeScore * 0.2;
    
    // Calendar fit (10%)
    const calendarScore = this.calculateCalendarFitScore(event, time);
    score += calendarScore * 0.1;
    
    return Math.round(score);
  }

  calculateTimeAppropriatenessScore(event, time) {
    const hour = time.getHours();
    const dayOfWeek = time.getDay();
    
    let score = 100;
    
    // Penalty for early/late hours
    if (hour < 9) score -= (9 - hour) * 10;
    if (hour > 17) score -= (hour - 17) * 15;
    
    // Weekend penalty for business events
    if ((dayOfWeek === 0 || dayOfWeek === 6) && event.type !== 'personal') {
      score -= 40;
    }
    
    // Lunch time penalty
    if (hour >= 12 && hour <= 13) score -= 20;
    
    // Event type specific preferences
    if (event.type === 'brainstorming' && hour >= 9 && hour <= 11) score += 20;
    if (event.type === 'administrative' && hour >= 14 && hour <= 16) score += 15;
    
    return Math.max(0, score);
  }

  calculateCalendarFitScore(event, time) {
    // This would integrate with actual calendar APIs
    // For now, return a base score
    return 80;
  }

  addOptimalBufferTimes(events) {
    const meetingEvents = events
      .filter(e => e.type !== 'personal' && e.type !== 'recovery')
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    for (let i = 0; i < meetingEvents.length - 1; i++) {
      const current = meetingEvents[i];
      const next = meetingEvents[i + 1];
      
      const currentEnd = new Date(current.startTime).getTime() + (current.duration || 60) * 60 * 1000;
      const nextStart = new Date(next.startTime).getTime();
      const gap = (nextStart - currentEnd) / (1000 * 60);
      
      if (gap < this.constraints.minBufferTime && gap >= 0) {
        // Suggest extending the gap
        const bufferNeeded = this.constraints.minBufferTime - gap;
        current.suggestedBufferTime = bufferNeeded;
        current.bufferReason = 'insufficient_recovery_time';
      }
    }
  }

  generateRecoveryBlocks(events, energyForecast, socialForecast) {
    const recoveryBlocks = [];
    const dailyGroups = this.groupEventsByDay(events);
    
    Object.keys(dailyGroups).forEach(date => {
      const dayEvents = dailyGroups[date];
      const totalEnergyDrain = this.calculateDailyEnergyDrain(dayEvents);
      const totalSocialDrain = this.calculateDailySocialDrain(dayEvents);
      
      // Add recovery blocks for high-drain days
      if (totalEnergyDrain > 200 || totalSocialDrain > 150) {
        const recoveryTime = this.findOptimalRecoveryTime(date, dayEvents, energyForecast);
        
        if (recoveryTime) {
          recoveryBlocks.push({
            id: `recovery_${date}_${Date.now()}`,
            title: 'Energy Recovery Break',
            type: 'recovery',
            startTime: recoveryTime,
            duration: this.calculateRecoveryDuration(totalEnergyDrain, totalSocialDrain),
            autoGenerated: true,
            reason: 'high_daily_drain',
            energyRecovery: 15,
            socialRecovery: 20
          });
        }
      }
    });
    
    return recoveryBlocks;
  }

  findOptimalRecoveryTime(date, dayEvents, energyForecast) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    
    // Find gaps between events
    const sortedEvents = dayEvents.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    
    for (let i = 0; i < sortedEvents.length - 1; i++) {
      const current = sortedEvents[i];
      const next = sortedEvents[i + 1];
      
      const currentEnd = new Date(current.startTime).getTime() + (current.duration || 60) * 60 * 1000;
      const nextStart = new Date(next.startTime).getTime();
      const gap = (nextStart - currentEnd) / (1000 * 60);
      
      if (gap >= 45) { // Minimum 45 minutes for recovery
        return new Date(currentEnd + 15 * 60 * 1000); // 15 minutes after current event
      }
    }
    
    // If no gaps, suggest end of day
    if (sortedEvents.length > 0) {
      const lastEvent = sortedEvents[sortedEvents.length - 1];
      const lastEventEnd = new Date(lastEvent.startTime).getTime() + (lastEvent.duration || 60) * 60 * 1000;
      return new Date(lastEventEnd + 30 * 60 * 1000);
    }
    
    return null;
  }

  calculateRecoveryDuration(energyDrain, socialDrain) {
    const baseRecovery = 30; // 30 minutes
    const extraRecovery = Math.floor((energyDrain + socialDrain) / 50) * 15; // 15 min per 50 drain points
    return Math.min(120, baseRecovery + extraRecovery); // Max 2 hours
  }

  calculateOptimizationMetrics(originalEvents, optimizedEvents, energyForecast) {
    const metrics = {
      eventsOptimized: 0,
      eventsRescheduled: 0,
      bufferTimesAdded: 0,
      recoveryBlocksAdded: 0,
      energyAlignment: 0,
      socialAlignment: 0,
      conflictsResolved: 0,
      overallImprovement: 0
    };

    // Count optimizations
    optimizedEvents.forEach(event => {
      if (event.rescheduled) metrics.eventsRescheduled++;
      if (event.suggestedBufferTime) metrics.bufferTimesAdded++;
      if (event.autoGenerated && event.type === 'recovery') metrics.recoveryBlocksAdded++;
    });

    // Calculate energy alignment improvement
    const originalAlignment = this.calculateScheduleEnergyAlignment(originalEvents, energyForecast);
    const optimizedAlignment = this.calculateScheduleEnergyAlignment(optimizedEvents, energyForecast);
    metrics.energyAlignment = optimizedAlignment - originalAlignment;

    // Calculate overall improvement
    metrics.overallImprovement = (
      metrics.energyAlignment * 0.4 +
      metrics.eventsRescheduled * 5 +
      metrics.bufferTimesAdded * 3 +
      metrics.recoveryBlocksAdded * 8
    );

    return metrics;
  }

  calculateScheduleEnergyAlignment(events, energyForecast) {
    let totalAlignment = 0;
    let eventCount = 0;

    events.forEach(event => {
      if (event.type === 'recovery' || event.type === 'personal') return;
      
      const eventStart = new Date(event.startTime);
      const hourIndex = Math.floor((eventStart.getTime() - Date.now()) / (1000 * 60 * 60));
      
      if (hourIndex >= 0 && hourIndex < energyForecast.length) {
        const energyData = energyForecast[hourIndex];
        const requiredEnergy = this.getEventEnergyRequirement(event);
        const alignment = Math.max(0, 100 - Math.abs(energyData.predictedEnergy - requiredEnergy));
        
        totalAlignment += alignment;
        eventCount++;
      }
    });

    return eventCount > 0 ? totalAlignment / eventCount : 0;
  }

  generateScheduleRecommendations(optimizedEvents, conflicts, metrics) {
    const recommendations = [];

    // High-priority recommendations based on conflicts
    const highSeverityConflicts = conflicts.filter(c => c.severity === 'high' || c.severity === 'critical');
    if (highSeverityConflicts.length > 0) {
      recommendations.push({
        type: 'critical_conflicts',
        priority: 'high',
        title: 'Critical Schedule Conflicts Detected',
        message: `${highSeverityConflicts.length} high-priority conflicts need attention`,
        action: 'Review and reschedule conflicting events',
        conflicts: highSeverityConflicts
      });
    }

    // Energy optimization recommendations
    if (metrics.energyAlignment < 60) {
      recommendations.push({
        type: 'energy_optimization',
        priority: 'medium',
        title: 'Schedule Energy Alignment',
        message: 'Schedule could be better aligned with energy patterns',
        action: 'Consider rescheduling demanding tasks to peak energy periods',
        improvement: `${metrics.energyAlignment.toFixed(1)}% alignment improvement possible`
      });
    }

    // Buffer time recommendations
    if (metrics.bufferTimesAdded > 0) {
      recommendations.push({
        type: 'buffer_times',
        priority: 'medium',
        title: 'Add Recovery Buffer Times',
        message: `${metrics.bufferTimesAdded} events need buffer time`,
        action: 'Add 15-30 minute buffers between demanding meetings'
      });
    }

    // Recovery recommendations
    if (metrics.recoveryBlocksAdded > 0) {
      recommendations.push({
        type: 'recovery_blocks',
        priority: 'medium',
        title: 'Schedule Recovery Time',
        message: `${metrics.recoveryBlocksAdded} recovery blocks recommended`,
        action: 'Block time for energy restoration during high-drain days'
      });
    }

    // Daily load recommendations
    const overloadedDays = this.findOverloadedDays(optimizedEvents);
    if (overloadedDays.length > 0) {
      recommendations.push({
        type: 'daily_load',
        priority: 'high',
        title: 'Daily Schedule Overload',
        message: `${overloadedDays.length} days have excessive meeting load`,
        action: 'Distribute meetings more evenly across the week',
        overloadedDays
      });
    }

    return recommendations.slice(0, 5); // Limit to top 5
  }

  // Utility methods
  groupEventsByDay(events) {
    const groups = {};
    
    events.forEach(event => {
      const date = new Date(event.startTime).toISOString().split('T')[0];
      if (!groups[date]) groups[date] = [];
      groups[date].push(event);
    });
    
    return groups;
  }

  calculateDailyEnergyDrain(events) {
    return events.reduce((total, event) => {
      if (event.type === 'recovery') return total;
      return total + this.getEventEnergyRequirement(event);
    }, 0);
  }

  calculateDailySocialDrain(events) {
    return events.reduce((total, event) => {
      if (event.type === 'recovery' || event.type === 'personal') return total;
      return total + this.getEventSocialRequirement(event);
    }, 0);
  }

  getAverageDailySocialLevel(date, socialForecast) {
    const dayStart = new Date(date).getTime();
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;
    
    const dayData = socialForecast.filter(forecast => {
      const forecastTime = forecast.time.getTime();
      return forecastTime >= dayStart && forecastTime < dayEnd;
    });
    
    if (dayData.length === 0) return 50; // Default
    
    return dayData.reduce((sum, data) => sum + data.predictedSocial, 0) / dayData.length;
  }

  findOverloadedDays(events) {
    const dailyGroups = this.groupEventsByDay(events);
    const overloaded = [];
    
    Object.keys(dailyGroups).forEach(date => {
      const dayEvents = dailyGroups[date];
      const meetingCount = dayEvents.filter(e => e.type !== 'personal' && e.type !== 'recovery').length;
      
      if (meetingCount > this.constraints.maxDailyMeetings) {
        overloaded.push({
          date,
          meetingCount,
          maxAllowed: this.constraints.maxDailyMeetings,
          events: dayEvents
        });
      }
    });
    
    return overloaded;
  }

  calculateOptimalBufferTimes(events) {
    const bufferTimes = [];
    const meetingEvents = events
      .filter(e => e.type !== 'personal' && e.type !== 'recovery')
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    for (let i = 0; i < meetingEvents.length - 1; i++) {
      const current = meetingEvents[i];
      const next = meetingEvents[i + 1];
      
      const energyDrain = this.getEventEnergyRequirement(current);
      const socialDrain = this.getEventSocialRequirement(current);
      
      let recommendedBuffer = this.constraints.minBufferTime;
      
      // Increase buffer for high-drain events
      if (energyDrain > 60 || socialDrain > 50) {
        recommendedBuffer += 15;
      }
      
      // Increase buffer for presentation -> meeting transitions
      if (current.type === 'presentation' && next.type === 'meeting') {
        recommendedBuffer += 10;
      }
      
      bufferTimes.push({
        afterEvent: current.id,
        beforeEvent: next.id,
        recommendedDuration: recommendedBuffer,
        reason: this.getBufferReason(energyDrain, socialDrain, current.type, next.type)
      });
    }
    
    return bufferTimes;
  }

  getBufferReason(energyDrain, socialDrain, currentType, nextType) {
    if (energyDrain > 60) return 'High energy recovery needed';
    if (socialDrain > 50) return 'Social battery recovery needed';
    if (currentType === 'presentation') return 'Post-presentation recovery';
    if (nextType === 'presentation') return 'Pre-presentation preparation';
    return 'Standard transition time';
  }

  identifyRecoveryWindows(events, energyForecast) {
    const windows = [];
    const dailyGroups = this.groupEventsByDay(events);
    
    Object.keys(dailyGroups).forEach(date => {
      const dayEvents = dailyGroups[date];
      const totalDrain = this.calculateDailyEnergyDrain(dayEvents) + this.calculateDailySocialDrain(dayEvents);
      
      if (totalDrain > 300) { // High drain day
        windows.push({
          date,
          type: 'full_recovery',
          duration: 120,
          reason: 'High drain day requires extended recovery',
          activities: ['meditation', 'alone_time', 'light_exercise']
        });
      } else if (totalDrain > 200) {
        windows.push({
          date,
          type: 'moderate_recovery',
          duration: 60,
          reason: 'Moderate recovery needed',
          activities: ['break', 'walk', 'stretching']
        });
      }
    });
    
    return windows;
  }

  generateFallbackSchedule(events) {
    return {
      optimizedEvents: events,
      energyForecast: [],
      socialForecast: [],
      conflicts: [],
      metrics: { overallImprovement: 0 },
      recommendations: [{
        type: 'fallback_notice',
        priority: 'low',
        title: 'Basic Schedule Analysis',
        message: 'Advanced optimization unavailable, showing current schedule',
        action: 'Check AI system status for full optimization features'
      }],
      bufferTimes: [],
      recoveryWindows: []
    };
  }

  processCalendarEvents(events) {
    // Process and normalize calendar events from different sources
    return events.map(event => ({
      id: event.id || `event_${Date.now()}_${Math.random()}`,
      title: event.title || event.summary || 'Untitled Event',
      startTime: event.startTime || event.start,
      duration: event.duration || this.calculateDuration(event.start, event.end),
      type: this.inferEventType(event),
      attendees: event.attendees || [],
      importance: event.importance || 'medium',
      external: this.isExternalEvent(event),
      location: event.location,
      description: event.description
    }));
  }

  inferEventType(event) {
    const title = (event.title || event.summary || '').toLowerCase();
    
    if (title.includes('presentation') || title.includes('demo')) return 'presentation';
    if (title.includes('interview')) return 'interview';
    if (title.includes('brainstorm') || title.includes('ideation')) return 'brainstorming';
    if (title.includes('training') || title.includes('workshop')) return 'training';
    if (title.includes('review') || title.includes('retrospective')) return 'review';
    if (title.includes('standup') || title.includes('daily')) return 'standup';
    if (title.includes('lunch') || title.includes('coffee')) return 'social';
    
    return 'meeting'; // Default
  }

  isExternalEvent(event) {
    if (!event.attendees) return false;
    
    const externalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com']; // Add more as needed
    return event.attendees.some(attendee => 
      externalDomains.some(domain => attendee.email?.includes(domain))
    );
  }

  calculateDuration(start, end) {
    if (!start || !end) return 60; // Default 1 hour
    return (new Date(end) - new Date(start)) / (1000 * 60); // minutes
  }

  // Calendar integration methods (stubs for actual implementations)
  async connectCalendar(provider, credentials) {
    // Would integrate with Google Calendar, Outlook, etc.
    this.calendarIntegrations.set(provider, {
      connected: true,
      credentials,
      lastSync: Date.now()
    });
    
    return { success: true, provider };
  }

  async syncCalendarEvents(provider) {
    // Would sync events from external calendar
    const integration = this.calendarIntegrations.get(provider);
    if (!integration) throw new Error('Calendar not connected');
    
    // Placeholder for actual sync logic
    return [];
  }

  async createCalendarEvent(event, provider) {
    // Would create event in external calendar
    const integration = this.calendarIntegrations.get(provider);
    if (!integration) throw new Error('Calendar not connected');
    
    // Placeholder for actual creation logic
    return { success: true, eventId: `${provider}_${Date.now()}` };
  }

  // Monitoring and continuous optimization
  startScheduleMonitoring() {
    // Monitor schedule adherence and outcomes
    setInterval(() => {
      this.analyzeScheduleAdherence();
    }, 60 * 60 * 1000); // Every hour
  }

  async analyzeScheduleAdherence() {
    // Analyze how well users follow optimized schedules
    const recentOptimizations = this.optimizedSchedules.slice(-5);
    
    for (const optimization of recentOptimizations) {
      if (!optimization.analyzed && this.isOptimizationPeriodComplete(optimization)) {
        const adherence = await this.calculateScheduleAdherence(optimization);
        optimization.analyzed = true;
        optimization.adherence = adherence;
        
        // Learn from adherence patterns
        this.updateOptimizationStrategy(adherence);
      }
    }
  }

  isOptimizationPeriodComplete(optimization) {
    const optimizationEndTime = optimization.timestamp + (optimization.timeRange * 24 * 60 * 60 * 1000);
    return Date.now() > optimizationEndTime;
  }

  async calculateScheduleAdherence(optimization) {
    // Compare optimized schedule with actual events
    // This would require tracking actual calendar usage
    return {
      eventsFollowed: 0.8, // 80% of optimized events were followed
      bufferTimesUsed: 0.6, // 60% of suggested buffers were implemented
      conflictsAvoided: 0.9, // 90% of predicted conflicts were avoided
      overallAdherence: 0.75
    };
  }

  updateOptimizationStrategy(adherence) {
    // Adjust optimization parameters based on user adherence
    if (adherence.overallAdherence < 0.5) {
      // Users aren't following recommendations, make them less aggressive
      this.constraints.minBufferTime = Math.max(10, this.constraints.minBufferTime - 5);
    } else if (adherence.overallAdherence > 0.8) {
      // Users are following well, can be more aggressive
      this.constraints.minBufferTime = Math.min(30, this.constraints.minBufferTime + 5);
    }
    
    this.storage.setLocalData('scheduleConstraints', this.constraints);
  }

  // Public API
  async getOptimizedSchedule(timeRange = 7) {
    const events = await this.storage.getAll('events');
    return this.optimizeSchedule(timeRange, events);
  }

  async suggestMeetingTime(meetingDetails, participants = []) {
    // Find optimal time for a new meeting considering all constraints
    const energyForecast = await this.generateEnergyForecast(168); // 7 days
    const socialForecast = await this.generateSocialForecast(168);
    const existingEvents = await this.storage.getAll('events');
    
    return this.findBetterEventTime(meetingDetails, energyForecast, socialForecast, existingEvents);
  }

  getScheduleConstraints() {
    return { ...this.constraints };
  }

  updateScheduleConstraints(newConstraints) {
    this.constraints = { ...this.constraints, ...newConstraints };
    this.storage.setLocalData('scheduleConstraints', this.constraints);
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

export default ScheduleOptimizer;