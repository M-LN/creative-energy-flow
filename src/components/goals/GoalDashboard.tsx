import React, { useState, useEffect, useCallback } from 'react';
import { EnergyGoal, GoalStats, GoalSuggestion } from '../../types/goals';
import { EnergyLevel } from '../../types/energy';
import { GoalService } from '../../services/GoalService';
import { GoalCard } from './GoalCard';
import { GoalCreationForm } from './GoalCreationForm';
import { GoalSuggestions } from './GoalSuggestions';
import './GoalDashboard.css';

interface GoalDashboardProps {
  energyData: EnergyLevel[];
  onDataUpdate?: (data: EnergyLevel[]) => void;
}

export const GoalDashboard: React.FC<GoalDashboardProps> = ({ 
  energyData,
  onDataUpdate 
}) => {
  const [goals, setGoals] = useState<EnergyGoal[]>([]);
  const [goalStats, setGoalStats] = useState<GoalStats | null>(null);
  const [suggestions, setSuggestions] = useState<GoalSuggestion[]>([]);
  const [activeTab, setActiveTab] = useState<'today' | 'active' | 'completed' | 'suggestions'>('today');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load goals and stats on mount
  useEffect(() => {
    loadGoals();
  }, []);

  const updateAllGoalProgress = useCallback(async () => {
    const updatedGoals: EnergyGoal[] = [];
    
    for (const goal of goals) {
      if (goal.status === 'active') {
        const updatedGoal = GoalService.updateGoalProgress(goal.id, energyData);
        if (updatedGoal) {
          updatedGoals.push(updatedGoal);
        } else {
          updatedGoals.push(goal);
        }
      } else {
        updatedGoals.push(goal);
      }
    }
    
    setGoals(updatedGoals);
    
    // Update stats after progress update
    const newStats = GoalService.getGoalStats();
    setGoalStats(newStats);
  }, [goals, energyData]);

  // Update goal progress when energy data changes
  useEffect(() => {
    if (goals.length > 0 && energyData.length > 0) {
      updateAllGoalProgress();
    }
  }, [energyData, goals.length, updateAllGoalProgress]);

  // Generate suggestions when we have enough data
  useEffect(() => {
    if (energyData.length >= 7) {
      const newSuggestions = GoalService.generateGoalSuggestions(energyData);
      setSuggestions(newSuggestions);
    }
  }, [energyData]);

  const loadGoals = async () => {
    try {
      setIsLoading(true);
      const loadedGoals = GoalService.loadGoals();
      setGoals(loadedGoals);
      
      const stats = GoalService.getGoalStats();
      setGoalStats(stats);
    } catch (error) {
      console.error('Failed to load goals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGoal = (goalData: Omit<EnergyGoal, 'id' | 'createdAt' | 'currentValue' | 'progress' | 'streak' | 'milestones'>) => {
    try {
      const newGoal = GoalService.createGoal(goalData);
      setGoals(prev => [newGoal, ...prev]);
      setShowCreateForm(false);
      
      // Update stats
      const newStats = GoalService.getGoalStats();
      setGoalStats(newStats);
    } catch (error) {
      console.error('Failed to create goal:', error);
      alert('Failed to create goal. Please try again.');
    }
  };

  const handleDeleteGoal = (goalId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this goal?');
    if (!confirmed) return;
    
    try {
      const success = GoalService.deleteGoal(goalId);
      if (success) {
        setGoals(prev => prev.filter(g => g.id !== goalId));
        
        // Update stats
        const newStats = GoalService.getGoalStats();
        setGoalStats(newStats);
      }
    } catch (error) {
      console.error('Failed to delete goal:', error);
      alert('Failed to delete goal. Please try again.');
    }
  };

  const handleCompleteGoal = (goalId: string) => {
    try {
      const updatedGoal = GoalService.updateGoalStatus(goalId, 'completed');
      if (updatedGoal) {
        setGoals(prev => prev.map(g => g.id === goalId ? updatedGoal : g));
        
        // Update stats
        const newStats = GoalService.getGoalStats();
        setGoalStats(newStats);
      }
    } catch (error) {
      console.error('Failed to complete goal:', error);
      alert('Failed to complete goal. Please try again.');
    }
  };

  const handleCreateFromSuggestion = (suggestion: GoalSuggestion) => {
    const goalData = {
      title: suggestion.title,
      description: suggestion.description,
      energyType: suggestion.energyType,
      metric: suggestion.metric,
      targetValue: suggestion.suggestedTarget,
      goalType: 'daily' as const,
      status: 'active' as const,
      startDate: new Date(),
      endDate: new Date(Date.now() + (suggestion.estimatedDuration.includes('2-4') ? 21 : 
                       suggestion.estimatedDuration.includes('3-6') ? 42 : 56) * 24 * 60 * 60 * 1000),
      reminders: []
    };
    
    handleCreateGoal(goalData);
  };

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');
  
  // Today's priority goals (due today or daily goals)
  const todayGoals = activeGoals.filter(goal => {
    if (goal.endDate) {
      const isToday = new Date(goal.endDate).toDateString() === new Date().toDateString();
      const isOverdue = new Date(goal.endDate) < new Date();
      return isToday || isOverdue;
    }
    return goal.goalType === 'daily';
  }).slice(0, 3); // Limit to 3 for focus

  if (isLoading) {
    return (
      <div className="goal-dashboard loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="goal-dashboard">
      <div className="goal-dashboard-header">
        <div className="header-content">
          <h2>🎯 Energy Goals</h2>
          <p>Track your progress and achieve your energy targets</p>
        </div>
        <button 
          className="create-goal-btn primary"
          onClick={() => setShowCreateForm(true)}
        >
          ➕ New Goal
        </button>
      </div>

      {/* Quick Stats */}
      {goalStats && (
        <div className="quick-stats">
          <div className="stat-card">
            <div className="stat-value">{goalStats.activeGoals}</div>
            <div className="stat-label">Active Goals</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{goalStats.completionRate.toFixed(0)}%</div>
            <div className="stat-label">Success Rate</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{goalStats.currentStreak}</div>
            <div className="stat-label">Current Streak</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{goalStats.goalsCompletedThisWeek}</div>
            <div className="stat-label">This Week</div>
          </div>
        </div>
      )}

      {/* Navigation Tabs - Daily-Use Focused */}
      <div className="goal-tabs">
        <button 
          className={`tab-btn ${activeTab === 'today' ? 'active' : ''}`}
          onClick={() => setActiveTab('today')}
        >
          📅 Today's Focus
        </button>
        <button 
          className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          🎯 My Goals ({activeGoals.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          ✅ Achieved ({completedGoals.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'suggestions' ? 'active' : ''}`}
          onClick={() => setActiveTab('suggestions')}
        >
          � Quick Wins ({suggestions.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'today' && (
          <div className="today-content">
            <div className="today-header">
              <h3>🌅 Today's Energy Focus</h3>
              <p>What will you accomplish today to boost your creative energy?</p>
            </div>

            {/* Today's Priority Goals */}
            {todayGoals.length > 0 && (
              <div className="today-section">
                <h4>🎯 Priority Goals for Today</h4>
                <div className="goals-grid">
                  {todayGoals.map(goal => (
                    <div key={goal.id} className="goal-card today-priority">
                      <div className="goal-header">
                        <h5>{goal.title}</h5>
                        <div className="goal-actions">
                          <button 
                            className="btn-complete"
                            onClick={() => handleCompleteGoal(goal.id)}
                            title="Mark as completed"
                          >
                            ✓
                          </button>
                        </div>
                      </div>
                      {goal.description && <p className="goal-description">{goal.description}</p>}
                      {goal.endDate && (
                        <div className="goal-deadline">
                          ⏰ Due: {new Date(goal.endDate).toLocaleDateString()}
                        </div>
                      )}
                      <div className="goal-progress">
                        <div className="progress-bar">
                          <div 
                            className={`progress-fill progress-${Math.floor(goal.progress / 10) * 10}`}
                          ></div>
                        </div>
                        <span>{goal.progress}% complete</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Win Suggestions for Today */}
            {suggestions.slice(0, 3).length > 0 && (
              <div className="today-section">
                <h4>⚡ Quick Energy Wins</h4>
                <div className="suggestions-grid">
                  {suggestions.slice(0, 3).map((suggestion, index) => (
                    <div key={index} className="suggestion-card today-suggestion">
                      <div className="suggestion-header">
                        <span className="suggestion-icon">
                          {suggestion.energyType === 'physical' ? '💪' :
                           suggestion.energyType === 'mental' ? '🧠' :
                           suggestion.energyType === 'emotional' ? '❤️' :
                           suggestion.energyType === 'creative' ? '🎨' : '⚡'}
                        </span>
                        <h5>{suggestion.title}</h5>
                      </div>
                      <p>{suggestion.description}</p>
                      <button 
                        className="btn-action"
                        onClick={() => handleCreateFromSuggestion(suggestion)}
                      >
                        Start Now
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Daily Energy Checkup */}
            <div className="today-section">
              <div className="daily-checkup">
                <h4>🔋 Daily Energy Checkup</h4>
                <p>How are you feeling about your goals today?</p>
                <div className="checkup-actions">
                  <button className="checkup-btn good">😊 On Track</button>
                  <button className="checkup-btn okay">😐 Some Challenges</button>
                  <button className="checkup-btn struggling">😔 Need Support</button>
                </div>
              </div>
            </div>

            {todayGoals.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">🎯</div>
                <h4>Ready to Focus?</h4>
                <p>No goals set for today yet. Pick a priority goal or try a quick win!</p>
                <button 
                  className="btn-primary"
                  onClick={() => setActiveTab('suggestions')}
                >
                  Explore Quick Wins
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'active' && (
          <div className="active-goals">
            {activeGoals.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🎯</div>
                <h3>No Active Goals</h3>
                <p>Create your first goal to start tracking your energy progress!</p>
                <button 
                  className="create-goal-btn primary"
                  onClick={() => setShowCreateForm(true)}
                >
                  Create Your First Goal
                </button>
              </div>
            ) : (
              <div className="goals-grid">
                {activeGoals.map(goal => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onDelete={handleDeleteGoal}
                    onComplete={handleCompleteGoal}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'completed' && (
          <div className="completed-goals">
            {completedGoals.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🏆</div>
                <h3>No Completed Goals Yet</h3>
                <p>Complete your first goal to see your achievements here!</p>
              </div>
            ) : (
              <div className="goals-grid">
                {completedGoals.map(goal => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onDelete={handleDeleteGoal}
                    showCompleted
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'suggestions' && (
          <GoalSuggestions
            suggestions={suggestions}
            onCreateFromSuggestion={handleCreateFromSuggestion}
          />
        )}
      </div>

      {/* Goal Creation Modal */}
      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <GoalCreationForm
              onSubmit={handleCreateGoal}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
