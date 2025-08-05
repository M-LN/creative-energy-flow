import React, { useMemo } from 'react';
import { EnergyLevel } from '../../types/energy';
import { ENERGY_COLORS, getEnergyColor } from '../../utils/colors';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import './WeeklyEnergyHeatmap.css';

interface WeeklyEnergyHeatmapProps {
  data: EnergyLevel[];
  weeks?: number;
  energyType?: 'overall' | 'physical' | 'mental' | 'emotional' | 'creative';
  height?: number;
}

export const WeeklyEnergyHeatmap: React.FC<WeeklyEnergyHeatmapProps> = ({
  data,
  weeks = 12,
  energyType = 'overall',
  height = 300,
}) => {
  const heatmapData = useMemo(() => {
    // Group data by weeks and days
    const weekData: Array<Array<{day: Date, energy: number | null}>> = [];
    
    if (data.length === 0) return weekData;
    
    const startDate = startOfWeek(data[0].timestamp);
    
    for (let week = 0; week < weeks; week++) {
      const weekStart = addDays(startDate, week * 7);
      const weekDays = [];
      
      for (let day = 0; day < 7; day++) {
        const currentDay = addDays(weekStart, day);
        const dayData = data.find(entry => isSameDay(entry.timestamp, currentDay));
        
        weekDays.push({
          day: currentDay,
          energy: dayData ? dayData[energyType] : null,
        });
      }
      
      weekData.push(weekDays);
    }
    
    return weekData;
  }, [data, weeks, energyType]);

  const cellSize = 24;
  const cellGap = 2;
  const totalWidth = (cellSize + cellGap) * 7 + cellGap;
  const totalHeight = (cellSize + cellGap) * weeks + cellGap + 60; // Extra space for labels

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthLabels = useMemo(() => {
    if (heatmapData.length === 0) return [];
    
    const labels: Array<{month: string, x: number}> = [];
    let currentMonth = '';
    
    heatmapData.forEach((week, weekIndex) => {
      const month = format(week[0].day, 'MMM');
      if (month !== currentMonth) {
        currentMonth = month;
        labels.push({
          month,
          x: weekIndex * (cellSize + cellGap) + cellGap,
        });
      }
    });
    
    return labels;
  }, [heatmapData, cellSize, cellGap]);

  return (
    <div 
      className="weekly-energy-heatmap"
      data-chart-height={`${Math.max(height, totalHeight + 40)}px`}
    >
      <h3 className="weekly-energy-heatmap-title">
        {energyType.charAt(0).toUpperCase() + energyType.slice(1)} Energy Heatmap
      </h3>
      
      <div className="weekly-energy-heatmap-container">
        <svg 
          className="weekly-energy-heatmap-svg"
          width={totalWidth + 40} 
          height={totalHeight}
        >
          {/* Month labels */}
          {monthLabels.map((label, index) => (
            <text
              key={index}
              x={label.x + 40}
              y={15}
              fontSize="11"
              fill={ENERGY_COLORS.textSecondary}
              textAnchor="start"
            >
              {label.month}
            </text>
          ))}
          
          {/* Day labels */}
          {dayLabels.map((day, index) => (
            <text
              key={day}
              x={30}
              y={30 + index * (cellSize + cellGap) + cellSize / 2 + 4}
              fontSize="10"
              fill={ENERGY_COLORS.textSecondary}
              textAnchor="end"
            >
              {day}
            </text>
          ))}
          
          {/* Heatmap cells */}
          {heatmapData.map((week, weekIndex) =>
            week.map((dayData, dayIndex) => (
              <g key={`${weekIndex}-${dayIndex}`}>
                <rect
                  className="weekly-energy-heatmap-cell"
                  x={40 + weekIndex * (cellSize + cellGap) + cellGap}
                  y={25 + dayIndex * (cellSize + cellGap) + cellGap}
                  width={cellSize}
                  height={cellSize}
                  fill={dayData.energy !== null ? getEnergyColor(dayData.energy) : ENERGY_COLORS.gridLines}
                  stroke={ENERGY_COLORS.background}
                  strokeWidth={1}
                  rx={3}
                  data-energy-value={dayData.energy !== null ? Math.round(dayData.energy) : "no-data"}
                >
                  <title>
                    {format(dayData.day, 'MMM dd, yyyy')}
                    {dayData.energy !== null 
                      ? `: ${Math.round(dayData.energy)}% ${energyType} energy`
                      : ': No data'
                    }
                  </title>
                </rect>
                {dayData.energy !== null && (
                  <text
                    className={`weekly-energy-heatmap-tooltip ${dayData.energy > 50 ? 'weekly-energy-heatmap-tooltip-light' : 'weekly-energy-heatmap-tooltip-dark'}`}
                    x={40 + weekIndex * (cellSize + cellGap) + cellGap + cellSize / 2}
                    y={25 + dayIndex * (cellSize + cellGap) + cellGap + cellSize / 2 + 3}
                    fontSize="8"
                    textAnchor="middle"
                  >
                    {Math.round(dayData.energy)}
                  </text>
                )}
              </g>
            ))
          )}
        </svg>
        
          {/* Legend */}
        <div className="weekly-energy-heatmap-legend">
          <span>Low</span>
          <div className="weekly-energy-heatmap-legend-gradient">
            {[0, 25, 50, 75, 100].map(level => (
              <div
                key={level}
                className={`weekly-energy-heatmap-legend-cell weekly-energy-heatmap-legend-cell-${level}`}
                data-energy-level={level}
              />
            ))}
          </div>
          <span>High</span>
        </div>        {/* Statistics */}
        <div className="weekly-energy-heatmap-legend-labels">
          {(() => {
            const validData = heatmapData.flat().filter(d => d.energy !== null);
            if (validData.length === 0) return null;
            
            const energyValues = validData.map(d => d.energy!);
            const avg = energyValues.reduce((sum, val) => sum + val, 0) / energyValues.length;
            const max = Math.max(...energyValues);
            const min = Math.min(...energyValues);
            
            return (
              <>
                <div>
                  <strong>Avg:</strong> {Math.round(avg)}%
                </div>
                <div>
                  <strong>Min:</strong> {Math.round(min)}%
                </div>
                <div>
                  <strong>Max:</strong> {Math.round(max)}%
                </div>
                <div>
                  <strong>Days:</strong> {validData.length}
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
};