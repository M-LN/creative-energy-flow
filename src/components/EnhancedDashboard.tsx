import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { EnergyLevel, SocialBatteryData } from '../types/energy';
import { CreativeConstraint, CreativeConstraintEngine, ConstraintSession } from '../services/CreativeConstraintEngine';
import { EnergyInputForm } from './EnergyInputForm';
import { StorageService } from '../services/StorageService';
import { ToastContainer, useToast } from './ToastNotification';
import { LoadingSpinner } from './LoadingSpinner';
import './EnhancedDashboard.css';

interface EnhancedDashboardProps {
  currentEnergy: EnergyLevel;
  socialBattery?: SocialBatteryData;
  onEnergyUpdate: (energy: EnergyLevel) => void;
  onEnergyDataUpdate?: (energyData: EnergyLevel[]) => void;
}

export const EnhancedDashboard: React.FC<EnhancedDashboardProps> = ({
  currentEnergy,
  socialBattery,
  onEnergyUpdate,
  onEnergyDataUpdate
}) => {
  const [dailyConstraint, setDailyConstraint] = useState<CreativeConstraint | null>(null);
  const [currentSession, setCurrentSession] = useState<ConstraintSession | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [completedSessions, setCompletedSessions] = useState<ConstraintSession[]>([]);
  const [showEnergyForm, setShowEnergyForm] = useState(false);
  const [energyDataHistory, setEnergyDataHistory] = useState<EnergyLevel[]>([]);
  const { toasts, removeToast, showSuccess, showError } = useToast();

  // Load energy data from storage on mount
  useEffect(() => {
    const savedData = StorageService.loadEnergyData();
    if (savedData.length > 0) {
      const processedData = savedData.map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      }));
      setEnergyDataHistory(processedData);
    }
  }, []);

  const generateTodaysConstraint = useCallback(() => {
    const constraint = CreativeConstraintEngine.generateDailyConstraint(currentEnergy);
    setDailyConstraint(constraint);
  }, [currentEnergy]);

  useEffect(() => {
    generateTodaysConstraint();
  }, [generateTodaysConstraint]);

  const handleTimerComplete = useCallback(() => {
    if (currentSession) {
      const completedSession: ConstraintSession = {
        ...currentSession,
        endTime: new Date(),
        duration: Math.round((new Date().getTime() - currentSession.startTime.getTime()) / (1000 * 60)),
        isCompleted: true,
        energyAfter: currentEnergy
      };
      setCompletedSessions(prev => [...prev, completedSession]);
      setCurrentSession(null);
    }
  }, [currentSession, currentEnergy]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setTimerRunning(false);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timeRemaining, handleTimerComplete]);

  const startConstraint = () => {
    if (!dailyConstraint) return;
    
    const session: ConstraintSession = {
      id: `session-${Date.now()}`,
      constraintId: dailyConstraint.id,
      startTime: new Date(),
      duration: 0,
      isCompleted: false,
      energyBefore: currentEnergy
    };
    
    setCurrentSession(session);
    setTimeRemaining(dailyConstraint.duration * 60);
    setTimerRunning(true);
  };

  const pauseTimer = () => {
    setTimerRunning(false);
  };

  const resumeTimer = () => {
    setTimerRunning(true);
  };

  const skipConstraint = () => {
    generateTodaysConstraint();
    setCurrentSession(null);
    setTimerRunning(false);
    setTimeRemaining(0);
  };

  const handleAddEnergyEntry = (entry: EnergyLevel) => {
    try {
      // Update current energy state
      onEnergyUpdate(entry);
      
      // Add to energy data history and save to storage
      const updatedHistory = [...energyDataHistory, entry].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      setEnergyDataHistory(updatedHistory);
      StorageService.saveEnergyData(updatedHistory);
      
      // Update parent component with new data if callback provided
      if (onEnergyDataUpdate) {
        onEnergyDataUpdate(updatedHistory);
      }
      
      // Close the form
      setShowEnergyForm(false);
      
      // Show success notification
      showSuccess('Energy Entry Added! 🌟', `Physical: ${entry.physical}% • Mental: ${entry.mental}% • Emotional: ${entry.emotional}% • Creative: ${entry.creative}%`);
    } catch (error) {
      console.error('Error saving energy entry:', error);
      showError('Failed to Save Entry', 'There was an error saving your energy entry. Please try again.');
    }
  };

  const toggleEnergyForm = () => {
    setShowEnergyForm(!showEnergyForm);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getEnergyBars = (level: number): string => {
    const bars = Math.round(level / 20);
    return '▓'.repeat(bars) + '░'.repeat(5 - bars);
  };

  const getConstraintTypeEmoji = (type: string): string => {
    switch (type) {
      case 'visual': return '🎨';
      case 'writing': return '✍️';
      case 'digital': return '💻';
      case 'physical': return '🏃‍♂️';
      case 'music': return '🎵';
      case 'mixed': return '✨';
      default: return '✨';
    }
  };

  const metrics = useMemo(() => {
    const totalSessions = completedSessions.length;
    const totalDuration = completedSessions.reduce((sum, session) => sum + session.duration, 0);
    const avgDuration = totalSessions > 0 ? totalDuration / totalSessions : 0;
    
    return {
      completionRate: totalSessions,
      averageDuration: avgDuration,
      energyImpact: 0,
      favoriteTypes: [],
      streak: 0
    };
  }, [completedSessions]);

  if (!dailyConstraint) {
    return (
      <div className="loading-container">
        <LoadingSpinner size="medium" />
        <p>Generating your daily creative constraint...</p>
      </div>
    );
  }

  return (
    <div className="enhanced-dashboard">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div className="header-title-container">
            <h1 className="dashboard-title">
              ☀️ Creative Energy Flow
            </h1>
          </div>
        </header>

        <div className="energy-status-card">
          <div className="energy-row">
            <span className="energy-label">🔋 Creative Energy:</span>
            <span className="energy-value">
              {getEnergyBars(currentEnergy.overall)} ({Math.round(currentEnergy.overall)}/100)
            </span>
          </div>
          <div className="energy-row">
            <span className="energy-label">👥 Social Battery:</span>
            <span className="energy-value">
              {getEnergyBars(socialBattery?.level ?? 75)} ({Math.round(socialBattery?.level ?? 75)}/100)
            </span>
          </div>
          <div className="energy-row">
            <span className="energy-label">🧠 Mental Focus:</span>
            <span className="energy-value">
              {getEnergyBars(currentEnergy.mental)} ({Math.round(currentEnergy.mental)}/100)
            </span>
          </div>
        </div>

        <div className="constraint-section">
          <h2 className="constraint-title">
            {getConstraintTypeEmoji(dailyConstraint.type)} Today's Creative Challenge
          </h2>

          <div className={`constraint-card ${currentSession ? 'active' : ''}`}>
            <div className="constraint-header">
              <h3 className="constraint-card-title">{dailyConstraint.title}</h3>
            </div>
            <p className="constraint-card-description">{dailyConstraint.description}</p>
            
            <div className="constraint-meta">
              <span className={`constraint-meta-item difficulty-${dailyConstraint.difficulty}`}>
                {dailyConstraint.difficulty.toUpperCase()}
              </span>
              <span className={`constraint-meta-item category-${dailyConstraint.type}`}>
                {dailyConstraint.type.toUpperCase()}
              </span>
              <span className="constraint-meta-item">
                ⏱️ {dailyConstraint.duration} MIN
              </span>
            </div>

            {currentSession && (
              <div className="timer-section">
                <div className="timer-display">{formatTime(timeRemaining)}</div>
                <div className="timer-controls">
                  {!timerRunning ? (
                    <button
                      className="btn btn-primary"
                      onClick={timeRemaining === dailyConstraint.duration * 60 ? startConstraint : resumeTimer}
                    >
                      {timeRemaining === dailyConstraint.duration * 60 ? '▶️ Start' : '▶️ Resume'}
                    </button>
                  ) : (
                    <button className="btn btn-secondary" onClick={pauseTimer}>
                      ⏸️ Pause
                    </button>
                  )}
                  <button className="btn btn-ghost" onClick={skipConstraint}>
                    ⏭️ Skip
                  </button>
                </div>
              </div>
            )}

            {!currentSession && (
              <div className="action-buttons">
                <button className="btn btn-primary" onClick={startConstraint}>
                  🚀 Start Challenge
                </button>
                <button className="btn btn-ghost" onClick={skipConstraint}>
                  🎲 New Challenge
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-number">{completedSessions.length}</div>
            <div className="summary-label">Completed</div>
          </div>
          <div className="summary-card">
            <div className="summary-number">{Math.round(metrics.averageDuration)}</div>
            <div className="summary-label">Avg Minutes</div>
          </div>
          <div className="summary-card">
            <div className="summary-number">{Math.round(completedSessions.reduce((sum, s) => sum + s.duration, 0) / 60)}</div>
            <div className="summary-label">Total Hours</div>
          </div>
        </div>
      </div>

      {/* Energy Input Form */}
      <EnergyInputForm
        isOpen={showEnergyForm}
        onAddEntry={handleAddEnergyEntry}
        onToggleForm={toggleEnergyForm}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
};
