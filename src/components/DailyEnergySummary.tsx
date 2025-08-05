import React from 'react';
import type { DailyEnergyData, EnergyType } from '../types/energy';
import { DateUtils } from '../utils/dateUtils';
import { EnergyCard } from './EnergyCard';
import './DailyEnergySummary.css';

interface DailyEnergySummaryProps {
  dailyData: DailyEnergyData | null;
  isToday?: boolean;
}

export const DailyEnergySummary: React.FC<DailyEnergySummaryProps> = ({
  dailyData,
  isToday = false,
}) => {
  if (!dailyData || dailyData.entries.length === 0) {
    return (
      <div className="daily-summary">
        <div className="daily-summary__header">
          <h3 className="daily-summary__title">
            {isToday ? "Today's Energy" : DateUtils.formatDisplayDate(dailyData?.date || '')}
          </h3>
          <div className="daily-summary__date">
            {isToday ? DateUtils.formatDisplayDate(DateUtils.getCurrentDate()) : ''}
          </div>
        </div>
        
        <div className="daily-summary__empty">
          <div className="daily-summary__empty-icon">📊</div>
          <div className="daily-summary__empty-text">
            No energy data recorded yet
          </div>
          <div className="daily-summary__empty-subtitle">
            Start tracking your energy levels to see insights here
          </div>
        </div>
      </div>
    );
  }

  const getTypeStats = () => {
    const typeGroups = dailyData.entries.reduce((acc, entry) => {
      if (!acc[entry.type]) {
        acc[entry.type] = [];
      }
      acc[entry.type].push(entry.value);
      return acc;
    }, {} as Record<EnergyType, number[]>);

    return Object.entries(typeGroups).map(([type, values]) => ({
      type: type as EnergyType,
      average: values.reduce((sum, val) => sum + val, 0) / values.length,
      count: values.length,
      latest: Math.max(...values.map((_, i) => i)), // Index of latest entry
    }));
  };

  const getTimeStats = () => {
    const timeGroups = dailyData.entries.reduce((acc, entry) => {
      if (!acc[entry.timeOfDay]) {
        acc[entry.timeOfDay] = [];
      }
      acc[entry.timeOfDay].push(entry.value);
      return acc;
    }, {} as Record<string, number[]>);

    return Object.entries(timeGroups).map(([time, values]) => ({
      time,
      average: values.reduce((sum, val) => sum + val, 0) / values.length,
      count: values.length,
    }));
  };

  const typeStats = getTypeStats();
  const timeStats = getTimeStats();
  const latestEntries = dailyData.entries
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 3);

  const getEnergyColor = (value: number): string => {
    if (value <= 3) return 'var(--color-energy-low)';
    if (value <= 7) return 'var(--color-energy-medium)';
    return 'var(--color-energy-high)';
  };

  return (
    <div className="daily-summary">
      <div className="daily-summary__header">
        <h3 className="daily-summary__title">
          {isToday ? "Today's Energy" : DateUtils.formatDisplayDate(dailyData.date)}
        </h3>
        <div className="daily-summary__average">
          <span 
            className="daily-summary__average-value"
            style={{ color: getEnergyColor(dailyData.averageLevel) }}
          >
            {dailyData.averageLevel.toFixed(1)}
          </span>
          <span className="daily-summary__average-label">avg</span>
        </div>
      </div>

      <div className="daily-summary__stats">
        <div className="daily-summary__stat-group">
          <h4 className="daily-summary__stat-title">By Energy Type</h4>
          <div className="daily-summary__type-stats">
            {typeStats.map(({ type, average, count }) => (
              <div key={type} className="daily-summary__type-stat">
                <div className="daily-summary__type-info">
                  <span className="daily-summary__type-name">{type}</span>
                  <span className="daily-summary__type-count">×{count}</span>
                </div>
                <div 
                  className="daily-summary__type-avg"
                  style={{ color: getEnergyColor(average) }}
                >
                  {average.toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="daily-summary__stat-group">
          <h4 className="daily-summary__stat-title">By Time of Day</h4>
          <div className="daily-summary__time-stats">
            {timeStats.map(({ time, average, count }) => (
              <div key={time} className="daily-summary__time-stat">
                <div className="daily-summary__time-info">
                  <span className="daily-summary__time-name">{time}</span>
                  <span className="daily-summary__time-count">×{count}</span>
                </div>
                <div 
                  className="daily-summary__time-avg"
                  style={{ color: getEnergyColor(average) }}
                >
                  {average.toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="daily-summary__recent">
        <h4 className="daily-summary__recent-title">Recent Entries</h4>
        <div className="daily-summary__recent-list">
          {latestEntries.map((entry) => (
            <EnergyCard
              key={entry.id}
              energyLevel={entry}
              showTimestamp={true}
              compact={true}
            />
          ))}
        </div>
      </div>
    </div>
  );
};