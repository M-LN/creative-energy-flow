import React, { useState, useMemo, useEffect } from 'react';
import { EnergyLevel } from '../types/energy';
import { AIInsightsEngine, PersonalizedConstraint, SmartRecommendation, AIEnergyPrediction } from '../services/AIInsightsEngine';
import './AIInsightsPanel.css';

interface AIInsightsPanelProps {
  data: EnergyLevel[];
  currentEnergy: EnergyLevel;
  isOpen: boolean;
  onToggle: () => void;
  onConstraintSelect?: (constraint: PersonalizedConstraint) => void;
}

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({
  data,
  currentEnergy,
  isOpen,
  onToggle,
  onConstraintSelect
}) => {
  const [activeTab, setActiveTab] = useState<'insights' | 'predictions' | 'recommendations' | 'constraints'>('predictions');
  const [selectedTimeframe] = useState<'next-hour' | 'next-day' | 'next-week'>('next-hour');
  
  // Enhanced AI insights using the new AI engine
  const insights = useMemo(() => {
    return AIInsightsEngine.generateInsights(data);
  }, [data]);

  const [aiPrediction, setAiPrediction] = useState<AIEnergyPrediction | null>(null);
  const [smartRecommendations, setSmartRecommendations] = useState<SmartRecommendation[]>([]);
  const [personalizedConstraints, setPersonalizedConstraints] = useState<PersonalizedConstraint[]>([]);

  useEffect(() => {
    if (data.length > 0) {
      // Initialize AI engine with data
      AIInsightsEngine.initialize(data);
      
      // Generate advanced AI features
      const prediction = AIInsightsEngine.predictNextEnergyLevel(selectedTimeframe);
      const recommendations = AIInsightsEngine.generateSmartRecommendations(currentEnergy?.overall || 75);
      const constraints = AIInsightsEngine.generatePersonalizedConstraints(currentEnergy?.overall || 75);
      
      setAiPrediction(prediction);
      setSmartRecommendations(recommendations);
      setPersonalizedConstraints(constraints);
    }
  }, [data, currentEnergy, selectedTimeframe]);

  const predictions = useMemo(() => {
    return AIInsightsEngine.generatePredictions(data);
  }, [data]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'pattern': return '🔍';
      case 'anomaly': return '⚠️';
      case 'recommendation': return '💡';
      case 'achievement': return '🏆';
      default: return '📊';
    }
  };

  const getImportanceClass = (importance: string): string => {
    switch (importance) {
      case 'high': return 'ai-insight-importance-high';
      case 'medium': return 'ai-insight-importance-medium';
      case 'low': return 'ai-insight-importance-low';
      default: return 'ai-insight-importance-medium';
    }
  };

  const getConfidenceClass = (confidence: number): string => {
    if (confidence >= 0.8) return 'ai-prediction-confidence-high';
    if (confidence >= 0.6) return 'ai-prediction-confidence-medium';
    return 'ai-prediction-confidence-low';
  };

  const handleTabClick = (tab: 'insights' | 'predictions' | 'recommendations' | 'constraints') => {
    setActiveTab(tab);
  };

  // Using direct string literals for ARIA values instead of expressions

  if (!isOpen) {
    return (
      <button
        className="ai-insights-fab"
        onClick={onToggle}
        title="AI Insights"
        aria-label="Open AI Insights Panel"
      >
        🤖
      </button>
    );
  }

  return (
    <div className="ai-insights-panel">
      {/* Header */}
      <div className="ai-insights-header">
        <h2 className="ai-insights-title">
          🤖 AI Insights
        </h2>
        <button
          className="ai-insights-close"
          onClick={onToggle}
          aria-label="Close AI Insights Panel"
        >
          ×
        </button>
      </div>

        {/* Tabs */}
        <div className="ai-insights-tabs" role="tablist" aria-label="AI Insights Navigation">
          {activeTab === 'insights' ? (
            <button
              className="ai-insights-tab ai-insights-tab-active"
              onClick={() => handleTabClick('insights')}
              role="tab"
              aria-selected="true"
              aria-controls="insights-panel"
              id="insights-tab"
            >
              💡 Insights ({insights.length})
            </button>
          ) : (
            <button
              className="ai-insights-tab"
              onClick={() => handleTabClick('insights')}
              role="tab"
              aria-selected="false"
              aria-controls="insights-panel"
              id="insights-tab"
            >
              💡 Insights ({insights.length})
            </button>
          )}
          
          {/* New AI Predictions Tab */}
          {activeTab === 'predictions' ? (
            <button
              className="ai-insights-tab ai-insights-tab-active"
              onClick={() => handleTabClick('predictions')}
              role="tab"
              aria-selected="true"
              aria-controls="predictions-panel"
              id="predictions-tab"
            >
              🔮 Classic Predictions ({predictions.length})
            </button>
          ) : (
            <button
              className="ai-insights-tab"
              onClick={() => handleTabClick('predictions')}
              role="tab"
              aria-selected="false"
              aria-controls="predictions-panel"
              id="predictions-tab"
            >
              🔮 Classic Predictions ({predictions.length})
            </button>
          )}

          {/* New AI Smart Recommendations Tab */}
          {activeTab === 'recommendations' ? (
            <button
              className="ai-insights-tab ai-insights-tab-active"
              onClick={() => handleTabClick('recommendations')}
              role="tab"
              aria-selected="true"
            >
              🤖 AI Recommendations ({smartRecommendations.length})
            </button>
          ) : (
            <button
              className="ai-insights-tab"
              onClick={() => handleTabClick('recommendations')}
              role="tab"
              aria-selected="false"
            >
              🤖 AI Recommendations ({smartRecommendations.length})
            </button>
          )}

          {/* New AI Constraints Tab */}
          {activeTab === 'constraints' ? (
            <button
              className="ai-insights-tab ai-insights-tab-active"
              onClick={() => handleTabClick('constraints')}
              role="tab"
              aria-selected="true"
            >
              🎯 AI Constraints ({personalizedConstraints.length})
            </button>
          ) : (
            <button
              className="ai-insights-tab"
              onClick={() => handleTabClick('constraints')}
              role="tab"
              aria-selected="false"
            >
              🎯 AI Constraints ({personalizedConstraints.length})
            </button>
          )}
        </div>

        {/* Content */}
        {activeTab === 'insights' && (
          <div 
            id="insights-panel"
            role="tabpanel"
            aria-labelledby="insights-tab"
            className="ai-insights-content"
          >
            {insights.length === 0 ? (
              <div className="ai-insights-empty">
                <div className="ai-insights-empty-icon">📊</div>
                <h3 className="ai-insights-empty-title">Not Enough Data Yet</h3>
                <p className="ai-insights-empty-text">Keep tracking your energy for a week to get AI-powered insights!</p>
              </div>
            ) : (
              <div className="ai-insights-list">
                {insights.map(insight => (
                  <div
                    key={insight.id}
                    className={`ai-insight-item ${getImportanceClass(insight.importance)}`}
                  >
                    <div className="ai-insight-content">
                      <div className="ai-insight-icon-container">
                        <span className="ai-insight-icon">
                          {getInsightIcon(insight.type)}
                        </span>
                      </div>
                      <div className="ai-insight-body">
                        <div className="ai-insight-header">
                          <h4 className="ai-insight-title">
                            {insight.title}
                          </h4>
                          <span className="ai-insight-importance-badge">
                            {insight.importance}
                          </span>
                        </div>
                        <p className="ai-insight-description">
                          {insight.description}
                        </p>
                        <span className="ai-insight-timestamp">
                          {insight.timestamp.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'predictions' && (
          <div 
            id="predictions-panel"
            role="tabpanel"
            aria-labelledby="predictions-tab"
            className="ai-predictions-content"
          >
            {predictions.length === 0 ? (
              <div className="ai-insights-empty">
                <div className="ai-insights-empty-icon">🔮</div>
                <h3 className="ai-insights-empty-title">Predictions Coming Soon</h3>
                <p className="ai-insights-empty-text">Track your energy for 2 weeks to get AI predictions!</p>
              </div>
            ) : (
              <div className="ai-predictions-list">
                {predictions.map((prediction, index) => (
                  <div key={index} className="ai-prediction-item">
                    <div className="ai-prediction-header">
                      <h4 className="ai-prediction-date">
                        {prediction.timestamp.toLocaleDateString()}
                      </h4>
                      <div className="ai-prediction-confidence-container">
                        <span className={`ai-prediction-confidence ${getConfidenceClass(prediction.confidence)}`}>
                          {Math.round(prediction.confidence * 100)}% confidence
                        </span>
                      </div>
                    </div>
                    
                    <div className="ai-prediction-energy-grid">
                      <div className="ai-prediction-energy-item">
                        <div className="ai-prediction-energy-value ai-prediction-physical">
                          {Math.round(prediction.predictedEnergy.physical)}%
                        </div>
                        <div className="ai-prediction-energy-label">Physical</div>
                      </div>
                      <div className="ai-prediction-energy-item">
                        <div className="ai-prediction-energy-value ai-prediction-mental">
                          {Math.round(prediction.predictedEnergy.mental)}%
                        </div>
                        <div className="ai-prediction-energy-label">Mental</div>
                      </div>
                      <div className="ai-prediction-energy-item">
                        <div className="ai-prediction-energy-value ai-prediction-emotional">
                          {Math.round(prediction.predictedEnergy.emotional)}%
                        </div>
                        <div className="ai-prediction-energy-label">Emotional</div>
                      </div>
                      <div className="ai-prediction-energy-item">
                        <div className="ai-prediction-energy-value ai-prediction-creative">
                          {Math.round(prediction.predictedEnergy.creative)}%
                        </div>
                        <div className="ai-prediction-energy-label">Creative</div>
                      </div>
                    </div>

                    <div className="ai-prediction-factors">
                      <h5 className="ai-prediction-factors-title">
                        Prediction Factors:
                      </h5>
                      <ul className="ai-prediction-factors-list">
                        {prediction.factors.map((factor, factorIndex) => (
                          <li key={factorIndex} className="ai-prediction-factor">
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* New AI Recommendations Tab Content */}
        {activeTab === 'recommendations' && (
          <div className="ai-insights-content">
            <div className="ai-advanced-prediction">
              <h3>⚡ Next Hour Energy Prediction</h3>
              {aiPrediction ? (
                <div className="ai-prediction-card">
                  <div className="ai-prediction-main">
                    <div className="ai-prediction-value">
                      <span className="ai-energy-number">
                        {aiPrediction.predictedEnergy}
                      </span>
                      <span className="ai-energy-unit">/100</span>
                    </div>
                    <div className="ai-confidence">
                      {aiPrediction.accuracy}% confident
                    </div>
                  </div>
                  <p className="ai-prediction-recommendation">{aiPrediction.recommendation}</p>
                  <details className="ai-prediction-factors">
                    <summary>AI Analysis Factors</summary>
                    <ul>
                      {aiPrediction.factors.map((factor, index) => (
                        <li key={index}>{factor}</li>
                      ))}
                    </ul>
                  </details>
                </div>
              ) : (
                <p>Loading AI prediction...</p>
              )}
            </div>

            <div className="ai-recommendations-grid">
              <h3>💡 Smart Recommendations</h3>
              {smartRecommendations.length === 0 ? (
                <p>No recommendations available yet.</p>
              ) : (
                smartRecommendations.map(rec => (
                  <div key={rec.id} className={`ai-recommendation-card ${rec.type}`}>
                    <div className="ai-rec-header">
                      <span className="ai-rec-icon">{rec.icon}</span>
                      <div className="ai-rec-title-area">
                        <h4>{rec.title}</h4>
                        <span className="ai-rec-type">{rec.type}</span>
                      </div>
                      <span className="ai-rec-confidence">
                        {Math.round(rec.confidence * 100)}%
                      </span>
                    </div>
                    <p>{rec.description}</p>
                    <div className="ai-rec-meta">
                      <span className={`ai-rec-impact ${rec.energyImpact}`}>
                        {rec.energyImpact} energy
                      </span>
                      {rec.estimatedMinutes && (
                        <span className="ai-rec-time">~{rec.estimatedMinutes}min</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* New AI Constraints Tab Content */}
        {activeTab === 'constraints' && (
          <div className="ai-insights-content">
            <h3>🎯 AI-Personalized Creative Constraints</h3>
            {personalizedConstraints.length === 0 ? (
              <p>Loading personalized constraints...</p>
            ) : (
              <div className="ai-constraints-grid">
                {personalizedConstraints.map(constraint => (
                  <div key={constraint.id} className="ai-constraint-card">
                    <div className="ai-constraint-header">
                      <h4>{constraint.title}</h4>
                      <div className="ai-constraint-meta">
                        <span className={`ai-difficulty ${constraint.adaptedDifficulty}`}>
                          {constraint.adaptedDifficulty}
                        </span>
                        <span className="ai-duration">{constraint.duration}min</span>
                      </div>
                    </div>
                    <p>{constraint.description}</p>
                    <div className="ai-personalization">
                      <span className="ai-personalization-icon">🤖</span>
                      <p className="ai-personalization-reason">{constraint.personalizedReason}</p>
                    </div>
                    <div className="ai-constraint-details">
                      <div className="ai-energy-impact">
                        Energy Impact: 
                        <span className={constraint.estimatedEnergyImpact > 0 ? 'positive' : 'negative'}>
                          {constraint.estimatedEnergyImpact > 0 ? '+' : ''}{constraint.estimatedEnergyImpact}
                        </span>
                      </div>
                      <div className="ai-confidence-score">
                        AI Confidence: {Math.round(constraint.aiConfidence * 100)}%
                      </div>
                    </div>
                    {onConstraintSelect && (
                      <button 
                        className="ai-constraint-select"
                        onClick={() => onConstraintSelect(constraint)}
                      >
                        Start AI Constraint
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
    </div>
  );
};
