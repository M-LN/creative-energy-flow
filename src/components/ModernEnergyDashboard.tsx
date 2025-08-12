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
import { EnergyType, TimeRange, EnergyLevel, SocialBatteryData } from '../types/energy';
import './ModernEnergyDashboard.css';

// Tab configuration for better UX
type TabId = 'overview' | 'insights' | 'chat' | 'social' | 'settings';

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
  const [showAIInsights, setShowAIInsights] = useState(() => {
    const saved = localStorage.getItem('energyFlow_showAIInsights');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [showAdvancedAnalytics, setShowAdvancedAnalytics] = useState(() => {
    const saved = localStorage.getItem('energyFlow_showAdvancedAnalytics');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [selectedEnergyTypes, setSelectedEnergyTypes] = useState<EnergyType[]>(() => {
    const saved = localStorage.getItem('energyFlow_selectedEnergyTypes');
    return saved !== null ? JSON.parse(saved) : ['physical', 'mental', 'emotional', 'creative'];
  });
  const [timeRange, setTimeRange] = useState<TimeRange>(() => {
    const saved = localStorage.getItem('energyFlow_timeRange');
    return saved !== null ? saved as TimeRange : '7d';
  });
  const [showSocialCorrelation, setShowSocialCorrelation] = useState(() => {
    const saved = localStorage.getItem('energyFlow_showSocialCorrelation');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [socialBatteryData, setSocialBatteryData] = useState<SocialBatteryData[]>([]);
  const [socialBatteryNotification, setSocialBatteryNotification] = useState<string | null>(null);

  // AI Daily Focus state
  const [dailyFocusCompleted, setDailyFocusCompleted] = useState<Set<string>>(new Set());
  const [focusNotification, setFocusNotification] = useState<string | null>(null);

  // Smart tab configuration - Simplified for everyday use
  const tabs: DashboardTab[] = useMemo(() => [
    {
      id: 'overview',
      label: 'Overview',
      icon: '📊',
      description: 'Energy dashboard and tracking'
    },
    {
      id: 'insights',
      label: 'AI Insights',
      icon: '🧠',
      description: 'Smart proactive insights'
    },
    {
      id: 'chat',
      label: 'AI Chat',
      icon: '💬',
      description: 'Chat with your AI assistant'
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
  ], []);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = StorageService.loadEnergyData();
    if (savedData.length > 0) {
      const processedData = savedData.map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      }));
      setUserEnergyData(processedData);
    }
  }, []);

  // Save data whenever userEnergyData changes
  useEffect(() => {
    if (userEnergyData.length > 0) {
      StorageService.saveEnergyData(userEnergyData);
    }
  }, [userEnergyData]);

  // Persist settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('energyFlow_showAIInsights', JSON.stringify(showAIInsights));
  }, [showAIInsights]);

  useEffect(() => {
    localStorage.setItem('energyFlow_showAdvancedAnalytics', JSON.stringify(showAdvancedAnalytics));
  }, [showAdvancedAnalytics]);

  useEffect(() => {
    localStorage.setItem('energyFlow_selectedEnergyTypes', JSON.stringify(selectedEnergyTypes));
  }, [selectedEnergyTypes]);

  useEffect(() => {
    localStorage.setItem('energyFlow_timeRange', timeRange);
  }, [timeRange]);

  useEffect(() => {
    localStorage.setItem('energyFlow_showSocialCorrelation', JSON.stringify(showSocialCorrelation));
  }, [showSocialCorrelation]);

  // Filter data based on selected time range
  const filteredData = useMemo(() => {
    if (userEnergyData.length === 0) {
      return []; // No user data available
    }

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
    return userEnergyData.filter((entry: EnergyLevel) => entry.timestamp >= cutoffDate);
  }, [userEnergyData, timeRange]);

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

  // Handle social battery level selection
  const handleSocialBatteryLevel = (level: number) => {
    const newEntry: SocialBatteryData = {
      timestamp: new Date(),
      level,
      socialInteractions: 0, // Could be expanded to track interactions
      drainEvents: [],
      rechargeEvents: []
    };
    
    setSocialBatteryData(prev => [...prev, newEntry]);
    
    // Show feedback to user
    const levelNames = {
      100: 'Fully Charged',
      50: 'Half Full', 
      25: 'Running Low',
      5: 'Need Recharge'
    };
    
    const levelName = levelNames[level as keyof typeof levelNames];
    setSocialBatteryNotification(`✅ Social battery set to: ${levelName}`);
    
    // Clear notification after 3 seconds
    setTimeout(() => {
      setSocialBatteryNotification(null);
    }, 3000);
    
    console.log(`Social battery level set to: ${levelName}`);
  };

  // AI-Powered Daily Focus Functions
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  const getAverageEnergyForTimeOfDay = (timeOfDay: string) => {
    const relevantData = userEnergyData.filter(entry => {
      const entryHour = new Date(entry.timestamp).getHours();
      const entryTimeOfDay = entryHour < 12 ? 'morning' : entryHour < 17 ? 'afternoon' : 'evening';
      return entryTimeOfDay === timeOfDay;
    });

    if (relevantData.length === 0) return 70; // Default if no data

    const avgPhysical = relevantData.reduce((sum, entry) => sum + entry.physical, 0) / relevantData.length;
    const avgMental = relevantData.reduce((sum, entry) => sum + entry.mental, 0) / relevantData.length;
    const avgEmotional = relevantData.reduce((sum, entry) => sum + entry.emotional, 0) / relevantData.length;
    const avgCreative = relevantData.reduce((sum, entry) => sum + entry.creative, 0) / relevantData.length;

    return {
      physical: Math.round(avgPhysical),
      mental: Math.round(avgMental),
      emotional: Math.round(avgEmotional),
      creative: Math.round(avgCreative),
      overall: Math.round((avgPhysical + avgMental + avgEmotional + avgCreative) / 4)
    };
  };

  const generateAIDailyFocus = () => {
    const timeOfDay = getTimeOfDay();
    const historicalAverage = getAverageEnergyForTimeOfDay(timeOfDay);
    const currentEnergy = userEnergyData[userEnergyData.length - 1] || null;
    
    if (timeOfDay === 'morning') {
      return {
        id: 'morning-focus',
        icon: '🌅',
        title: 'Morning Energy Boost',
        description: currentEnergy 
          ? `Your ${currentEnergy.physical < 60 ? 'body' : currentEnergy.mental < 60 ? 'mind' : 'creative self'} could use some attention today`
          : 'Start your day with intention and energy awareness',
        actionText: currentEnergy ? 'Get Personalized Plan' : 'Set Morning Intention',
        aiTip: typeof historicalAverage === 'object' 
          ? `Historically, your ${historicalAverage.physical < 70 ? 'physical' : historicalAverage.mental < 70 ? 'mental' : 'creative'} energy peaks in the morning. Use this time wisely!`
          : 'Morning is a great time to set energy intentions for the day'
      };
    } else if (timeOfDay === 'afternoon') {
      return {
        id: 'afternoon-focus',
        icon: '⚡',
        title: 'Afternoon Recharge',
        description: currentEnergy
          ? `Your current ${currentEnergy.overall < 50 ? 'energy is low' : 'energy looks good'} - ${currentEnergy.overall < 50 ? 'time for a break' : 'maintain your momentum'}`
          : 'Mid-day energy maintenance and productivity',
        actionText: currentEnergy && currentEnergy.overall < 50 ? '5-Min Energy Break' : 'Power Hour Focus',
        aiTip: 'Research shows afternoon energy dips are normal. A short break can boost your productivity for the rest of the day!'
      };
    } else {
      return {
        id: 'evening-focus',
        icon: '🎯',
        title: 'Evening Reflection',
        description: userEnergyData.length > 0 
          ? `You logged ${userEnergyData.length} energy entries. Let's reflect on your patterns`
          : 'Review your energy patterns and prepare for tomorrow',
        actionText: userEnergyData.length > 3 ? 'Smart Reflection' : 'Quick Check-in',
        aiTip: 'Evening reflection helps your brain process the day and improves energy awareness over time.'
      };
    }
  };

  const handleDailyFocusAction = (focusId: string) => {
    // Mark as completed
    setDailyFocusCompleted(prev => {
      const newSet = new Set(prev);
      newSet.add(focusId);
      return newSet;
    });
    
    // Show personalized feedback
    if (focusId === 'morning-focus') {
      setFocusNotification('🌅 Great start! Your morning intention is set. Consider logging your current energy level.');
    } else if (focusId === 'afternoon-focus') {
      const currentEnergy = userEnergyData[userEnergyData.length - 1];
      if (currentEnergy && currentEnergy.overall < 50) {
        setFocusNotification('⚡ Take a 5-minute break: deep breathing, stretch, or step outside. Your energy will thank you!');
      } else {
        setFocusNotification('🚀 You\'re in your power hour! Focus on your most important task while your energy is high.');
      }
    } else if (focusId === 'evening-focus') {
      const insights = userEnergyData.length > 0 
        ? `Today you averaged ${Math.round(userEnergyData.reduce((sum, entry) => sum + entry.overall, 0) / userEnergyData.length)}% energy. `
        : '';
      setFocusNotification(`🎯 ${insights}Reflection complete! Rest well and prepare for tomorrow's energy journey.`);
    }

    // Clear notification after 5 seconds
    setTimeout(() => {
      setFocusNotification(null);
    }, 5000);
  };

  // AI Social Intelligence Functions
  const getCurrentSocialBatteryLevel = () => {
    if (socialBatteryData.length === 0) return 75; // Default assumption
    const latest = socialBatteryData[socialBatteryData.length - 1];
    return latest.level;
  };

  const generateAISocialTip = () => {
    const timeOfDay = getTimeOfDay();
    const currentLevel = getCurrentSocialBatteryLevel();
    // Note: historicalAverage could be used for future enhancements

    // High Social Battery (80-100%)
    if (currentLevel >= 80) {
      if (timeOfDay === 'morning') {
        return {
          id: 'social-morning-high',
          title: '🌟 Peak Social Energy',
          description: 'Your social battery is fully charged! Perfect time for important conversations, networking, or team collaborations.',
          icon: '🔋',
          action: 'Schedule that important meeting or social call'
        };
      } else if (timeOfDay === 'afternoon') {
        return {
          id: 'social-afternoon-high',
          title: '🤝 Social Connection Time',
          description: 'Great energy for meaningful interactions! Consider reaching out to friends or engaging in collaborative work.',
          icon: '💬',
          action: 'Connect with colleagues or friends'
        };
      } else {
        return {
          id: 'social-evening-high',
          title: '🎉 Social Evening Energy',
          description: 'You have energy for social activities! Perfect for dinner with friends, social events, or quality time with loved ones.',
          icon: '✨',
          action: 'Plan a social activity or gather with friends'
        };
      }
    }
    
    // Medium Social Battery (40-79%)
    else if (currentLevel >= 40) {
      if (timeOfDay === 'morning') {
        return {
          id: 'social-morning-medium',
          title: '⚡ Selective Social Mode',
          description: 'Moderate social energy today. Focus on meaningful, low-energy social interactions like close friends or family.',
          icon: '🎯',
          action: 'Choose quality over quantity in social interactions'
        };
      } else if (timeOfDay === 'afternoon') {
        return {
          id: 'social-afternoon-medium',
          title: '🔄 Social Balance Needed',
          description: 'Your social battery is moderate. Mix social time with brief recharge breaks to maintain energy.',
          icon: '⚖️',
          action: 'Take 10-minute breaks between social interactions'
        };
      } else {
        return {
          id: 'social-evening-medium',
          title: '🏠 Cozy Social Time',
          description: 'Perfect energy for intimate, low-key social activities. Consider small gatherings or one-on-one time.',
          icon: '🕯️',
          action: 'Opt for quiet, close-knit social activities'
        };
      }
    }
    
    // Low Social Battery (0-39%)
    else {
      if (timeOfDay === 'morning') {
        return {
          id: 'social-morning-low',
          title: '🛡️ Social Protection Mode',
          description: 'Your social battery is low. Prioritize essential interactions only and focus on recharging activities.',
          icon: '🪫',
          action: 'Limit social commitments and practice self-care'
        };
      } else if (timeOfDay === 'afternoon') {
        return {
          id: 'social-afternoon-low',
          title: '🔇 Quiet Recharge Time',
          description: 'Social energy is running low. Consider postponing non-essential social activities and take alone time.',
          icon: '🔕',
          action: 'Cancel optional social plans and rest'
        };
      } else {
        return {
          id: 'social-evening-low',
          title: '🧘 Solo Recovery Evening',
          description: 'Your social battery needs recharging. Perfect time for solo activities, meditation, or early rest.',
          icon: '🌙',
          action: 'Enjoy solo activities and prepare for tomorrow'
        };
      }
    }
  };

  const handleSocialTipAction = (tipId: string) => {
    const socialTip = generateAISocialTip();
    if (!socialTip) return;
    
    // Mark social tip as completed
    setDailyFocusCompleted(prev => new Set([...Array.from(prev), tipId]));
    
    // Show personalized social feedback
    const currentLevel = getCurrentSocialBatteryLevel();
    let feedback = '';
    
    if (currentLevel >= 80) {
      feedback = '🌟 Great job leveraging your high social energy! Keep building those meaningful connections.';
    } else if (currentLevel >= 40) {
      feedback = '⚖️ Perfect balance! You\'re managing your social energy wisely.';
    } else {
      feedback = '🛡️ Excellent self-care! Protecting your social energy is crucial for long-term wellbeing.';
    }
    
    setFocusNotification(feedback);
    
    // Clear notification after 4 seconds
    setTimeout(() => {
      setFocusNotification(null);
    }, 4000);
  };

  // Generate current AI social tip
  const socialTip = generateAISocialTip();

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
              <h3>Log Current Energy & Social Battery</h3>
              <div className="quick-add-form">
                <QuickEnergyForm 
                  onSubmit={addEnergyEntry}
                  onSocialBatterySubmit={handleSocialBatteryLevel}
                  currentSocialBatteryLevel={getCurrentSocialBatteryLevel()}
                />
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

            {/* AI-Powered Daily Focus */}
            <div className="daily-actions">
              <h3>Today's AI Energy Focus</h3>
              <div className="action-cards-grid">
                {(() => {
                  const aiSuggestion = generateAIDailyFocus();
                  const isCompleted = dailyFocusCompleted.has(aiSuggestion.id);
                  
                  return (
                    <div className={`action-card ai-powered ${isCompleted ? 'completed' : ''}`}>
                      <span className="action-icon">{aiSuggestion.icon}</span>
                      <div className="action-content">
                        <h4>{aiSuggestion.title}</h4>
                        <p>{aiSuggestion.description}</p>
                        <div className="ai-tip">💡 {aiSuggestion.aiTip}</div>
                        <button 
                          className={`action-btn ${isCompleted ? 'completed' : ''}`}
                          onClick={() => handleDailyFocusAction(aiSuggestion.id)}
                          disabled={isCompleted}
                        >
                          {isCompleted ? '✅ Completed' : aiSuggestion.actionText}
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
              
              {/* Focus Notification */}
              {focusNotification && (
                <div className="focus-notification">
                  {focusNotification}
                </div>
              )}
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
              energyData={userEnergyData}
              onActionClick={handleInsightAction}
            />

            {/* Advanced AI Analytics Panel */}
            <div className="advanced-analytics-section">
              <div className="advanced-analytics-header">
                <div className="analytics-title-with-badge">
                  <h3>🔬 Advanced AI Analytics</h3>
                  <span className="analytics-feature-badge">NEW</span>
                </div>
                <p>Deep insights with predictions, recommendations, and constraint analysis</p>
                <button 
                  className="toggle-analytics-btn"
                  onClick={() => setShowAdvancedAnalytics(!showAdvancedAnalytics)}
                >
                  {showAdvancedAnalytics ? 'Hide Advanced Analytics' : 'Show Advanced Analytics'} 📊
                </button>
              </div>

              {showAdvancedAnalytics && (
                <AIInsightsPanel
                  data={userEnergyData}
                  currentEnergy={userEnergyData[userEnergyData.length - 1] || { 
                    timestamp: new Date(), 
                    overall: 75, 
                    physical: 75, 
                    mental: 75, 
                    emotional: 75, 
                    creative: 75 
                  }}
                  isOpen={true}
                  onToggle={() => setShowAdvancedAnalytics(false)}
                />
              )}
            </div>
          </div>
        )}

        {/* AI Chat Tab */}
        {activeTab === 'chat' && (
          <div className="tab-panel chat-panel">
            <div className="panel-header">
              <h2>AI Energy Assistant</h2>
              <p>Chat with your personal AI coach for energy insights and advice</p>
            </div>

            <div className="ai-chat-full-section">
              <AIChatAssistant
                data={userEnergyData}
                currentEnergy={userEnergyData[userEnergyData.length - 1] || { 
                  timestamp: new Date(), 
                  overall: 75, 
                  physical: 75, 
                  mental: 75, 
                  emotional: 75, 
                  creative: 75 
                }}
                isOpen={true}
                onToggle={() => {}}
                fullscreen={true}
              />
            </div>
          </div>
        )}

        {/* Social Battery Tab */}
        {activeTab === 'social' && (
          <div className="tab-panel social-panel">
            <div className="panel-header">
              <h2>Social Battery</h2>
              <p>Track your social energy and manage your social interactions</p>
            </div>

            {/* Quick Social Energy Log */}
            <div className="social-quick-log">
              <h3>How's your social battery today?</h3>
              <div className="social-battery-levels">
                <button 
                  className={`social-level-btn full ${getCurrentSocialBatteryLevel() === 100 ? 'selected' : ''}`}
                  onClick={() => handleSocialBatteryLevel(100)}
                >
                  🔋 Fully Charged
                </button>
                <button 
                  className={`social-level-btn medium ${getCurrentSocialBatteryLevel() === 50 ? 'selected' : ''}`}
                  onClick={() => handleSocialBatteryLevel(50)}
                >
                  🔋 Half Full
                </button>
                <button 
                  className={`social-level-btn low ${getCurrentSocialBatteryLevel() === 25 ? 'selected' : ''}`}
                  onClick={() => handleSocialBatteryLevel(25)}
                >
                  🪫 Running Low
                </button>
                <button 
                  className={`social-level-btn empty ${getCurrentSocialBatteryLevel() === 5 ? 'selected' : ''}`}
                  onClick={() => handleSocialBatteryLevel(5)}
                >
                  📱 Need Recharge
                </button>
              </div>
              
              {/* Notification display */}
              {socialBatteryNotification && (
                <div className="social-battery-notification">
                  {socialBatteryNotification}
                </div>
              )}
            </div>

            {/* AI-Powered Daily Social Tips */}
            <div className="social-tips">
              <h3>🤖 AI Daily Social Focus</h3>
              <div className="ai-social-tip-card">
                <div className="social-tip-header">
                  <span className="social-tip-icon">{socialTip.icon}</span>
                  <div className="social-tip-content">
                    <h4>{socialTip.title}</h4>
                    <p>{socialTip.description}</p>
                  </div>
                </div>
                <div className="social-tip-actions">
                  {!dailyFocusCompleted.has(socialTip.id) ? (
                    <button 
                      className="social-tip-action-btn"
                      onClick={() => handleSocialTipAction(socialTip.id)}
                    >
                      ✅ {socialTip.action}
                    </button>
                  ) : (
                    <div className="social-tip-completed">
                      <span className="completion-check">✅</span>
                      <span>Completed: {socialTip.action}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Social Battery Visualization */}
            <div className="social-controls">
              <label className="social-correlation-toggle">
                <input
                  type="checkbox"
                  checked={showSocialCorrelation}
                  onChange={(e) => setShowSocialCorrelation(e.target.checked)}
                />
                Show detailed energy correlation analysis
              </label>
            </div>

            <div className="chart-section">
              <SocialBatteryChart
                socialData={socialBatteryData}
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
                <h3>Daily Preferences</h3>
                <label htmlFor="default-time-range">
                  View Range:
                  <select
                    id="default-time-range"
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                    className="setting-select"
                    title="Select default time range"
                  >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                  </select>
                </label>
              </div>

              <div className="setting-group">
                <h3>AI Assistant</h3>
                <label className="setting-toggle">
                  <input
                    type="checkbox"
                    checked={showAIInsights}
                    onChange={(e) => setShowAIInsights(e.target.checked)}
                  />
                  Get daily AI insights and tips
                </label>
                <p className="setting-description">
                  Receive personalized energy recommendations each day
                </p>
              </div>

              <div className="setting-group">
                <h3>Power User Features</h3>
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

              <div className="setting-group">
                <h3>Social Energy</h3>
                <label className="setting-toggle">
                  <input
                    type="checkbox"
                    checked={showSocialCorrelation}
                    onChange={(e) => setShowSocialCorrelation(e.target.checked)}
                  />
                  Show social energy correlation analysis
                </label>
                <p className="setting-description">
                  Display how social interactions impact your overall energy levels
                </p>
              </div>

              <div className="setting-group">
                <h3>Data Management</h3>
                <div className="setting-buttons">
                  <button 
                    className="setting-btn secondary"
                    onClick={() => {
                      const settings = {
                        showAIInsights,
                        showAdvancedAnalytics,
                        selectedEnergyTypes,
                        timeRange,
                        showSocialCorrelation
                      };
                      const blob = new Blob([JSON.stringify(settings, null, 2)], 
                        { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'energy-flow-settings.json';
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    📤 Export Settings
                  </button>
                  
                  <button 
                    className="setting-btn danger"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to reset all settings to default? This cannot be undone.')) {
                        // Reset all settings to defaults
                        setShowAIInsights(false);
                        setShowAdvancedAnalytics(false);
                        setSelectedEnergyTypes(['physical', 'mental', 'emotional', 'creative']);
                        setTimeRange('7d');
                        setShowSocialCorrelation(false);
                        
                        // Clear localStorage
                        localStorage.removeItem('energyFlow_showAIInsights');
                        localStorage.removeItem('energyFlow_showAdvancedAnalytics');
                        localStorage.removeItem('energyFlow_selectedEnergyTypes');
                        localStorage.removeItem('energyFlow_timeRange');
                        localStorage.removeItem('energyFlow_showSocialCorrelation');
                        
                        alert('Settings have been reset to default values.');
                      }
                    }}
                  >
                    🔄 Reset to Defaults
                  </button>

                  <button 
                    className="setting-btn danger"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to clear all energy data? This cannot be undone.')) {
                        setUserEnergyData([]);
                        setSocialBatteryData([]);
                        StorageService.clearAllData();
                        alert('All energy data has been cleared.');
                      }
                    }}
                  >
                    🗑️ Clear All Data
                  </button>
                </div>
                <p className="setting-description">
                  Export your settings, reset to defaults, or clear all stored data
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

// Quick Energy Input Form Component - Button-based like Social Battery
const QuickEnergyForm: React.FC<{ 
  onSubmit: (entry: Omit<EnergyLevel, 'timestamp'>) => void;
  onSocialBatterySubmit?: (level: number) => void;
  currentSocialBatteryLevel?: number;
}> = ({ onSubmit, onSocialBatterySubmit, currentSocialBatteryLevel = 75 }) => {
  const [selectedEnergy, setSelectedEnergy] = useState({
    physical: 0,
    mental: 0,
    emotional: 0,
    creative: 0,
    social: 0
  });

  const [showNotification, setShowNotification] = useState<string | null>(null);

  const energyLevels = [
    { value: 90, label: 'High Energy', icon: '🔥', class: 'high' },
    { value: 70, label: 'Good Energy', icon: '⚡', class: 'good' },
    { value: 50, label: 'Moderate', icon: '🔋', class: 'moderate' },
    { value: 30, label: 'Low Energy', icon: '🪫', class: 'low' },
    { value: 10, label: 'Drained', icon: '📱', class: 'drained' }
  ];

  const socialLevels = [
    { value: 100, label: 'Fully Charged', icon: '🔋', class: 'full' },
    { value: 50, label: 'Half Full', icon: '🔋', class: 'medium' },
    { value: 25, label: 'Running Low', icon: '🪫', class: 'low' },
    { value: 5, label: 'Need Recharge', icon: '📱', class: 'empty' }
  ];

  const handleEnergySelect = (type: keyof typeof selectedEnergy, value: number) => {
    if (type === 'social') {
      setSelectedEnergy(prev => ({ ...prev, [type]: value }));
      if (onSocialBatterySubmit) {
        onSocialBatterySubmit(value);
      }
    } else {
      setSelectedEnergy(prev => ({ ...prev, [type]: value }));
    }
  };

  const canSubmitEnergy = selectedEnergy.physical > 0 && selectedEnergy.mental > 0 && 
                         selectedEnergy.emotional > 0 && selectedEnergy.creative > 0;

  const handleSubmit = () => {
    if (!canSubmitEnergy) return;

    const overall = Math.round(
      (selectedEnergy.physical + selectedEnergy.mental + selectedEnergy.emotional + selectedEnergy.creative) / 4
    );

    onSubmit({
      physical: selectedEnergy.physical,
      mental: selectedEnergy.mental,
      emotional: selectedEnergy.emotional,
      creative: selectedEnergy.creative,
      overall: overall
    });

    // Show success notification
    setShowNotification('✅ Energy logged successfully!');
    
    // Reset form
    setSelectedEnergy({
      physical: 0,
      mental: 0,
      emotional: 0,
      creative: 0,
      social: 0
    });

    // Clear notification after 3 seconds
    setTimeout(() => {
      setShowNotification(null);
    }, 3000);
  };

  const EnergyTypeSection = ({ 
    type, 
    title, 
    levels 
  }: { 
    type: keyof typeof selectedEnergy, 
    title: string,
    levels: typeof energyLevels 
  }) => (
    <div className="energy-type-section">
      <h4>{title} {(type === 'social' ? currentSocialBatteryLevel : selectedEnergy[type]) > 0 && `- ${type === 'social' ? currentSocialBatteryLevel : selectedEnergy[type]}%`}</h4>
      <div className="energy-level-buttons">
        {levels.map((level) => (
          <button
            key={`${type}-${level.value}`}
            type="button"
            className={`energy-level-btn ${level.class} ${
              (type === 'social' ? currentSocialBatteryLevel : selectedEnergy[type]) === level.value ? 'selected' : ''
            }`}
            onClick={() => handleEnergySelect(type, level.value)}
          >
            <span className="level-icon">{level.icon}</span>
            <span className="level-label">{level.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="quick-energy-form button-style">
      {/* Energy Type Sections */}
      <div className="energy-types-grid">
        <EnergyTypeSection 
          type="physical" 
          title="💪 Physical Energy" 
          levels={energyLevels}
        />
        <EnergyTypeSection 
          type="mental" 
          title="🧠 Mental Energy" 
          levels={energyLevels}
        />
        <EnergyTypeSection 
          type="emotional" 
          title="❤️ Emotional Energy" 
          levels={energyLevels}
        />
        <EnergyTypeSection 
          type="creative" 
          title="🎨 Creative Energy" 
          levels={energyLevels}
        />
        <EnergyTypeSection 
          type="social" 
          title="🤝 Social Battery" 
          levels={socialLevels}
        />
      </div>

      {/* Submit Button */}
      <div className="form-actions">
        <button 
          type="button"
          className={`submit-energy-btn ${canSubmitEnergy ? 'ready' : 'disabled'}`}
          onClick={handleSubmit}
          disabled={!canSubmitEnergy}
        >
          {canSubmitEnergy ? '⚡ Log Energy & Social Battery' : '📝 Select all energy levels first'}
        </button>
      </div>

      {/* Success Notification */}
      {showNotification && (
        <div className="energy-log-notification">
          {showNotification}
        </div>
      )}
    </div>
  );
};

export default ModernEnergyDashboard;
