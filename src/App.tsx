import React, { useState, useMemo } from 'react';
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

  return (
    <div className="App">
      {/* View Toggle */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        display: 'flex',
        gap: '8px'
      }}>
        <button
          onClick={() => setCurrentView('enhanced')}
          style={{
            backgroundColor: currentView === 'enhanced' ? '#4FD1C7' : '#EDF2F7',
            color: currentView === 'enhanced' ? 'white' : '#4A5568',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 12px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          🏠 Home
        </button>
        <button
          onClick={() => setCurrentView('analytics')}
          style={{
            backgroundColor: currentView === 'analytics' ? '#4FD1C7' : '#EDF2F7',
            color: currentView === 'analytics' ? 'white' : '#4A5568',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 12px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          📊 Analytics
        </button>
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
