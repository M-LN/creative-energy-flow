import React, { useState } from 'react';
import { EnergyDashboard } from './components/EnergyDashboard';
import { EnhancedDashboard } from './components/EnhancedDashboard';
import { EnergyLevel } from './types/energy';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState<'enhanced' | 'analytics'>('enhanced');
  const [currentEnergy, setCurrentEnergy] = useState<EnergyLevel>({
    timestamp: new Date(),
    physical: 65,
    mental: 70,
    emotional: 60,
    creative: 75,
    overall: 67.5
  });

  // Using direct string literals for ARIA values instead of expressions

  return (
    <div className="App">
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
      </div>

      {/* Main Content */}
      {currentView === 'enhanced' ? (
        <EnhancedDashboard
          currentEnergy={currentEnergy}
          onEnergyUpdate={setCurrentEnergy}
        />
      ) : (
        <EnergyDashboard />
      )}
    </div>
  );
}

export default App;
