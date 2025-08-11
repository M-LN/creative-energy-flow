import React, { useState, useMemo, useEffect } from 'react';
import { EnergyFlowChart } from './charts/EnergyFlowChart';
import { SocialBatteryChart } from './charts/SocialBatteryChart';
import { EnergyTypeChart } from './charts/EnergyTypeChart';
import { WeeklyEnergyHeatmap } from './charts/WeeklyEnergyHeatmap';
import { AIInsightsPanel } from './AIInsightsPanel';
import { AIChatAssistant } from './AIChatAssistant';
import ProactiveInsights from './ProactiveInsights';
import { EnergyDataService } from '../data/energyDataService';
import { StorageService } from '../services/StorageService';
import { EnergyType, TimeRange, EnergyLevel } from '../types/energy';
import './ModernEnergyDashboard.css';

// Tab configuration for better UX
type TabId = 'overview' | 'insights' | 'social' | 'settings';

interface DashboardTab {
  id: TabId;
  label: string;
  icon: string;
  description: string;
  badgeCount?: number;
}

export const ModernEnergyDashboard: React.FC = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Existing state
  const [userEnergyData, setUserEnergyData] = useState<EnergyLevel[]>([]);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [showLegacyAIPanel, setShowLegacyAIPanel] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showAdvancedAnalytics, setShowAdvancedAnalytics] = useState(false);
  const [dataSource, setDataSource] = useState<'sample' | 'user' | 'both'>('sample');
  const [selectedEnergyTypes, setSelectedEnergyTypes] = useState<EnergyType[]>(['physical', 'mental', 'emotional', 'creative']);
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [showSocialCorrelation, setShowSocialCorrelation] = useState(false);

  // Smart tab configuration - Simplified for everyday use
  const tabs: DashboardTab[] = useMemo(() => [
    {
      id: 'overview',
      label: 'Overview',
      icon: '📊',
      description: 'Energy dashboard and tracking',
      badgeCount: userEnergyData.length > 0 ? 1 : undefined
    },
    {
      id: 'insights',
      label: 'AI Insights',
      icon: '🧠',
      description: 'Smart proactive insights',
      badgeCount: 3 // Number of daily insights
    },
    {
      id: 'social',
      label: 'Social Battery',
      icon: '🔋',
      description: 'Social energy tracking',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      description: 'Customize your experience',
    }
  ], [userEnergyData.length]);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = StorageService.loadEnergyData();
    if (savedData.length > 0) {
      const processedData = savedData.map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      }));
      setUserEnergyData(processedData);
      setDataSource('both');
    }
  }, []);

  // Save data whenever userEnergyData changes
  useEffect(() => {
    if (userEnergyData.length > 0) {
      StorageService.saveEnergyData(userEnergyData);
    }
  }, [userEnergyData]);

  // Generate sample data
  const sampleEnergyData = useMemo(() => EnergyDataService.generateEnergyData(30), []);
  const socialData = useMemo(() => EnergyDataService.generateSocialBatteryData(30), []);
  
  // Combine user data with sample data based on data source selection
  const combinedEnergyData = useMemo(() => {
    switch (dataSource) {
      case 'user':
        return userEnergyData.length > 0 ? userEnergyData : sampleEnergyData;
      case 'sample':
        return sampleEnergyData;
      case 'both':
      default:
        return userEnergyData.length > 0 
          ? [...sampleEnergyData, ...userEnergyData].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
          : sampleEnergyData;
    }
  }, [dataSource, userEnergyData, sampleEnergyData]);

  // Filter data based on selected time range
  const filteredData = useMemo(() => {
    const now = new Date();
    const msInDay = 24 * 60 * 60 * 1000;
    
    let days: number;
    switch (timeRange) {
      case '7d': days = 7; break;
      case '30d': days = 30; break;
      case '90d': days = 90; break;
      default: days = 7;
    }
    
    const cutoffDate = new Date(now.getTime() - days * msInDay);
    return combinedEnergyData.filter(entry => entry.timestamp >= cutoffDate);
  }, [combinedEnergyData, timeRange]);

  // Calculate daily averages for correlation (future use)
  // const dailyAverages = useMemo(() => {
  //   const dailyMap = new Map<string, { sum: number; count: number }>();
    
  //   filteredData.forEach(entry => {
  //     const dateStr = entry.timestamp.toDateString();
  //     const current = dailyMap.get(dateStr) || { sum: 0, count: 0 };
  //     dailyMap.set(dateStr, {
  //       sum: current.sum + entry.overall,
  //       count: current.count + 1
  //     });
  //   });
    
  //   return Array.from(dailyMap.entries()).map(([dateStr, data]) => ({
  //     date: new Date(dateStr),
  //     value: data.sum / data.count
  //   }));
  // }, [filteredData]);

  // Add new energy entry
  const addEnergyEntry = (entry: Omit<EnergyLevel, 'timestamp'>) => {
    const newEntry: EnergyLevel = {
      ...entry,
      timestamp: new Date()
    };
    setUserEnergyData(prev => [...prev, newEntry]);
  };

  // Handle tab change
  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  // Handle proactive insight actions
  const handleInsightAction = (action: string, insight: any) => {
    console.log('Insight action:', action, insight);
    // Implement specific actions based on the action type
    switch (action) {
      case 'View energy dashboard':
        setActiveTab('overview');
        break;
      case 'View detailed analytics':
        // Navigate to settings and show advanced analytics
        setActiveTab('settings');
        setShowAdvancedAnalytics(true);
        break;
      case 'Plan your day':
      case 'Set energy goals':
        // Could open a planning modal or navigate to settings
        break;
      default:
        break;
    }
  };

  return (
    <div className="modern-energy-dashboard">
      {/* Mobile Header */}
      <div className="mobile-header">
        <div className="mobile-header-content">
          <h1 className="app-title">
            <span className="app-icon">⚡</span>
            Energy Flow
          </h1>
          <button
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className={`dashboard-tabs ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="tabs-container">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.id)}
              aria-label={`${tab.label}: ${tab.description}`}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
              {tab.badgeCount && (
                <span className="tab-badge" aria-label={`${tab.badgeCount} items`}>
                  {tab.badgeCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Tab Content */}
      <main className="tab-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="tab-panel overview-panel">
            <div className="panel-header">
              <h2>Energy Overview</h2>
              <p>Track and visualize your energy patterns</p>
            </div>

            {/* Quick Add Energy Form */}
            <div className="quick-add-section">
              <h3>Log Current Energy</h3>
              <div className="quick-add-form">
                <QuickEnergyForm onSubmit={addEnergyEntry} />
              </div>
            </div>

            {/* Main Energy Chart */}
            <div className="chart-section">
              <EnergyFlowChart
                data={filteredData}
                energyTypes={selectedEnergyTypes}
                timeRange={timeRange === '7d' ? 'week' : timeRange === '30d' ? 'month' : 'quarter'}
                showArea={false}
                showOverall={true}
                height={400}
              />
            </div>

            {/* Quick Stats */}
            <div className="quick-stats-grid">
              {selectedEnergyTypes.slice(0, 4).map(energyType => {
                const stats = EnergyDataService.calculateStatistics(filteredData, energyType);
                return stats ? (
                  <div key={energyType} className="quick-stat-card">
                    <h4>{energyType}</h4>
                    <div className="stat-value">{stats.average}%</div>
                    <div className="stat-trend">
                      {stats.trend > 0 ? '↗️' : stats.trend < 0 ? '↘️' : '➡️'}
                      {Math.abs(stats.trend)}%
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* AI Insights Tab */}
        {activeTab === 'insights' && (
          <div className="tab-panel insights-panel">
            <div className="panel-header">
              <h2>Smart AI Insights</h2>
              <p>Personalized recommendations based on your patterns</p>
            </div>

            <ProactiveInsights
              energyData={combinedEnergyData}
              onActionClick={handleInsightAction}
            />

            {/* AI Chat Section */}
            <div className="ai-chat-section">
              <div className="ai-chat-header">
                <h3>AI Energy Coach</h3>
                <p>Chat with your personal AI energy assistant for tailored advice and insights</p>
                <button 
                  className="toggle-ai-chat-btn"
                  onClick={() => setShowAIChat(!showAIChat)}
                >
                  {showAIChat ? 'Hide AI Chat' : 'Open AI Chat'} 💬
                </button>
              </div>

              {showAIChat && (
                <AIChatAssistant
                  data={combinedEnergyData}
                  currentEnergy={combinedEnergyData[combinedEnergyData.length - 1] || { 
                    timestamp: new Date(), 
                    overall: 75, 
                    physical: 75, 
                    mental: 75, 
                    emotional: 75, 
                    creative: 75 
                  }}
                  isOpen={true}
                  onToggle={() => setShowAIChat(false)}
                />
              )}
            </div>

            {/* Legacy AI Insights Panel */}
            <div className="legacy-insights-section">
              <div className="legacy-insights-header">
                <h3>Advanced AI Analytics</h3>
                <p>Detailed predictions, recommendations, and constraints analysis</p>
                <button 
                  className="toggle-legacy-ai-btn"
                  onClick={() => setShowLegacyAIPanel(!showLegacyAIPanel)}
                >
                  {showLegacyAIPanel ? 'Hide Analytics' : 'Show Advanced Analytics'} �
                </button>
              </div>

              {showLegacyAIPanel && (
                <AIInsightsPanel
                  data={combinedEnergyData}
                  currentEnergy={combinedEnergyData[combinedEnergyData.length - 1] || { 
                    timestamp: new Date(), 
                    overall: 75, 
                    physical: 75, 
                    mental: 75, 
                    emotional: 75, 
                    creative: 75 
                  }}
                  isOpen={true}
                  onToggle={() => setShowLegacyAIPanel(false)}
                />
              )}
            </div>
          </div>
        )}

        {/* Social Battery Tab */}
        {activeTab === 'social' && (
          <div className="tab-panel social-panel">
            <div className="panel-header">
              <h2>Social Battery</h2>
              <p>Track your social energy and interactions</p>
            </div>

            <div className="social-controls">
              <label className="social-correlation-toggle">
                <input
                  type="checkbox"
                  checked={showSocialCorrelation}
                  onChange={(e) => setShowSocialCorrelation(e.target.checked)}
                />
                Show Energy Correlation
              </label>
            </div>

            <div className="chart-section">
              <SocialBatteryChart
                socialData={socialData}
                energyData={undefined}
                showCorrelation={false}
              />
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="tab-panel settings-panel">
            <div className="panel-header">
              <h2>Settings</h2>
              <p>Customize your energy tracking experience</p>
            </div>

            <div className="settings-groups">
              <div className="setting-group">
                <h3>Data Source</h3>
                <div className="setting-options">
                  {(['sample', 'user', 'both'] as const).map(source => (
                    <label key={source} className="radio-option">
                      <input
                        type="radio"
                        name="dataSource"
                        value={source}
                        checked={dataSource === source}
                        onChange={(e) => setDataSource(e.target.value as any)}
                      />
                      <span className="radio-label">
                        {source === 'sample' ? 'Sample Data' : 
                         source === 'user' ? 'Your Data Only' : 
                         'Combined Data'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="setting-group">
                <h3>Default Time Range</h3>
                <label htmlFor="default-time-range">
                  <select
                    id="default-time-range"
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                    className="setting-select"
                    title="Select default time range"
                  >
                    <option value="7d">7 days</option>
                    <option value="30d">30 days</option>
                    <option value="90d">90 days</option>
                  </select>
                </label>
              </div>

              <div className="setting-group">
                <h3>AI Features</h3>
                <label className="setting-toggle">
                  <input
                    type="checkbox"
                    checked={showAIInsights}
                    onChange={(e) => setShowAIInsights(e.target.checked)}
                  />
                  Enable Smart Insights
                </label>
              </div>

              <div className="setting-group">
                <h3>Advanced Options</h3>
                <label className="setting-toggle">
                  <input
                    type="checkbox"
                    checked={showAdvancedAnalytics}
                    onChange={(e) => setShowAdvancedAnalytics(e.target.checked)}
                  />
                  Show Advanced Analytics
                </label>
                <p className="setting-description">
                  Display detailed charts, trends, and data visualizations for power users
                </p>
              </div>
            </div>

            {/* Advanced Analytics Section */}
            {showAdvancedAnalytics && (
              <div className="advanced-analytics-section">
                <div className="panel-header">
                  <h2>📈 Advanced Analytics</h2>
                  <p>Detailed charts and data analysis for deeper insights</p>
                </div>

                {/* Time Range and Energy Type Filters */}
                <div className="analytics-controls">
                  <div className="control-group">
                    <label htmlFor="analytics-time-range">Time Range:</label>
                    <select
                      id="analytics-time-range"
                      value={timeRange}
                      onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                      className="setting-select"
                    >
                      <option value="7d">Last 7 days</option>
                      <option value="30d">Last 30 days</option>
                      <option value="90d">Last 90 days</option>
                    </select>
                  </div>

                  <div className="control-group">
                    <label>Energy Types:</label>
                    <div className="energy-type-checkboxes">
                      {(['physical', 'mental', 'emotional', 'creative'] as const).map(type => (
                        <label key={type} className="checkbox-option">
                          <input
                            type="checkbox"
                            checked={selectedEnergyTypes.includes(type)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedEnergyTypes([...selectedEnergyTypes, type]);
                              } else {
                                setSelectedEnergyTypes(selectedEnergyTypes.filter(t => t !== type));
                              }
                            }}
                          />
                          {type}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Charts Grid */}
                <div className="analytics-charts-grid">
                  <div className="chart-section">
                    <EnergyTypeChart
                      data={filteredData}
                      energyTypes={selectedEnergyTypes}
                    />
                  </div>

                  <div className="chart-section">
                    <WeeklyEnergyHeatmap
                      data={filteredData}
                      energyType={'overall'}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

// Quick Energy Input Form Component
const QuickEnergyForm: React.FC<{ onSubmit: (entry: Omit<EnergyLevel, 'timestamp'>) => void }> = ({ onSubmit }) => {
  const [energy, setEnergy] = useState({
    physical: 70,
    mental: 70,
    emotional: 70,
    creative: 70,
    overall: 70
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(energy);
    // Reset form or provide feedback
  };

  const handleEnergyChange = (type: keyof typeof energy, value: number) => {
    const newEnergy = { ...energy, [type]: value };
    
    // Auto-calculate overall as average
    if (type !== 'overall') {
      newEnergy.overall = Math.round(
        (newEnergy.physical + newEnergy.mental + newEnergy.emotional + newEnergy.creative) / 4
      );
    }
    
    setEnergy(newEnergy);
  };

  return (
    <form onSubmit={handleSubmit} className="quick-energy-form">
      {Object.entries(energy).map(([type, value]) => (
        <div key={type} className="energy-slider-group">
          <label className="energy-label" htmlFor={`energy-${type}`}>
            {type.charAt(0).toUpperCase() + type.slice(1)}: {value}%
          </label>
          <input
            id={`energy-${type}`}
            type="range"
            min="0"
            max="100"
            value={value}
            onChange={(e) => handleEnergyChange(type as keyof typeof energy, parseInt(e.target.value))}
            className={`energy-slider energy-slider-${type}`}
            disabled={type === 'overall'}
            title={`${type.charAt(0).toUpperCase() + type.slice(1)} energy level: ${value}%`}
            aria-label={`${type.charAt(0).toUpperCase() + type.slice(1)} energy level`}
          />
        </div>
      ))}
      <button type="submit" className="submit-energy-btn">
        Log Energy ⚡
      </button>
    </form>
  );
};

export default ModernEnergyDashboard;
