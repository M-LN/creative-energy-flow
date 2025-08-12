import React, { useState } from 'react';
import { EnergyLevel } from '../../types/energy';
import './OnboardingFlow.css';

interface OnboardingFlowProps {
  onComplete: (initialEnergyData: EnergyLevel) => void;
  onSkip: () => void;
}

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState({
    name: '',
    primaryGoal: '',
    energyStyle: '',
    workSchedule: '',
    currentEnergy: {
      physical: 50,
      mental: 50,
      emotional: 50,
      creative: 50
    }
  });

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Creative Energy Flow! 🌟',
      description: 'Track, understand, and optimize your energy patterns for peak creativity and well-being.',
      component: <WelcomeStep />
    },
    {
      id: 'goals',
      title: 'What brings you here? 🎯',
      description: 'Understanding your goals helps us personalize your experience.',
      component: <GoalsStep userData={userData} setUserData={setUserData} />
    },
    {
      id: 'energy-style',
      title: 'What\'s your energy style? ⚡',
      description: 'Everyone has different energy patterns. Let\'s discover yours!',
      component: <EnergyStyleStep userData={userData} setUserData={setUserData} />
    },
    {
      id: 'first-entry',
      title: 'How are you feeling right now? 📊',
      description: 'Let\'s create your first energy entry to get started.',
      component: <FirstEnergyEntry userData={userData} setUserData={setUserData} />
    },
    {
      id: 'features',
      title: 'Your personalized dashboard awaits! 🚀',
      description: 'Here\'s what you can explore next.',
      component: <FeaturesOverview />
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    const initialEnergyData: EnergyLevel = {
      timestamp: new Date(),
      physical: userData.currentEnergy.physical,
      mental: userData.currentEnergy.mental,
      emotional: userData.currentEnergy.emotional,
      creative: userData.currentEnergy.creative,
      overall: (
        userData.currentEnergy.physical + 
        userData.currentEnergy.mental + 
        userData.currentEnergy.emotional + 
        userData.currentEnergy.creative
      ) / 4
    };

    // Store user preferences
    localStorage.setItem('user_onboarding_data', JSON.stringify({
      ...userData,
      completedAt: new Date().toISOString(),
      version: '1.0'
    }));

    onComplete(initialEnergyData);
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-container">
        {/* Progress Bar */}
        <div className="onboarding-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
              aria-label={`Progress: ${Math.round(progress)}% complete`}
            />
          </div>
          <span className="progress-text">
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>

        {/* Step Content */}
        <div className="onboarding-content">
          <div className="step-header">
            <h2 className="step-title">{steps[currentStep].title}</h2>
            <p className="step-description">{steps[currentStep].description}</p>
          </div>

          <div className="step-body">
            {steps[currentStep].component}
          </div>
        </div>

        {/* Navigation */}
        <div className="onboarding-nav">
          <div className="nav-left">
            {currentStep > 0 && (
              <button 
                className="btn-secondary"
                onClick={handleBack}
              >
                ← Back
              </button>
            )}
          </div>

          <div className="nav-right">
            <button 
              className="btn-link"
              onClick={onSkip}
            >
              Skip for now
            </button>
            
            <button 
              className="btn-primary"
              onClick={handleNext}
            >
              {currentStep < steps.length - 1 ? 'Continue →' : 'Get Started! 🚀'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Welcome Step Component
const WelcomeStep: React.FC = () => (
  <div className="welcome-step">
    <div className="welcome-hero">
      <div className="hero-icon">🌟</div>
      <div className="hero-content">
        <h3>Your personal energy companion</h3>
        <div className="feature-grid">
          <div className="feature-item">
            <span className="feature-icon">📊</span>
            <span>Track energy patterns</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🤖</span>
            <span>AI-powered insights</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🎯</span>
            <span>Personalized recommendations</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">⚡</span>
            <span>Optimize your flow state</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Goals Step Component
const GoalsStep: React.FC<{userData: any, setUserData: any}> = ({ userData, setUserData }) => {
  const goals = [
    { id: 'productivity', title: 'Boost Productivity', desc: 'Optimize when and how I work', icon: '🚀' },
    { id: 'creativity', title: 'Enhance Creativity', desc: 'Find my peak creative moments', icon: '🎨' },
    { id: 'wellbeing', title: 'Improve Well-being', desc: 'Better work-life balance', icon: '🌱' },
    { id: 'burnout', title: 'Prevent Burnout', desc: 'Recognize and avoid energy depletion', icon: '🛡️' },
    { id: 'understanding', title: 'Understand Myself', desc: 'Discover my energy patterns', icon: '🔍' }
  ];

  return (
    <div className="goals-step">
      <div className="goals-grid">
        {goals.map(goal => (
          <button
            key={goal.id}
            className={`goal-card ${userData.primaryGoal === goal.id ? 'selected' : ''}`}
            onClick={() => setUserData({...userData, primaryGoal: goal.id})}
          >
            <span className="goal-icon">{goal.icon}</span>
            <h4 className="goal-title">{goal.title}</h4>
            <p className="goal-desc">{goal.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

// Energy Style Step Component
const EnergyStyleStep: React.FC<{userData: any, setUserData: any}> = ({ userData, setUserData }) => {
  const styles = [
    { id: 'steady', title: 'Steady & Consistent', desc: 'I maintain similar energy throughout the day', icon: '📈' },
    { id: 'peaks', title: 'Peak & Valley', desc: 'I have distinct high and low energy periods', icon: '⛰️' },
    { id: 'morning', title: 'Morning Person', desc: 'I\'m most energetic in the morning', icon: '🌅' },
    { id: 'night', title: 'Night Owl', desc: 'I come alive in the evening/night', icon: '🦉' },
    { id: 'unpredictable', title: 'Unpredictable', desc: 'My energy varies day to day', icon: '🎲' }
  ];

  return (
    <div className="energy-style-step">
      <div className="styles-grid">
        {styles.map(style => (
          <button
            key={style.id}
            className={`style-card ${userData.energyStyle === style.id ? 'selected' : ''}`}
            onClick={() => setUserData({...userData, energyStyle: style.id})}
          >
            <span className="style-icon">{style.icon}</span>
            <h4 className="style-title">{style.title}</h4>
            <p className="style-desc">{style.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

// First Energy Entry Component
const FirstEnergyEntry: React.FC<{userData: any, setUserData: any}> = ({ userData, setUserData }) => {
  const handleEnergyChange = (type: string, value: number) => {
    setUserData({
      ...userData,
      currentEnergy: {
        ...userData.currentEnergy,
        [type]: value
      }
    });
  };

  const energyTypes = [
    { key: 'physical', label: '💪 Physical Energy', icon: '💪', desc: 'How energetic is your body?' },
    { key: 'mental', label: '🧠 Mental Energy', icon: '🧠', desc: 'How sharp is your mind?' },
    { key: 'emotional', label: '❤️ Emotional Energy', icon: '❤️', desc: 'How positive do you feel?' },
    { key: 'creative', label: '🎨 Creative Energy', icon: '🎨', desc: 'How inspired are you?' }
  ];

  const energyLevels = [
    { value: 90, label: 'High Energy', icon: '🔥', class: 'high', color: '#22c55e' },
    { value: 70, label: 'Good Energy', icon: '⚡', class: 'good', color: '#667eea' },
    { value: 50, label: 'Moderate', icon: '🔋', class: 'moderate', color: '#f59e0b' },
    { value: 30, label: 'Low Energy', icon: '🪫', class: 'low', color: '#ef4444' }
  ];

  return (
    <div className="first-energy-entry">
      <div className="energy-button-groups">
        {energyTypes.map(type => (
          <div key={type.key} className="energy-type-section">
            <div className="energy-type-header">
              <div className="energy-type-info">
                <h4 className="energy-type-label">{type.label}</h4>
                <p className="energy-type-desc">{type.desc}</p>
              </div>
            </div>
            <div className="energy-level-buttons">
              {energyLevels.map(level => (
                <button
                  key={`${type.key}-${level.value}`}
                  className={`energy-level-btn ${level.class} ${userData.currentEnergy[type.key] === level.value ? 'selected' : ''}`}
                  onClick={() => handleEnergyChange(type.key, level.value)}
                >
                  <span className="level-icon">{level.icon}</span>
                  <span className="level-label">{level.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Features Overview Component
const FeaturesOverview: React.FC = () => (
  <div className="features-overview">
    <div className="celebration">
      <div className="celebration-icon">🎉</div>
      <h3>You're all set!</h3>
      <p>Your personalized energy dashboard is ready. Here's what you can explore:</p>
    </div>

    <div className="features-grid">
      <div className="feature-preview">
        <h4>📊 Overview Dashboard</h4>
        <p>Quick energy logging with buttons and real-time insights</p>
      </div>
      <div className="feature-preview">
        <h4>🤖 AI Insights</h4>
        <p>Get personalized recommendations and advanced analytics</p>
      </div>
      <div className="feature-preview">
        <h4>💬 AI Chat</h4>
        <p>Interactive energy coaching and daily focus recommendations</p>
      </div>
      <div className="feature-preview">
        <h4>� Social Battery</h4>
        <p>Track your social energy and get smart interaction tips</p>
      </div>
    </div>

    <div className="next-steps">
      <p><strong>💡 Pro tip:</strong> Start by logging your energy in the Overview tab - just tap the buttons that match how you feel!</p>
    </div>
  </div>
);
