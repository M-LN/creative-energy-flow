import React, { useState } from 'react';
import { WelcomeTooltip } from './WelcomeTooltip';
import './HelpPanel.css';

interface HelpPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpPanel: React.FC<HelpPanelProps> = ({ isOpen, onClose }) => {
  const [showWelcomeTour, setShowWelcomeTour] = useState(false);

  const handleRestartTour = () => {
    // Clear the localStorage flag and show tour
    localStorage.removeItem('hasSeenWelcome');
    setShowWelcomeTour(true);
    onClose();
  };

  const handleTourComplete = () => {
    setShowWelcomeTour(false);
  };

  const handleResetApp = () => {
    // Clear all localStorage data
    localStorage.clear();
    window.location.reload();
  };

  if (!isOpen && !showWelcomeTour) return null;

  return (
    <>
      {showWelcomeTour && (
        <WelcomeTooltip onComplete={handleTourComplete} />
      )}
      
      {isOpen && (
        <div className="help-panel-overlay" onClick={onClose}>
          <div className="help-panel" onClick={(e) => e.stopPropagation()}>
            <div className="help-panel-header">
              <h2>🛟 Help & Guidance</h2>
              <button 
                className="close-button" 
                onClick={onClose}
                aria-label="Close help panel"
              >
                ×
              </button>
            </div>
            
            <div className="help-panel-content">
              <div className="help-section">
                <h3>🎯 Quick Start</h3>
                <ul>
                  <li><strong>Track Energy:</strong> Use the button on Home screen to log your current energy levels</li>
                  <li><strong>View Analytics:</strong> Switch to Analytics tab to see your energy patterns</li>
                  <li><strong>Get AI Insights:</strong> Click the AI button on Analytics for personalized recommendations</li>
                  <li><strong>Set Goals:</strong> Use the Goals tab to track your energy objectives</li>
                </ul>
              </div>

              <div className="help-section">
                <h3>💡 Pro Tips</h3>
                <ul>
                  <li><strong>Daily Tracking:</strong> Log energy 2-3 times daily for best insights</li>
                  <li><strong>Pattern Recognition:</strong> Look for trends in your peak and low energy times</li>
                  <li><strong>Creative Constraints:</strong> Use the daily challenges to boost creativity</li>
                  <li><strong>Data Export:</strong> Export your data on Analytics screen for deeper analysis</li>
                </ul>
              </div>

              <div className="help-section">
                <h3>🔍 Help Features</h3>
                <ul>
                  <li><strong>Help Icons:</strong> Look for ? and ℹ️ icons throughout the app</li>
                  <li><strong>Quick Tips:</strong> Blue tip boxes provide contextual guidance</li>
                  <li><strong>Tooltips:</strong> Hover over help icons for detailed explanations</li>
                  <li><strong>Welcome Tour:</strong> First-time users see a guided introduction</li>
                </ul>
              </div>

              <div className="help-actions">
                <button 
                  className="help-action-button primary"
                  onClick={handleRestartTour}
                >
                  🔄 Restart Welcome Tour
                </button>
                <button 
                  className="help-action-button secondary"
                  onClick={handleResetApp}
                >
                  🔄 Reset App Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Floating Help Button Component
export const FloatingHelpButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <button 
      className="floating-help-button"
      onClick={onClick}
      aria-label="Open help panel"
      title="Need help? Click here!"
    >
      <span className="help-icon-large">?</span>
    </button>
  );
};
