import React from 'react';
import './EnergyLevelSlider.css';

interface EnergyLevelSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  disabled?: boolean;
}

export const EnergyLevelSlider: React.FC<EnergyLevelSliderProps> = ({
  value,
  onChange,
  min = 1,
  max = 10,
  step = 1,
  label = 'Energy Level',
  disabled = false,
}) => {
  const getEnergyColor = (val: number): string => {
    if (val <= 3) return 'var(--color-energy-low)';
    if (val <= 7) return 'var(--color-energy-medium)';
    return 'var(--color-energy-high)';
  };

  const getEnergyLabel = (val: number): string => {
    if (val <= 2) return 'Very Low';
    if (val <= 4) return 'Low';
    if (val <= 6) return 'Moderate';
    if (val <= 8) return 'High';
    return 'Very High';
  };

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(event.target.value, 10);
    onChange(newValue);
  };

  return (
    <div className="energy-slider">
      <div className="energy-slider__header">
        <label className="energy-slider__label" htmlFor="energy-slider">
          {label}
        </label>
        <div className="energy-slider__value-display">
          <span 
            className="energy-slider__value"
            style={{ color: getEnergyColor(value) }}
          >
            {value}
          </span>
          <span className="energy-slider__level-text">
            {getEnergyLabel(value)}
          </span>
        </div>
      </div>

      <div className="energy-slider__container">
        <input
          id="energy-slider"
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSliderChange}
          disabled={disabled}
          className="energy-slider__input"
          style={{
            background: `linear-gradient(to right, 
              var(--color-energy-low) 0%, 
              var(--color-energy-medium) 50%, 
              var(--color-energy-high) 100%)`
          }}
        />
        
        <div className="energy-slider__markers">
          {Array.from({ length: max - min + 1 }, (_, i) => i + min).map((num) => (
            <div
              key={num}
              className={`energy-slider__marker ${value === num ? 'active' : ''}`}
              style={{ left: `${((num - min) / (max - min)) * 100}%` }}
            >
              {num}
            </div>
          ))}
        </div>
      </div>

      <div className="energy-slider__feedback">
        <div 
          className="energy-slider__visual-feedback"
          style={{
            backgroundColor: getEnergyColor(value),
            transform: `scale(${0.5 + (value / max) * 0.5})`,
          }}
        />
      </div>
    </div>
  );
};