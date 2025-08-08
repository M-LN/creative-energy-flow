import React, { useState, useEffect } from 'react';
import './WelcomeTooltip.css';

interface WelcomeTooltipProps {
  onComplete: () => void;
}

export const WelcomeTooltip: React.FC<WelcomeTooltipProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const steps = [
    {
      title: "Welcome to Creative Energy Flow! 🌟",
      description: "Track your physical, mental, emotional, and creative energy levels throughout the day.",
      position: "center",
      highlight: null
    },
    {
      title: "Add Your First Energy Entry ➕",
      description: "Click the + button to record your current energy levels. This helps track patterns over time.",
      position: "bottom-right",
      highlight: ".energy-input-fab"
    },
    {
      title: "View Your Analytics 📊",
      description: "Switch to the Analytics tab to see charts and insights about your energy patterns.",
      position: "top",
      highlight: "[aria-label='Switch to analytics view']"
    },
    {
      title: "Get AI Insights 🤖",
      description: "On the Analytics screen, click the AI button for personalized insights and recommendations.",
      position: "bottom-right",
      highlight: ".ai-insights-fab"
    }
  ];

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setIsVisible(true);
    }
  }, []);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeWelcome();
    }
  };

  const skipWelcome = () => {
    completeWelcome();
  };

  const completeWelcome = () => {
    localStorage.setItem('hasSeenWelcome', 'true');
    setIsVisible(false);
    onComplete();
  };

  if (!isVisible) return null;

  const currentStepData = steps[currentStep];

  return (
    <div className="welcome-overlay">
      <div className="welcome-tooltip">
        <div className="welcome-header">
          <h3>{currentStepData.title}</h3>
          <button 
            className="welcome-skip" 
            onClick={skipWelcome}
            aria-label="Skip welcome tour"
          >
            ✕
          </button>
        </div>
        
        <div className="welcome-content">
          <p>{currentStepData.description}</p>
        </div>

        <div className="welcome-footer">
          <div className="welcome-progress">
            <span>{currentStep + 1} of {steps.length}</span>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                data-progress={((currentStep + 1) / steps.length) * 100}
              />
            </div>
          </div>
          
          <div className="welcome-actions">
            <button className="btn btn-ghost" onClick={skipWelcome}>
              Skip Tour
            </button>
            <button className="btn btn-primary" onClick={nextStep}>
              {currentStep < steps.length - 1 ? 'Next' : 'Get Started'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
