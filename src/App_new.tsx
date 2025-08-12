import React, { useState } from 'react';
import ModernEnergyDashboard from './components/ModernEnergyDashboard';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { ThemeProvider } from './contexts/ThemeContext';
import { EnergyLevel } from './types/energy';
import './components/onboarding/OnboardingFlow.css';
import './styles/globals.css';
import './App.css';

function App() {
  const [showOnboarding, setShowOnboarding] = useState(() => {
    // Show onboarding for new users
    const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding');
    const hasAnyData = localStorage.getItem('energyReadings') || localStorage.getItem('userPreferences');
    return !hasCompletedOnboarding && !hasAnyData;
  });

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
      localStorage.setItem('firstEnergyEntry', JSON.stringify(firstEnergyEntry));
    }
  };

  return (
    <ThemeProvider>
      <div className="App">
        {/* Main Application - Only ModernEnergyDashboard */}
        <ModernEnergyDashboard />

        {/* Onboarding Flow for New Users */}
        {showOnboarding && (
          <OnboardingFlow 
            onComplete={handleOnboardingComplete}
            onSkip={handleOnboardingSkip}
          />
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;
