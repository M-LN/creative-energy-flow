// Goal management types for energy tracking
import { EnergyType } from './energy';

export type GoalType = 'daily' | 'weekly' | 'monthly';
export type GoalMetric = 'average' | 'minimum' | 'maximum' | 'consistency';
export type GoalStatus = 'active' | 'completed' | 'paused' | 'archived';

export interface EnergyGoal {
  id: string;
  title: string;
  description?: string;
  energyType: EnergyType | 'overall';
  metric: GoalMetric;
  targetValue: number;
  currentValue: number;
  goalType: GoalType;
  status: GoalStatus;
  createdAt: Date;
  startDate: Date;
  endDate: Date;
  completedAt?: Date;
  progress: number; // 0-100 percentage
  streak: number; // Days of consecutive progress
  milestones: GoalMilestone[];
  reminders: GoalReminder[];
}

export interface GoalMilestone {
  id: string;
  title: string;
  targetProgress: number; // 0-100 percentage
  reached: boolean;
  reachedAt?: Date;
  reward?: string;
}

export interface GoalReminder {
  id: string;
  time: string; // HH:MM format
  days: number[]; // 0-6 (Sunday-Saturday)
  enabled: boolean;
  message: string;
}

export interface GoalProgress {
  date: Date;
  value: number;
  achieved: boolean;
  notes?: string;
}

export interface GoalSuggestion {
  id: string;
  title: string;
  description: string;
  energyType: EnergyType | 'overall';
  metric: GoalMetric;
  suggestedTarget: number;
  reasoning: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedDuration: string;
}

export interface GoalStats {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  completionRate: number;
  averageStreakLength: number;
  longestStreak: number;
  currentStreak: number;
  mostImprovedEnergyType: EnergyType | 'overall';
  goalsCompletedThisWeek: number;
  goalsCompletedThisMonth: number;
}

// Goal calculation helpers
export interface GoalCalculation {
  isOnTrack: boolean;
  daysRemaining: number;
  requiredDailyProgress: number;
  projectedCompletion: Date;
  confidenceScore: number; // 0-100
}
