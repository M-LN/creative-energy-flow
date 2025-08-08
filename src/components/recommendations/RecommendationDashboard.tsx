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
  const [activeTab, setActiveTab] = useState<'patterns' | 'recommendations' | 'insights'>('recommendations');
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
          <h2>Energy Pattern Recommendations</h2>
          <p>Personalized insights and suggestions based on your energy data</p>
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
          className={`tab-btn ${activeTab === 'recommendations' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommendations')}
        >
          📋 Recommendations
        </button>
        <button 
          className={`tab-btn ${activeTab === 'patterns' ? 'active' : ''}`}
          onClick={() => setActiveTab('patterns')}
        >
          📊 Patterns
        </button>
        <button 
          className={`tab-btn ${activeTab === 'insights' ? 'active' : ''}`}
          onClick={() => setActiveTab('insights')}
        >
          🔍 Insights
        </button>
      </div>

      <div className="tab-content">
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
