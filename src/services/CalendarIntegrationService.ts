// Calendar Integration Service - Smart calendar management with energy optimization

import { 
  CalendarEvent, 
  CalendarProvider, 
  TimeSlot, 
  ScheduleOptimization,
  SmartSchedulingRequest,
  SmartSchedulingResult,
  ScheduleConflict,
  MeetingEnergyStats,
  SyncStatus
} from '../types/integration';
import { EnergyLevel } from '../types/energy';
import { addMinutes, format, startOfDay, endOfDay, isWithinInterval, parseISO } from 'date-fns';

export class CalendarIntegrationService {
  private static instance: CalendarIntegrationService;
  private providers: CalendarProvider[] = [];
  private events: CalendarEvent[] = [];
  private syncStatus: SyncStatus = {
    isActive: false,
    lastSync: new Date(),
    nextSync: new Date(),
    errors: [],
    successfulSyncs: 0,
    failedSyncs: 0,
    dataQuality: 0.95
  };

  public static getInstance(): CalendarIntegrationService {
    if (!CalendarIntegrationService.instance) {
      CalendarIntegrationService.instance = new CalendarIntegrationService();
    }
    return CalendarIntegrationService.instance;
  }

  // Provider Management
  async connectProvider(provider: Omit<CalendarProvider, 'isConnected' | 'lastSync'>): Promise<boolean> {
    try {
      // Simulate API connection (in real implementation, this would handle OAuth flow)
      const connectedProvider: CalendarProvider = {
        ...provider,
        isConnected: true,
        lastSync: new Date(),
        syncEnabled: true
      };

      const existingIndex = this.providers.findIndex(p => p.id === provider.id);
      if (existingIndex >= 0) {
        this.providers[existingIndex] = connectedProvider;
      } else {
        this.providers.push(connectedProvider);
      }

      // Initial sync
      await this.syncProvider(provider.id);
      
      this.saveToStorage();
      return true;
    } catch (error) {
      console.error('Failed to connect calendar provider:', error);
      return false;
    }
  }

  async disconnectProvider(providerId: string): Promise<boolean> {
    try {
      const providerIndex = this.providers.findIndex(p => p.id === providerId);
      if (providerIndex >= 0) {
        this.providers[providerIndex].isConnected = false;
        this.providers[providerIndex].syncEnabled = false;
        
        // Remove events from this provider
        this.events = this.events.filter(event => event.source.id !== providerId);
        
        this.saveToStorage();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to disconnect calendar provider:', error);
      return false;
    }
  }

  getProviders(): CalendarProvider[] {
    return [...this.providers];
  }

  getConnectedProviders(): CalendarProvider[] {
    return this.providers.filter(p => p.isConnected && p.syncEnabled);
  }

  // Event Management
  async syncAllProviders(): Promise<SyncStatus> {
    const connectedProviders = this.getConnectedProviders();
    let successCount = 0;
    let errorCount = 0;

    for (const provider of connectedProviders) {
      try {
        await this.syncProvider(provider.id);
        successCount++;
      } catch (error) {
        errorCount++;
        this.syncStatus.errors.push({
          timestamp: new Date(),
          provider: provider.name,
          error: error instanceof Error ? error.message : 'Unknown sync error',
          severity: 'error',
          resolved: false
        });
      }
    }

    this.syncStatus.lastSync = new Date();
    this.syncStatus.nextSync = addMinutes(new Date(), 30); // Sync every 30 minutes
    this.syncStatus.successfulSyncs += successCount;
    this.syncStatus.failedSyncs += errorCount;
    this.syncStatus.dataQuality = Math.max(0.7, 1 - (errorCount / Math.max(1, successCount + errorCount)));

    this.saveToStorage();
    return { ...this.syncStatus };
  }

  private async syncProvider(providerId: string): Promise<void> {
    const provider = this.providers.find(p => p.id === providerId);
    if (!provider || !provider.isConnected) {
      throw new Error(`Provider ${providerId} not found or not connected`);
    }

    // Simulate API call to fetch events
    const mockEvents = this.generateMockEvents(provider);
    
    // Remove old events from this provider
    this.events = this.events.filter(event => event.source.id !== providerId);
    
    // Add new events
    this.events.push(...mockEvents);
    
    // Update provider sync time
    provider.lastSync = new Date();
    
    console.log(`Synced ${mockEvents.length} events from ${provider.name}`);
  }

  private generateMockEvents(provider: CalendarProvider): CalendarEvent[] {
    const now = new Date();
    const events: CalendarEvent[] = [];
    
    // Generate 10-15 mock events for the next 2 weeks
    for (let i = 0; i < 12; i++) {
      const startTime = addMinutes(now, Math.random() * 14 * 24 * 60); // Next 2 weeks
      const duration = [30, 45, 60, 90, 120][Math.floor(Math.random() * 5)];
      const endTime = addMinutes(startTime, duration);
      
      const eventTypes = [
        { title: 'Team Standup', type: 'video' as const, energyCost: 3 },
        { title: 'Client Meeting', type: 'video' as const, energyCost: 7 },
        { title: 'Project Review', type: 'in-person' as const, energyCost: 6 },
        { title: 'One-on-One', type: 'video' as const, energyCost: 4 },
        { title: 'Design Workshop', type: 'hybrid' as const, energyCost: 8 },
        { title: 'Coffee Chat', type: 'in-person' as const, energyCost: 2 },
        { title: 'Board Meeting', type: 'in-person' as const, energyCost: 9 },
        { title: 'Training Session', type: 'video' as const, energyCost: 5 }
      ];
      
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      
      events.push({
        id: `${provider.id}-event-${i}`,
        title: eventType.title,
        description: `${eventType.title} scheduled via ${provider.name}`,
        startTime,
        endTime,
        meetingType: eventType.type,
        energyCost: eventType.energyCost,
        isRecurring: Math.random() > 0.7,
        source: provider,
        attendees: Math.random() > 0.5 ? ['colleague@company.com', 'manager@company.com'] : [],
        location: eventType.type === 'in-person' ? 'Conference Room A' : undefined
      });
    }
    
    return events;
  }

  getEvents(startDate?: Date, endDate?: Date): CalendarEvent[] {
    let filteredEvents = [...this.events];
    
    if (startDate) {
      filteredEvents = filteredEvents.filter(event => event.startTime >= startDate);
    }
    
    if (endDate) {
      filteredEvents = filteredEvents.filter(event => event.endTime <= endDate);
    }
    
    return filteredEvents.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  // Smart Scheduling
  async findOptimalTimeSlot(request: SmartSchedulingRequest): Promise<SmartSchedulingResult> {
    const availableSlots = this.findAvailableSlots(request.duration, request.deadline);
    const energyOptimizedSlots = await this.optimizeForEnergy(availableSlots, request.energyRequirement);
    
    if (energyOptimizedSlots.length === 0) {
      return {
        success: false,
        suggestedSlots: [],
        conflicts: [{
          type: 'time-overlap',
          severity: 'critical',
          description: 'No available time slots found',
          affectedItems: [],
          suggestedResolution: 'Consider extending deadline or reducing duration',
          autoResolvable: false
        }],
        energyScore: 0,
        optimizationApplied: false,
        reasoning: 'No suitable time slots available',
        alternatives: []
      };
    }

    const bestSlot = energyOptimizedSlots[0];
    const conflicts = this.detectConflicts(bestSlot);
    
    return {
      success: true,
      suggestedSlots: energyOptimizedSlots.slice(0, 3),
      selectedSlot: bestSlot,
      conflicts,
      energyScore: bestSlot.energyLevel,
      optimizationApplied: true,
      reasoning: this.generateSchedulingReasoning(bestSlot, request),
      alternatives: energyOptimizedSlots.slice(1, 5)
    };
  }

  private findAvailableSlots(duration: number, deadline?: Date): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const now = new Date();
    const searchEnd = deadline || addMinutes(now, 14 * 24 * 60); // 2 weeks default
    
    // Generate 15-minute time slots for the next period
    for (let time = new Date(now); time < searchEnd; time = addMinutes(time, 15)) {
      // Skip slots outside working hours (9 AM - 6 PM)
      const hour = time.getHours();
      if (hour < 9 || hour >= 18) continue;
      
      // Skip weekends for this demo
      const day = time.getDay();
      if (day === 0 || day === 6) continue;
      
      const slotEnd = addMinutes(time, duration);
      
      // Check if this slot conflicts with existing events
      const hasConflict = this.events.some(event => 
        isWithinInterval(time, { start: event.startTime, end: event.endTime }) ||
        isWithinInterval(slotEnd, { start: event.startTime, end: event.endTime }) ||
        (time <= event.startTime && slotEnd >= event.endTime)
      );
      
      if (!hasConflict) {
        slots.push({
          start: new Date(time),
          end: slotEnd,
          energyLevel: this.predictEnergyLevel(time),
          availability: 'free',
          conflictRisk: 0
        });
      }
    }
    
    return slots;
  }

  private predictEnergyLevel(time: Date): number {
    const hour = time.getHours();
    
    // Energy patterns based on typical circadian rhythms
    if (hour >= 9 && hour <= 11) return 8; // Morning peak
    if (hour >= 14 && hour <= 16) return 7; // Afternoon peak
    if (hour >= 11 && hour <= 13) return 6; // Pre-lunch
    if (hour >= 16 && hour <= 18) return 5; // Evening decline
    if (hour >= 8 && hour <= 9) return 6;   // Early morning
    return 4; // Default
  }

  private async optimizeForEnergy(slots: TimeSlot[], energyRequirement: string): Promise<TimeSlot[]> {
    const energyThresholds = {
      'low': 4,
      'medium': 6,
      'high': 8,
      'variable': 5
    };
    
    const threshold = energyThresholds[energyRequirement as keyof typeof energyThresholds] || 5;
    
    return slots
      .filter(slot => slot.energyLevel >= threshold)
      .sort((a, b) => b.energyLevel - a.energyLevel);
  }

  private detectConflicts(slot: TimeSlot): ScheduleConflict[] {
    const conflicts: ScheduleConflict[] = [];
    
    // Check for back-to-back meetings
    const adjacentEvents = this.events.filter(event => {
      const timeDiff = Math.abs(event.startTime.getTime() - slot.end.getTime());
      return timeDiff < 15 * 60 * 1000; // Within 15 minutes
    });
    
    if (adjacentEvents.length > 0) {
      conflicts.push({
        type: 'energy-drain',
        severity: 'medium',
        description: 'Back-to-back meetings may cause energy drain',
        affectedItems: adjacentEvents.map(e => e.id),
        suggestedResolution: 'Add 15-minute buffer between meetings',
        autoResolvable: true
      });
    }
    
    return conflicts;
  }

  private generateSchedulingReasoning(slot: TimeSlot, request: SmartSchedulingRequest): string {
    const hour = slot.start.getHours();
    const energyLevel = slot.energyLevel;
    
    let reasoning = `Scheduled for ${format(slot.start, 'HH:mm')} `;
    
    if (energyLevel >= 8) {
      reasoning += 'during peak energy hours for optimal performance';
    } else if (energyLevel >= 6) {
      reasoning += 'during good energy hours with sufficient focus';
    } else {
      reasoning += 'during available time with adequate energy levels';
    }
    
    if (request.energyRequirement === 'high' && energyLevel >= 8) {
      reasoning += '. Perfect match for high-energy requirement.';
    } else if (request.energyRequirement === 'low') {
      reasoning += '. Suitable for low-energy task.';
    }
    
    return reasoning;
  }

  // Energy Analysis
  async analyzeEnergyPatterns(): Promise<MeetingEnergyStats> {
    const events = this.getEvents();
    const totalMeetingTime = events.reduce((sum, event) => {
      return sum + (event.endTime.getTime() - event.startTime.getTime()) / (1000 * 60);
    }, 0);
    
    const averageEnergyCost = events.length > 0 
      ? events.reduce((sum, event) => sum + event.energyCost, 0) / events.length
      : 0;
    
    // Analyze meeting times to find patterns
    const hourlyMeetingCount: { [hour: number]: number } = {};
    const hourlyEnergyCost: { [hour: number]: number[] } = {};
    
    events.forEach(event => {
      const hour = event.startTime.getHours();
      hourlyMeetingCount[hour] = (hourlyMeetingCount[hour] || 0) + 1;
      if (!hourlyEnergyCost[hour]) hourlyEnergyCost[hour] = [];
      hourlyEnergyCost[hour].push(event.energyCost);
    });
    
    // Find optimal and worst meeting times
    const hourScores = Object.keys(hourlyMeetingCount).map(hour => {
      const h = parseInt(hour);
      const avgCost = hourlyEnergyCost[h].reduce((a, b) => a + b, 0) / hourlyEnergyCost[h].length;
      return { hour: h, score: 10 - avgCost, count: hourlyMeetingCount[h] };
    });
    
    hourScores.sort((a, b) => b.score - a.score);
    
    const optimalTimes = hourScores.slice(0, 3).map(h => `${h.hour.toString().padStart(2, '0')}:00`);
    const worstTimes = hourScores.slice(-3).map(h => `${h.hour.toString().padStart(2, '0')}:00`);
    
    return {
      averageEnergyCost,
      totalMeetingTime,
      energyDrainRate: averageEnergyCost * 60, // energy per hour
      optimalMeetingTimes: optimalTimes,
      worstMeetingTimes: worstTimes,
      energyRecoveryNeeded: averageEnergyCost * 10 // minutes
    };
  }

  // Schedule Optimization
  async generateOptimizations(): Promise<ScheduleOptimization[]> {
    const optimizations: ScheduleOptimization[] = [];
    const events = this.getEvents();
    const now = new Date();
    
    // Find high-energy meetings in low-energy times
    events.forEach(event => {
      if (event.startTime > now && event.energyCost >= 7) {
        const hour = event.startTime.getHours();
        const predictedEnergy = this.predictEnergyLevel(event.startTime);
        
        if (predictedEnergy < 6) {
          // Suggest rescheduling to high-energy time
          const betterSlots = this.findAvailableSlots(
            (event.endTime.getTime() - event.startTime.getTime()) / (1000 * 60)
          ).filter(slot => slot.energyLevel >= 8);
          
          if (betterSlots.length > 0) {
            optimizations.push({
              id: `reschedule-${event.id}`,
              type: 'meeting-reschedule',
              priority: 'high',
              title: `Reschedule "${event.title}" to peak energy time`,
              description: `This high-energy meeting is scheduled during a low-energy period. Moving it to ${format(betterSlots[0].start, 'HH:mm')} could improve performance by ${betterSlots[0].energyLevel - predictedEnergy} energy points.`,
              currentSchedule: {
                start: event.startTime,
                end: event.endTime,
                energyLevel: predictedEnergy,
                availability: 'busy',
                conflictRisk: 0
              },
              suggestedSchedule: betterSlots[0],
              energyImprovement: betterSlots[0].energyLevel - predictedEnergy,
              reasoning: `High-energy meetings perform better during peak energy hours (${format(betterSlots[0].start, 'HH:mm')})`,
              conflictRisk: 0.1,
              implementationEffort: 'moderate',
              expiresAt: addMinutes(event.startTime, -60), // 1 hour before meeting
              source: 'ai-analysis'
            });
          }
        }
      }
    });
    
    // Suggest breaks between intensive meetings
    for (let i = 0; i < events.length - 1; i++) {
      const currentEvent = events[i];
      const nextEvent = events[i + 1];
      
      if (currentEvent.energyCost >= 6 && nextEvent.energyCost >= 6) {
        const timeBetween = (nextEvent.startTime.getTime() - currentEvent.endTime.getTime()) / (1000 * 60);
        
        if (timeBetween < 15) {
          optimizations.push({
            id: `break-${currentEvent.id}-${nextEvent.id}`,
            type: 'break-suggestion',
            priority: 'medium',
            title: 'Add energy recovery break',
            description: `Add a 15-minute break between "${currentEvent.title}" and "${nextEvent.title}" to prevent energy depletion.`,
            currentSchedule: {
              start: currentEvent.endTime,
              end: nextEvent.startTime,
              energyLevel: 3,
              availability: 'free',
              conflictRisk: 0
            },
            suggestedSchedule: {
              start: currentEvent.endTime,
              end: addMinutes(currentEvent.endTime, 15),
              energyLevel: 6,
              availability: 'tentative',
              conflictRisk: 0.2
            },
            energyImprovement: 3,
            reasoning: 'High-energy meetings back-to-back can lead to energy depletion and reduced performance',
            conflictRisk: 0.2,
            implementationEffort: 'easy',
            expiresAt: currentEvent.startTime,
            source: 'energy-pattern'
          });
        }
      }
    }
    
    return optimizations;
  }

  // Storage
  private saveToStorage(): void {
    const data = {
      providers: this.providers,
      events: this.events.map(event => ({
        ...event,
        startTime: event.startTime.toISOString(),
        endTime: event.endTime.toISOString()
      })),
      syncStatus: {
        ...this.syncStatus,
        lastSync: this.syncStatus.lastSync.toISOString(),
        nextSync: this.syncStatus.nextSync.toISOString(),
        errors: this.syncStatus.errors.map(error => ({
          ...error,
          timestamp: error.timestamp.toISOString()
        }))
      }
    };
    
    localStorage.setItem('calendarIntegration', JSON.stringify(data));
  }

  loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('calendarIntegration');
      if (stored) {
        const data = JSON.parse(stored);
        
        this.providers = data.providers || [];
        this.events = (data.events || []).map((event: any) => ({
          ...event,
          startTime: new Date(event.startTime),
          endTime: new Date(event.endTime)
        }));
        
        if (data.syncStatus) {
          this.syncStatus = {
            ...data.syncStatus,
            lastSync: new Date(data.syncStatus.lastSync),
            nextSync: new Date(data.syncStatus.nextSync),
            errors: (data.syncStatus.errors || []).map((error: any) => ({
              ...error,
              timestamp: new Date(error.timestamp)
            }))
          };
        }
      }
    } catch (error) {
      console.error('Failed to load calendar integration data:', error);
    }
  }

  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }
}

// Export singleton instance
export const calendarService = CalendarIntegrationService.getInstance();
