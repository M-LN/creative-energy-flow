// Charts & Analytics Feature - Data visualization with Chart.js
import { EventSystem, EVENTS } from '@/core/EventSystem';
import { StateManager } from '@/core/StateManager';
import type { ChartData, EnergyLevel, SocialBatteryEntry } from '@/shared/types';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

export class ChartsFeature {
  private static instance: ChartsFeature;
  private eventSystem: EventSystem;
  private stateManager: StateManager;
  private isInitialized = false;
  private activeCharts: Map<string, Chart> = new Map();
  private chartContainers: Map<string, HTMLCanvasElement> = new Map();

  private constructor() {
    this.eventSystem = EventSystem.getInstance();
    this.stateManager = StateManager.getInstance();
  }

  public static getInstance(): ChartsFeature {
    if (!ChartsFeature.instance) {
      ChartsFeature.instance = new ChartsFeature();
    }
    return ChartsFeature.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Set up event listeners
      this.setupEventListeners();
      
      // Configure Chart.js defaults
      this.configureChartDefaults();
      
      this.isInitialized = true;
      this.eventSystem.emit('feature:charts-ready', {}, 'ChartsFeature');
      
    } catch (error) {
      this.eventSystem.emit(EVENTS.ERROR_OCCURRED, {
        type: 'charts-initialization-error',
        error: (error as Error).message,
      }, 'ChartsFeature');
      throw error;
    }
  }

  private setupEventListeners(): void {
    // Listen for data updates from energy tracking and social battery
    this.eventSystem.subscribe(EVENTS.CHART_DATA_UPDATED, (payload) => {
      this.handleDataUpdate(payload.data);
    });

    // Listen for chart view changes
    this.eventSystem.subscribe(EVENTS.CHART_VIEW_CHANGED, (payload) => {
      this.handleViewChange(payload.data);
    });

    // Listen for energy and social battery data changes
    this.eventSystem.subscribe(EVENTS.ENERGY_LOGGED, () => {
      this.updateEnergyCharts();
    });

    this.eventSystem.subscribe(EVENTS.SOCIAL_BATTERY_LOGGED, () => {
      this.updateSocialBatteryCharts();
    });

    // Listen for external updates
    this.eventSystem.subscribe('charts:external-update', (payload) => {
      this.handleExternalUpdate(payload.data);
    });
  }

  private configureChartDefaults(): void {
    // Set global Chart.js defaults for the warm creative theme
    Chart.defaults.font.family = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    Chart.defaults.font.size = 14;
    Chart.defaults.color = '#2C3E50';
    Chart.defaults.backgroundColor = '#FFF8DC';
    Chart.defaults.borderColor = '#E0E0E0';
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(44, 62, 80, 0.9)';
    Chart.defaults.plugins.tooltip.titleColor = '#FFFFFF';
    Chart.defaults.plugins.tooltip.bodyColor = '#FFFFFF';
    Chart.defaults.plugins.tooltip.cornerRadius = 8;
  }

  private handleDataUpdate(data: any): void {
    try {
      if (data.type === 'energy') {
        this.updateEnergyCharts();
      } else if (data.type === 'social') {
        this.updateSocialBatteryCharts();
      }
      
    } catch (error) {
      this.eventSystem.emit(EVENTS.ERROR_OCCURRED, {
        type: 'chart-update-error',
        error: (error as Error).message,
        data,
      }, 'ChartsFeature');
    }
  }

  private handleViewChange(data: any): void {
    this.eventSystem.emit('charts:view-changed', {
      viewType: data.viewType,
      timeRange: data.timeRange,
      timestamp: new Date(),
    }, 'ChartsFeature');
  }

  private handleExternalUpdate(data: any): void {
    console.log('Charts external update:', data);
  }

  private updateEnergyCharts(): void {
    const energyData = this.stateManager.getEnergyData();
    
    // Update all energy-related charts
    this.updateChart('energy-trends', this.createEnergyTrendsChart(energyData));
    this.updateChart('energy-types', this.createEnergyTypesChart(energyData));
    this.updateChart('energy-weekly', this.createEnergyWeeklyChart(energyData));
  }

  private updateSocialBatteryCharts(): void {
    const socialData = this.stateManager.getSocialBatteryData();
    
    // Update all social battery-related charts
    this.updateChart('social-trends', this.createSocialTrendsChart(socialData));
    this.updateChart('social-interactions', this.createSocialInteractionsChart(socialData));
  }

  private updateChart(chartId: string, config: ChartConfiguration): void {
    const existingChart = this.activeCharts.get(chartId);
    if (existingChart) {
      // Update existing chart data
      existingChart.data = config.data!;
      existingChart.update('none'); // Update without animation for better performance
    }
  }

  // Chart creation methods
  public createEnergyTrendsChart(energyData: EnergyLevel[]): ChartConfiguration {
    // Sort data by timestamp
    const sortedData = [...energyData].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    // Group by date and calculate daily averages
    const dailyAverages = this.groupEnergyByDate(sortedData);
    
    return {
      type: 'line',
      data: {
        labels: Array.from(dailyAverages.keys()),
        datasets: [
          {
            label: 'Creative Energy',
            data: Array.from(dailyAverages.values()).map(day => day.creative || 0),
            borderColor: '#FF6B6B',
            backgroundColor: 'rgba(255, 107, 107, 0.1)',
            tension: 0.4,
            fill: true,
          },
          {
            label: 'Physical Energy',
            data: Array.from(dailyAverages.values()).map(day => day.physical || 0),
            borderColor: '#4ECDC4',
            backgroundColor: 'rgba(78, 205, 196, 0.1)',
            tension: 0.4,
            fill: true,
          },
          {
            label: 'Mental Energy',
            data: Array.from(dailyAverages.values()).map(day => day.mental || 0),
            borderColor: '#FFE66D',
            backgroundColor: 'rgba(255, 230, 109, 0.1)',
            tension: 0.4,
            fill: true,
          },
          {
            label: 'Emotional Energy',
            data: Array.from(dailyAverages.values()).map(day => day.emotional || 0),
            borderColor: '#95E1D3',
            backgroundColor: 'rgba(149, 225, 211, 0.1)',
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Energy Trends Over Time',
            font: { size: 18, weight: 'bold' },
          },
          legend: {
            position: 'bottom',
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 10,
            title: {
              display: true,
              text: 'Energy Level (1-10)',
            },
          },
          x: {
            title: {
              display: true,
              text: 'Date',
            },
          },
        },
        interaction: {
          intersect: false,
          mode: 'index',
        },
        elements: {
          point: {
            radius: 4,
            hoverRadius: 6,
          },
        },
      },
    };
  }

  public createEnergyTypesChart(energyData: EnergyLevel[]): ChartConfiguration {
    const typeAverages = this.calculateEnergyTypeAverages(energyData);
    
    return {
      type: 'radar',
      data: {
        labels: ['Creative', 'Physical', 'Mental', 'Emotional'],
        datasets: [
          {
            label: 'Average Energy Levels',
            data: [
              typeAverages.creative,
              typeAverages.physical,
              typeAverages.mental,
              typeAverages.emotional,
            ],
            borderColor: '#FF6B6B',
            backgroundColor: 'rgba(255, 107, 107, 0.2)',
            pointBackgroundColor: '#FF6B6B',
            pointBorderColor: '#FFFFFF',
            pointHoverBackgroundColor: '#FFFFFF',
            pointHoverBorderColor: '#FF6B6B',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Energy Types Overview',
            font: { size: 18, weight: 'bold' },
          },
        },
        scales: {
          r: {
            beginAtZero: true,
            max: 10,
            ticks: {
              stepSize: 2,
            },
          },
        },
      },
    };
  }

  public createEnergyWeeklyChart(energyData: EnergyLevel[]): ChartConfiguration {
    const weeklyData = this.groupEnergyByWeekday(energyData);
    
    return {
      type: 'bar',
      data: {
        labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        datasets: [
          {
            label: 'Average Energy',
            data: weeklyData,
            backgroundColor: [
              '#FF6B6B',
              '#4ECDC4',
              '#FFE66D',
              '#95E1D3',
              '#FFA726',
              '#F06292',
              '#81C784',
            ],
            borderColor: [
              '#FF5252',
              '#26A69A',
              '#FFD54F',
              '#4DB6AC',
              '#FF9800',
              '#E91E63',
              '#66BB6A',
            ],
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Energy Levels by Day of Week',
            font: { size: 18, weight: 'bold' },
          },
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 10,
            title: {
              display: true,
              text: 'Average Energy Level',
            },
          },
        },
      },
    };
  }

  public createSocialTrendsChart(socialData: SocialBatteryEntry[]): ChartConfiguration {
    const sortedData = [...socialData].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const dailyAverages = this.groupSocialByDate(sortedData);
    
    return {
      type: 'line',
      data: {
        labels: Array.from(dailyAverages.keys()),
        datasets: [
          {
            label: 'Social Battery Level',
            data: Array.from(dailyAverages.values()),
            borderColor: '#4ECDC4',
            backgroundColor: 'rgba(78, 205, 196, 0.1)',
            tension: 0.4,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Social Battery Trends',
            font: { size: 18, weight: 'bold' },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 10,
            title: {
              display: true,
              text: 'Social Battery Level (1-10)',
            },
          },
          x: {
            title: {
              display: true,
              text: 'Date',
            },
          },
        },
        interaction: {
          intersect: false,
          mode: 'index',
        },
      },
    };
  }

  public createSocialInteractionsChart(socialData: SocialBatteryEntry[]): ChartConfiguration {
    const interactionStats = this.calculateInteractionStats(socialData);
    
    return {
      type: 'doughnut',
      data: {
        labels: ['Solo Time', 'Small Group', 'Large Group', 'Public'],
        datasets: [
          {
            label: 'Interaction Distribution',
            data: [
              interactionStats.solo,
              interactionStats['small-group'],
              interactionStats['large-group'],
              interactionStats.public,
            ],
            backgroundColor: [
              '#95E1D3',
              '#4ECDC4',
              '#FFE66D',
              '#FF6B6B',
            ],
            borderColor: '#FFFFFF',
            borderWidth: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Social Interaction Types',
            font: { size: 18, weight: 'bold' },
          },
          legend: {
            position: 'bottom',
          },
        },
      },
    };
  }

  // Helper methods for data processing
  private groupEnergyByDate(energyData: EnergyLevel[]): Map<string, {
    creative: number;
    physical: number;
    mental: number;
    emotional: number;
  }> {
    const dailyData = new Map();
    
    energyData.forEach(entry => {
      const date = entry.timestamp.toISOString().split('T')[0];
      
      if (!dailyData.has(date)) {
        dailyData.set(date, {
          creative: { sum: 0, count: 0 },
          physical: { sum: 0, count: 0 },
          mental: { sum: 0, count: 0 },
          emotional: { sum: 0, count: 0 },
        });
      }
      
      const dayData = dailyData.get(date);
      dayData[entry.type].sum += entry.level;
      dayData[entry.type].count += 1;
    });
    
    // Calculate averages
    const averages = new Map();
    dailyData.forEach((data, date) => {
      averages.set(date, {
        creative: data.creative.count > 0 ? data.creative.sum / data.creative.count : 0,
        physical: data.physical.count > 0 ? data.physical.sum / data.physical.count : 0,
        mental: data.mental.count > 0 ? data.mental.sum / data.mental.count : 0,
        emotional: data.emotional.count > 0 ? data.emotional.sum / data.emotional.count : 0,
      });
    });
    
    return averages;
  }

  private calculateEnergyTypeAverages(energyData: EnergyLevel[]): {
    creative: number;
    physical: number;
    mental: number;
    emotional: number;
  } {
    const sums = { creative: 0, physical: 0, mental: 0, emotional: 0 };
    const counts = { creative: 0, physical: 0, mental: 0, emotional: 0 };
    
    energyData.forEach(entry => {
      sums[entry.type] += entry.level;
      counts[entry.type] += 1;
    });
    
    return {
      creative: counts.creative > 0 ? sums.creative / counts.creative : 0,
      physical: counts.physical > 0 ? sums.physical / counts.physical : 0,
      mental: counts.mental > 0 ? sums.mental / counts.mental : 0,
      emotional: counts.emotional > 0 ? sums.emotional / counts.emotional : 0,
    };
  }

  private groupEnergyByWeekday(energyData: EnergyLevel[]): number[] {
    const weekdayData = new Array(7).fill(0).map(() => ({ sum: 0, count: 0 }));
    
    energyData.forEach(entry => {
      const weekday = entry.timestamp.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const mondayIndex = weekday === 0 ? 6 : weekday - 1; // Convert to Monday = 0
      
      weekdayData[mondayIndex].sum += entry.level;
      weekdayData[mondayIndex].count += 1;
    });
    
    return weekdayData.map(day => day.count > 0 ? day.sum / day.count : 0);
  }

  private groupSocialByDate(socialData: SocialBatteryEntry[]): Map<string, number> {
    const dailyData = new Map();
    
    socialData.forEach(entry => {
      const date = entry.timestamp.toISOString().split('T')[0];
      
      if (!dailyData.has(date)) {
        dailyData.set(date, { sum: 0, count: 0 });
      }
      
      const dayData = dailyData.get(date);
      dayData.sum += entry.level;
      dayData.count += 1;
    });
    
    // Calculate averages
    const averages = new Map();
    dailyData.forEach((data, date) => {
      averages.set(date, data.count > 0 ? data.sum / data.count : 0);
    });
    
    return averages;
  }

  private calculateInteractionStats(socialData: SocialBatteryEntry[]): {
    solo: number;
    'small-group': number;
    'large-group': number;
    public: number;
  } {
    const stats = { solo: 0, 'small-group': 0, 'large-group': 0, public: 0 };
    
    socialData.forEach(entry => {
      stats[entry.interactionType] += 1;
    });
    
    return stats;
  }

  // Public API methods
  public renderChart(containerId: string, chartType: string, options?: any): void {
    const container = document.getElementById(containerId) as HTMLCanvasElement;
    if (!container) {
      throw new Error(`Chart container ${containerId} not found`);
    }
    
    // Destroy existing chart if it exists
    this.destroyChart(containerId);
    
    let config: ChartConfiguration;
    
    switch (chartType) {
      case 'energy-trends':
        config = this.createEnergyTrendsChart(this.stateManager.getEnergyData());
        break;
      case 'energy-types':
        config = this.createEnergyTypesChart(this.stateManager.getEnergyData());
        break;
      case 'energy-weekly':
        config = this.createEnergyWeeklyChart(this.stateManager.getEnergyData());
        break;
      case 'social-trends':
        config = this.createSocialTrendsChart(this.stateManager.getSocialBatteryData());
        break;
      case 'social-interactions':
        config = this.createSocialInteractionsChart(this.stateManager.getSocialBatteryData());
        break;
      default:
        throw new Error(`Unknown chart type: ${chartType}`);
    }
    
    // Apply custom options
    if (options) {
      config.options = { ...config.options, ...options };
    }
    
    const chart = new Chart(container, config);
    this.activeCharts.set(containerId, chart);
    this.chartContainers.set(containerId, container);
    
    // Emit chart rendered event
    this.eventSystem.emit('chart:rendered', {
      containerId,
      chartType,
      timestamp: new Date(),
    }, 'ChartsFeature');
  }

  public destroyChart(containerId: string): void {
    const chart = this.activeCharts.get(containerId);
    if (chart) {
      chart.destroy();
      this.activeCharts.delete(containerId);
      this.chartContainers.delete(containerId);
    }
  }

  public destroyAllCharts(): void {
    this.activeCharts.forEach((chart) => {
      chart.destroy();
    });
    this.activeCharts.clear();
    this.chartContainers.clear();
  }

  public exportChartData(chartType: string): ChartData {
    const energyData = this.stateManager.getEnergyData();
    const socialData = this.stateManager.getSocialBatteryData();
    
    switch (chartType) {
      case 'energy-trends':
        return this.createEnergyTrendsChart(energyData).data as ChartData;
      case 'social-trends':
        return this.createSocialTrendsChart(socialData).data as ChartData;
      default:
        throw new Error(`Cannot export data for chart type: ${chartType}`);
    }
  }

  public getChartInsights(): {
    energyInsights: string[];
    socialInsights: string[];
    recommendations: string[];
  } {
    const energyData = this.stateManager.getEnergyData();
    const socialData = this.stateManager.getSocialBatteryData();
    
    const energyInsights: string[] = [];
    const socialInsights: string[] = [];
    const recommendations: string[] = [];
    
    // Energy insights
    if (energyData.length > 0) {
      const typeAverages = this.calculateEnergyTypeAverages(energyData);
      const highest = Object.entries(typeAverages).reduce((a, b) => a[1] > b[1] ? a : b);
      const lowest = Object.entries(typeAverages).reduce((a, b) => a[1] < b[1] ? a : b);
      
      energyInsights.push(`Your highest energy type is ${highest[0]} (${highest[1].toFixed(1)}/10)`);
      energyInsights.push(`Your lowest energy type is ${lowest[0]} (${lowest[1].toFixed(1)}/10)`);
      
      if (lowest[1] < 5) {
        recommendations.push(`Consider activities to boost your ${lowest[0]} energy`);
      }
    }
    
    // Social insights
    if (socialData.length > 0) {
      const interactionStats = this.calculateInteractionStats(socialData);
      const total = Object.values(interactionStats).reduce((sum, count) => sum + count, 0);
      const mostCommon = Object.entries(interactionStats).reduce((a, b) => a[1] > b[1] ? a : b);
      
      socialInsights.push(`Your most common interaction type is ${mostCommon[0]} (${((mostCommon[1] / total) * 100).toFixed(1)}%)`);
      
      const avgLevel = socialData.reduce((sum, entry) => sum + entry.level, 0) / socialData.length;
      socialInsights.push(`Your average social battery level is ${avgLevel.toFixed(1)}/10`);
      
      if (avgLevel < 5) {
        recommendations.push('Consider scheduling more solo time to recharge your social battery');
      }
    }
    
    return { energyInsights, socialInsights, recommendations };
  }

  public getFeatureStatus(): {
    isInitialized: boolean;
    activeCharts: number;
    availableChartTypes: string[];
    lastUpdate: Date | null;
  } {
    return {
      isInitialized: this.isInitialized,
      activeCharts: this.activeCharts.size,
      availableChartTypes: [
        'energy-trends',
        'energy-types',
        'energy-weekly',
        'social-trends',
        'social-interactions'
      ],
      lastUpdate: new Date(),
    };
  }
}