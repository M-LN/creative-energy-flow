/**
 * Social Optimization Dashboard
 * Comprehensive interface for social battery optimization and suggestions
 */

import React, { useState, useEffect, useCallback } from 'react';
import { SocialOptimizationService } from '../../services/SocialOptimizationService';
import { 
  SocialOptimizationSuggestion, 
  SocialOptimizationAnalysis, 
  SocialOptimizationMetrics 
} from '../../types/socialOptimization';
import './SocialOptimizationDashboard.css';

interface SocialOptimizationDashboardProps {
  className?: string;
}

export const SocialOptimizationDashboard: React.FC<SocialOptimizationDashboardProps> = ({ 
  className = '' 
}) => {
  const [activeTab, setActiveTab] = useState<'suggestions' | 'analysis' | 'metrics'>('suggestions');
  const [suggestions, setSuggestions] = useState<SocialOptimizationSuggestion[]>([]);
  const [analysis, setAnalysis] = useState<SocialOptimizationAnalysis | null>(null);
  const [metrics, setMetrics] = useState<SocialOptimizationMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'immediate' | 'daily-routine' | 'weekly-planning' | 'lifestyle-change'>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'confidence' | 'category' | 'recent'>('priority');

  const loadOptimizationData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get latest analysis
      const latestAnalysis = SocialOptimizationService.getLatestAnalysis();
      setAnalysis(latestAnalysis);
      
      // Get filtered suggestions
      const filteredSuggestions = SocialOptimizationService.getOptimizationSuggestions(filter, sortBy);
      setSuggestions(filteredSuggestions);
      
      // Get metrics
      const optimizationMetrics = SocialOptimizationService.getOptimizationMetrics();
      setMetrics(optimizationMetrics);
    } catch (error) {
      console.error('Error loading optimization data:', error);
    } finally {
      setLoading(false);
    }
  }, [filter, sortBy]);

  useEffect(() => {
    loadOptimizationData();
  }, [loadOptimizationData]);

  const handleImplementSuggestion = async (suggestionId: string) => {
    const success = SocialOptimizationService.implementSuggestion(suggestionId);
    if (success) {
      await loadOptimizationData();
    }
  };

  const handleSubmitFeedback = async (
    suggestionId: string, 
    helpful: boolean, 
    effectiveness?: number,
    difficulty?: 'easier' | 'as-expected' | 'harder'
  ) => {
    const success = SocialOptimizationService.submitFeedback(suggestionId, {
      helpful,
      implemented: true,
      effectiveness,
      difficulty
    });
    if (success) {
      await loadOptimizationData();
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return '🚨';
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'schedule-optimization': return '📅';
      case 'recovery-strategies': return '🧘';
      case 'interaction-management': return '👥';
      case 'energy-balance': return '⚡';
      case 'wellness-tips': return '💡';
      default: return '📋';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'immediate': return '⚡';
      case 'daily-routine': return '🔄';
      case 'weekly-planning': return '📆';
      case 'lifestyle-change': return '🔄';
      default: return '📝';
    }
  };

  const renderSuggestionsTab = () => (
    <div className="suggestions-tab">
      <div className="suggestions-header">
        <div className="header-content">
          <h3>💡 Social Battery Optimization Suggestions</h3>
          <p>Personalized recommendations to improve your social energy management</p>
        </div>
        
        <div className="suggestions-controls">
          <div className="control-group">
            <label htmlFor="suggestion-filter">Filter by Type:</label>
            <select
              id="suggestion-filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="filter-select"
            >
              <option value="all">All Suggestions</option>
              <option value="immediate">Immediate Actions</option>
              <option value="daily-routine">Daily Routine</option>
              <option value="weekly-planning">Weekly Planning</option>
              <option value="lifestyle-change">Lifestyle Changes</option>
            </select>
          </div>
          
          <div className="control-group">
            <label htmlFor="suggestion-sort">Sort by:</label>
            <select
              id="suggestion-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="sort-select"
            >
              <option value="priority">Priority</option>
              <option value="confidence">Confidence</option>
              <option value="category">Category</option>
              <option value="recent">Recently Added</option>
            </select>
          </div>
        </div>
      </div>

      {suggestions.length === 0 ? (
        <div className="empty-suggestions">
          <div className="empty-icon">🌟</div>
          <h4>No suggestions available</h4>
          <p>Generate an analysis with your social battery data to receive personalized optimization suggestions.</p>
        </div>
      ) : (
        <div className="suggestions-grid">
          {suggestions.map(suggestion => (
            <div key={suggestion.id} className={`suggestion-card ${suggestion.priority}`}>
              <div className="suggestion-header">
                <div className="suggestion-meta">
                  <span className="priority-badge">
                    {getPriorityIcon(suggestion.priority)} {suggestion.priority.toUpperCase()}
                  </span>
                  <span className="category-badge">
                    {getCategoryIcon(suggestion.category)} {suggestion.category.replace('-', ' ')}
                  </span>
                  <span className="type-badge">
                    {getTypeIcon(suggestion.type)} {suggestion.type.replace('-', ' ')}
                  </span>
                </div>
                <div className="confidence-score">
                  {Math.round(suggestion.confidence * 100)}% confidence
                </div>
              </div>

              <div className="suggestion-content">
                <h4 className="suggestion-title">{suggestion.title}</h4>
                <p className="suggestion-description">{suggestion.description}</p>

                <div className="implementation-details">
                  <h5>📋 Implementation Steps:</h5>
                  <ul>
                    {suggestion.implementation.steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ul>
                  
                  <div className="implementation-meta">
                    <span className="time-to-effect">
                      ⏱️ {suggestion.implementation.estimatedTimeToEffect}
                    </span>
                    <span className="difficulty">
                      📊 {suggestion.implementation.difficulty} difficulty
                    </span>
                  </div>
                </div>

                <div className="expected-benefits">
                  <h5>✨ Expected Benefits:</h5>
                  <ul>
                    {suggestion.expectedBenefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="suggestion-actions">
                {!suggestion.implemented ? (
                  <button
                    onClick={() => handleImplementSuggestion(suggestion.id)}
                    className="implement-btn"
                  >
                    ✅ Mark as Implemented
                  </button>
                ) : (
                  <div className="feedback-section">
                    <span className="implemented-badge">✅ Implemented</span>
                    {!suggestion.userFeedback && (
                      <div className="feedback-controls">
                        <button
                          onClick={() => handleSubmitFeedback(suggestion.id, true, 4, 'as-expected')}
                          className="feedback-btn positive"
                        >
                          👍 Helpful
                        </button>
                        <button
                          onClick={() => handleSubmitFeedback(suggestion.id, false, 2, 'harder')}
                          className="feedback-btn negative"
                        >
                          👎 Not Helpful
                        </button>
                      </div>
                    )}
                    {suggestion.userFeedback && (
                      <div className="feedback-summary">
                        <span className="feedback-status">
                          {suggestion.userFeedback.helpful ? '👍 Marked as helpful' : '👎 Marked as not helpful'}
                        </span>
                        {suggestion.userFeedback.effectiveness && (
                          <span className="effectiveness-rating">
                            ⭐ {suggestion.userFeedback.effectiveness}/5 effectiveness
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAnalysisTab = () => (
    <div className="analysis-tab">
      <div className="analysis-header">
        <h3>📊 Social Battery Pattern Analysis</h3>
        <p>Insights from your social energy data</p>
      </div>

      {!analysis ? (
        <div className="no-analysis">
          <div className="no-analysis-icon">📈</div>
          <h4>No analysis available</h4>
          <p>Analysis is generated automatically when you have sufficient social battery data (7+ days).</p>
        </div>
      ) : (
        <div className="analysis-content">
          <div className="analysis-summary">
            <h4>📋 Analysis Summary</h4>
            <div className="summary-stats">
              <div className="stat-item">
                <span className="stat-label">Analysis Date:</span>
                <span className="stat-value">{new Date(analysis.analysisDate).toLocaleDateString()}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Data Range:</span>
                <span className="stat-value">{analysis.dataRange.daysAnalyzed} days</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Patterns Found:</span>
                <span className="stat-value">{analysis.patterns.length}</span>
              </div>
            </div>
          </div>

          <div className="insights-section">
            <h4>🔍 Key Insights</h4>
            <div className="insights-grid">
              <div className="insight-card">
                <h5>📈 Current Trend</h5>
                <div className="insight-value trend">
                  {analysis.insights.currentTrend === 'improving' && '📈 Improving'}
                  {analysis.insights.currentTrend === 'declining' && '📉 Declining'}
                  {analysis.insights.currentTrend === 'stable' && '➡️ Stable'}
                  {analysis.insights.currentTrend === 'fluctuating' && '📊 Fluctuating'}
                </div>
              </div>
              
              <div className="insight-card">
                <h5>🔋 Average Social Battery</h5>
                <div className="insight-value battery">
                  {Math.round(analysis.insights.avgSocialBattery)}%
                </div>
              </div>
              
              <div className="insight-card">
                <h5>⏱️ Average Recovery Time</h5>
                <div className="insight-value recovery">
                  {analysis.insights.avgRecoveryTime.toFixed(1)} hours
                </div>
              </div>
            </div>

            {analysis.insights.optimalInteractionWindows.length > 0 && (
              <div className="optimal-windows">
                <h5>⏰ Optimal Interaction Windows</h5>
                <div className="windows-list">
                  {analysis.insights.optimalInteractionWindows.map((window, index) => (
                    <div key={index} className="window-item">
                      <span className="window-time">
                        {window.startHour}:00 - {window.endHour}:00
                      </span>
                      <span className="window-confidence">
                        {Math.round(window.confidence * 100)}% confidence
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysis.insights.riskFactors.length > 0 && (
              <div className="risk-factors">
                <h5>⚠️ Risk Factors</h5>
                <ul>
                  {analysis.insights.riskFactors.map((risk, index) => (
                    <li key={index}>{risk}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.insights.strengths.length > 0 && (
              <div className="strengths">
                <h5>💪 Strengths</h5>
                <ul>
                  {analysis.insights.strengths.map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="patterns-section">
            <h4>🔍 Detected Patterns</h4>
            <div className="patterns-list">
              {analysis.patterns.map(pattern => (
                <div key={pattern.id} className="pattern-card">
                  <div className="pattern-header">
                    <span className="pattern-type">{pattern.type.replace('-', ' ')}</span>
                    <span className="pattern-confidence">
                      {Math.round(pattern.confidence * 100)}% confidence
                    </span>
                  </div>
                  <p className="pattern-description">{pattern.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderMetricsTab = () => (
    <div className="metrics-tab">
      <div className="metrics-header">
        <h3>📊 Optimization Metrics</h3>
        <p>Track your progress and improvement</p>
      </div>

      {!metrics ? (
        <div className="no-metrics">
          <div className="no-metrics-icon">📈</div>
          <h4>No metrics available</h4>
          <p>Metrics will appear once you start implementing suggestions.</p>
        </div>
      ) : (
        <div className="metrics-content">
          <div className="metrics-overview">
            <div className="metric-card">
              <h4>📋 Total Suggestions</h4>
              <div className="metric-value">{metrics.totalSuggestions}</div>
            </div>
            
            <div className="metric-card">
              <h4>✅ Implementation Rate</h4>
              <div className="metric-value">{Math.round(metrics.implementationRate * 100)}%</div>
            </div>
            
            <div className="metric-card">
              <h4>⭐ Average Effectiveness</h4>
              <div className="metric-value">{metrics.averageEffectiveness.toFixed(1)}/5</div>
            </div>
            
            <div className="metric-card">
              <h4>💬 Feedback Rate</h4>
              <div className="metric-value">{Math.round(metrics.userEngagement.positiveRate * 100)}%</div>
            </div>
          </div>

          <div className="improvement-metrics">
            <h4>📈 Improvement Metrics</h4>
            <div className="improvement-grid">
              <div className="improvement-item">
                <span className="improvement-label">Social Battery Increase:</span>
                <span className="improvement-value">+{metrics.improvementMetrics.socialBatteryIncrease.toFixed(1)}%</span>
              </div>
              <div className="improvement-item">
                <span className="improvement-label">Recovery Time Decrease:</span>
                <span className="improvement-value">-{metrics.improvementMetrics.recoveryTimeDecrease.toFixed(1)} minutes</span>
              </div>
              <div className="improvement-item">
                <span className="improvement-label">Interaction Quality:</span>
                <span className="improvement-value">+{metrics.improvementMetrics.interactionQualityImprovement.toFixed(1)}%</span>
              </div>
              <div className="improvement-item">
                <span className="improvement-label">Overall Satisfaction:</span>
                <span className="improvement-value">+{metrics.improvementMetrics.overallSatisfaction.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="category-breakdown">
            <h4>📊 Category Breakdown</h4>
            <div className="breakdown-chart">
              {Object.entries(metrics.categoryBreakdown).map(([category, count]) => (
                <div key={category} className="breakdown-item">
                  <span className="breakdown-label">
                    {getCategoryIcon(category)} {category.replace('-', ' ')}
                  </span>
                  <span className="breakdown-bar">
                    <div 
                      className="breakdown-fill" 
                      data-width={`${(count / metrics.totalSuggestions) * 100}%`}
                    ></div>
                  </span>
                  <span className="breakdown-count">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className={`social-optimization-dashboard loading ${className}`}>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading optimization data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`social-optimization-dashboard ${className}`}>
      <div className="dashboard-header">
        <h2>🧘‍♀️ Social Battery Optimization</h2>
        <p>Intelligent suggestions to improve your social energy management</p>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === 'suggestions' ? 'active' : ''}`}
          onClick={() => setActiveTab('suggestions')}
        >
          💡 Suggestions ({suggestions.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'analysis' ? 'active' : ''}`}
          onClick={() => setActiveTab('analysis')}
        >
          📊 Analysis
        </button>
        <button
          className={`tab-btn ${activeTab === 'metrics' ? 'active' : ''}`}
          onClick={() => setActiveTab('metrics')}
        >
          📈 Metrics
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'suggestions' && renderSuggestionsTab()}
        {activeTab === 'analysis' && renderAnalysisTab()}
        {activeTab === 'metrics' && renderMetricsTab()}
      </div>
    </div>
  );
};
