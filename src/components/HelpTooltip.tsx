import React, { useState } from 'react';
import './HelpTooltip.css';

interface HelpTooltipProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
  className?: string;
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  content,
  position = 'top',
  children,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className={`help-tooltip-container ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`help-tooltip help-tooltip-${position}`}>
          <div className="help-tooltip-content">
            {content}
          </div>
          <div className="help-tooltip-arrow"></div>
        </div>
      )}
    </div>
  );
};

interface QuickTipProps {
  title: string;
  description: string;
  icon?: string;
  onDismiss?: () => void;
}

export const QuickTip: React.FC<QuickTipProps> = ({
  title,
  description,
  icon = '💡',
  onDismiss
}) => {
  return (
    <div className="quick-tip">
      <div className="quick-tip-header">
        <span className="quick-tip-icon">{icon}</span>
        <h4 className="quick-tip-title">{title}</h4>
        {onDismiss && (
          <button 
            className="quick-tip-dismiss"
            onClick={onDismiss}
            aria-label="Dismiss tip"
          >
            ✕
          </button>
        )}
      </div>
      <p className="quick-tip-description">{description}</p>
    </div>
  );
};
