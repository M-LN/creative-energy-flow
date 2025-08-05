import React, { useState, useEffect, useMemo } from 'react';
import { EnergyLevel, EnergyInsight, EnergyPrediction } from '../types/energy';
import { AIInsightsEngine } from '../services/AIInsightsEngine';
import { ENERGY_COLORS } from '../utils/colors';

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

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return ENERGY_COLORS.textSecondary;
    }
  };

  const getPredictionConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#10B981';
    if (confidence >= 0.6) return '#F59E0B';
    return '#EF4444';
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        style={{
          position: 'fixed',
          bottom: '110px',
          right: '30px',
          backgroundColor: ENERGY_COLORS.mental,
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
        title="AI Insights"
      >
        🤖
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: ENERGY_COLORS.surface,
        borderRadius: '16px',
        padding: '30px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{
            color: ENERGY_COLORS.text,
            fontSize: '24px',
            fontWeight: 'bold',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            🤖 AI Insights
          </h2>
          <button
            onClick={onToggle}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              color: ENERGY_COLORS.textSecondary,
              cursor: 'pointer',
              padding: '5px',
              borderRadius: '4px'
            }}
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          marginBottom: '20px',
          borderRadius: '8px',
          backgroundColor: ENERGY_COLORS.background,
          padding: '4px'
        }}>
          <button
            onClick={() => setActiveTab('insights')}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: activeTab === 'insights' ? ENERGY_COLORS.mental : 'transparent',
              color: activeTab === 'insights' ? 'white' : ENERGY_COLORS.text,
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            💡 Insights ({insights.length})
          </button>
          <button
            onClick={() => setActiveTab('predictions')}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: activeTab === 'predictions' ? ENERGY_COLORS.mental : 'transparent',
              color: activeTab === 'predictions' ? 'white' : ENERGY_COLORS.text,
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            🔮 Predictions ({predictions.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === 'insights' && (
          <div>
            {insights.length === 0 ? (
              <div style={{
                textAlign: 'center',
                color: ENERGY_COLORS.textSecondary,
                padding: '40px 20px'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
                <h3 style={{ color: ENERGY_COLORS.text, marginBottom: '8px' }}>Not Enough Data Yet</h3>
                <p>Keep tracking your energy for a week to get AI-powered insights!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {insights.map(insight => (
                  <div
                    key={insight.id}
                    style={{
                      backgroundColor: ENERGY_COLORS.background,
                      borderRadius: '12px',
                      padding: '20px',
                      borderLeft: `4px solid ${getImportanceColor(insight.importance)}`
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      marginBottom: '8px'
                    }}>
                      <span style={{ fontSize: '24px' }}>
                        {getInsightIcon(insight.type)}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '8px'
                        }}>
                          <h4 style={{
                            color: ENERGY_COLORS.text,
                            fontSize: '16px',
                            fontWeight: '600',
                            margin: 0
                          }}>
                            {insight.title}
                          </h4>
                          <span style={{
                            backgroundColor: getImportanceColor(insight.importance),
                            color: 'white',
                            fontSize: '10px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            textTransform: 'uppercase',
                            fontWeight: 'bold'
                          }}>
                            {insight.importance}
                          </span>
                        </div>
                        <p style={{
                          color: ENERGY_COLORS.textSecondary,
                          fontSize: '14px',
                          margin: '0 0 8px 0',
                          lineHeight: '1.5'
                        }}>
                          {insight.description}
                        </p>
                        <span style={{
                          color: ENERGY_COLORS.textSecondary,
                          fontSize: '12px'
                        }}>
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
          <div>
            {predictions.length === 0 ? (
              <div style={{
                textAlign: 'center',
                color: ENERGY_COLORS.textSecondary,
                padding: '40px 20px'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔮</div>
                <h3 style={{ color: ENERGY_COLORS.text, marginBottom: '8px' }}>Predictions Coming Soon</h3>
                <p>Track your energy for 2 weeks to get AI predictions!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {predictions.map((prediction, index) => (
                  <div
                    key={index}
                    style={{
                      backgroundColor: ENERGY_COLORS.background,
                      borderRadius: '12px',
                      padding: '20px'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '16px'
                    }}>
                      <h4 style={{
                        color: ENERGY_COLORS.text,
                        fontSize: '16px',
                        fontWeight: '600',
                        margin: 0
                      }}>
                        {prediction.timestamp.toLocaleDateString()}
                      </h4>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{
                          color: getPredictionConfidenceColor(prediction.confidence),
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {Math.round(prediction.confidence * 100)}% confidence
                        </span>
                      </div>
                    </div>
                    
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                      gap: '12px',
                      marginBottom: '16px'
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: ENERGY_COLORS.physical, fontSize: '18px', fontWeight: 'bold' }}>
                          {Math.round(prediction.predictedEnergy.physical)}%
                        </div>
                        <div style={{ color: ENERGY_COLORS.textSecondary, fontSize: '12px' }}>Physical</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: ENERGY_COLORS.mental, fontSize: '18px', fontWeight: 'bold' }}>
                          {Math.round(prediction.predictedEnergy.mental)}%
                        </div>
                        <div style={{ color: ENERGY_COLORS.textSecondary, fontSize: '12px' }}>Mental</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: ENERGY_COLORS.emotional, fontSize: '18px', fontWeight: 'bold' }}>
                          {Math.round(prediction.predictedEnergy.emotional)}%
                        </div>
                        <div style={{ color: ENERGY_COLORS.textSecondary, fontSize: '12px' }}>Emotional</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: ENERGY_COLORS.creative, fontSize: '18px', fontWeight: 'bold' }}>
                          {Math.round(prediction.predictedEnergy.creative)}%
                        </div>
                        <div style={{ color: ENERGY_COLORS.textSecondary, fontSize: '12px' }}>Creative</div>
                      </div>
                    </div>

                    <div style={{
                      backgroundColor: ENERGY_COLORS.surface,
                      borderRadius: '8px',
                      padding: '12px'
                    }}>
                      <h5 style={{
                        color: ENERGY_COLORS.text,
                        fontSize: '12px',
                        fontWeight: '600',
                        margin: '0 0 8px 0',
                        textTransform: 'uppercase'
                      }}>
                        Prediction Factors:
                      </h5>
                      <ul style={{
                        margin: 0,
                        padding: '0 0 0 16px',
                        color: ENERGY_COLORS.textSecondary,
                        fontSize: '12px'
                      }}>
                        {prediction.factors.map((factor, factorIndex) => (
                          <li key={factorIndex} style={{ marginBottom: '4px' }}>
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
