import React, { useState } from 'react';
import { EnergyLevel, EnergyType } from '../types/energy';
import './EnergyInputForm.css';

interface EnergyInputFormProps {
  onAddEntry: (entry: EnergyLevel) => void;
  onToggleForm: () => void;
  isOpen: boolean;
}

export const EnergyInputForm: React.FC<EnergyInputFormProps> = ({
  onAddEntry,
  onToggleForm,
  isOpen
}) => {
  const [energyLevels, setEnergyLevels] = useState({
    physical: 50,
    mental: 50,
    emotional: 50,
    creative: 50
  });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 16));
  const [notes, setNotes] = useState('');

  const handleSliderChange = (energyType: EnergyType, value: number) => {
    setEnergyLevels(prev => ({
      ...prev,
      [energyType]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const overall = (energyLevels.physical + energyLevels.mental + energyLevels.emotional + energyLevels.creative) / 4;
    
    const newEntry: EnergyLevel = {
      timestamp: new Date(selectedDate),
      physical: energyLevels.physical,
      mental: energyLevels.mental,
      emotional: energyLevels.emotional,
      creative: energyLevels.creative,
      overall
    };

    onAddEntry(newEntry);
    
    // Reset form
    setEnergyLevels({
      physical: 50,
      mental: 50,
      emotional: 50,
      creative: 50
    });
    setNotes('');
    onToggleForm();
  };

  const getEnergyLevelClass = (value: number): string => {
    if (value >= 80) return 'high';
    if (value >= 60) return 'good';
    if (value >= 40) return 'low';
    return 'very-low';
  };

  const getEnergyDescription = (value: number): string => {
    if (value >= 80) return 'High';
    if (value >= 60) return 'Good';
    if (value >= 40) return 'Low';
    return 'Very Low';
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggleForm}
        className="energy-input-fab"
        aria-label="Open energy level input form"
        title="Add new energy entry"
      >
        +
      </button>
    );
  }

  const overallEnergy = Math.round((energyLevels.physical + energyLevels.mental + energyLevels.emotional + energyLevels.creative) / 4);

  return (
    <div className="energy-input-overlay">
      <div className="energy-input-modal" role="dialog" aria-labelledby="energy-form-title" aria-modal="true">
        <div className="energy-input-header">
          <h2 id="energy-form-title" className="energy-input-title">
            Log Energy Levels
          </h2>
          <button
            onClick={onToggleForm}
            className="energy-input-close"
            aria-label="Close energy input form"
            title="Close form"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Date/Time Input */}
          <div className="energy-input-field">
            <label htmlFor="energy-datetime" className="energy-input-label">
              Date & Time
            </label>
            <input
              id="energy-datetime"
              type="datetime-local"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="energy-input-datetime"
              required
              aria-describedby="datetime-help"
            />
          </div>

          {/* Energy Level Sliders */}
          {(Object.keys(energyLevels) as EnergyType[]).map(energyType => {
            const energyValue = energyLevels[energyType];
            const energyLevel = getEnergyLevelClass(energyValue);
            const sliderId = `energy-slider-${energyType}`;
            
            return (
              <div key={energyType} className="energy-slider-container">
                <div className="energy-slider-header">
                  <label htmlFor={sliderId} className="energy-slider-label">
                    {energyType} Energy
                  </label>
                  <div className="energy-slider-values">
                    <span 
                      className="energy-value" 
                      data-level={energyLevel}
                      aria-live="polite"
                    >
                      {energyValue}%
                    </span>
                    <span className="energy-description">
                      ({getEnergyDescription(energyValue)})
                    </span>
                  </div>
                </div>
                <input
                  id={sliderId}
                  type="range"
                  min="0"
                  max="100"
                  value={energyValue}
                  onChange={(e) => handleSliderChange(energyType, parseInt(e.target.value))}
                  className="energy-range-slider"
                  aria-label={`${energyType} energy level: ${energyValue}% (${getEnergyDescription(energyValue)})`}
                  aria-valuetext={`${energyValue}% - ${getEnergyDescription(energyValue)}`}
                />
              </div>
            );
          })}

          {/* Overall Energy Display */}
          <div className="energy-overall-display">
            <span className="energy-overall-label">
              Overall Energy
            </span>
            <span 
              className="energy-overall-value" 
              data-level={getEnergyLevelClass(overallEnergy)}
              aria-live="polite"
            >
              {overallEnergy}%
            </span>
          </div>

          {/* Notes */}
          <div className="energy-input-field">
            <label htmlFor="energy-notes" className="energy-input-label">
              Notes (Optional)
            </label>
            <textarea
              id="energy-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How are you feeling? What's affecting your energy today?"
              className="energy-notes-textarea"
              aria-describedby="notes-help"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="energy-submit-button"
            aria-describedby="submit-help"
          >
            Save Energy Entry
          </button>
        </form>
      </div>
    </div>
  );
};
