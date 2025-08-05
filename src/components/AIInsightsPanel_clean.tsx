import React, { useState, useMemo } from 'react';
import { EnergyLevel } from '../types/energy';
import { AIInsightsEngine } from '../services/AIInsightsEngine';
import './AIInsightsPanel.css';

interface AIInsightsPanelProps {
  data: EnergyLevel[];
  isOpen: boolean;
  onToggle: () => void;
}

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({
  data,
  isOpen,
  onToggle
}) => {
  const [activeTab, setActiveTab] = useState<'insights' | 'predictions'>('insights');
  
  const insights = useMemo(() => {
    return AIInsightsEngine.generateInsights(data);
  }, [data]);

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

  const handleTabClick = (tab: 'insights' | 'predictions') => {
    setActiveTab(tab);
  };

  // We'll use direct string literals for ARIA values instead of variables

  if (!isOpen) {
    return (
      <button
        className="ai-insights-toggle-button"
        onClick={onToggle}
        title="AI Insights"
        aria-label="Open AI Insights Panel"
      >
        🤖
      </button>
    );
  }

  return (
    <div className="ai-insights-modal-overlay">
      <div className="ai-insights-modal">
        {/* Header */}
        <div className="ai-insights-modal-header">
          <h2 className="ai-insights-modal-title">
            🤖 AI Insights
          </h2>
          <button
            className="ai-insights-close-button"
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
          {activeTab === 'predictions' ? (
            <button
              className="ai-insights-tab ai-insights-tab-active"
              onClick={() => handleTabClick('predictions')}
              role="tab"
              aria-selected="true"
              aria-controls="predictions-panel"
              id="predictions-tab"
            >
              🔮 Predictions ({predictions.length})
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
              🔮 Predictions ({predictions.length})
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
      </div>
    </div>
  );
};
