// Calendar and Productivity Integration Types

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  attendees?: string[];
  meetingType: 'in-person' | 'video' | 'phone' | 'hybrid';
  energyCost: number; // 1-10 scale
  isRecurring: boolean;
  source: CalendarProvider;
  energyOptimized?: boolean;
  originalStartTime?: Date; // For rescheduling tracking
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  priority: TaskPriority;
  estimatedDuration: number; // minutes
  energyRequirement: EnergyRequirement;
  category: TaskCategory;
  status: TaskStatus;
  source: ProductivityProvider;
  dependencies?: string[];
  energyOptimalTime?: TimeSlot;
  completedAt?: Date;
}

export interface TimeSlot {
  start: Date;
  end: Date;
  energyLevel: number; // 1-10 predicted energy level
  availability: 'free' | 'busy' | 'tentative';
  conflictRisk: number; // 0-1 probability of conflict
}

export interface CalendarProvider {
  id: string;
  name: 'google' | 'outlook' | 'apple' | 'other';
  isConnected: boolean;
  lastSync?: Date;
  accessToken?: string;
  refreshToken?: string;
  syncEnabled: boolean;
}

export interface ProductivityProvider {
  id: string;
  name: 'notion' | 'todoist' | 'microsoft-todo' | 'asana' | 'trello' | 'other';
  isConnected: boolean;
  lastSync?: Date;
  accessToken?: string;
  refreshToken?: string;
  syncEnabled: boolean;
  workspaceId?: string;
}

export interface IntegrationSettings {
  autoSync: boolean;
  syncInterval: number; // minutes
  energyOptimization: boolean;
  smartRescheduling: boolean;
  meetingEnergyAnalysis: boolean;
  taskPrioritization: boolean;
  notifications: IntegrationNotificationSettings;
  workingHours: WorkingHours;
  energyPreferences: EnergyPreferences;
}

export interface IntegrationNotificationSettings {
  syncUpdates: boolean;
  optimizationSuggestions: boolean;
  energyWarnings: boolean;
  scheduleConflicts: boolean;
  taskReminders: boolean;
}

export interface WorkingHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  enabled: boolean;
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
  breaks: BreakSlot[];
  energyPeaks: string[]; // Times when energy is typically highest
}

export interface BreakSlot {
  startTime: string;
  endTime: string;
  type: 'lunch' | 'coffee' | 'rest' | 'meeting-break';
}

export interface EnergyPreferences {
  morningPersonType: 'early-bird' | 'night-owl' | 'balanced';
  optimalMeetingDuration: number; // minutes
  maxMeetingsPerDay: number;
  preferredBreakDuration: number; // minutes
  energyRecoveryTime: number; // minutes needed between high-energy tasks
  focusBlocks: FocusBlock[];
}

export interface FocusBlock {
  name: string;
  duration: number; // minutes
  energyType: 'physical' | 'mental' | 'creative' | 'social';
  preferredTime: string; // HH:mm format
  recurring: boolean;
}

export interface ScheduleOptimization {
  id: string;
  type: 'meeting-reschedule' | 'task-reorder' | 'break-suggestion' | 'energy-block';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  currentSchedule: TimeSlot;
  suggestedSchedule: TimeSlot;
  energyImprovement: number; // Expected energy improvement (0-10)
  reasoning: string;
  conflictRisk: number; // 0-1
  implementationEffort: 'easy' | 'moderate' | 'complex';
  expiresAt: Date;
  source: 'calendar' | 'tasks' | 'energy-pattern' | 'ai-analysis';
}

export interface IntegrationAnalytics {
  totalEvents: number;
  totalTasks: number;
  averageEnergyUtilization: number; // 0-1
  optimizationsImplemented: number;
  energyImprovementScore: number; // 0-10
  scheduleEfficiency: number; // 0-1
  meetingEnergyStats: MeetingEnergyStats;
  taskCompletionStats: TaskCompletionStats;
  weeklyTrends: WeeklyTrend[];
}

export interface MeetingEnergyStats {
  averageEnergyCost: number;
  totalMeetingTime: number; // minutes per week
  energyDrainRate: number; // energy lost per hour of meetings
  optimalMeetingTimes: string[]; // HH:mm times
  worstMeetingTimes: string[];
  energyRecoveryNeeded: number; // minutes
}

export interface TaskCompletionStats {
  completionRate: number; // 0-1
  averageTaskDuration: number; // minutes
  energyEfficiency: number; // tasks completed per energy unit
  optimalTaskTimes: string[];
  procrastinationPattern: ProcrastinationPattern;
}

export interface ProcrastinationPattern {
  frequentDelayTimes: string[]; // Times when tasks are often delayed
  energyCorrelation: number; // -1 to 1, correlation between energy and delays
  commonReasons: string[];
  improvementSuggestions: string[];
}

export interface WeeklyTrend {
  week: string; // ISO week string
  energyUtilization: number;
  scheduleOptimization: number;
  taskCompletion: number;
  meetingEfficiency: number;
  overallScore: number;
}

export interface SyncStatus {
  isActive: boolean;
  lastSync: Date;
  nextSync: Date;
  errors: SyncError[];
  successfulSyncs: number;
  failedSyncs: number;
  dataQuality: number; // 0-1 score
}

export interface SyncError {
  timestamp: Date;
  provider: string;
  error: string;
  severity: 'warning' | 'error' | 'critical';
  resolved: boolean;
  resolution?: string;
}

// Enums and Union Types
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in-progress' | 'completed' | 'cancelled' | 'blocked';
export type TaskCategory = 'work' | 'personal' | 'health' | 'social' | 'learning' | 'creative' | 'administrative';
export type EnergyRequirement = 'low' | 'medium' | 'high' | 'variable';

// Integration Events
export interface IntegrationEvent {
  id: string;
  type: IntegrationEventType;
  timestamp: Date;
  source: string;
  data: any;
  processed: boolean;
  result?: IntegrationEventResult;
}

export type IntegrationEventType = 
  | 'calendar-sync'
  | 'task-sync'
  | 'optimization-generated'
  | 'schedule-updated'
  | 'energy-analysis'
  | 'conflict-detected'
  | 'provider-connected'
  | 'provider-disconnected'
  | 'sync-error'
  | 'user-action';

export interface IntegrationEventResult {
  success: boolean;
  message: string;
  changes?: ScheduleChange[];
  optimizations?: ScheduleOptimization[];
  errors?: string[];
}

export interface ScheduleChange {
  type: 'event-created' | 'event-updated' | 'event-deleted' | 'task-created' | 'task-updated' | 'task-completed';
  itemId: string;
  itemType: 'event' | 'task';
  oldValue?: any;
  newValue?: any;
  energyImpact: number; // -10 to +10
  timestamp: Date;
}

// Smart Scheduling Types
export interface SmartSchedulingRequest {
  type: 'meeting' | 'task' | 'focus-block' | 'break';
  title: string;
  duration: number; // minutes
  energyRequirement: EnergyRequirement;
  participants?: string[];
  constraints: SchedulingConstraint[];
  preferences: SchedulingPreferences;
  deadline?: Date;
  priority: TaskPriority;
}

export interface SchedulingConstraint {
  type: 'time-range' | 'attendee-availability' | 'resource-requirement' | 'energy-level' | 'buffer-time';
  value: any;
  weight: number; // 0-1, how important this constraint is
  flexible: boolean;
}

export interface SchedulingPreferences {
  preferredTimes: string[]; // HH:mm format
  avoidTimes: string[];
  energyOptimization: boolean;
  bufferTime: number; // minutes before/after
  allowRescheduling: boolean;
  notificationPreference: 'immediate' | 'batch' | 'none';
}

export interface SmartSchedulingResult {
  success: boolean;
  suggestedSlots: TimeSlot[];
  selectedSlot?: TimeSlot;
  conflicts: ScheduleConflict[];
  energyScore: number; // 0-10
  optimizationApplied: boolean;
  reasoning: string;
  alternatives: TimeSlot[];
}

export interface ScheduleConflict {
  type: 'time-overlap' | 'energy-drain' | 'commute-time' | 'preference-violation' | 'resource-conflict';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedItems: string[];
  suggestedResolution: string;
  autoResolvable: boolean;
}
