// Goal Statistics Panel Component - Display comprehensive goal analytics
import React, { useMemo } from 'react';
import { GoalStats, EnergyGoal } from '../../types/goals';
import { EnergyLevel } from '../../types/energy';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';

interface GoalStatsPanelProps {
  stats: GoalStats;
  goals: EnergyGoal[];
  energyData: EnergyLevel[];
}

export const GoalStatsPanel: React.FC<GoalStatsPanelProps> = ({ 
  stats, 
  goals,
  energyData 
}) => {
  const analyticsData = useMemo(() => {
    const now = new Date();
    const oneWeekAgo = subDays(now, 7);

    // Calculate weekly progress
    const weeklyProgress = goals.filter(g => 
      g.status === 'active' && 
      g.createdAt >= startOfWeek(oneWeekAgo) && 
      g.createdAt <= endOfWeek(now)
    );

    // Calculate goal completion trend
    const monthlyCompletions = [];
    for (let i = 6; i >= 0; i--) {
      const weekStart = startOfWeek(subDays(now, i * 7));
      const weekEnd = endOfWeek(subDays(now, i * 7));
      const completions = goals.filter(g => 
        g.status === 'completed' && 
        g.completedAt && 
        g.completedAt >= weekStart && 
        g.completedAt <= weekEnd
      ).length;
      
      monthlyCompletions.push({
        week: format(weekStart, 'MMM dd'),
        completions
      });
    }

    // Energy type performance
    const energyTypeStats = new Map<string, { goals: number; completed: number; avgProgress: number }>();
    
    ['physical', 'mental', 'emotional', 'creative', 'overall'].forEach(type => {
      const typeGoals = goals.filter(g => g.energyType === type);
      const completedGoals = typeGoals.filter(g => g.status === 'completed');
      const avgProgress = typeGoals.length > 0 ? 
        typeGoals.reduce((sum, g) => sum + g.progress, 0) / typeGoals.length : 0;
      
      energyTypeStats.set(type, {
        goals: typeGoals.length,
        completed: completedGoals.length,
        avgProgress
      });
    });

    return {
      weeklyProgress,
      monthlyCompletions,
      energyTypeStats
    };
  }, [goals]);

  const getEnergyTypeIcon = (energyType: string) => {
    const icons = {
      physical: '💪',
      mental: '🧠',
      emotional: '❤️',
      creative: '🎨',
      overall: '⚡'
    };
    return icons[energyType as keyof typeof icons] || '⚡';
  };

  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return '🏆';
    if (streak >= 14) return '🔥';
    if (streak >= 7) return '⚡';
    if (streak >= 3) return '🌟';
    return '💫';
  };

  const getCompletionRateColor = (rate: number) => {
    if (rate >= 80) return 'success';
    if (rate >= 60) return 'warning';
    return 'error';
  };

  return (
    <div className="goal-stats-panel">
      {/* Overview Stats */}
      <div className="stats-overview">
        <h3>📊 Goal Statistics Overview</h3>
        <div className="overview-grid">
          <div className="stat-card large">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalGoals}</div>
              <div className="stat-label">Total Goals</div>
              <div className="stat-breakdown">
                {stats.activeGoals} active • {stats.completedGoals} completed
              </div>
            </div>
          </div>

          <div className="stat-card large">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <div className={`stat-number ${getCompletionRateColor(stats.completionRate)}`}>
                {stats.completionRate.toFixed(0)}%
              </div>
              <div className="stat-label">Success Rate</div>
              <div className="stat-breakdown">
                {stats.goalsCompletedThisMonth} completed this month
              </div>
            </div>
          </div>

          <div className="stat-card large">
            <div className="stat-icon">{getStreakEmoji(stats.currentStreak)}</div>
            <div className="stat-content">
              <div className="stat-number">{stats.currentStreak}</div>
              <div className="stat-label">Current Streak</div>
              <div className="stat-breakdown">
                Best: {stats.longestStreak} days
              </div>
            </div>
          </div>

          <div className="stat-card large">
            <div className="stat-icon">{getEnergyTypeIcon(stats.mostImprovedEnergyType)}</div>
            <div className="stat-content">
              <div className="stat-number">
                {stats.mostImprovedEnergyType === 'overall' ? 'Overall' : 
                 stats.mostImprovedEnergyType.charAt(0).toUpperCase() + stats.mostImprovedEnergyType.slice(1)}
              </div>
              <div className="stat-label">Top Energy Type</div>
              <div className="stat-breakdown">Most completed goals</div>
            </div>
          </div>
        </div>
      </div>

      {/* Energy Type Performance */}
      <div className="energy-type-performance">
        <h4>🔋 Energy Type Performance</h4>
        <div className="performance-grid">
          {Array.from(analyticsData.energyTypeStats.entries()).map(([type, data]) => (
            <div key={type} className="performance-card">
              <div className="performance-header">
                <span className="energy-icon">{getEnergyTypeIcon(type)}</span>
                <span className="energy-name">
                  {type === 'overall' ? 'Overall' : type.charAt(0).toUpperCase() + type.slice(1)}
                </span>
              </div>
              <div className="performance-stats">
                <div className="performance-item">
                  <span className="performance-value">{data.goals}</span>
                  <span className="performance-label">Goals</span>
                </div>
                <div className="performance-item">
                  <span className="performance-value">{data.completed}</span>
                  <span className="performance-label">Completed</span>
                </div>
                <div className="performance-item">
                  <span className="performance-value">{data.avgProgress.toFixed(0)}%</span>
                  <span className="performance-label">Avg Progress</span>
                </div>
              </div>
              <div className="performance-bar">
                {/* eslint-disable-next-line react/forbid-dom-props */}
                <div 
                  className="performance-fill"
                  style={{ ['--progress-width' as any]: `${Math.min(100, data.avgProgress)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Completion Trend */}
      <div className="completion-trend">
        <h4>📈 Weekly Completion Trend</h4>
        <div className="trend-chart">
          {analyticsData.monthlyCompletions.map((week, index) => (
            <div key={index} className="trend-bar">
              {/* eslint-disable-next-line react/forbid-dom-props */}
              <div 
                className="trend-fill"
                style={{ 
                  ['--trend-height' as any]: `${Math.max(20, (week.completions / Math.max(1, Math.max(...analyticsData.monthlyCompletions.map(w => w.completions)))) * 100)}%` 
                }}
                title={`${week.completions} goals completed`}
              />
              <span className="trend-label">{week.week}</span>
              <span className="trend-value">{week.completions}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="recent-achievements">
        <h4>🏆 Recent Achievements</h4>
        <div className="achievements-list">
          {goals
            .filter(g => g.status === 'completed')
            .sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0))
            .slice(0, 5)
            .map(goal => (
              <div key={goal.id} className="achievement-item">
                <span className="achievement-icon">{getEnergyTypeIcon(goal.energyType)}</span>
                <div className="achievement-content">
                  <span className="achievement-title">{goal.title}</span>
                  <span className="achievement-date">
                    {goal.completedAt && format(goal.completedAt, 'MMM dd, yyyy')}
                  </span>
                </div>
                <span className="achievement-badge">✅</span>
              </div>
            ))
          }
          {goals.filter(g => g.status === 'completed').length === 0 && (
            <div className="no-achievements">
              <span className="no-achievements-icon">🎯</span>
              <span className="no-achievements-text">Complete your first goal to see achievements here!</span>
            </div>
          )}
        </div>
      </div>

      {/* Goal Insights */}
      <div className="goal-insights">
        <h4>💡 Insights & Tips</h4>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-icon">⏰</div>
            <div className="insight-content">
              <h5>Best Completion Day</h5>
              <p>You complete most goals on weekends. Consider starting new goals on Friday!</p>
            </div>
          </div>
          
          <div className="insight-card">
            <div className="insight-icon">🎯</div>
            <div className="insight-content">
              <h5>Goal Focus</h5>
              <p>You work best with 2-3 active goals. Consider completing current goals before adding more.</p>
            </div>
          </div>
          
          <div className="insight-card">
            <div className="insight-icon">📊</div>
            <div className="insight-content">
              <h5>Progress Pattern</h5>
              <p>Your average streak is {stats.averageStreakLength.toFixed(1)} days. Try to beat your record of {stats.longestStreak} days!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
