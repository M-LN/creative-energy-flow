import React, { useState } from 'react';
import type { EnergyType } from '../types/energy';
import { useEnergyState } from '../hooks/useEnergyState';
import { EnergyCheckIn } from './EnergyCheckIn';
import { DailyEnergySummary } from './DailyEnergySummary';
import { EnergyCard } from './EnergyCard';
import { DateUtils } from '../utils/dateUtils';
import './EnergyDashboard.css';

export const EnergyDashboard: React.FC = () => {
  const {
    currentEnergy,
    todayData,
    weeklyTrends,
    isLoading,
    error,
    addEnergyLevel,
  } = useEnergyState();

  const [showCheckIn, setShowCheckIn] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const handleEnergySubmit = async (value: number, type: EnergyType) => {
    try {
      await addEnergyLevel(value, type);
      setFeedbackMessage(`✅ ${type} energy level saved: ${value}/10`);
      setShowCheckIn(false);
      
      // Clear feedback after 3 seconds
      setTimeout(() => setFeedbackMessage(null), 3000);
    } catch (error) {
      setFeedbackMessage(`❌ Failed to save energy level: ${error}`);
      setTimeout(() => setFeedbackMessage(null), 5000);
    }
  };

  const getWeeklyAverage = () => {
    if (weeklyTrends.length === 0) return 0;
    const sum = weeklyTrends.reduce((acc, day) => acc + day.averageEnergy, 0);
    return sum / weeklyTrends.length;
  };

  const getTodayCheckIns = () => {
    if (!todayData) return 0;
    return todayData.entries.length;
  };

  const currentTimeOfDay = DateUtils.getCurrentTimeOfDay();
  const timeEmoji = {
    morning: '🌅',
    afternoon: '☀️',
    evening: '🌙'
  };

  if (isLoading) {
    return (
      <div className="energy-dashboard">
        <div className="energy-dashboard__loading">
          <div className="energy-dashboard__spinner" />
          <p>Loading your energy data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="energy-dashboard">
      <header className="energy-dashboard__header">
        <div className="energy-dashboard__title">
          <h1>
            <span className="energy-dashboard__emoji">⚡</span>
            Creative Energy Flow
          </h1>
          <p className="energy-dashboard__subtitle">
            Track your daily energy and boost your creative potential
          </p>
        </div>
        
        <div className="energy-dashboard__quick-stats">
          <div className="energy-dashboard__stat">
            <span className="energy-dashboard__stat-value">
              {getTodayCheckIns()}
            </span>
            <span className="energy-dashboard__stat-label">
              Check-ins today
            </span>
          </div>
          <div className="energy-dashboard__stat">
            <span className="energy-dashboard__stat-value">
              {getWeeklyAverage().toFixed(1)}
            </span>
            <span className="energy-dashboard__stat-label">
              7-day average
            </span>
          </div>
        </div>
      </header>

      {error && (
        <div className="energy-dashboard__error">
          <span>⚠️</span>
          <p>{error}</p>
        </div>
      )}

      {feedbackMessage && (
        <div className="energy-dashboard__feedback">
          <p>{feedbackMessage}</p>
        </div>
      )}

      <main className="energy-dashboard__main">
        <div className="energy-dashboard__primary">
          {currentEnergy && (
            <section className="energy-dashboard__current">
              <div className="energy-dashboard__section-header">
                <h2>Current Energy</h2>
                <div className="energy-dashboard__current-time">
                  <span>{timeEmoji[currentTimeOfDay]}</span>
                  <span>{currentTimeOfDay}</span>
                </div>
              </div>
              <EnergyCard energyLevel={currentEnergy} showTimestamp={true} />
            </section>
          )}

          <section className="energy-dashboard__checkin-section">
            {!showCheckIn ? (
              <div className="energy-dashboard__checkin-prompt">
                <div className="energy-dashboard__checkin-content">
                  <h2>Ready for an energy check-in?</h2>
                  <p>How are you feeling right now? Track your energy to understand your patterns.</p>
                  <button
                    className="energy-dashboard__checkin-button"
                    onClick={() => setShowCheckIn(true)}
                  >
                    <span>📊</span>
                    Start Energy Check-in
                  </button>
                </div>
              </div>
            ) : (
              <EnergyCheckIn
                onSubmit={handleEnergySubmit}
                isLoading={isLoading}
              />
            )}
          </section>
        </div>

        <aside className="energy-dashboard__sidebar">
          <DailyEnergySummary
            dailyData={todayData}
            isToday={true}
          />

          {weeklyTrends.length > 0 && (
            <section className="energy-dashboard__trends">
              <h3>7-Day Energy Trends</h3>
              <div className="energy-dashboard__trend-chart">
                {weeklyTrends.map((trend) => {
                  const isToday = DateUtils.isToday(trend.date);
                  const height = trend.averageEnergy > 0 
                    ? Math.max(10, (trend.averageEnergy / 10) * 100) 
                    : 10;
                  
                  return (
                    <div key={trend.date} className="energy-dashboard__trend-day">
                      <div
                        className={`energy-dashboard__trend-bar ${isToday ? 'today' : ''}`}
                        style={{ height: `${height}%` }}
                        title={`${DateUtils.formatDisplayDate(trend.date)}: ${trend.averageEnergy.toFixed(1)}/10`}
                      />
                      <div className="energy-dashboard__trend-label">
                        {DateUtils.formatDisplayDate(trend.date).split(' ')[0]}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </aside>
      </main>
    </div>
  );
};