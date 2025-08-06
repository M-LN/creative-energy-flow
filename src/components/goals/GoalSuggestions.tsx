// Goal Suggestions Component - Display AI-generated goal recommendations
import React from 'react';
import { GoalSuggestion } from '../../types/goals';

interface GoalSuggestionsProps {
  suggestions: GoalSuggestion[];
  onCreateFromSuggestion: (suggestion: GoalSuggestion) => void;
}

export const GoalSuggestions: React.FC<GoalSuggestionsProps> = ({ 
  suggestions, 
  onCreateFromSuggestion 
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

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      easy: 'var(--success-color)',
      medium: 'var(--warning-color)',
      hard: 'var(--error-color)'
    };
    return colors[difficulty as keyof typeof colors] || 'var(--neutral-color)';
  };

  const getDifficultyIcon = (difficulty: string) => {
    const icons = {
      easy: '🟢',
      medium: '🟡',
      hard: '🔴'
    };
    return icons[difficulty as keyof typeof icons] || '⚪';
  };

  if (suggestions.length === 0) {
    return (
      <div className="goal-suggestions empty">
        <div className="empty-state">
          <div className="empty-icon">💡</div>
          <h3>No Suggestions Available</h3>
          <p>Track your energy for at least a week to get personalized goal suggestions!</p>
          <div className="suggestions-help">
            <h4>How it works:</h4>
            <ul>
              <li>🔍 We analyze your energy patterns</li>
              <li>📊 Identify areas for improvement</li>
              <li>🎯 Suggest achievable goals</li>
              <li>📈 Provide realistic targets</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="goal-suggestions">
      <div className="suggestions-header">
        <h3>💡 Personalized Goal Suggestions</h3>
        <p>Based on your energy patterns, here are some goals that could help you improve:</p>
      </div>

      <div className="suggestions-grid">
        {suggestions.map(suggestion => (
          <div key={suggestion.id} className="suggestion-card">
            <div className="suggestion-header">
              <div className="suggestion-title-section">
                <span className="energy-type-icon">
                  {getEnergyTypeIcon(suggestion.energyType)}
                </span>
                <h4 className="suggestion-title">{suggestion.title}</h4>
              </div>
              <div className="suggestion-difficulty">
                <span 
                  className="difficulty-badge"
                  style={{ color: getDifficultyColor(suggestion.difficulty) }}
                >
                  {getDifficultyIcon(suggestion.difficulty)}
                  {suggestion.difficulty.charAt(0).toUpperCase() + suggestion.difficulty.slice(1)}
                </span>
              </div>
            </div>

            <p className="suggestion-description">{suggestion.description}</p>

            <div className="suggestion-details">
              <div className="detail-item">
                <span className="detail-label">Target:</span>
                <span className="detail-value">{suggestion.suggestedTarget}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Metric:</span>
                <span className="detail-value">
                  {suggestion.metric.charAt(0).toUpperCase() + suggestion.metric.slice(1)}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Duration:</span>
                <span className="detail-value">{suggestion.estimatedDuration}</span>
              </div>
            </div>

            <div className="suggestion-reasoning">
              <h5>Why this goal?</h5>
              <p>{suggestion.reasoning}</p>
            </div>

            <div className="suggestion-actions">
              <button
                className="btn primary create-goal-btn"
                onClick={() => onCreateFromSuggestion(suggestion)}
              >
                ✨ Create This Goal
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="suggestions-footer">
        <div className="suggestions-info">
          <h4>💭 About These Suggestions</h4>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-icon">🎯</span>
              <div className="info-content">
                <h5>Personalized</h5>
                <p>Based on your unique energy patterns and history</p>
              </div>
            </div>
            <div className="info-item">
              <span className="info-icon">📊</span>
              <div className="info-content">
                <h5>Data-Driven</h5>
                <p>Calculated from your recent energy tracking data</p>
              </div>
            </div>
            <div className="info-item">
              <span className="info-icon">⚡</span>
              <div className="info-content">
                <h5>Achievable</h5>
                <p>Realistic targets designed for sustainable progress</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
