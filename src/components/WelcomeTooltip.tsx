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
      description: "Your personal energy management dashboard with AI insights. Let's get you started!",
      position: "center",
      highlight: null
    },
    {
      title: "Log Your Energy 📊",
      description: "Use the button-based energy logging in Overview - just tap the levels that match how you feel right now.",
      position: "top",
      highlight: ".quick-energy-form"
    },
    {
      title: "Explore Your Social Battery 🔋",
      description: "Check the Social Battery tab to track your social energy and get smart recommendations.",
      position: "top",
      highlight: "[data-tab='social-battery']"
    },
    {
      title: "Get AI Insights 🤖",
      description: "Visit AI Insights for personalized tips and advanced analytics about your energy patterns.",
      position: "top",
      highlight: "[data-tab='ai-insights']"
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
