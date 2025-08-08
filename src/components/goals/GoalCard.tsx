// Individual Goal Card Component - Display and manage single energy goals
import React from 'react';
import { EnergyGoal } from '../../types/goals';
import { format } from 'date-fns';

interface GoalCardProps {
  goal: EnergyGoal;
  onDelete?: (goalId: string) => void;
  onComplete?: (goalId: string) => void;
  showCompleted?: boolean;
}

export const GoalCard: React.FC<GoalCardProps> = ({ 
  goal, 
  onDelete, 
  onComplete,
  showCompleted = false 
}) => {
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

  const getMetricLabel = (metric: string) => {
    const labels = {
      average: 'Average',
      minimum: 'Minimum',
      maximum: 'Maximum',
      consistency: 'Consistency'
    };
    return labels[metric as keyof typeof labels] || metric;
  };

  const getStatusClass = (status: string) => {
    return `status-badge ${status}`;
  };

  const getProgressClass = (progress: number) => {
    if (progress >= 100) return 'progress-fill progress-complete';
    if (progress >= 75) return 'progress-fill progress-high';
    if (progress >= 50) return 'progress-fill progress-medium';
    return 'progress-fill progress-low';
  };

  const formatDate = (date: Date) => {
    return format(date, 'MMM dd, yyyy');
  };

  const completedMilestones = goal.milestones.filter(m => m.reached).length;
  const totalMilestones = goal.milestones.length;

  return (
    <div className={`goal-card ${goal.status}`}>
      <div className="goal-card-header">
        <div className="goal-title-section">
          <span className="energy-type-icon">
            {getEnergyTypeIcon(goal.energyType)}
          </span>
          <div className="goal-title-content">
            <h3 className="goal-title">{goal.title}</h3>
            <div className="goal-meta">
              <span className="energy-type">
                {goal.energyType === 'overall' ? 'Overall' : 
                 goal.energyType.charAt(0).toUpperCase() + goal.energyType.slice(1)} Energy
              </span>
              <span className="goal-metric">
                {getMetricLabel(goal.metric)}: {goal.targetValue}
              </span>
            </div>
          </div>
        </div>
        <div className="goal-status">
          <span 
            className={getStatusClass(goal.status)}
          >
            {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
          </span>
        </div>
      </div>

      {goal.description && (
        <p className="goal-description">{goal.description}</p>
      )}

      {/* Progress Section */}
      <div className="goal-progress-section">
        <div className="progress-header">
          <span className="progress-label">Progress</span>
          <span className="progress-value">
            {goal.currentValue.toFixed(1)} / {goal.targetValue} ({goal.progress.toFixed(1)}%)
          </span>
        </div>
        <div className="progress-bar">
          {/* eslint-disable-next-line react/forbid-dom-props */}
          <div 
            className={getProgressClass(goal.progress)}
            style={{ 
              ['--progress-width' as any]: `${Math.min(100, goal.progress)}%`
            }}
          />
        </div>
      </div>

      {/* Milestones */}
      {goal.milestones.length > 0 && (
        <div className="milestones-section">
          <div className="milestones-header">
            <span>🏆 Milestones</span>
            <span className="milestone-count">
              {completedMilestones}/{totalMilestones}
            </span>
          </div>
          <div className="milestones-list">
            {goal.milestones.map(milestone => (
              <div 
                key={milestone.id}
                className={`milestone ${milestone.reached ? 'reached' : ''}`}
              >
                <span className="milestone-icon">
                  {milestone.reached ? '✅' : '⭕'}
                </span>
                <span className="milestone-title">{milestone.title}</span>
                {milestone.reached && milestone.reachedAt && (
                  <span className="milestone-date">
                    {formatDate(milestone.reachedAt)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Streak */}
      {goal.streak > 0 && (
        <div className="streak-section">
          <span className="streak-icon">🔥</span>
          <span className="streak-text">
            {goal.streak} day{goal.streak !== 1 ? 's' : ''} streak!
          </span>
        </div>
      )}

      {/* Goal Timeline */}
      <div className="goal-timeline">
        <div className="timeline-item">
          <span className="timeline-label">Start:</span>
          <span className="timeline-date">{formatDate(goal.startDate)}</span>
        </div>
        <div className="timeline-item">
          <span className="timeline-label">Target:</span>
          <span className="timeline-date">{formatDate(goal.endDate)}</span>
        </div>
        {showCompleted && goal.completedAt && (
          <div className="timeline-item">
            <span className="timeline-label">Completed:</span>
            <span className="timeline-date">{formatDate(goal.completedAt)}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="goal-actions">
        {goal.status === 'active' && onComplete && (
          <button 
            className="action-btn complete-btn"
            onClick={() => onComplete(goal.id)}
            title="Mark as completed"
          >
            ✅ Complete
          </button>
        )}
        
        {onDelete && (
          <button 
            className="action-btn delete-btn"
            onClick={() => onDelete(goal.id)}
            title="Delete goal"
          >
            🗑️ Delete
          </button>
        )}
      </div>
    </div>
  );
};
