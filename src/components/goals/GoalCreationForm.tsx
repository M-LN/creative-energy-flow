// Goal Creation Form Component - Form for creating new energy goals
import React, { useState } from 'react';
import { EnergyGoal, GoalType, GoalMetric } from '../../types/goals';
import { EnergyType } from '../../types/energy';

interface GoalCreationFormProps {
  onSubmit: (goalData: Omit<EnergyGoal, 'id' | 'createdAt' | 'currentValue' | 'progress' | 'streak' | 'milestones'>) => void;
  onCancel: () => void;
}

export const GoalCreationForm: React.FC<GoalCreationFormProps> = ({ 
  onSubmit, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    energyType: 'overall' as EnergyType | 'overall',
    metric: 'average' as GoalMetric,
    targetValue: 70,
    goalType: 'weekly' as GoalType,
    duration: 30 // days
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Goal title is required';
    }

    if (formData.targetValue <= 0 || formData.targetValue > 100) {
      newErrors.targetValue = 'Target value must be between 1 and 100';
    }

    if (formData.duration <= 0 || formData.duration > 365) {
      newErrors.duration = 'Duration must be between 1 and 365 days';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + formData.duration);

    const goalData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      energyType: formData.energyType,
      metric: formData.metric,
      targetValue: formData.targetValue,
      goalType: formData.goalType,
      status: 'active' as const,
      startDate,
      endDate,
      reminders: []
    };

    onSubmit(goalData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getEnergyTypeIcon = (energyType: string) => {
    const icons = {
      physical: '💪',
      mental: '🧠',
      emotional: '❤️',
      creative: '🎨',
      overall: '⚡'
    };
    return icons[energyType as keyof typeof icons] || '⚡';
  };

  const getMetricDescription = (metric: GoalMetric) => {
    const descriptions = {
      average: 'Maintain an average energy level',
      minimum: 'Never fall below this energy level',
      maximum: 'Reach this peak energy level',
      consistency: 'Stay above target this percentage of time'
    };
    return descriptions[metric];
  };

  const getGoalTypeDescription = (goalType: GoalType) => {
    const descriptions = {
      daily: 'Track progress daily',
      weekly: 'Track progress weekly',
      monthly: 'Track progress monthly'
    };
    return descriptions[goalType];
  };

  return (
    <div className="goal-creation-form">
      <button 
        type="button" 
        className="modal-close-btn"
        onClick={onCancel}
        aria-label="Close modal"
      >
        ✕
      </button>
      
      <div className="form-header">
        <h2>🎯 Create New Energy Goal</h2>
        <p>Set a target to improve your energy levels</p>
      </div>

      <form onSubmit={handleSubmit} className="goal-form">
        {/* Goal Title */}
        <div className="form-group">
          <label htmlFor="title" className="form-label">
            Goal Title *
          </label>
          <input
            id="title"
            type="text"
            className={`form-input ${errors.title ? 'error' : ''}`}
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="e.g., Improve Morning Energy"
            maxLength={100}
          />
          {errors.title && <span className="error-message">{errors.title}</span>}
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="description" className="form-label">
            Description
          </label>
          <textarea
            id="description"
            className="form-textarea"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe your goal and why it's important to you..."
            maxLength={500}
            rows={3}
          />
          <small className="form-help">
            {formData.description.length}/500 characters
          </small>
        </div>

        {/* Energy Type */}
        <div className="form-group">
          <label className="form-label">Energy Type</label>
          <div className="energy-type-grid">
            {(['overall', 'physical', 'mental', 'emotional', 'creative'] as const).map(type => (
              <button
                key={type}
                type="button"
                className={`energy-type-btn ${formData.energyType === type ? 'selected' : ''}`}
                onClick={() => handleInputChange('energyType', type)}
              >
                <span className="energy-icon">{getEnergyTypeIcon(type)}</span>
                <span className="energy-label">
                  {type === 'overall' ? 'Overall' : type.charAt(0).toUpperCase() + type.slice(1)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Goal Metric */}
        <div className="form-group">
          <label className="form-label">Measurement Type</label>
          <div className="metric-grid">
            {(['average', 'minimum', 'maximum', 'consistency'] as const).map(metric => (
              <button
                key={metric}
                type="button"
                className={`metric-btn ${formData.metric === metric ? 'selected' : ''}`}
                onClick={() => handleInputChange('metric', metric)}
              >
                <span className="metric-title">
                  {metric.charAt(0).toUpperCase() + metric.slice(1)}
                </span>
                <span className="metric-description">
                  {getMetricDescription(metric)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Target Value */}
        <div className="form-group">
          <label htmlFor="targetValue" className="form-label">
            Target Value *
          </label>
          <div className="slider-input-group">
            <input
              id="targetValue"
              type="range"
              className="form-slider"
              min="1"
              max="100"
              value={formData.targetValue}
              onChange={(e) => handleInputChange('targetValue', parseInt(e.target.value))}
            />
            <input
              type="number"
              className={`form-number ${errors.targetValue ? 'error' : ''}`}
              min="1"
              max="100"
              value={formData.targetValue}
              onChange={(e) => handleInputChange('targetValue', parseInt(e.target.value) || 0)}
              aria-label="Target value input"
              title="Enter target value between 1 and 100"
            />
          </div>
          <small className="form-help">
            {formData.metric === 'consistency' ? 
              `Achieve target ${formData.targetValue}% of the time` :
              `Target ${formData.metric} energy level: ${formData.targetValue}`
            }
          </small>
          {errors.targetValue && <span className="error-message">{errors.targetValue}</span>}
        </div>

        {/* Goal Type */}
        <div className="form-group">
          <label className="form-label">Tracking Frequency</label>
          <div className="goal-type-grid">
            {(['daily', 'weekly', 'monthly'] as const).map(type => (
              <button
                key={type}
                type="button"
                className={`goal-type-btn ${formData.goalType === type ? 'selected' : ''}`}
                onClick={() => handleInputChange('goalType', type)}
              >
                <span className="goal-type-title">
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </span>
                <span className="goal-type-description">
                  {getGoalTypeDescription(type)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div className="form-group">
          <label htmlFor="duration" className="form-label">
            Duration (days) *
          </label>
          <input
            id="duration"
            type="number"
            className={`form-input ${errors.duration ? 'error' : ''}`}
            value={formData.duration}
            onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
            min="1"
            max="365"
          />
          <small className="form-help">
            Goal will run until {new Date(Date.now() + formData.duration * 24 * 60 * 60 * 1000).toLocaleDateString()}
          </small>
          {errors.duration && <span className="error-message">{errors.duration}</span>}
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="btn secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn primary"
          >
            Create Goal
          </button>
        </div>
      </form>
    </div>
  );
};
