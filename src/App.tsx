import React, { useState, useEffect } from 'react';
import { EnergyDashboard } from './components/EnergyDashboard';
import { EnhancedDashboard } from './components/EnhancedDashboard';
import { PWAInstallButton } from './components/PWAInstallButton';
import { DataExportPanel } from './components/DataExportPanel';
import { GoalDashboard } from './components/goals/GoalDashboard';
import { ThemeToggle } from './components/ThemeToggle';
import { ThemeProvider } from './contexts/ThemeContext';
import { EnergyLevel, EnergyReading } from './types/energy';
import { PWAService } from './services/PWAService';
import { SampleEnergyReadings } from './data/sampleEnergyReadings';
import './styles/globals.css';
import './App.css';
import './styles/responsive-enhancements.css';
import './styles/chart-enhancements.css';

function App() {
  const [currentView, setCurrentView] = useState<'enhanced' | 'analytics' | 'goals' | 'data'>('enhanced');
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

  // Initialize sample data and PWA service
  useEffect(() => {
    PWAService.getInstance();
    
    // Load sample energy readings
    const sampleData = SampleEnergyReadings.generateSampleReadings(30);
    setEnergyReadings(sampleData);
    
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
  }, []);

  const handleDataImported = (importedData: EnergyReading[]) => {
    // Merge imported data with existing data, avoiding duplicates
    const existingIds = new Set(energyReadings.map(reading => reading.id));
    const newReadings = importedData.filter(reading => !existingIds.has(reading.id));
    
    if (newReadings.length > 0) {
      setEnergyReadings(prev => [...prev, ...newReadings]);
    }
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
      {currentView === 'enhanced' ? (
        <EnhancedDashboard
          currentEnergy={currentEnergy}
          onEnergyUpdate={setCurrentEnergy}
        />
      ) : currentView === 'analytics' ? (
        <EnergyDashboard />
      ) : currentView === 'goals' ? (
        <GoalDashboard
          energyData={energyData}
          onDataUpdate={setEnergyData}
        />
      ) : (
        <DataExportPanel
          energyData={energyReadings}
          onDataImported={handleDataImported}
        />
      )}
      </div>
    </ThemeProvider>
  );
}

export default App;
