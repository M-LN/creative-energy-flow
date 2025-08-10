import React, { useState, useEffect, useCallback } from 'react';
import { EnergyDashboard } from './components/EnergyDashboard';
import { EnhancedDashboard } from './components/EnhancedDashboard';
import ModernEnergyDashboard from './components/ModernEnergyDashboard';
import { PWAInstallButton } from './components/PWAInstallButton';
import { DataExportPanel } from './components/DataExportPanel';
import { GoalDashboard } from './components/goals/GoalDashboard';
import RecommendationDashboard from './components/recommendations/RecommendationDashboard';
import { SocialOptimizationDashboard } from './components/socialOptimization/SocialOptimizationDashboard';
import IntegrationDashboard from './components/integration/IntegrationDashboard';
import { ThemeToggle } from './components/ThemeToggle';
import { WelcomeTooltip } from './components/WelcomeTooltip';
import { HelpPanel, FloatingHelpButton } from './components/HelpPanel';
import { ThemeProvider } from './contexts/ThemeContext';
import { EnergyLevel, EnergyReading, SocialBatteryData } from './types/energy';
import { PWAService } from './services/PWAService';
import { EnergyRecommendationService } from './services/EnergyRecommendationService';
import { SocialOptimizationService } from './services/SocialOptimizationService';
import { calendarService } from './services/CalendarIntegrationService';
import { productivityService } from './services/ProductivityIntegrationService';
import { SampleEnergyReadings } from './data/sampleEnergyReadings';
import { EnergyDataService } from './data/energyDataService';
import './styles/globals.css';
import './App.css';
import './styles/responsive-enhancements.css';
import './styles/chart-enhancements.css';

function App() {
  const [currentView, setCurrentView] = useState<'modern' | 'enhanced' | 'analytics' | 'goals' | 'recommendations' | 'social-optimization' | 'integration' | 'data'>('modern');
  const [showWelcome, setShowWelcome] = useState(() => {
    // Show welcome tour for first-time users
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    return !hasSeenWelcome;
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
  
  // Sample energy readings for export/import demo and goal tracking
  const [energyReadings, setEnergyReadings] = useState<EnergyReading[]>([]);
  const [energyData, setEnergyData] = useState<EnergyLevel[]>([]);
  const [socialData, setSocialData] = useState<SocialBatteryData[]>([]);

  // Initialize sample data and PWA service
  useEffect(() => {
    PWAService.getInstance();
    
    // Load sample energy readings
    const sampleData = SampleEnergyReadings.generateSampleReadings(30);
    setEnergyReadings(sampleData);
    
    // Load sample social battery data
    const sampleSocialData = EnergyDataService.generateSocialBatteryData(30);
    setSocialData(sampleSocialData);
    
    // Convert readings to EnergyLevel format for goal tracking
    const energyLevels: EnergyLevel[] = sampleData.map(reading => ({
      timestamp: new Date(reading.timestamp),
      physical: reading.type === 'physical' ? reading.level * 10 : 65,
      mental: reading.type === 'mental' ? reading.level * 10 : 70,
      emotional: reading.type === 'emotional' ? reading.level * 10 : 60,
      creative: reading.type === 'creative' ? reading.level * 10 : 75,
      overall: reading.level * 10
    }));
    setEnergyData(energyLevels);
    
    // Initialize recommendations with sample data
    EnergyRecommendationService.analyzeAndRecommend(sampleData).catch(console.error);
    
    // Initialize integration services
    calendarService.loadFromStorage();
    productivityService.loadFromStorage();
  }, []);

  // Initialize social optimization analysis
  const initializeSocialOptimization = useCallback(async () => {
    try {
      // Generate social optimization analysis with sample data
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
        
        {currentView === 'analytics' ? (
          <button
            type="button"
            onClick={() => setCurrentView('analytics')}
            className="view-toggle-button active"
            aria-pressed="true"
            aria-label="Switch to analytics view"
          >
            📊 Analytics
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setCurrentView('analytics')}
            className="view-toggle-button"
            aria-pressed="false"
            aria-label="Switch to analytics view"
          >
            📊 Analytics
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
        
        {currentView === 'integration' ? (
          <button
            type="button"
            onClick={() => setCurrentView('integration')}
            className="view-toggle-button active"
            aria-pressed="true"
            aria-label="Switch to integration view"
          >
            📅 Integration
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setCurrentView('integration')}
            className="view-toggle-button"
            aria-pressed="false"
            aria-label="Switch to integration view"
          >
            📅 Integration
          </button>
        )}
        
        {currentView === 'data' ? (
          <button
            type="button"
            onClick={() => setCurrentView('data')}
            className="view-toggle-button active"
            aria-pressed="true"
            aria-label="Switch to data management view"
          >
            📁 Data
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setCurrentView('data')}
            className="view-toggle-button"
            aria-pressed="false"
            aria-label="Switch to data management view"
          >
            📁 Data
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
      ) : currentView === 'analytics' ? (
        <EnergyDashboard />
      ) : currentView === 'goals' ? (
        <GoalDashboard
          energyData={energyData}
          onDataUpdate={setEnergyData}
        />
      ) : currentView === 'recommendations' ? (
        <RecommendationDashboard />
      ) : currentView === 'social-optimization' ? (
        <SocialOptimizationDashboard />
      ) : currentView === 'integration' ? (
        <IntegrationDashboard />
      ) : (
        <DataExportPanel
          energyData={energyReadings}
          onDataImported={handleDataImported}
        />
      )}

      {/* Welcome Tour for First-Time Users */}
      {showWelcome && (
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
