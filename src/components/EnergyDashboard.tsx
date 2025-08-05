import React, { useState, useMemo } from 'react';
import { EnergyFlowChart } from './charts/EnergyFlowChart';
import { SocialBatteryChart } from './charts/SocialBatteryChart';
import { EnergyTypeChart } from './charts/EnergyTypeChart';
import { WeeklyEnergyHeatmap } from './charts/WeeklyEnergyHeatmap';
import { EnergyDataService } from '../data/energyDataService';
import { EnergyType, TimeRange } from '../types/energy';
import { ENERGY_COLORS } from '../utils/colors';

export const EnergyDashboard: React.FC = () => {
  // Generate sample data
  const energyData = useMemo(() => EnergyDataService.generateEnergyData(30), []);
  const socialData = useMemo(() => EnergyDataService.generateSocialBatteryData(30), []);
  const dailyAverages = useMemo(() => EnergyDataService.getDailyAverages(energyData), [energyData]);
  
  // State for chart configuration
  const [selectedEnergyTypes, setSelectedEnergyTypes] = useState<EnergyType[]>(['physical', 'mental', 'emotional', 'creative']);
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [showSocialCorrelation, setShowSocialCorrelation] = useState(false);
  const [heatmapEnergyType, setHeatmapEnergyType] = useState<'overall' | EnergyType>('overall');

  const filteredData = useMemo(() => {
    const now = new Date();
    const daysBack = timeRange === 'day' ? 1 : timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
    
    return EnergyDataService.getEnergyDataByRange(
      timeRange === 'day' ? energyData : dailyAverages, 
      startDate, 
      now
    );
  }, [energyData, dailyAverages, timeRange]);

  const handleEnergyTypeToggle = (energyType: EnergyType) => {
    setSelectedEnergyTypes(prev => 
      prev.includes(energyType) 
        ? prev.filter(type => type !== energyType)
        : [...prev, energyType]
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: ENERGY_COLORS.background,
      padding: '20px',
      fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {/* Header */}
        <header style={{
          marginBottom: '30px',
          textAlign: 'center',
        }}>
          <h1 style={{
            color: ENERGY_COLORS.text,
            fontSize: '32px',
            fontWeight: 'bold',
            margin: '0 0 10px 0',
          }}>
            Creative Energy Flow
          </h1>
          <p style={{
            color: ENERGY_COLORS.textSecondary,
            fontSize: '16px',
            margin: 0,
          }}>
            Track and visualize your energy patterns to optimize your creative flow
          </p>
        </header>

        {/* Controls */}
        <div style={{
          backgroundColor: ENERGY_COLORS.surface,
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '30px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            alignItems: 'start',
          }}>
            {/* Time Range Selector */}
            <div>
              <label style={{
                display: 'block',
                color: ENERGY_COLORS.text,
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '8px',
              }}>
                Time Range
              </label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: `1px solid ${ENERGY_COLORS.gridLines}`,
                  backgroundColor: ENERGY_COLORS.surface,
                  color: ENERGY_COLORS.text,
                  fontSize: '14px',
                }}
              >
                <option value="day">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
            </div>

            {/* Energy Types */}
            <div>
              <label style={{
                display: 'block',
                color: ENERGY_COLORS.text,
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '8px',
              }}>
                Energy Types
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {(['physical', 'mental', 'emotional', 'creative'] as EnergyType[]).map(type => (
                  <button
                    key={type}
                    onClick={() => handleEnergyTypeToggle(type)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      border: 'none',
                      backgroundColor: selectedEnergyTypes.includes(type) 
                        ? ENERGY_COLORS[type] 
                        : ENERGY_COLORS.gridLines,
                      color: selectedEnergyTypes.includes(type) 
                        ? ENERGY_COLORS.surface 
                        : ENERGY_COLORS.text,
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Heatmap Energy Type */}
            <div>
              <label style={{
                display: 'block',
                color: ENERGY_COLORS.text,
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '8px',
              }}>
                Heatmap View
              </label>
              <select
                value={heatmapEnergyType}
                onChange={(e) => setHeatmapEnergyType(e.target.value as 'overall' | EnergyType)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: `1px solid ${ENERGY_COLORS.gridLines}`,
                  backgroundColor: ENERGY_COLORS.surface,
                  color: ENERGY_COLORS.text,
                  fontSize: '14px',
                }}
              >
                <option value="overall">Overall Energy</option>
                <option value="physical">Physical Energy</option>
                <option value="mental">Mental Energy</option>
                <option value="emotional">Emotional Energy</option>
                <option value="creative">Creative Energy</option>
              </select>
            </div>

            {/* Social Correlation Toggle */}
            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                color: ENERGY_COLORS.text,
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
              }}>
                <input
                  type="checkbox"
                  checked={showSocialCorrelation}
                  onChange={(e) => setShowSocialCorrelation(e.target.checked)}
                  style={{
                    marginRight: '8px',
                    accentColor: ENERGY_COLORS.social,
                  }}
                />
                Show Social Correlation
              </label>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '30px',
        }}>
          {/* Main Energy Flow Chart */}
          <div style={{ gridColumn: '1 / -1' }}>
            <EnergyFlowChart
              data={filteredData}
              energyTypes={selectedEnergyTypes}
              timeRange={timeRange}
              showArea={false}
              showOverall={true}
              height={400}
            />
          </div>

          {/* Social Battery Chart */}
          <SocialBatteryChart
            socialData={socialData}
            energyData={showSocialCorrelation ? dailyAverages : undefined}
            showCorrelation={showSocialCorrelation}
            height={350}
          />

          {/* Energy Type Breakdown */}
          <EnergyTypeChart
            data={filteredData}
            energyTypes={selectedEnergyTypes}
            stacked={false}
            timeRange={timeRange}
            height={350}
          />

          {/* Weekly Heatmap */}
          <div style={{ gridColumn: '1 / -1' }}>
            <WeeklyEnergyHeatmap
              data={dailyAverages}
              weeks={12}
              energyType={heatmapEnergyType}
              height={300}
            />
          </div>
        </div>

        {/* Statistics Summary */}
        <div style={{
          marginTop: '30px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
        }}>
          {selectedEnergyTypes.map(energyType => {
            const stats = EnergyDataService.calculateStatistics(filteredData, energyType);
            return stats ? (
              <div
                key={energyType}
                style={{
                  backgroundColor: ENERGY_COLORS.surface,
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  borderLeft: `4px solid ${ENERGY_COLORS[energyType]}`,
                }}
              >
                <h3 style={{
                  color: ENERGY_COLORS.text,
                  fontSize: '16px',
                  fontWeight: '600',
                  margin: '0 0 12px 0',
                  textTransform: 'capitalize',
                }}>
                  {energyType} Energy
                </h3>
                <div style={{ fontSize: '14px', color: ENERGY_COLORS.textSecondary }}>
                  <div style={{ marginBottom: '4px' }}>
                    <strong>Average:</strong> {stats.average}%
                  </div>
                  <div style={{ marginBottom: '4px' }}>
                    <strong>Range:</strong> {stats.min}% - {stats.max}%
                  </div>
                  <div style={{ marginBottom: '4px' }}>
                    <strong>Trend:</strong> {stats.trend > 0 ? '+' : ''}{stats.trend}%
                  </div>
                  <div>
                    <strong>Social Correlation:</strong> {Math.round(stats.correlationWithSocial * 100)}%
                  </div>
                </div>
              </div>
            ) : null;
          })}
        </div>
      </div>
    </div>
  );
};