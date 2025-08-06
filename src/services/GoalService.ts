// Goal Management Service - Handle goal creation, tracking, and analytics
import { EnergyGoal, GoalType, GoalMetric, GoalStatus, GoalProgress, GoalStats, GoalCalculation, GoalSuggestion, GoalMilestone } from '../types/goals';
import { EnergyLevel, EnergyType } from '../types/energy';
import { format, startOfDay, endOfDay, subDays, differenceInDays, addDays, isAfter, isBefore } from 'date-fns';

export class GoalService {
  private static readonly STORAGE_KEY = 'energy-goals';
  private static readonly PROGRESS_KEY = 'goal-progress';

  // Save goals to localStorage
  static saveGoals(goals: EnergyGoal[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(goals));
    } catch (error) {
      console.error('Failed to save goals:', error);
    }
  }

  // Load goals from localStorage
  static loadGoals(): EnergyGoal[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return [];
      
      const goals = JSON.parse(data);
      return goals.map((goal: any) => ({
        ...goal,
        createdAt: new Date(goal.createdAt),
        startDate: new Date(goal.startDate),
        endDate: new Date(goal.endDate),
        completedAt: goal.completedAt ? new Date(goal.completedAt) : undefined,
        milestones: goal.milestones?.map((m: any) => ({
          ...m,
          reachedAt: m.reachedAt ? new Date(m.reachedAt) : undefined
        })) || []
      }));
    } catch (error) {
      console.error('Failed to load goals:', error);
      return [];
    }
  }

  // Create a new goal
  static createGoal(goalData: Omit<EnergyGoal, 'id' | 'createdAt' | 'currentValue' | 'progress' | 'streak' | 'milestones'>): EnergyGoal {
    const now = new Date();
    const goal: EnergyGoal = {
      id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      currentValue: 0,
      progress: 0,
      streak: 0,
      milestones: this.generateMilestones(goalData.targetValue),
      ...goalData
    };

    const goals = this.loadGoals();
    goals.push(goal);
    this.saveGoals(goals);
    
    return goal;
  }

  // Generate automatic milestones for a goal
  private static generateMilestones(targetValue: number): GoalMilestone[] {
    const milestones: GoalMilestone[] = [];
    const milestonePercentages = [25, 50, 75, 90, 100];
    
    milestonePercentages.forEach((percentage, index) => {
      milestones.push({
        id: `milestone_${Date.now()}_${index}`,
        title: percentage === 100 ? 'Goal Complete!' : `${percentage}% Progress`,
        targetProgress: percentage,
        reached: false,
        reward: this.getMilestoneReward(percentage)
      });
    });
    
    return milestones;
  }

  private static getMilestoneReward(percentage: number): string {
    const rewards = {
      25: 'Great start! 🌟',
      50: 'Halfway there! 🚀',
      75: 'Almost done! 💪',
      90: 'Final push! 🏃‍♂️',
      100: 'Goal achieved! 🎉🏆'
    };
    return rewards[percentage as keyof typeof rewards] || 'Keep going! 💫';
  }

  // Update goal progress
  static updateGoalProgress(goalId: string, energyData: EnergyLevel[]): EnergyGoal | null {
    const goals = this.loadGoals();
    const goalIndex = goals.findIndex(g => g.id === goalId);
    
    if (goalIndex === -1) return null;
    
    const goal = goals[goalIndex];
    const calculation = this.calculateGoalProgress(goal, energyData);
    
    // Update goal with new progress
    goal.currentValue = calculation.currentValue;
    goal.progress = Math.min(100, (calculation.currentValue / goal.targetValue) * 100);
    goal.streak = calculation.streak;
    
    // Check for milestone completion
    goal.milestones.forEach(milestone => {
      if (!milestone.reached && goal.progress >= milestone.targetProgress) {
        milestone.reached = true;
        milestone.reachedAt = new Date();
      }
    });
    
    // Check if goal is completed
    if (goal.progress >= 100 && goal.status === 'active') {
      goal.status = 'completed';
      goal.completedAt = new Date();
    }
    
    goals[goalIndex] = goal;
    this.saveGoals(goals);
    
    return goal;
  }

  // Calculate goal progress based on energy data
  private static calculateGoalProgress(goal: EnergyGoal, energyData: EnergyLevel[]): {
    currentValue: number;
    streak: number;
  } {
    const now = new Date();
    const startDate = startOfDay(goal.startDate);
    const endDate = goal.status === 'completed' ? goal.endDate : endOfDay(now);
    
    // Filter energy data within goal timeframe
    const relevantData = energyData.filter(entry => {
      const entryDate = entry.timestamp;
      return entryDate >= startDate && entryDate <= endDate;
    });

    let currentValue = 0;
    let streak = 0;

    if (relevantData.length === 0) {
      return { currentValue: 0, streak: 0 };
    }

    // Calculate based on goal metric
    switch (goal.metric) {
      case 'average':
        currentValue = this.calculateAverage(relevantData, goal.energyType);
        break;
      case 'minimum':
        currentValue = this.calculateMinimum(relevantData, goal.energyType);
        break;
      case 'maximum':
        currentValue = this.calculateMaximum(relevantData, goal.energyType);
        break;
      case 'consistency':
        currentValue = this.calculateConsistency(relevantData, goal.energyType, goal.targetValue);
        break;
    }

    // Calculate streak
    streak = this.calculateStreak(relevantData, goal);

    return { currentValue, streak };
  }

  private static calculateAverage(data: EnergyLevel[], energyType: EnergyType | 'overall'): number {
    if (data.length === 0) return 0;
    
    const values = data.map(entry => {
      return energyType === 'overall' ? entry.overall : entry[energyType];
    });
    
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  private static calculateMinimum(data: EnergyLevel[], energyType: EnergyType | 'overall'): number {
    if (data.length === 0) return 0;
    
    const values = data.map(entry => {
      return energyType === 'overall' ? entry.overall : entry[energyType];
    });
    
    return Math.min(...values);
  }

  private static calculateMaximum(data: EnergyLevel[], energyType: EnergyType | 'overall'): number {
    if (data.length === 0) return 0;
    
    const values = data.map(entry => {
      return energyType === 'overall' ? entry.overall : entry[energyType];
    });
    
    return Math.max(...values);
  }

  private static calculateConsistency(data: EnergyLevel[], energyType: EnergyType | 'overall', target: number): number {
    if (data.length === 0) return 0;
    
    const values = data.map(entry => {
      return energyType === 'overall' ? entry.overall : entry[energyType];
    });
    
    const daysAboveTarget = values.filter(value => value >= target).length;
    return (daysAboveTarget / values.length) * 100;
  }

  private static calculateStreak(data: EnergyLevel[], goal: EnergyGoal): number {
    if (data.length === 0) return 0;

    // Group data by day
    const dailyData = new Map<string, EnergyLevel[]>();
    data.forEach(entry => {
      const dayKey = format(entry.timestamp, 'yyyy-MM-dd');
      if (!dailyData.has(dayKey)) {
        dailyData.set(dayKey, []);
      }
      dailyData.get(dayKey)!.push(entry);
    });

    let streak = 0;
    const today = new Date();
    
    // Check backwards from today
    for (let i = 0; i < 365; i++) { // Max 365 days streak
      const checkDate = subDays(today, i);
      const dayKey = format(checkDate, 'yyyy-MM-dd');
      const dayData = dailyData.get(dayKey);
      
      if (!dayData || dayData.length === 0) {
        break;
      }
      
      const dayValue = this.calculateDayValue(dayData, goal.energyType, goal.metric);
      const targetMet = this.checkTargetMet(dayValue, goal.targetValue, goal.metric);
      
      if (targetMet) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  private static calculateDayValue(dayData: EnergyLevel[], energyType: EnergyType | 'overall', metric: GoalMetric): number {
    switch (metric) {
      case 'average':
        return this.calculateAverage(dayData, energyType);
      case 'minimum':
        return this.calculateMinimum(dayData, energyType);
      case 'maximum':
        return this.calculateMaximum(dayData, energyType);
      case 'consistency':
        return dayData.length > 0 ? 100 : 0; // Simple consistency check
      default:
        return 0;
    }
  }

  private static checkTargetMet(value: number, target: number, metric: GoalMetric): boolean {
    switch (metric) {
      case 'minimum':
        return value >= target;
      case 'maximum':
      case 'average':
        return value >= target;
      case 'consistency':
        return value >= target;
      default:
        return false;
    }
  }

  // Get goal statistics
  static getGoalStats(): GoalStats {
    const goals = this.loadGoals();
    const now = new Date();
    
    const totalGoals = goals.length;
    const activeGoals = goals.filter(g => g.status === 'active').length;
    const completedGoals = goals.filter(g => g.status === 'completed').length;
    const completionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;
    
    const streaks = goals.map(g => g.streak);
    const averageStreakLength = streaks.length > 0 ? streaks.reduce((sum, s) => sum + s, 0) / streaks.length : 0;
    const longestStreak = streaks.length > 0 ? Math.max(...streaks) : 0;
    const currentStreak = goals.filter(g => g.status === 'active').reduce((max, g) => Math.max(max, g.streak), 0);
    
    // Find most improved energy type
    const energyTypeProgress = new Map<string, number>();
    goals.forEach(goal => {
      if (goal.status === 'completed') {
        const current = energyTypeProgress.get(goal.energyType) || 0;
        energyTypeProgress.set(goal.energyType, current + 1);
      }
    });
    
    let mostImprovedEnergyType: EnergyType | 'overall' = 'overall';
    let maxProgress = 0;
    energyTypeProgress.forEach((progress, type) => {
      if (progress > maxProgress) {
        maxProgress = progress;
        mostImprovedEnergyType = type as EnergyType | 'overall';
      }
    });
    
    const oneWeekAgo = subDays(now, 7);
    const oneMonthAgo = subDays(now, 30);
    
    const goalsCompletedThisWeek = goals.filter(g => 
      g.status === 'completed' && g.completedAt && g.completedAt >= oneWeekAgo
    ).length;
    
    const goalsCompletedThisMonth = goals.filter(g => 
      g.status === 'completed' && g.completedAt && g.completedAt >= oneMonthAgo
    ).length;
    
    return {
      totalGoals,
      activeGoals,
      completedGoals,
      completionRate,
      averageStreakLength,
      longestStreak,
      currentStreak,
      mostImprovedEnergyType,
      goalsCompletedThisWeek,
      goalsCompletedThisMonth
    };
  }

  // Generate goal suggestions based on user's energy patterns
  static generateGoalSuggestions(energyData: EnergyLevel[]): GoalSuggestion[] {
    if (energyData.length < 7) return []; // Need at least a week of data
    
    const suggestions: GoalSuggestion[] = [];
    const recentData = energyData.slice(-30); // Last 30 days
    
    // Analyze patterns for each energy type
    const energyTypes: (EnergyType | 'overall')[] = ['physical', 'mental', 'emotional', 'creative', 'overall'];
    
    energyTypes.forEach(energyType => {
      const avgValue = this.calculateAverage(recentData, energyType);
      const minValue = this.calculateMinimum(recentData, energyType);
      
      // Suggest improvement goals based on current performance
      if (avgValue < 60) {
        suggestions.push({
          id: `suggestion_${energyType}_improve`,
          title: `Improve ${energyType === 'overall' ? 'Overall' : energyType.charAt(0).toUpperCase() + energyType.slice(1)} Energy`,
          description: `Your average ${energyType} energy is ${avgValue.toFixed(1)}. Let's work on raising it!`,
          energyType,
          metric: 'average',
          suggestedTarget: Math.min(100, avgValue + 15),
          reasoning: 'Based on your recent energy levels, this is an achievable improvement target.',
          difficulty: avgValue < 40 ? 'medium' : 'easy',
          estimatedDuration: '2-4 weeks'
        });
      }
      
      // Suggest consistency goals if there's high variance
      const variance = this.calculateVariance(recentData, energyType);
      if (variance > 300) { // High variance
        suggestions.push({
          id: `suggestion_${energyType}_consistency`,
          title: `Maintain Consistent ${energyType === 'overall' ? 'Overall' : energyType.charAt(0).toUpperCase() + energyType.slice(1)} Energy`,
          description: `Your ${energyType} energy varies quite a bit. Let's work on consistency!`,
          energyType,
          metric: 'consistency',
          suggestedTarget: 70,
          reasoning: 'Consistent energy levels lead to better overall wellbeing and performance.',
          difficulty: 'medium',
          estimatedDuration: '3-6 weeks'
        });
      }
      
      // Suggest minimum threshold goals if experiencing low points
      if (minValue < 30) {
        suggestions.push({
          id: `suggestion_${energyType}_minimum`,
          title: `Raise ${energyType === 'overall' ? 'Overall' : energyType.charAt(0).toUpperCase() + energyType.slice(1)} Energy Floor`,
          description: `Your lowest ${energyType} energy was ${minValue.toFixed(1)}. Let's prevent those dips!`,
          energyType,
          metric: 'minimum',
          suggestedTarget: 40,
          reasoning: 'Avoiding energy crashes is crucial for maintaining productivity and wellbeing.',
          difficulty: 'hard',
          estimatedDuration: '4-8 weeks'
        });
      }
    });
    
    return suggestions.slice(0, 5); // Return top 5 suggestions
  }

  private static calculateVariance(data: EnergyLevel[], energyType: EnergyType | 'overall'): number {
    const avg = this.calculateAverage(data, energyType);
    const values = data.map(entry => energyType === 'overall' ? entry.overall : entry[energyType]);
    const squaredDiffs = values.map(value => Math.pow(value - avg, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / squaredDiffs.length;
  }

  // Delete a goal
  static deleteGoal(goalId: string): boolean {
    const goals = this.loadGoals();
    const filteredGoals = goals.filter(g => g.id !== goalId);
    
    if (filteredGoals.length === goals.length) {
      return false; // Goal not found
    }
    
    this.saveGoals(filteredGoals);
    return true;
  }

  // Update goal status
  static updateGoalStatus(goalId: string, status: GoalStatus): EnergyGoal | null {
    const goals = this.loadGoals();
    const goalIndex = goals.findIndex(g => g.id === goalId);
    
    if (goalIndex === -1) return null;
    
    goals[goalIndex].status = status;
    if (status === 'completed') {
      goals[goalIndex].completedAt = new Date();
    }
    
    this.saveGoals(goals);
    return goals[goalIndex];
  }
}
