import React, { useState, useMemo, useEffect } from 'react';
import { EnergyFlowChart } from './charts/EnergyFlowChart';
import { SocialBatteryChart } from './charts/SocialBatteryChart';
import { EnergyTypeChart } from './charts/EnergyTypeChart';
import { WeeklyEnergyHeatmap } from './charts/WeeklyEnergyHeatmap';
import { AIInsightsPanel } from './AIInsightsPanel';
import { EnergyDataService } from '../data/energyDataService';
import { StorageService } from '../services/StorageService';
import { EnergyType, TimeRange, EnergyLevel } from '../types/energy';
import './EnergyDashboard.css';

export const EnergyDashboard: React.FC = () => {
  // State for user-added energy data
  const [userEnergyData, setUserEnergyData] = useState<EnergyLevel[]>([]);
  // State for AI features
  const [showAIInsights, setShowAIInsights] = useState(false);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = StorageService.loadEnergyData();
    if (savedData.length > 0) {
      // Convert string timestamps back to Date objects
      const processedData = savedData.map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      }));
      setUserEnergyData(processedData);
    }
  }, []);

  // Save data whenever userEnergyData changes
  useEffect(() => {
    if (userEnergyData.length > 0) {
      StorageService.saveEnergyData(userEnergyData);
    }
  }, [userEnergyData]);

  // Use only user data - no sample data
  const energyData = userEnergyData;
  const socialData: any[] = []; // Empty social data until user adds some

  const dailyAverages = useMemo(() => 
    energyData.length > 0 ? EnergyDataService.getDailyAverages(energyData) : [], 
    [energyData]
  );
  
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
    <div className="energy-dashboard">
      <div className="dashboard-container">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-content">
            <h1 className="dashboard-title">
              Creative Energy Flow
            </h1>
            <p className="dashboard-subtitle">
              Track and visualize your energy patterns to optimize your creative flow
            </p>
          </div>
        </header>

        {/* Controls */}
        <div className="controls-panel">
          <div className="controls-grid">
            {/* Time Range Selector */}
            <div className="control-group">
              <label 
                htmlFor="time-range-select"
                className="control-label"
              >
                Time Range
              </label>
              <select
                id="time-range-select"
                aria-label="Select time range for energy data display"
                title="Choose the time period to display energy data for"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                className="control-select"
              >
                <option value="day">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
            </div>

            {/* Energy Types */}
            <div className="control-group">
              <label className="control-label">
                Energy Types
              </label>
              <div className="energy-types-container">
                {(['physical', 'mental', 'emotional', 'creative'] as EnergyType[]).map(type => {
                  const isSelected = selectedEnergyTypes.includes(type);
                  
                  if (isSelected) {
                    return (
                      <button
                        key={type}
                        onClick={() => handleEnergyTypeToggle(type)}
                        className="energy-type-button"
                        data-energy-type={type}
                        aria-pressed="true"
                        title={`Toggle ${type} energy visualization`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    );
                  } else {
                    return (
                      <button
                        key={type}
                        onClick={() => handleEnergyTypeToggle(type)}
                        className="energy-type-button"
                        data-energy-type={type}
                        aria-pressed="false"
                        title={`Toggle ${type} energy visualization`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    );
                  }
                })}
              </div>
            </div>

            {/* Heatmap Energy Type */}
            <div className="control-group">
              <label 
                htmlFor="heatmap-select"
                className="control-label"
              >
                Heatmap View
              </label>
              <select
                id="heatmap-select"
                aria-label="Select energy type for heatmap visualization"
                title="Choose which energy type to display in the weekly heatmap"
                value={heatmapEnergyType}
                onChange={(e) => setHeatmapEnergyType(e.target.value as 'overall' | EnergyType)}
                className="control-select"
              >
                <option value="overall">Overall Energy</option>
                <option value="physical">Physical Energy</option>
                <option value="mental">Mental Energy</option>
                <option value="emotional">Emotional Energy</option>
                <option value="creative">Creative Energy</option>
              </select>
            </div>

            {/* Social Correlation Toggle */}
            <div className="control-group">
              <label className="social-correlation-label">
                <input
                  type="checkbox"
                  checked={showSocialCorrelation}
                  onChange={(e) => setShowSocialCorrelation(e.target.checked)}
                  className="social-correlation-checkbox"
                  aria-describedby="social-correlation-help"
                />
                Show Social Correlation
                <span id="social-correlation-help" className="sr-only">
                  Display correlation between social battery and energy levels
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="charts-grid">
          {/* Main Energy Flow Chart */}
          <div className="chart-full-width">
            <EnergyFlowChart
              data={filteredData}
              energyTypes={selectedEnergyTypes}
              timeRange={timeRange}
              showArea={false}
              showOverall={true}
              height={500}
            />
          </div>

          {/* Social Battery Chart */}
          <SocialBatteryChart
            socialData={socialData}
            energyData={showSocialCorrelation ? dailyAverages : undefined}
            showCorrelation={showSocialCorrelation}
            height={500}
          />

          {/* Energy Type Breakdown */}
          <EnergyTypeChart
            data={filteredData}
            energyTypes={selectedEnergyTypes}
            stacked={false}
            timeRange={timeRange}
            height={500}
          />

          {/* Weekly Heatmap */}
          <div className="chart-full-width">
            <WeeklyEnergyHeatmap
              data={dailyAverages}
              weeks={12}
              energyType={heatmapEnergyType}
              height={400}
            />
          </div>
        </div>

        {/* Statistics Summary */}
        <div className="statistics-grid">
          {selectedEnergyTypes.map(energyType => {
            const stats = EnergyDataService.calculateStatistics(filteredData, energyType);
            return stats ? (
              <div
                key={energyType}
                className="statistic-card"
                data-energy-type={energyType}
              >
                <h3 className="statistic-title">
                  {energyType} Energy
                </h3>
                <div className="statistic-content">
                  <div className="statistic-item">
                    <strong>Average:</strong> {stats.average}%
                  </div>
                  <div className="statistic-item">
                    <strong>Range:</strong> {stats.min}% - {stats.max}%
                  </div>
                  <div className="statistic-item">
                    <strong>Trend:</strong> {stats.trend > 0 ? '+' : ''}{stats.trend}%
                  </div>
                  <div className="statistic-item">
                    <strong>Social Correlation:</strong> {Math.round(stats.correlationWithSocial * 100)}%
                  </div>
                </div>
              </div>
            ) : null;
          })}
        </div>

        {/* AI Insights Panel */}
        <AIInsightsPanel
          data={energyData}
          currentEnergy={energyData[energyData.length - 1] || { 
            timestamp: new Date(), 
            overall: 75, 
            physical: 75, 
            mental: 75, 
            emotional: 75, 
            creative: 75 
          }}
          isOpen={showAIInsights}
          onToggle={() => setShowAIInsights(!showAIInsights)}
        />
      </div>
    </div>
  );
};