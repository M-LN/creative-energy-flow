import React, { useState } from 'react';
import { EnergyLevel, EnergyType } from '../types/energy';
import { ENERGY_COLORS } from '../utils/colors';

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

  const getEnergyColor = (value: number): string => {
    if (value >= 80) return '#10B981'; // green
    if (value >= 60) return '#F59E0B'; // yellow
    if (value >= 40) return '#F97316'; // orange
    return '#EF4444'; // red
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
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          backgroundColor: ENERGY_COLORS.creative,
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        +
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: ENERGY_COLORS.surface,
        borderRadius: '16px',
        padding: '30px',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{
            color: ENERGY_COLORS.text,
            fontSize: '24px',
            fontWeight: 'bold',
            margin: 0
          }}>
            Log Energy Levels
          </h2>
          <button
            onClick={onToggleForm}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              color: ENERGY_COLORS.textSecondary,
              cursor: 'pointer',
              padding: '5px',
              borderRadius: '4px'
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Date/Time Input */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{
              display: 'block',
              color: ENERGY_COLORS.text,
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '8px'
            }}>
              Date & Time
            </label>
            <input
              type="datetime-local"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: `1px solid ${ENERGY_COLORS.textSecondary}`,
                backgroundColor: ENERGY_COLORS.background,
                color: ENERGY_COLORS.text,
                fontSize: '14px'
              }}
              required
            />
          </div>

          {/* Energy Level Sliders */}
          {(Object.keys(energyLevels) as EnergyType[]).map(energyType => (
            <div key={energyType} style={{ marginBottom: '25px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <label style={{
                  color: ENERGY_COLORS.text,
                  fontSize: '16px',
                  fontWeight: '600',
                  textTransform: 'capitalize'
                }}>
                  {energyType} Energy
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{
                    color: getEnergyColor(energyLevels[energyType]),
                    fontWeight: 'bold',
                    fontSize: '18px'
                  }}>
                    {energyLevels[energyType]}%
                  </span>
                  <span style={{
                    color: ENERGY_COLORS.textSecondary,
                    fontSize: '12px'
                  }}>
                    ({getEnergyDescription(energyLevels[energyType])})
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={energyLevels[energyType]}
                onChange={(e) => handleSliderChange(energyType, parseInt(e.target.value))}
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: '4px',
                  background: `linear-gradient(to right, 
                    #EF4444 0%, 
                    #F97316 25%, 
                    #F59E0B 50%, 
                    #10B981 75%, 
                    #10B981 100%)`,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
            </div>
          ))}

          {/* Overall Energy Display */}
          <div style={{
            backgroundColor: ENERGY_COLORS.background,
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '25px',
            textAlign: 'center'
          }}>
            <span style={{
              color: ENERGY_COLORS.textSecondary,
              fontSize: '14px',
              display: 'block',
              marginBottom: '4px'
            }}>
              Overall Energy
            </span>
            <span style={{
              color: getEnergyColor((energyLevels.physical + energyLevels.mental + energyLevels.emotional + energyLevels.creative) / 4),
              fontSize: '24px',
              fontWeight: 'bold'
            }}>
              {Math.round((energyLevels.physical + energyLevels.mental + energyLevels.emotional + energyLevels.creative) / 4)}%
            </span>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{
              display: 'block',
              color: ENERGY_COLORS.text,
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '8px'
            }}>
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How are you feeling? What's affecting your energy today?"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: `1px solid ${ENERGY_COLORS.textSecondary}`,
                backgroundColor: ENERGY_COLORS.background,
                color: ENERGY_COLORS.text,
                fontSize: '14px',
                minHeight: '80px',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            style={{
              width: '100%',
              backgroundColor: ENERGY_COLORS.creative,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '16px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#7C3AED';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = ENERGY_COLORS.creative;
            }}
          >
            Save Energy Entry
          </button>
        </form>
      </div>
    </div>
  );
};
