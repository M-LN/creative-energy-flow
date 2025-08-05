import React from 'react';
import type { EnergyLevel } from '../types/energy';
import { DateUtils } from '../utils/dateUtils';
import './EnergyCard.css';

interface EnergyCardProps {
  energyLevel: EnergyLevel;
  showTimestamp?: boolean;
  compact?: boolean;
  onClick?: () => void;
}

export const EnergyCard: React.FC<EnergyCardProps> = ({
  energyLevel,
  showTimestamp = true,
  compact = false,
  onClick,
}) => {
  const getEnergyColor = (value: number): string => {
    if (value <= 3) return 'var(--color-energy-low)';
    if (value <= 7) return 'var(--color-energy-medium)';
    return 'var(--color-energy-high)';
  };

  const getEnergyLevel = (value: number): string => {
    if (value <= 2) return 'Very Low';
    if (value <= 4) return 'Low';
    if (value <= 6) return 'Moderate';
    if (value <= 8) return 'High';
    return 'Very High';
  };

  const getTypeEmoji = (type: string): string => {
    const emojiMap = {
      physical: '💪',
      mental: '🧠',
      emotional: '❤️',
      creative: '🎨',
    };
    return emojiMap[type as keyof typeof emojiMap] || '⚡';
  };

  const getTimeOfDayEmoji = (timeOfDay: string): string => {
    const emojiMap = {
      morning: '🌅',
      afternoon: '☀️',
      evening: '🌙',
    };
    return emojiMap[timeOfDay as keyof typeof emojiMap] || '🕐';
  };

  const cardClasses = [
    'energy-card',
    compact ? 'energy-card--compact' : '',
    onClick ? 'energy-card--clickable' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={cardClasses}
      onClick={onClick}
      style={{ borderLeftColor: getEnergyColor(energyLevel.value) }}
    >
      <div className="energy-card__header">
        <div className="energy-card__type">
          <span className="energy-card__type-emoji">
            {getTypeEmoji(energyLevel.type)}
          </span>
          <span className="energy-card__type-label">
            {energyLevel.type.charAt(0).toUpperCase() + energyLevel.type.slice(1)}
          </span>
        </div>
        
        <div className="energy-card__time">
          <span className="energy-card__time-emoji">
            {getTimeOfDayEmoji(energyLevel.timeOfDay)}
          </span>
          <span className="energy-card__time-label">
            {energyLevel.timeOfDay.charAt(0).toUpperCase() + energyLevel.timeOfDay.slice(1)}
          </span>
        </div>
      </div>

      <div className="energy-card__main">
        <div className="energy-card__value-container">
          <div
            className="energy-card__value"
            style={{ color: getEnergyColor(energyLevel.value) }}
          >
            {energyLevel.value}
          </div>
          <div className="energy-card__scale">/10</div>
        </div>
        
        <div className="energy-card__level">
          {getEnergyLevel(energyLevel.value)}
        </div>
      </div>

      {showTimestamp && !compact && (
        <div className="energy-card__footer">
          <div className="energy-card__timestamp">
            {DateUtils.formatDisplayTime(energyLevel.timestamp)}
          </div>
        </div>
      )}

      <div
        className="energy-card__visual-indicator"
        style={{
          backgroundColor: getEnergyColor(energyLevel.value),
          height: `${(energyLevel.value / 10) * 100}%`,
        }}
      />
    </div>
  );
};