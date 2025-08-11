import React, { useState, useEffect, useCallback } from 'react';
import { EnergyRecommendationService } from '../../services/EnergyRecommendationService';
import { 
  EnergyRecommendation, 
  PatternAnalysis, 
  RecommendationFilter,
  RecommendationSort 
} from '../../types/recommendations';
import { EnergyType } from '../../types/energy';
import './RecommendationDashboard.css';

interface RecommendationDashboardProps {
  className?: string;
}

const RecommendationDashboard: React.FC<RecommendationDashboardProps> = ({ className = '' }) => {
  const [analysis, setAnalysis] = useState<PatternAnalysis | null>(null);
  const [recommendations, setRecommendations] = useState<EnergyRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'today' | 'recommendations' | 'patterns' | 'insights'>('today');
  const [filter] = useState<RecommendationFilter>({});
  const [sortBy] = useState<RecommendationSort>({ field: 'priority', direction: 'desc' });

  const loadRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get latest analysis
      const latestAnalysis = EnergyRecommendationService.getLatestAnalysis();
      setAnalysis(latestAnalysis);
      
      // Get filtered recommendations
      const recs = EnergyRecommendationService.getRecommendations(filter, sortBy);
      setRecommendations(recs);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  }, [filter, sortBy]);

  // Get today's priority recommendations
  const todayRecommendations = recommendations
    .filter(rec => rec.priority === 'high' || rec.category === 'daily-routine')
    .slice(0, 3);

  // Generate daily action items based on current energy patterns
  const getDailyActionItems = () => {
    const currentHour = new Date().getHours();
    const timeOfDay = currentHour < 12 ? 'morning' : currentHour < 18 ? 'afternoon' : 'evening';
    
    const actionItems = [];
    
    // Morning actions
    if (timeOfDay === 'morning') {
      actionItems.push({
        id: 'morning-check',
        title: 'Morning Energy Check-in',
        description: 'How are you feeling this morning? Log your current energy levels.',
        icon: '🌅',
        action: 'Log Energy',
        category: 'check-in'
      });
      actionItems.push({
        id: 'morning-priorities',
        title: 'Set Today\'s Priorities',
        description: 'Review your goals and pick 1-2 priorities for today.',
        icon: '🎯',
        action: 'Set Priorities',
        category: 'planning'
      });
    }
    
    // Afternoon actions
    if (timeOfDay === 'afternoon') {
      actionItems.push({
        id: 'afternoon-boost',
        title: 'Energy Boost Check',
        description: 'Time for a quick energy recharge. Try a short walk or stretching.',
        icon: '⚡',
        action: 'Take Break',
        category: 'recharge'
      });
      actionItems.push({
        id: 'progress-check',
        title: 'Progress Review',
        description: 'How are you progressing on today\'s priorities?',
        icon: '📊',
        action: 'Review Progress',
        category: 'reflection'
      });
    }
    
    // Evening actions
    if (timeOfDay === 'evening') {
      actionItems.push({
        id: 'evening-reflect',
        title: 'Evening Reflection',
        description: 'Reflect on your energy levels throughout the day.',
        icon: '🌙',
        action: 'Reflect',
        category: 'reflection'
      });
      actionItems.push({
        id: 'tomorrow-prep',
        title: 'Prepare for Tomorrow',
        description: 'What energy pattern insights can you apply tomorrow?',
        icon: '🔮',
        action: 'Plan Ahead',
        category: 'planning'
      });
    }
    
    return actionItems;
  };

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  const handleImplementRecommendation = async (id: string) => {
    const success = EnergyRecommendationService.implementRecommendation(id);
    if (success) {
      await loadRecommendations();
    }
  };

  const handleSubmitFeedback = async (id: string, helpful: boolean, effectiveness?: number) => {
    const success = EnergyRecommendationService.submitFeedback(id, {
      helpful,
      implemented: true,
      effectiveness
    });
    if (success) {
      await loadRecommendations();
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔥';
      case 'medium': return '⚡';
      case 'low': return '💡';
      default: return '📌';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'daily-routine': return '🕐';
      case 'work-schedule': return '💼';
      case 'social-activities': return '👥';
      case 'rest-recovery': return '😴';
      case 'creative-work': return '🎨';
      case 'physical-activity': return '🏃';
      case 'mental-focus': return '🧠';
      case 'emotional-wellbeing': return '❤️';
      default: return '📋';
    }
  };

  const getEnergyTypeIcon = (type: EnergyType) => {
    switch (type) {
      case 'physical': return '💪';
      case 'mental': return '🧠';
      case 'emotional': return '❤️';
      case 'creative': return '🎨';
      default: return '⚡';
    }
  };

  const renderRecommendationCard = (recommendation: EnergyRecommendation) => (
    <div key={recommendation.id} className="recommendation-card">
      <div className="recommendation-header">
        <div className="recommendation-title-section">
          <span className="priority-icon">{getPriorityIcon(recommendation.priority)}</span>
          <h3 className="recommendation-title">{recommendation.title}</h3>
          <span className="category-icon">{getCategoryIcon(recommendation.category)}</span>
        </div>
        <div className="recommendation-meta">
          <span className={`priority-badge ${recommendation.priority}`}>
            {recommendation.priority}
          </span>
        </div>
      </div>

      <p className="recommendation-description">{recommendation.description}</p>

      <div className="recommendation-details">
        <div className="detail-group">
          <span className="detail-label">Energy Types:</span>
          <div className="energy-types">
            {recommendation.energyTypes.map(type => (
              <span key={type} className="energy-type-tag">
                {getEnergyTypeIcon(type)} {type}
              </span>
            ))}
          </div>
        </div>

        <div className="detail-row">
          <div className="detail-item">
            <span className="detail-label">Impact:</span>
            <span className="detail-value">{recommendation.estimatedImpact}/10</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Time:</span>
            <span className="detail-value">{recommendation.timeToImplement}</span>
          </div>
        </div>

        {recommendation.tags && recommendation.tags.length > 0 && (
          <div className="tags">
            {recommendation.tags.map((tag, index) => (
              <span key={index} className="tag">{tag}</span>
            ))}
          </div>
        )}
      </div>

      <div className="recommendation-actions">
        {!recommendation.implemented ? (
          <button 
            className="btn primary"
            onClick={() => handleImplementRecommendation(recommendation.id)}
          >
            Mark as Implemented
          </button>
        ) : (
          <div className="implemented-section">
            <span className="implemented-badge">✅ Implemented</span>
            {!recommendation.userFeedback && (
              <div className="feedback-buttons">
                <button 
                  className="btn secondary small"
                  onClick={() => handleSubmitFeedback(recommendation.id, true, 4)}
                >
                  👍 Helpful
                </button>
                <button 
                  className="btn secondary small"
                  onClick={() => handleSubmitFeedback(recommendation.id, false)}
                >
                  👎 Not Helpful
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderPatterns = () => {
    if (!analysis || !analysis.patterns.length) {
      return (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>No Patterns Detected Yet</h3>
          <p>We need more energy data to detect meaningful patterns. Keep logging your energy levels!</p>
        </div>
      );
    }

    return (
      <div className="patterns-grid">
        {analysis.patterns.map(pattern => (
          <div key={pattern.id} className="pattern-card">
            <div className="pattern-header">
              <h3>{getEnergyTypeIcon(pattern.type)} {pattern.type} Energy Pattern</h3>
              <span className="confidence-badge">
                {Math.round(pattern.confidence * 100)}% confidence
              </span>
            </div>
            
            <p className="pattern-description">{pattern.description}</p>
            
            <div className="pattern-details">
              <div className="detail-item">
                <span className="detail-label">Type:</span>
                <span className="detail-value">{pattern.patternType}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Trend:</span>
                <span className="detail-value">{pattern.trend}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Average:</span>
                <span className="detail-value">{pattern.averageValue.toFixed(1)}/10</span>
              </div>
            </div>

            {pattern.peakTimes.length > 0 && (
              <div className="pattern-times">
                <h4>Peak Times:</h4>
                <div className="time-tags">
                  {pattern.peakTimes.map((time, index) => (
                    <span key={index} className="time-tag peak">{time}</span>
                  ))}
                </div>
              </div>
            )}

            {pattern.lowTimes.length > 0 && (
              <div className="pattern-times">
                <h4>Low Times:</h4>
                <div className="time-tags">
                  {pattern.lowTimes.map((time, index) => (
                    <span key={index} className="time-tag low">{time}</span>
                  ))}
                </div>
              </div>
            )}

            {pattern.insights.length > 0 && (
              <div className="pattern-insights">
                <h4>Insights:</h4>
                <ul>
                  {pattern.insights.map((insight, index) => (
                    <li key={index}>{insight}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderTodayContent = () => {
    const dailyActions = getDailyActionItems();
    
    return (
      <div className="today-content">
        <div className="today-header">
          <h3>🌟 Today's Energy Focus</h3>
          <p>Actionable insights and recommendations for your daily energy optimization</p>
        </div>

        {/* Daily Action Items */}
        <div className="daily-actions-section">
          <h4>📋 Today's Action Items</h4>
          <div className="actions-grid">
            {dailyActions.map(action => (
              <div key={action.id} className={`action-card ${action.category}`}>
                <div className="action-header">
                  <span className="action-icon">{action.icon}</span>
                  <h5>{action.title}</h5>
                </div>
                <p className="action-description">{action.description}</p>
                <button className="btn-action primary">
                  {action.action}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Priority Recommendations */}
        {todayRecommendations.length > 0 && (
          <div className="today-recommendations-section">
            <h4>🔥 Priority Recommendations</h4>
            <div className="recommendations-grid compact">
              {todayRecommendations.map(rec => (
                <div key={rec.id} className="recommendation-card compact today-focus">
                  <div className="recommendation-header">
                    <div className="recommendation-title-section">
                      <span className="category-icon">{getCategoryIcon(rec.category)}</span>
                      <h5>{rec.title}</h5>
                      <span className="priority-badge">{getPriorityIcon(rec.priority)}</span>
                    </div>
                  </div>
                  <p className="recommendation-description">{rec.description}</p>
                  <div className="recommendation-actions">
                    <button 
                      className="btn primary small"
                      onClick={() => handleImplementRecommendation(rec.id)}
                    >
                      Try Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Energy Insights */}
        {analysis && analysis.insights.length > 0 && (
          <div className="today-insights-section">
            <h4>💡 Quick Insights</h4>
            <div className="insights-grid compact">
              {analysis.insights.slice(0, 2).map(insight => (
                <div key={insight.id} className={`insight-card compact ${insight.significance}`}>
                  <h5>{insight.title}</h5>
                  <p className="insight-description">{insight.description}</p>
                  <span className={`significance-badge small ${insight.significance}`}>
                    {insight.significance}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state for no data */}
        {recommendations.length === 0 && (!analysis || analysis.insights.length === 0) && (
          <div className="empty-state">
            <div className="empty-icon">📈</div>
            <h4>Building Your Insights</h4>
            <p>Keep logging your energy levels and we'll provide personalized daily insights!</p>
            <button className="btn-primary">
              Log Energy Now
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderInsights = () => {
    if (!analysis || !analysis.insights.length) {
      return (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No Insights Available</h3>
          <p>Insights will appear as we gather more data about your energy patterns.</p>
        </div>
      );
    }

    return (
      <div className="insights-grid">
        {analysis.insights.map(insight => (
          <div key={insight.id} className={`insight-card ${insight.significance}`}>
            <div className="insight-header">
              <h3>{insight.title}</h3>
              <span className={`significance-badge ${insight.significance}`}>
                {insight.significance}
              </span>
            </div>
            <p className="insight-description">{insight.description}</p>
            <div className="insight-type">
              <span className="type-label">Type:</span>
              <span className="type-value">{insight.type}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`recommendation-dashboard loading ${className}`}>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Analyzing your energy patterns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`recommendation-dashboard ${className}`}>
      <div className="dashboard-header">
        <div className="header-content">
          <h2>💡 Energy Insights</h2>
          <p>Daily actionable insights based on your energy patterns</p>
        </div>
        {analysis && (
          <div className="analysis-info">
            <div className="analysis-stat">
              <span className="stat-value">{analysis.patterns.length}</span>
              <span className="stat-label">Patterns</span>
            </div>
            <div className="analysis-stat">
              <span className="stat-value">{analysis.recommendations.length}</span>
              <span className="stat-label">Recommendations</span>
            </div>
            <div className="analysis-stat">
              <span className="stat-value">{Math.round(analysis.confidence * 100)}%</span>
              <span className="stat-label">Confidence</span>
            </div>
          </div>
        )}
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'today' ? 'active' : ''}`}
          onClick={() => setActiveTab('today')}
        >
          🌟 Today's Focus
        </button>
        <button 
          className={`tab-btn ${activeTab === 'recommendations' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommendations')}
        >
          📋 All Recommendations
        </button>
        <button 
          className={`tab-btn ${activeTab === 'patterns' ? 'active' : ''}`}
          onClick={() => setActiveTab('patterns')}
        >
          📊 Energy Patterns
        </button>
        <button 
          className={`tab-btn ${activeTab === 'insights' ? 'active' : ''}`}
          onClick={() => setActiveTab('insights')}
        >
          🔍 Deep Insights
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'today' && renderTodayContent()}
        
        {activeTab === 'recommendations' && (
          <div className="recommendations-content">
            {recommendations.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">💡</div>
                <h3>No Recommendations Available</h3>
                <p>We'll generate personalized recommendations as we learn more about your energy patterns.</p>
              </div>
            ) : (
              <div className="recommendations-grid">
                {recommendations.map(renderRecommendationCard)}
              </div>
            )}
          </div>
        )}

        {activeTab === 'patterns' && renderPatterns()}
        {activeTab === 'insights' && renderInsights()}
      </div>
    </div>
  );
};

export default RecommendationDashboard;
