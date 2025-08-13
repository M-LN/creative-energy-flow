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
      // Filter out dismissed insights and ensure we have valid insights
      const validInsights = newInsights.filter(insight => 
        insight && 
        insight.id && 
        insight.title && 
        insight.content && 
        !dismissedInsights.has(insight.id)
      );
      setInsights(validInsights);
    } catch (error) {
      console.error('Failed to generate insights:', error);
      // Set empty insights array to prevent crash
      setInsights([]);
    } finally {
      setLoading(false);
    }
  }, [energyData, dismissedInsights]);

  useEffect(() => {
    generateInsights();
  }, [generateInsights]);

  useEffect(() => {
    // Auto-expand high priority insights when insights are loaded
    if (insights.length > 0 && !expandedInsight) {
      const highPriorityInsight = insights.find(insight => insight.priority === 'high');
      if (highPriorityInsight) {
        setExpandedInsight(highPriorityInsight.id);
      }
    }
  }, [insights, expandedInsight]);

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
    try {
      console.log('Action clicked:', action, 'for insight:', insight.title);
      
      if (onActionClick) {
        onActionClick(action, insight);
      }
      
      // Provide visual feedback that action was taken
      setTimeout(() => {
        const button = document.querySelector(`[data-action="${action}"]`);
        if (button) {
          button.classList.add('action-applied');
          setTimeout(() => {
            button.classList.remove('action-applied');
          }, 2000);
        }
      }, 0);
    } catch (error) {
      console.error('Error handling action click:', error);
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
        {insights.map((insight) => {
          if (!insight || !insight.id) return null;
          
          return (
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
                    <h4 className="insight-title">{insight.title || 'Insight'}</h4>
                    <span className="insight-timestamp">
                      {insight.timestamp ? formatTimestamp(insight.timestamp) : 'Recent'}
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
                <p className="insight-text">{insight.content || 'No content available'}</p>
                
                {insight.energyData && (
                  <div className="insight-energy-data">
                    <div className="energy-trend">
                      <span className="trend-label">Current Energy:</span>
                      <span className="trend-value">
                        {insight.energyData.current ? Math.round(insight.energyData.current.overall) : 0}/100
                      </span>
                      <span className={`trend-indicator ${insight.energyData.trend || 'stable'}`}>
                        {insight.energyData.trend === 'improving' ? '↗️' : 
                         insight.energyData.trend === 'declining' ? '↘️' : '➡️'}
                        {insight.energyData.trend || 'stable'}
                      </span>
                    </div>
                  </div>
                )}

                {expandedInsight === insight.id && insight.actionable && insight.suggestedActions && insight.suggestedActions.length > 0 && (
                  <div className="insight-actions">
                    <h5>Suggested Actions:</h5>
                    <div className="action-buttons">
                      {insight.suggestedActions.map((action, index) => (
                        <button
                          key={index}
                          className="action-button"
                          data-action={action}
                          onClick={() => handleActionClick(action, insight)}
                          title={`Apply suggestion: ${action}`}
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
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
