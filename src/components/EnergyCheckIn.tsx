import React, { useState } from 'react';
import type { EnergyType } from '../types/energy';
import { EnergyLevelSlider } from './EnergyLevelSlider';
import { EnergyTypeSelector } from './EnergyTypeSelector';
import { DateUtils } from '../utils/dateUtils';
import './EnergyCheckIn.css';

interface EnergyCheckInProps {
  onSubmit: (value: number, type: EnergyType) => void;
  initialValue?: number;
  initialType?: EnergyType;
  isLoading?: boolean;
  disabled?: boolean;
}

export const EnergyCheckIn: React.FC<EnergyCheckInProps> = ({
  onSubmit,
  initialValue = 5,
  initialType = 'physical',
  isLoading = false,
  disabled = false,
}) => {
  const [energyValue, setEnergyValue] = useState(initialValue);
  const [energyType, setEnergyType] = useState<EnergyType>(initialType);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting || disabled) return;

    try {
      setIsSubmitting(true);
      await onSubmit(energyValue, energyType);
    } catch (error) {
      console.error('Failed to submit energy check-in:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentTimeOfDay = DateUtils.getCurrentTimeOfDay();
  const timeOfDayEmoji = {
    morning: '🌅',
    afternoon: '☀️',
    evening: '🌙'
  };

  const isFormDisabled = isLoading || disabled || isSubmitting;

  return (
    <div className="energy-checkin">
      <div className="energy-checkin__header">
        <div className="energy-checkin__title">
          <span className="energy-checkin__emoji">
            {timeOfDayEmoji[currentTimeOfDay]}
          </span>
          <h2>Energy Check-In</h2>
        </div>
        <div className="energy-checkin__time-info">
          <span className="energy-checkin__time-label">
            {currentTimeOfDay.charAt(0).toUpperCase() + currentTimeOfDay.slice(1)}
          </span>
          <span className="energy-checkin__timestamp">
            {DateUtils.formatDisplayTime(DateUtils.getCurrentTimestamp())}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="energy-checkin__form">
        <EnergyTypeSelector
          selectedType={energyType}
          onChange={setEnergyType}
          disabled={isFormDisabled}
        />

        <EnergyLevelSlider
          value={energyValue}
          onChange={setEnergyValue}
          label="How's your energy level?"
          disabled={isFormDisabled}
        />

        <div className="energy-checkin__actions">
          <button
            type="submit"
            className="energy-checkin__submit"
            disabled={isFormDisabled}
          >
            {isSubmitting ? (
              <>
                <span className="energy-checkin__spinner" />
                Saving...
              </>
            ) : (
              <>
                <span>💾</span>
                Save Energy Level
              </>
            )}
          </button>
        </div>

        {isLoading && (
          <div className="energy-checkin__loading">
            <span className="energy-checkin__spinner" />
            Loading your energy data...
          </div>
        )}
      </form>
    </div>
  );
};