// Goal Management Dashboard - Main interface for viewing and managing energy goals
import React, { useState, useEffect } from 'react';
import { EnergyGoal, GoalStats, GoalSuggestion } from '../../types/goals';
import { EnergyLevel } from '../../types/energy';
import { GoalService } from '../../services/GoalService';
import { GoalCard } from './GoalCard';
import { GoalCreationForm } from './GoalCreationForm';
import { GoalSuggestions } from './GoalSuggestions';
import { GoalStatsPanel } from './GoalStatsPanel';
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
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'suggestions' | 'stats'>('active');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load goals and stats on mount
  useEffect(() => {
    loadGoals();
  }, []);

  // Update goal progress when energy data changes
  useEffect(() => {
    if (goals.length > 0 && energyData.length > 0) {
      updateAllGoalProgress();
    }
  }, [energyData]);

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

  const updateAllGoalProgress = async () => {
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

      {/* Navigation Tabs */}
      <div className="goal-tabs">
        <button 
          className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          🎯 Active ({activeGoals.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          ✅ Completed ({completedGoals.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'suggestions' ? 'active' : ''}`}
          onClick={() => setActiveTab('suggestions')}
        >
          💡 Suggestions ({suggestions.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          📊 Statistics
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
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

        {activeTab === 'stats' && goalStats && (
          <GoalStatsPanel
            stats={goalStats}
            goals={goals}
            energyData={energyData}
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
