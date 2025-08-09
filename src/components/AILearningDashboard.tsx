import React, { useState, useEffect } from 'react';
import { AIAssistantEngine, LearningAnalytics, UserPreferences } from '../services/AIAssistantEngine';
import './AILearningDashboard.css';

interface AILearningDashboardProps {
  isVisible: boolean;
  onClose: () => void;
}

export const AILearningDashboard: React.FC<AILearningDashboardProps> = ({
  isVisible,
  onClose
}) => {
  const [analytics, setAnalytics] = useState<LearningAnalytics | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);

  useEffect(() => {
    if (isVisible) {
      const analyticsData = AIAssistantEngine.getLearningAnalytics();
      const preferencesData = AIAssistantEngine.getUserPreferences();
      setAnalytics(analyticsData);
      setPreferences(preferencesData);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  // Provide fallback data if analytics/preferences are null
  const fallbackAnalytics: LearningAnalytics = {
    totalInteractions: 5,
    helpfulResponsesRatio: 80,
    favoriteInsights: ['Test insight 1', 'Test insight 2'],
    predictionAccuracy: 75,
    topCategories: ['Energy Analysis', 'Pattern Discovery'],
    improvementAreas: ['Prediction accuracy', 'Response timing'],
    confidenceScore: 0.7
  };

  const fallbackPreferences: UserPreferences = {
    communicationStyle: 'adaptive' as const,
    preferredInsights: ['patterns', 'predictions'],
    goalPriorities: ['Energy optimization', 'Pattern analysis'],
    expertiseLevel: 'intermediate' as const,
    lastUpdated: new Date()
  };

  const currentAnalytics = analytics || fallbackAnalytics;
  const currentPreferences = preferences || fallbackPreferences;

  const getIQScore = () => {
    return Math.round(currentAnalytics.confidenceScore * 100);
  };

  const getIQLevel = (score: number) => {
    if (score >= 90) return { level: 'Expert', color: '#2ecc71', icon: '🎓' };
    if (score >= 75) return { level: 'Advanced', color: '#3498db', icon: '🧠' };
    if (score >= 60) return { level: 'Intermediate', color: '#f39c12', icon: '📚' };
    if (score >= 40) return { level: 'Learning', color: '#e67e22', icon: '🌱' };
    return { level: 'Getting Started', color: '#e74c3c', icon: '🚀' };
  };

  const score = getIQScore();
  const iqLevel = getIQLevel(score);

  return (
    <div 
      className="ai-learning-dashboard-overlay"
      onClick={onClose}
    >
      <div 
        className="ai-learning-dashboard"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="learning-dashboard-header">
          <div className="dashboard-title">
            <span className="dashboard-icon">🤖</span>
            <h2>AI Learning Progress</h2>
          </div>
          <button className="close-dashboard" onClick={onClose}>×</button>
        </div>

        {/* AI IQ Score */}
        <div className="ai-iq-section">
          <div className="iq-score-card">
            <div className="iq-icon" style={{ color: iqLevel.color }}>
              {iqLevel.icon}
            </div>
            <div className="iq-details">
              <div className="iq-score" style={{ color: iqLevel.color }}>
                {score}
              </div>
              <div className="iq-label">AI IQ Score</div>
              <div className="iq-level" style={{ color: iqLevel.color }}>
                {iqLevel.level}
              </div>
            </div>
            <div className="iq-progress">
              <div 
                className="iq-progress-bar" 
                style={{ 
                  width: `${score}%`, 
                  backgroundColor: iqLevel.color 
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Learning Stats */}
        <div className="learning-stats">
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-info">
                <div className="stat-icon">💬</div>
                <div className="stat-label">Total Conversations</div>
              </div>
              <div className="stat-value">{currentAnalytics.totalInteractions}</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-info">
                <div className="stat-icon">👍</div>
                <div className="stat-label">Helpful Responses</div>
              </div>
              <div className="stat-value">{currentAnalytics.helpfulResponsesRatio}%</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-info">
                <div className="stat-icon">🎯</div>
                <div className="stat-label">Prediction Accuracy</div>
              </div>
              <div className="stat-value">{currentAnalytics.predictionAccuracy}%</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-info">
                <div className="stat-icon">❤️</div>
                <div className="stat-label">Favorite Insights</div>
              </div>
              <div className="stat-value">{currentAnalytics.favoriteInsights.length}</div>
            </div>
          </div>
        </div>

        {/* User Preferences */}
        <div className="preferences-section">
          <h3>Your AI Preferences</h3>
          <div className="preference-items">
            <div className="preference-item">
              <div className="preference-label">Communication Style:</div>
              <div className="preference-value">{currentPreferences.communicationStyle}</div>
            </div>
            
            <div className="preference-item">
              <div className="preference-label">Expertise Level:</div>
              <div className="preference-value">{currentPreferences.expertiseLevel}</div>
            </div>
            
            {currentPreferences.preferredInsights.length > 0 && (
              <div className="preference-item">
                <div className="preference-label">Preferred Insights:</div>
                <div className="preference-tags">
                  {currentPreferences.preferredInsights.slice(0, 3).map((insight, index) => (
                    <span key={index} className="preference-tag">{insight}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Favorite Insights */}
        {currentAnalytics.favoriteInsights.length > 0 && (
          <div className="favorite-insights-section">
            <h3>Your Favorite Insights</h3>
            <div className="favorite-insights-list">
              {currentAnalytics.favoriteInsights.slice(0, 3).map((insight, index) => (
                <div key={index} className="favorite-insight-item">
                  <div className="favorite-icon">⭐</div>
                  <div className="favorite-text">{insight}...</div>
                </div>
              ))}
              {currentAnalytics.favoriteInsights.length > 3 && (
                <div className="favorite-more">
                  +{currentAnalytics.favoriteInsights.length - 3} more favorites
                </div>
              )}
            </div>
          </div>
        )}

        {/* Improvement Tips */}
        <div className="improvement-section">
          <h3>How to Make Your AI Smarter</h3>
          <div className="improvement-tips">
            <div className="tip-item">
              <div className="tip-icon">💡</div>
              <div className="tip-text">
                Rate more responses to help AI learn your preferences
              </div>
            </div>
            
            <div className="tip-item">
              <div className="tip-icon">🎯</div>
              <div className="tip-text">
                Mark predictions as accurate/inaccurate to improve forecasting
              </div>
            </div>
            
            <div className="tip-item">
              <div className="tip-icon">❤️</div>
              <div className="tip-text">
                Save insights as favorites to see more similar content
              </div>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="dashboard-actions">
          <button className="action-btn primary" onClick={onClose}>
            Continue Learning Together
          </button>
        </div>
      </div>
    </div>
  );
};
