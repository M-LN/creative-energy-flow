import React, { useState, useEffect, useCallback } from 'react';
import { ProactiveInsightsEngine, ProactiveInsight } from '../services/ProactiveInsightsEngine';
import { EnergyLevel } from '../types/energy';
import './ProactiveInsights.css';

interface ProactiveInsightsProps {
  energyData: EnergyLevel[];
  onActionClick?: (action: string, insight: ProactiveInsight) => void;
}

const ProactiveInsights: React.FC<ProactiveInsightsProps> = ({ 
  energyData, 
  onActionClick 
}) => {
  const [insights, setInsights] = useState<ProactiveInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);
  const [dismissedInsights, setDismissedInsights] = useState<Set<string>>(new Set());

  const generateInsights = useCallback(async () => {
    if (energyData.length === 0) return;
    
    setLoading(true);
    try {
      const newInsights = await ProactiveInsightsEngine.generateDailyInsights(energyData);
      // Filter out dismissed insights
      const visibleInsights = newInsights.filter(insight => !dismissedInsights.has(insight.id));
      setInsights(visibleInsights);
    } catch (error) {
      console.error('Failed to generate insights:', error);
    } finally {
      setLoading(false);
    }
  }, [energyData, dismissedInsights]);

  useEffect(() => {
    generateInsights();
  }, [generateInsights]);

  const handleDismiss = (insightId: string) => {
    setDismissedInsights(prev => {
      const newSet = new Set(prev);
      newSet.add(insightId);
      return newSet;
    });
    setInsights(prev => prev.filter(insight => insight.id !== insightId));
  };

  const handleExpand = (insightId: string) => {
    setExpandedInsight(expandedInsight === insightId ? null : insightId);
  };

  const handleActionClick = (action: string, insight: ProactiveInsight) => {
    if (onActionClick) {
      onActionClick(action, insight);
    }
  };

  const getInsightIcon = (type: ProactiveInsight['type']) => {
    switch (type) {
      case 'morning_greeting': return '🌅';
      case 'energy_trend': return '📈';
      case 'optimization_tip': return '💡';
      case 'pattern_alert': return '🎯';
      case 'achievement': return '🏆';
      default: return '✨';
    }
  };

  const getPriorityClass = (priority: string) => {
    return `insight-priority-${priority}`;
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffHours = Math.abs(now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
    return timestamp.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="proactive-insights loading">
        <div className="insights-header">
          <h3>🧠 Generating Smart Insights...</h3>
          <div className="loading-pulse"></div>
        </div>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="proactive-insights empty">
        <div className="empty-state">
          <span className="empty-icon">🤖</span>
          <h4>AI Insights Coming Soon</h4>
          <p>Track your energy for a few days to unlock personalized insights!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="proactive-insights">
      <div className="insights-header">
        <h3>
          <span className="header-icon">🧠</span>
          Smart Insights
          <span className="insights-count">{insights.length}</span>
        </h3>
        <button 
          className="refresh-insights"
          onClick={generateInsights}
          disabled={loading}
          aria-label="Refresh insights"
        >
          🔄
        </button>
      </div>

      <div className="insights-container">
        {insights.map((insight) => (
          <div 
            key={insight.id}
            className={`insight-card ${getPriorityClass(insight.priority)} ${
              expandedInsight === insight.id ? 'expanded' : ''
            }`}
          >
            <div className="insight-header" onClick={() => handleExpand(insight.id)}>
              <div className="insight-title-section">
                <span className="insight-icon" role="img" aria-label={insight.type}>
                  {getInsightIcon(insight.type)}
                </span>
                <div className="insight-title-content">
                  <h4 className="insight-title">{insight.title}</h4>
                  <span className="insight-timestamp">
                    {formatTimestamp(insight.timestamp)}
                  </span>
                </div>
              </div>
              
              <div className="insight-controls">
                {insight.priority === 'high' && (
                  <span className="priority-indicator" title="High Priority">⭐</span>
                )}
                <button 
                  className="expand-button"
                  aria-label={expandedInsight === insight.id ? "Collapse" : "Expand"}
                >
                  {expandedInsight === insight.id ? '▲' : '▼'}
                </button>
                <button 
                  className="dismiss-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDismiss(insight.id);
                  }}
                  aria-label="Dismiss insight"
                  title="Dismiss"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="insight-content">
              <p className="insight-text">{insight.content}</p>
              
              {insight.energyData && (
                <div className="insight-energy-data">
                  <div className="energy-trend">
                    <span className="trend-label">Current Energy:</span>
                    <span className="trend-value">{Math.round(insight.energyData.current.overall)}/100</span>
                    <span className={`trend-indicator ${insight.energyData.trend}`}>
                      {insight.energyData.trend === 'improving' ? '↗️' : 
                       insight.energyData.trend === 'declining' ? '↘️' : '➡️'}
                      {insight.energyData.trend}
                    </span>
                  </div>
                </div>
              )}

              {expandedInsight === insight.id && insight.actionable && insight.suggestedActions && (
                <div className="insight-actions">
                  <h5>Suggested Actions:</h5>
                  <div className="action-buttons">
                    {insight.suggestedActions.map((action, index) => (
                      <button
                        key={index}
                        className="action-button"
                        onClick={() => handleActionClick(action, insight)}
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="insights-footer">
        <p className="insights-info">
          <span className="info-icon">ℹ️</span>
          Insights refresh daily and adapt to your energy patterns
        </p>
      </div>
    </div>
  );
};

export default ProactiveInsights;
