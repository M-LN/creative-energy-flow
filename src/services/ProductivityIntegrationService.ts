// Productivity Integration Service - Task management with energy optimization

import { 
  Task, 
  ProductivityProvider, 
  TaskPriority, 
  TaskStatus, 
  TaskCategory,
  EnergyRequirement,
  TimeSlot,
  ScheduleOptimization,
  TaskCompletionStats,
  ProcrastinationPattern,
  SmartSchedulingRequest,
  SmartSchedulingResult,
  SyncStatus
} from '../types/integration';
import { addMinutes, addDays, isAfter, isBefore, startOfDay, endOfDay, format } from 'date-fns';

export class ProductivityIntegrationService {
  private static instance: ProductivityIntegrationService;
  private providers: ProductivityProvider[] = [];
  private tasks: Task[] = [];
  private syncStatus: SyncStatus = {
    isActive: false,
    lastSync: new Date(),
    nextSync: new Date(),
    errors: [],
    successfulSyncs: 0,
    failedSyncs: 0,
    dataQuality: 0.95
  };

  public static getInstance(): ProductivityIntegrationService {
    if (!ProductivityIntegrationService.instance) {
      ProductivityIntegrationService.instance = new ProductivityIntegrationService();
    }
    return ProductivityIntegrationService.instance;
  }

  // Provider Management
  async connectProvider(provider: Omit<ProductivityProvider, 'isConnected' | 'lastSync'>): Promise<boolean> {
    try {
      // Simulate API connection
      const connectedProvider: ProductivityProvider = {
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
      console.error('Failed to connect productivity provider:', error);
      return false;
    }
  }

  async disconnectProvider(providerId: string): Promise<boolean> {
    try {
      const providerIndex = this.providers.findIndex(p => p.id === providerId);
      if (providerIndex >= 0) {
        this.providers[providerIndex].isConnected = false;
        this.providers[providerIndex].syncEnabled = false;
        
        // Remove tasks from this provider
        this.tasks = this.tasks.filter(task => task.source.id !== providerId);
        
        this.saveToStorage();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to disconnect productivity provider:', error);
      return false;
    }
  }

  getProviders(): ProductivityProvider[] {
    return [...this.providers];
  }

  getConnectedProviders(): ProductivityProvider[] {
    return this.providers.filter(p => p.isConnected && p.syncEnabled);
  }

  // Task Management
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
    this.syncStatus.nextSync = addMinutes(new Date(), 15); // Sync every 15 minutes
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

    // Simulate API call to fetch tasks
    const mockTasks = this.generateMockTasks(provider);
    
    // Remove old tasks from this provider
    this.tasks = this.tasks.filter(task => task.source.id !== providerId);
    
    // Add new tasks
    this.tasks.push(...mockTasks);
    
    // Update provider sync time
    provider.lastSync = new Date();
    
    console.log(`Synced ${mockTasks.length} tasks from ${provider.name}`);
  }

  private generateMockTasks(provider: ProductivityProvider): Task[] {
    const now = new Date();
    const tasks: Task[] = [];
    
    const taskTemplates = [
      { title: 'Review quarterly reports', category: 'work' as TaskCategory, priority: 'high' as TaskPriority, energy: 'high' as EnergyRequirement, duration: 120 },
      { title: 'Team retrospective preparation', category: 'work' as TaskCategory, priority: 'medium' as TaskPriority, energy: 'medium' as EnergyRequirement, duration: 45 },
      { title: 'Update project documentation', category: 'work' as TaskCategory, priority: 'low' as TaskPriority, energy: 'low' as EnergyRequirement, duration: 90 },
      { title: 'Brainstorm new feature ideas', category: 'creative' as TaskCategory, priority: 'medium' as TaskPriority, energy: 'high' as EnergyRequirement, duration: 60 },
      { title: 'Code review for PR #123', category: 'work' as TaskCategory, priority: 'high' as TaskPriority, energy: 'high' as EnergyRequirement, duration: 30 },
      { title: 'Schedule dentist appointment', category: 'personal' as TaskCategory, priority: 'medium' as TaskPriority, energy: 'low' as EnergyRequirement, duration: 15 },
      { title: 'Plan weekend hiking trip', category: 'personal' as TaskCategory, priority: 'low' as TaskPriority, energy: 'medium' as EnergyRequirement, duration: 30 },
      { title: 'Learn new design patterns', category: 'learning' as TaskCategory, priority: 'medium' as TaskPriority, energy: 'high' as EnergyRequirement, duration: 90 },
      { title: 'Organize team building event', category: 'social' as TaskCategory, priority: 'medium' as TaskPriority, energy: 'medium' as EnergyRequirement, duration: 45 },
      { title: 'File expense reports', category: 'administrative' as TaskCategory, priority: 'medium' as TaskPriority, energy: 'low' as EnergyRequirement, duration: 20 },
      { title: 'Morning meditation', category: 'health' as TaskCategory, priority: 'high' as TaskPriority, energy: 'low' as EnergyRequirement, duration: 15 },
      { title: 'Design new user interface', category: 'creative' as TaskCategory, priority: 'high' as TaskPriority, energy: 'high' as EnergyRequirement, duration: 180 }
    ];
    
    // Generate 8-12 tasks
    for (let i = 0; i < 10; i++) {
      const template = taskTemplates[Math.floor(Math.random() * taskTemplates.length)];
      const dueDate = Math.random() > 0.3 ? addDays(now, Math.floor(Math.random() * 14) + 1) : undefined;
      const status = this.getRandomStatus();
      
      const task: Task = {
        id: `${provider.id}-task-${i}`,
        title: template.title + (i > 0 ? ` (${i + 1})` : ''),
        description: `${template.title} from ${provider.name} workspace`,
        dueDate,
        priority: template.priority,
        estimatedDuration: template.duration,
        energyRequirement: template.energy,
        category: template.category,
        status,
        source: provider,
        energyOptimalTime: this.calculateOptimalTime(template.energy, template.duration),
        completedAt: status === 'completed' ? addDays(now, -Math.floor(Math.random() * 7)) : undefined
      };
      
      tasks.push(task);
    }
    
    return tasks;
  }

  private getRandomStatus(): TaskStatus {
    const statuses: TaskStatus[] = ['todo', 'in-progress', 'completed', 'todo', 'todo']; // Weighted towards todo
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  private calculateOptimalTime(energyRequirement: EnergyRequirement, duration: number): TimeSlot {
    const tomorrow = addDays(new Date(), 1);
    
    // Optimal times based on energy requirement
    const optimalHours = {
      'low': [9, 13, 16], // After meals, low energy periods
      'medium': [10, 14, 15], // Moderate energy periods
      'high': [9, 10, 14], // Peak energy periods
      'variable': [11, 15, 16] // Flexible periods
    };
    
    const hours = optimalHours[energyRequirement] || [10, 14, 16];
    const selectedHour = hours[Math.floor(Math.random() * hours.length)];
    
    const startTime = new Date(tomorrow);
    startTime.setHours(selectedHour, 0, 0, 0);
    
    return {
      start: startTime,
      end: addMinutes(startTime, duration),
      energyLevel: this.predictEnergyLevel(startTime),
      availability: 'free',
      conflictRisk: 0.1
    };
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

  getTasks(status?: TaskStatus, category?: TaskCategory): Task[] {
    let filteredTasks = [...this.tasks];
    
    if (status) {
      filteredTasks = filteredTasks.filter(task => task.status === status);
    }
    
    if (category) {
      filteredTasks = filteredTasks.filter(task => task.category === category);
    }
    
    return filteredTasks.sort((a, b) => {
      // Sort by priority, then by due date
      const priorityOrder = { 'urgent': 4, 'high': 3, 'medium': 2, 'low': 1 };
      const aPriority = priorityOrder[a.priority];
      const bPriority = priorityOrder[b.priority];
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      // Then by due date
      if (a.dueDate && b.dueDate) {
        return a.dueDate.getTime() - b.dueDate.getTime();
      }
      
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      
      return 0;
    });
  }

  // Smart Task Scheduling
  async scheduleTask(taskId: string): Promise<SmartSchedulingResult> {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) {
      return {
        success: false,
        suggestedSlots: [],
        conflicts: [],
        energyScore: 0,
        optimizationApplied: false,
        reasoning: 'Task not found',
        alternatives: []
      };
    }

    // Create scheduling request
    const request: SmartSchedulingRequest = {
      type: 'task',
      title: task.title,
      duration: task.estimatedDuration,
      energyRequirement: task.energyRequirement,
      constraints: [],
      preferences: {
        preferredTimes: [],
        avoidTimes: [],
        energyOptimization: true,
        bufferTime: 5,
        allowRescheduling: true,
        notificationPreference: 'immediate'
      },
      deadline: task.dueDate,
      priority: task.priority
    };

    return this.findOptimalTaskSlot(request, task);
  }

  private async findOptimalTaskSlot(request: SmartSchedulingRequest, task: Task): Promise<SmartSchedulingResult> {
    const availableSlots = this.findAvailableTaskSlots(request.duration, request.deadline);
    const energyOptimizedSlots = this.optimizeTaskForEnergy(availableSlots, request.energyRequirement);
    
    if (energyOptimizedSlots.length === 0) {
      return {
        success: false,
        suggestedSlots: [],
        conflicts: [],
        energyScore: 0,
        optimizationApplied: false,
        reasoning: 'No suitable time slots available for this task',
        alternatives: []
      };
    }

    const bestSlot = energyOptimizedSlots[0];
    
    // Update task with optimal time
    task.energyOptimalTime = bestSlot;
    
    return {
      success: true,
      suggestedSlots: energyOptimizedSlots.slice(0, 3),
      selectedSlot: bestSlot,
      conflicts: [],
      energyScore: bestSlot.energyLevel,
      optimizationApplied: true,
      reasoning: this.generateTaskSchedulingReasoning(bestSlot, task),
      alternatives: energyOptimizedSlots.slice(1, 5)
    };
  }

  private findAvailableTaskSlots(duration: number, deadline?: Date): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const now = new Date();
    const searchEnd = deadline || addDays(now, 7); // 1 week default
    
    // Generate time slots during working hours
    for (let day = 0; day < 7; day++) {
      const date = addDays(now, day);
      if (date.getDay() === 0 || date.getDay() === 6) continue; // Skip weekends
      
      // Working hours: 9 AM - 6 PM
      for (let hour = 9; hour < 18; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const slotStart = new Date(date);
          slotStart.setHours(hour, minute, 0, 0);
          
          if (slotStart <= now) continue;
          if (slotStart > searchEnd) break;
          
          const slotEnd = addMinutes(slotStart, duration);
          if (slotEnd.getHours() >= 18) continue; // Don't go past work hours
          
          slots.push({
            start: slotStart,
            end: slotEnd,
            energyLevel: this.predictEnergyLevel(slotStart),
            availability: 'free',
            conflictRisk: 0.1
          });
        }
      }
    }
    
    return slots;
  }

  private optimizeTaskForEnergy(slots: TimeSlot[], energyRequirement: EnergyRequirement): TimeSlot[] {
    const energyThresholds = {
      'low': 4,
      'medium': 6,
      'high': 8,
      'variable': 5
    };
    
    const threshold = energyThresholds[energyRequirement] || 5;
    
    return slots
      .filter(slot => slot.energyLevel >= threshold)
      .sort((a, b) => b.energyLevel - a.energyLevel);
  }

  private generateTaskSchedulingReasoning(slot: TimeSlot, task: Task): string {
    const hour = slot.start.getHours();
    const energyLevel = slot.energyLevel;
    
    let reasoning = `Scheduled "${task.title}" for ${format(slot.start, 'MMM dd, HH:mm')} `;
    
    if (energyLevel >= 8) {
      reasoning += 'during peak energy hours';
    } else if (energyLevel >= 6) {
      reasoning += 'during good energy hours';
    } else {
      reasoning += 'during available time';
    }
    
    if (task.energyRequirement === 'high' && energyLevel >= 8) {
      reasoning += '. Perfect match for high-energy task requiring deep focus.';
    } else if (task.energyRequirement === 'low') {
      reasoning += '. Suitable for routine task requiring minimal energy.';
    } else if (task.category === 'creative') {
      reasoning += '. Good time for creative work when mind is fresh.';
    }
    
    if (task.dueDate) {
      const daysUntilDue = Math.ceil((task.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntilDue <= 2) {
        reasoning += ` Scheduled with urgency due to ${daysUntilDue} day(s) until deadline.`;
      }
    }
    
    return reasoning;
  }

  // Task Completion Analysis
  async analyzeTaskCompletion(): Promise<TaskCompletionStats> {
    const completedTasks = this.tasks.filter(t => t.status === 'completed');
    const totalTasks = this.tasks.length;
    
    const completionRate = totalTasks > 0 ? completedTasks.length / totalTasks : 0;
    
    const averageTaskDuration = completedTasks.length > 0
      ? completedTasks.reduce((sum, task) => sum + task.estimatedDuration, 0) / completedTasks.length
      : 0;
    
    // Analyze completion times to find optimal hours
    const completionHours: { [hour: number]: number } = {};
    completedTasks.forEach(task => {
      if (task.completedAt) {
        const hour = task.completedAt.getHours();
        completionHours[hour] = (completionHours[hour] || 0) + 1;
      }
    });
    
    const optimalTaskTimes = Object.entries(completionHours)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => `${hour.padStart(2, '0')}:00`);
    
    // Analyze procrastination patterns
    const procrastinationPattern = this.analyzeProcrastinationPattern();
    
    return {
      completionRate,
      averageTaskDuration,
      energyEfficiency: completionRate * 10, // Simple efficiency metric
      optimalTaskTimes,
      procrastinationPattern
    };
  }

  private analyzeProcrastinationPattern(): ProcrastinationPattern {
    const overdueTasks = this.tasks.filter(task => 
      task.dueDate && task.dueDate < new Date() && task.status !== 'completed'
    );
    
    const frequentDelayTimes = ['14:00', '16:00', '17:00']; // Common procrastination times
    
    return {
      frequentDelayTimes,
      energyCorrelation: -0.3, // Negative correlation: lower energy = more delays
      commonReasons: [
        'Task scheduled during low-energy periods',
        'Insufficient time blocks allocated',
        'High-energy tasks scheduled at wrong times',
        'Missing breaks between intensive tasks'
      ],
      improvementSuggestions: [
        'Schedule high-energy tasks during morning peak hours',
        'Break large tasks into smaller, manageable chunks',
        'Add buffer time between tasks',
        'Align task energy requirements with personal energy patterns'
      ]
    };
  }

  // Task Optimization
  async generateTaskOptimizations(): Promise<ScheduleOptimization[]> {
    const optimizations: ScheduleOptimization[] = [];
    const incompleteTasks = this.tasks.filter(t => t.status === 'todo' || t.status === 'in-progress');
    
    // Find high-energy tasks scheduled at suboptimal times
    incompleteTasks.forEach(task => {
      if (task.energyOptimalTime && task.energyRequirement === 'high') {
        const currentEnergyLevel = task.energyOptimalTime.energyLevel;
        
        if (currentEnergyLevel < 7) {
          // Suggest rescheduling to peak energy time
          const betterSlots = this.findAvailableTaskSlots(task.estimatedDuration)
            .filter(slot => slot.energyLevel >= 8);
          
          if (betterSlots.length > 0) {
            optimizations.push({
              id: `reschedule-task-${task.id}`,
              type: 'task-reorder',
              priority: 'high',
              title: `Reschedule "${task.title}" to peak energy time`,
              description: `This ${task.energyRequirement}-energy task would perform better during peak hours. Moving it to ${format(betterSlots[0].start, 'HH:mm')} could improve focus and completion quality.`,
              currentSchedule: task.energyOptimalTime,
              suggestedSchedule: betterSlots[0],
              energyImprovement: betterSlots[0].energyLevel - currentEnergyLevel,
              reasoning: `${task.category} tasks requiring ${task.energyRequirement} energy perform best during peak energy periods`,
              conflictRisk: 0.1,
              implementationEffort: 'easy',
              expiresAt: addDays(new Date(), 1),
              source: 'ai-analysis'
            });
          }
        }
      }
    });
    
    // Suggest task batching for similar categories
    const tasksByCategory = incompleteTasks.reduce((acc, task) => {
      if (!acc[task.category]) acc[task.category] = [];
      acc[task.category].push(task);
      return acc;
    }, {} as { [category: string]: Task[] });
    
    Object.entries(tasksByCategory).forEach(([category, tasks]) => {
      if (tasks.length >= 3) {
        const totalDuration = tasks.reduce((sum, task) => sum + task.estimatedDuration, 0);
        
        if (totalDuration <= 180) { // 3 hours or less
          optimizations.push({
            id: `batch-${category}`,
            type: 'energy-block',
            priority: 'medium',
            title: `Batch ${category} tasks together`,
            description: `Group ${tasks.length} ${category} tasks into a focused work session to improve efficiency and reduce context switching.`,
            currentSchedule: {
              start: new Date(),
              end: addMinutes(new Date(), totalDuration),
              energyLevel: 5,
              availability: 'free',
              conflictRisk: 0.2
            },
            suggestedSchedule: {
              start: addDays(new Date(), 1),
              end: addMinutes(addDays(new Date(), 1), totalDuration),
              energyLevel: 7,
              availability: 'free',
              conflictRisk: 0.1
            },
            energyImprovement: 2,
            reasoning: `Batching similar tasks reduces mental overhead and improves focus`,
            conflictRisk: 0.1,
            implementationEffort: 'moderate',
            expiresAt: addDays(new Date(), 3),
            source: 'ai-analysis'
          });
        }
      }
    });
    
    return optimizations;
  }

  // Task Actions
  async markTaskCompleted(taskId: string): Promise<boolean> {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = 'completed';
      task.completedAt = new Date();
      this.saveToStorage();
      return true;
    }
    return false;
  }

  async updateTaskStatus(taskId: string, status: TaskStatus): Promise<boolean> {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = status;
      if (status === 'completed') {
        task.completedAt = new Date();
      }
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // Storage
  private saveToStorage(): void {
    const data = {
      providers: this.providers,
      tasks: this.tasks.map(task => ({
        ...task,
        dueDate: task.dueDate?.toISOString(),
        completedAt: task.completedAt?.toISOString(),
        energyOptimalTime: task.energyOptimalTime ? {
          ...task.energyOptimalTime,
          start: task.energyOptimalTime.start.toISOString(),
          end: task.energyOptimalTime.end.toISOString()
        } : undefined
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
    
    localStorage.setItem('productivityIntegration', JSON.stringify(data));
  }

  loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('productivityIntegration');
      if (stored) {
        const data = JSON.parse(stored);
        
        this.providers = data.providers || [];
        this.tasks = (data.tasks || []).map((task: any) => ({
          ...task,
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
          completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
          energyOptimalTime: task.energyOptimalTime ? {
            ...task.energyOptimalTime,
            start: new Date(task.energyOptimalTime.start),
            end: new Date(task.energyOptimalTime.end)
          } : undefined
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
      console.error('Failed to load productivity integration data:', error);
    }
  }

  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }
}

// Export singleton instance
export const productivityService = ProductivityIntegrationService.getInstance();
