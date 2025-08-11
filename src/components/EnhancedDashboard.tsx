import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { EnergyLevel, SocialBatteryData } from '../types/energy';
import { CreativeConstraint, CreativeConstraintEngine, ConstraintSession } from '../services/CreativeConstraintEngine';
import { EnergyInputForm } from './EnergyInputForm';
import { StorageService } from '../services/StorageService';
import { ToastContainer, useToast } from './ToastNotification';
import { LoadingSpinner } from './LoadingSpinner';
import { AIChatAssistant } from './AIChatAssistant';
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
  const [showAIChat, setShowAIChat] = useState(false);
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

  // Calculate proper constraint metrics using the engine
  const constraintMetrics = useMemo(() => {
    return CreativeConstraintEngine.calculateConstraintMetrics(completedSessions);
  }, [completedSessions]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getEnergyBars = (level: number): string => {
    const bars = Math.round(level / 20);
    return '▓'.repeat(bars) + '░'.repeat(5 - bars);
  };

  const getMotivationMessage = (energy: EnergyLevel, constraint: CreativeConstraint) => {
    const energyLevel = energy.overall;
    
    if (energyLevel >= 80) {
      return "You're energized and ready! This is perfect for pushing creative boundaries.";
    } else if (energyLevel >= 60) {
      return "Good energy level! This challenge should feel just right for you.";
    } else if (energyLevel >= 40) {
      return "A gentle creative challenge can help boost your energy. Take it at your own pace.";
    } else {
      return "Low energy? Perfect for mindful, meditative creative work. Be kind to yourself.";
    }
  };

  const getEnergyMatchEmoji = (energy: EnergyLevel, constraint: CreativeConstraint) => {
    const energyLevel = energy.overall;
    const constraintEnergy = constraint.energyLevel;
    
    if (constraintEnergy === 'low' && energyLevel < 50) return '🎯';
    if (constraintEnergy === 'medium' && energyLevel >= 40 && energyLevel < 80) return '✨';
    if (constraintEnergy === 'high' && energyLevel >= 70) return '🔥';
    return '👍';
  };

  const getEnergyMatchText = (energy: EnergyLevel, constraint: CreativeConstraint) => {
    const energyLevel = energy.overall;
    const constraintEnergy = constraint.energyLevel;
    
    if (constraintEnergy === 'low' && energyLevel < 50) return 'Perfect match for your current energy';
    if (constraintEnergy === 'medium' && energyLevel >= 40 && energyLevel < 80) return 'Great fit for your energy level';
    if (constraintEnergy === 'high' && energyLevel >= 70) return 'High energy - let\'s create something amazing!';
    if (energyLevel < 40 && constraintEnergy !== 'low') return 'Might be challenging - consider updating energy first';
    return 'Good creative opportunity';
  };

  const getConstraintTypeEmoji = (type: string) => {
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
          <div className="challenge-header">
            <div className="challenge-title-section">
              <h2 className="constraint-title">
                🎨 Today's Creative Challenge
              </h2>
              <div className="challenge-stats">
                <div className="stat-item">
                  <span className="stat-value">{completedSessions.length}</span>
                  <span className="stat-label">Done</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{constraintMetrics.streak}</span>
                  <span className="stat-label">Streak</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{Math.round(constraintMetrics.averageDuration)}</span>
                  <span className="stat-label">Avg Min</span>
                </div>
              </div>
            </div>
            
            <div className="challenge-actions">
              <button className="btn btn-ghost btn-small" onClick={skipConstraint} title="Get new challenge">
                🎲 New Challenge
              </button>
            </div>
          </div>

          <div className={`constraint-card modern-challenge ${currentSession ? 'active-session' : ''}`}>
            <div className="challenge-type-badge">
              <span className="type-icon">{getConstraintTypeEmoji(dailyConstraint.type)}</span>
              <span className="type-label">{dailyConstraint.type}</span>
            </div>

            <div className="challenge-content">
              <h3 className="challenge-title">{dailyConstraint.title}</h3>
              <p className="challenge-description">{dailyConstraint.description}</p>
              
              <div className="challenge-details">
                <div className="detail-row">
                  <div className="detail-item">
                    <span className="detail-icon">⏱️</span>
                    <span className="detail-text">{dailyConstraint.duration} minutes</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">⚡</span>
                    <span className="detail-text">{dailyConstraint.difficulty} level</span>
                  </div>
                  {dailyConstraint.materials && dailyConstraint.materials.length > 0 && (
                    <div className="detail-item">
                      <span className="detail-icon">🎯</span>
                      <span className="detail-text">{dailyConstraint.materials.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="motivation-message">
                <div className="motivation-icon">💡</div>
                <div className="motivation-text">
                  {getMotivationMessage(currentEnergy, dailyConstraint)}
                </div>
              </div>
            </div>

            {currentSession && (
              <div className="active-session-panel">
                <div className="session-progress">
                  <div className="progress-ring">
                    <div 
                      className={`progress-circle progress-${Math.floor(((dailyConstraint.duration * 60 - timeRemaining) / (dailyConstraint.duration * 60)) * 10) * 10}`}
                    ></div>
                    <div className="progress-content">
                      <div className="timer-display">{formatTime(timeRemaining)}</div>
                      <div className="progress-label">remaining</div>
                    </div>
                  </div>
                </div>
                
                <div className="session-controls">
                  {!timerRunning ? (
                    <button
                      className="btn btn-primary btn-large"
                      onClick={timeRemaining === dailyConstraint.duration * 60 ? startConstraint : resumeTimer}
                    >
                      {timeRemaining === dailyConstraint.duration * 60 ? '🚀 Begin Creating' : '▶️ Continue'}
                    </button>
                  ) : (
                    <button className="btn btn-secondary btn-large" onClick={pauseTimer}>
                      ⏸️ Pause Session
                    </button>
                  )}
                  <button className="btn btn-ghost" onClick={skipConstraint}>
                    ⏭️ End Session
                  </button>
                </div>
              </div>
            )}

            {!currentSession && (
              <div className="challenge-launch-panel">
                <div className="energy-match">
                  <div className="energy-indicator">
                    <span className="energy-emoji">{getEnergyMatchEmoji(currentEnergy, dailyConstraint)}</span>
                    <span className="energy-text">{getEnergyMatchText(currentEnergy, dailyConstraint)}</span>
                  </div>
                </div>
                
                <div className="launch-actions">
                  <button className="btn btn-primary btn-hero" onClick={startConstraint}>
                    <span className="btn-icon">🎨</span>
                    <span className="btn-text">Start Creating</span>
                    <span className="btn-duration">{dailyConstraint.duration}min</span>
                  </button>
                  
                  <div className="secondary-actions">
                    <button className="btn btn-outline" onClick={() => setShowEnergyForm(true)}>
                      📊 Update Energy First
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Completion celebration for just finished sessions */}
            {completedSessions.length > 0 && (
              <div className="recent-completion">
                <div className="completion-badge">
                  <span className="badge-icon">�</span>
                  <span className="badge-text">
                    Great work! You've completed {completedSessions.length} creative challenge{completedSessions.length !== 1 ? 's' : ''} this week.
                  </span>
                </div>
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
            <div className="summary-number">{Math.round(Math.max(0, completedSessions.reduce((sum, s) => sum + s.duration, 0) / 60))}</div>
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

      {/* AI Chat Assistant */}
      <AIChatAssistant
        data={energyDataHistory}
        currentEnergy={currentEnergy}
        isOpen={showAIChat}
        onToggle={() => setShowAIChat(!showAIChat)}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
};
