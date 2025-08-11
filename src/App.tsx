import React, { useState, useEffect, useCallback } from 'react';
import { EnergyDashboard } from './components/EnergyDashboard';
import { EnhancedDashboard } from './components/EnhancedDashboard';
import ModernEnergyDashboard from './components/ModernEnergyDashboard';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { PWAInstallButton } from './components/PWAInstallButton';
import { DataExportPanel } from './components/DataExportPanel';
import { GoalDashboard } from './components/goals/GoalDashboard';
import RecommendationDashboard from './components/recommendations/RecommendationDashboard';
import { SocialOptimizationDashboard } from './components/socialOptimization/SocialOptimizationDashboard';
import { ThemeToggle } from './components/ThemeToggle';
import { WelcomeTooltip } from './components/WelcomeTooltip';
import { HelpPanel, FloatingHelpButton } from './components/HelpPanel';
import { ThemeProvider } from './contexts/ThemeContext';
import { EnergyLevel, EnergyReading, SocialBatteryData } from './types/energy';
import { PWAService } from './services/PWAService';
import { SmartNotificationService } from './services/SmartNotificationService';
import { SocialOptimizationService } from './services/SocialOptimizationService';
import './components/onboarding/OnboardingFlow.css';
import './styles/globals.css';
import './App.css';
import './styles/responsive-enhancements.css';
import './styles/chart-enhancements.css';

function App() {
  const [currentView, setCurrentView] = useState<'modern' | 'enhanced' | 'goals' | 'recommendations' | 'social-optimization' | 'advanced'>('modern');
  const [showWelcome, setShowWelcome] = useState(() => {
    // Show welcome tour for first-time users
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    return !hasSeenWelcome;
  });
  const [showOnboarding, setShowOnboarding] = useState(() => {
    // Show onboarding for new users (different from welcome tour)
    const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding');
    const hasAnyData = localStorage.getItem('energyReadings') || localStorage.getItem('userPreferences');
    return !hasCompletedOnboarding && !hasAnyData;
  });
  const [showHelpPanel, setShowHelpPanel] = useState(false);
  const [currentEnergy, setCurrentEnergy] = useState<EnergyLevel>({
    timestamp: new Date(),
    physical: 65,
    mental: 70,
    emotional: 60,
    creative: 75,
    overall: 67.5
  });
  
  // User energy readings for export/import and goal tracking
  const [energyReadings, setEnergyReadings] = useState<EnergyReading[]>([]);
  const [energyData, setEnergyData] = useState<EnergyLevel[]>([]);
  const [socialData] = useState<SocialBatteryData[]>([]);

  // Initialize PWA service
  useEffect(() => {
    PWAService.getInstance();
    
    // Initialize smart notifications
    SmartNotificationService.getInstance().requestPermission();
    
    // Load user energy data from localStorage if available
    // No sample data is generated - app starts with empty state
  }, []);

  // Initialize social optimization analysis with user data when available
  const initializeSocialOptimization = useCallback(async () => {
    if (socialData.length === 0 || energyData.length === 0) {
      return; // No user data available yet
    }
    
    try {
      // Generate social optimization analysis with user data
      await SocialOptimizationService.generateOptimizationAnalysis(socialData, energyData);
    } catch (error) {
      console.error('Error initializing social optimization:', error);
    }
  }, [socialData, energyData]);

  // Initialize social optimization when data is available
  useEffect(() => {
    if (energyData.length > 0 && socialData.length > 0) {
      initializeSocialOptimization();
    }
  }, [energyData, socialData, initializeSocialOptimization]);

  const handleDataImported = (importedData: EnergyReading[]) => {
    // Merge imported data with existing data, avoiding duplicates
    const existingIds = new Set(energyReadings.map(reading => reading.id));
    const newReadings = importedData.filter(reading => !existingIds.has(reading.id));
    
    if (newReadings.length > 0) {
      setEnergyReadings(prev => [...prev, ...newReadings]);
    }
  };

  const handleEnergyDataUpdate = (updatedEnergyData: EnergyLevel[]) => {
    setEnergyData(updatedEnergyData);
  };

  const handleOnboardingSkip = () => {
    localStorage.setItem('hasCompletedOnboarding', 'true');
    setShowOnboarding(false);
  };

  const handleOnboardingComplete = (userPreferences: any, firstEnergyEntry?: EnergyLevel) => {
    // Mark onboarding as completed
    localStorage.setItem('hasCompletedOnboarding', 'true');
    setShowOnboarding(false);

    // Save user preferences
    localStorage.setItem('userPreferences', JSON.stringify(userPreferences));

    // If user provided first energy entry, save it
    if (firstEnergyEntry) {
      setCurrentEnergy(firstEnergyEntry);
      setEnergyData([firstEnergyEntry]);
    }

    // Start smart notification system for engaged users
    const notificationService = SmartNotificationService.getInstance();
    const schedules = [{
      id: 'daily-energy-checkin',
      type: 'daily-checkin' as const,
      title: 'Energy Check-in Time! 🌟',
      body: 'How are your energy levels today?',
      scheduledTime: userPreferences.preferredNotificationTime || '18:00',
      days: [1, 2, 3, 4, 5, 6, 0], // Every day
      enabled: true
    }];
    notificationService.scheduleNotifications(schedules);
  };

  // Using direct string literals for ARIA values instead of expressions

  return (
    <ThemeProvider>
      <div className="App">
        {/* App Header with Theme Toggle */}
        <header className="app-header">
          <div className="app-header-content">
            <h1 className="app-title">Creative Energy Flow</h1>
            <div className="app-header-controls">
              <ThemeToggle />
              <PWAInstallButton />
            </div>
          </div>
        </header>

        {/* View Toggle */}
        <div className="view-toggle">
        {currentView === 'modern' ? (
          <button
            type="button"
            onClick={() => setCurrentView('modern')}
            className="view-toggle-button active"
            aria-pressed="true"
            aria-label="Switch to modern view"
          >
            ⚡ Modern
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setCurrentView('modern')}
            className="view-toggle-button"
            aria-pressed="false"
            aria-label="Switch to modern view"
          >
            ⚡ Modern
          </button>
        )}

        {currentView === 'enhanced' ? (
          <button
            type="button"
            onClick={() => setCurrentView('enhanced')}
            className="view-toggle-button active"
            aria-pressed="true"
            aria-label="Switch to home view"
          >
            🏠 Home
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setCurrentView('enhanced')}
            className="view-toggle-button"
            aria-pressed="false"
            aria-label="Switch to home view"
          >
            🏠 Home
          </button>
        )}
        
        {currentView === 'advanced' ? (
          <button
            type="button"
            onClick={() => setCurrentView('advanced')}
            className="view-toggle-button active"
            aria-pressed="true"
            aria-label="Switch to advanced analytics view"
          >
            ⚙️ Advanced
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setCurrentView('advanced')}
            className="view-toggle-button"
            aria-pressed="false"
            aria-label="Switch to advanced analytics view"
          >
            ⚙️ Advanced
          </button>
        )}
        
        {currentView === 'goals' ? (
          <button
            type="button"
            onClick={() => setCurrentView('goals')}
            className="view-toggle-button active"
            aria-pressed="true"
            aria-label="Switch to goals view"
          >
            🎯 Goals
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setCurrentView('goals')}
            className="view-toggle-button"
            aria-pressed="false"
            aria-label="Switch to goals view"
          >
            🎯 Goals
          </button>
        )}
        
        {currentView === 'recommendations' ? (
          <button
            type="button"
            onClick={() => setCurrentView('recommendations')}
            className="view-toggle-button active"
            aria-pressed="true"
            aria-label="Switch to recommendations view"
          >
            💡 Insights
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setCurrentView('recommendations')}
            className="view-toggle-button"
            aria-pressed="false"
            aria-label="Switch to recommendations view"
          >
            💡 Insights
          </button>
        )}
        
        {currentView === 'social-optimization' ? (
          <button
            type="button"
            onClick={() => setCurrentView('social-optimization')}
            className="view-toggle-button active"
            aria-pressed="true"
            aria-label="Switch to social optimization view"
          >
            🧘‍♀️ Social
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setCurrentView('social-optimization')}
            className="view-toggle-button"
            aria-pressed="false"
            aria-label="Switch to social optimization view"
          >
            🧘‍♀️ Social
          </button>
        )}
      </div>

      {/* Main Content */}
      {currentView === 'modern' ? (
        <ModernEnergyDashboard />
      ) : currentView === 'enhanced' ? (
        <EnhancedDashboard
          currentEnergy={currentEnergy}
          onEnergyUpdate={setCurrentEnergy}
          onEnergyDataUpdate={handleEnergyDataUpdate}
        />
      ) : currentView === 'goals' ? (
        <GoalDashboard
          energyData={energyData}
          onDataUpdate={setEnergyData}
        />
      ) : currentView === 'recommendations' ? (
        <RecommendationDashboard />
      ) : currentView === 'social-optimization' ? (
        <SocialOptimizationDashboard />
      ) : currentView === 'advanced' ? (
        <div className="advanced-dashboard">
          <div className="advanced-header">
            <h2>⚙️ Advanced Analytics & Data</h2>
            <p>Detailed analytics and data management tools</p>
          </div>
          
          <div className="advanced-tabs">
            <div className="advanced-tab-content">
              <div className="analytics-section">
                <h3>📊 Analytics Dashboard</h3>
                <EnergyDashboard />
              </div>
              
              <div className="data-section">
                <h3>📁 Data Management</h3>
                <DataExportPanel
                  energyData={energyReadings}
                  onDataImported={handleDataImported}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <ModernEnergyDashboard />
      )}

      {/* Onboarding Flow for New Users */}
      {showOnboarding && (
        <OnboardingFlow 
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}

      {/* Welcome Tour for First-Time Users */}
      {showWelcome && !showOnboarding && (
        <WelcomeTooltip onComplete={() => setShowWelcome(false)} />
      )}

      {/* Floating Help Button */}
      <FloatingHelpButton onClick={() => setShowHelpPanel(true)} />
      
      {/* Help Panel */}
      <HelpPanel 
        isOpen={showHelpPanel} 
        onClose={() => setShowHelpPanel(false)} 
      />
      </div>
    </ThemeProvider>
  );
}

export default App;
