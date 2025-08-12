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
      description: "Your personal energy management dashboard with AI-powered insights. Track your physical, mental, emotional, and creative energy levels with an intuitive button-based interface.",
      position: "center",
      highlight: null
    },
    {
      title: "Quick Energy Logging 🎯",
      description: "Use the 'Log Current Energy' section in Overview to quickly record your energy levels using simple buttons - no more sliders! Just tap the level that matches how you feel.",
      position: "top",
      highlight: ".quick-energy-form"
    },
    {
      title: "Explore Your Social Battery 🔋",
      description: "Check out the Social Battery tab to track your social energy and get AI-powered recommendations for social interactions based on your current state.",
      position: "top",
      highlight: "[data-tab='social-battery']"
    },
    {
      title: "AI-Powered Insights 🤖",
      description: "Visit the AI Insights tab to get personalized recommendations, energy predictions, and smart tips. Click 'Advanced AI Analytics' for detailed analysis and learning dashboard.",
      position: "top",
      highlight: "[data-tab='ai-insights']"
    },
    {
      title: "View Your Analytics 📊",
      description: "Check the Analytics tab to see beautiful charts of your energy patterns, weekly heatmaps, and detailed breakdowns of your energy types.",
      position: "top",
      highlight: "[data-tab='analytics']"
    },
    {
      title: "AI Chat Assistant 💬",
      description: "Access the AI Chat tab for personalized energy coaching, daily focus recommendations, and interactive conversations about optimizing your energy.",
      position: "top",
      highlight: "[data-tab='ai-chat']"
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
