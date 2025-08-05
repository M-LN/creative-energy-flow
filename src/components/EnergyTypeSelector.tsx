import React from 'react';
import type { EnergyType } from '../types/energy';
import './EnergyTypeSelector.css';

interface EnergyTypeSelectorProps {
  selectedType: EnergyType;
  onChange: (type: EnergyType) => void;
  disabled?: boolean;
}

const energyTypes: { type: EnergyType; label: string; emoji: string; description: string }[] = [
  {
    type: 'physical',
    label: 'Physical',
    emoji: '💪',
    description: 'Body strength & stamina'
  },
  {
    type: 'mental',
    label: 'Mental',
    emoji: '🧠',
    description: 'Focus & cognitive clarity'
  },
  {
    type: 'emotional',
    label: 'Emotional',
    emoji: '❤️',
    description: 'Emotional well-being'
  },
  {
    type: 'creative',
    label: 'Creative',
    emoji: '🎨',
    description: 'Creative inspiration'
  }
];

export const EnergyTypeSelector: React.FC<EnergyTypeSelectorProps> = ({
  selectedType,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="energy-type-selector">
      <h3 className="energy-type-selector__title">Energy Type</h3>
      <div className="energy-type-selector__grid">
        {energyTypes.map(({ type, label, emoji, description }) => (
          <button
            key={type}
            className={`energy-type-selector__option ${
              selectedType === type ? 'active' : ''
            }`}
            onClick={() => onChange(type)}
            disabled={disabled}
            aria-label={`Select ${label} energy type`}
          >
            <div className="energy-type-selector__emoji">
              {emoji}
            </div>
            <div className="energy-type-selector__label">
              {label}
            </div>
            <div className="energy-type-selector__description">
              {description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};