import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Scatter } from 'react-chartjs-2';
import { SocialBatteryData, EnergyLevel } from '../../types/energy';
import { ENERGY_COLORS } from '../../utils/colors';
import { format } from 'date-fns';
import './SocialBatteryChart.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface SocialBatteryChartProps {
  socialData: SocialBatteryData[];
  energyData?: EnergyLevel[];
  showCorrelation?: boolean;
  height?: number;
}

export const SocialBatteryChart: React.FC<SocialBatteryChartProps> = ({
  socialData,
  energyData,
  showCorrelation = false,
  height = 500,
}) => {
  const chartData = useMemo(() => {
    if (showCorrelation && energyData) {
      // Create correlation scatter plot
      const correlationData = socialData.map(social => {
        const correspondingEnergy = energyData.find(energy => 
          format(energy.timestamp, 'yyyy-MM-dd') === format(social.timestamp, 'yyyy-MM-dd')
        );
        
        return correspondingEnergy ? {
          x: social.level,
          y: correspondingEnergy.overall,
          timestamp: social.timestamp,
          interactions: social.socialInteractions,
        } : null;
      }).filter((item): item is NonNullable<typeof item> => item !== null);

      return {
        datasets: [
          {
            label: 'Social Battery vs Overall Energy',
            data: correlationData,
            backgroundColor: ENERGY_COLORS.social,
            borderColor: ENERGY_COLORS.social,
            pointRadius: 6,
            pointHoverRadius: 8,
            showLine: false,
          },
        ],
      };
    } else {
      // Create time series line chart
      const labels = socialData.map(entry => format(entry.timestamp, 'MMM dd'));
      
      return {
        labels,
        datasets: [
          {
            label: 'Social Battery Level',
            data: socialData.map(entry => entry.level),
            borderColor: ENERGY_COLORS.social,
            backgroundColor: `${ENERGY_COLORS.social}20`,
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: ENERGY_COLORS.social,
            pointBorderColor: ENERGY_COLORS.background,
            pointBorderWidth: 2,
          },
          {
            label: 'Social Interactions',
            data: socialData.map(entry => entry.socialInteractions * 10), // Scale for visibility
            borderColor: ENERGY_COLORS.creative,
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 3,
            pointHoverRadius: 5,
            pointBackgroundColor: ENERGY_COLORS.creative,
            pointBorderColor: ENERGY_COLORS.background,
            pointBorderWidth: 1,
            yAxisID: 'y1',
          },
        ],
      };
    }
  }, [socialData, energyData, showCorrelation]);

  const options = useMemo(() => {
    if (showCorrelation) {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top' as const,
            labels: {
              color: ENERGY_COLORS.text,
              font: {
                size: 12,
                family: 'Inter, sans-serif',
              },
            },
          },
          title: {
            display: true,
            text: 'Social Battery vs Energy Correlation',
            color: ENERGY_COLORS.text,
            font: {
              size: 16,
              weight: 'bold' as const,
              family: 'Inter, sans-serif',
            },
            padding: 20,
          },
          tooltip: {
            backgroundColor: ENERGY_COLORS.chart.tooltipBackground,
            titleColor: ENERGY_COLORS.text,
            bodyColor: ENERGY_COLORS.text,
            borderColor: ENERGY_COLORS.chart.tooltipBorder,
            borderWidth: 1,
            cornerRadius: 8,
            padding: 12,
            callbacks: {
              title: (context: any): string => {
                const point = context[0].raw;
                return format(point.timestamp, 'MMM dd, yyyy');
              },
              label: (context: any): string | string[] => {
                const point = context.raw;
                return [
                  `Social Battery: ${Math.round(point.x)}%`,
                  `Overall Energy: ${Math.round(point.y)}%`,
                  `Interactions: ${point.interactions}`,
                ];
              },
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Social Battery Level (%)',
              color: ENERGY_COLORS.text,
              font: {
                size: 12,
                family: 'Inter, sans-serif',
              },
            },
            min: 0,
            max: 100,
            grid: {
              color: ENERGY_COLORS.gridLines,
            },
            ticks: {
              color: ENERGY_COLORS.textSecondary,
              callback: (value: any) => `${value}%`,
            },
          },
          y: {
            title: {
              display: true,
              text: 'Overall Energy Level (%)',
              color: ENERGY_COLORS.text,
              font: {
                size: 12,
                family: 'Inter, sans-serif',
              },
            },
            min: 0,
            max: 100,
            grid: {
              color: ENERGY_COLORS.gridLines,
            },
            ticks: {
              color: ENERGY_COLORS.textSecondary,
              callback: (value: any) => `${value}%`,
            },
          },
        },
      };
    } else {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top' as const,
            labels: {
              color: ENERGY_COLORS.text,
              font: {
                size: 12,
                family: 'Inter, sans-serif',
              },
            },
          },
          title: {
            display: true,
            text: 'Social Battery Over Time',
            color: ENERGY_COLORS.text,
            font: {
              size: 16,
              weight: 'bold' as const,
              family: 'Inter, sans-serif',
            },
            padding: 20,
          },
          tooltip: {
            backgroundColor: ENERGY_COLORS.chart.tooltipBackground,
            titleColor: ENERGY_COLORS.text,
            bodyColor: ENERGY_COLORS.text,
            borderColor: ENERGY_COLORS.chart.tooltipBorder,
            borderWidth: 1,
            cornerRadius: 8,
            padding: 12,
            callbacks: {
              title: (context: any): string => {
                const dataIndex = context[0].dataIndex;
                const timestamp = socialData[dataIndex].timestamp;
                return format(timestamp, 'MMM dd, yyyy');
              },
              label: (context: any): string | string[] => {
                const dataIndex = context.dataIndex;
                const entry = socialData[dataIndex];
                
                if (context.dataset.label === 'Social Interactions') {
                  return `Social Interactions: ${entry.socialInteractions}`;
                }
                return `${context.dataset.label}: ${Math.round(context.parsed.y)}%`;
              },
              afterBody: (context: any): string[] => {
                const dataIndex = context[0].dataIndex;
                const entry = socialData[dataIndex];
                return [
                  '',
                  `Drain Events: ${entry.drainEvents.length}`,
                  `Recharge Events: ${entry.rechargeEvents.length}`,
                ];
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              color: ENERGY_COLORS.gridLines,
            },
            ticks: {
              color: ENERGY_COLORS.textSecondary,
              font: {
                size: 11,
                family: 'Inter, sans-serif',
              },
            },
          },
          y: {
            type: 'linear' as const,
            display: true,
            position: 'left' as const,
            min: 0,
            max: 100,
            grid: {
              color: ENERGY_COLORS.gridLines,
            },
            ticks: {
              color: ENERGY_COLORS.textSecondary,
              callback: (value: any) => `${value}%`,
            },
            title: {
              display: true,
              text: 'Social Battery Level (%)',
              color: ENERGY_COLORS.text,
            },
          },
          y1: {
            type: 'linear' as const,
            display: true,
            position: 'right' as const,
            min: 0,
            max: 100,
            grid: {
              drawOnChartArea: false,
            },
            ticks: {
              color: ENERGY_COLORS.textSecondary,
              callback: (value: any) => Math.round(value / 10),
            },
            title: {
              display: true,
              text: 'Interactions Count',
              color: ENERGY_COLORS.text,
            },
          },
        },
        interaction: {
          intersect: false,
          mode: 'index' as const,
        },
      };
    }
  }, [socialData, showCorrelation]);

  return (
    <div 
      className="social-battery-chart"
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    >
      {showCorrelation && energyData ? (
        <Scatter data={chartData as any} options={options} />
      ) : (
        <Line data={chartData as any} options={options} />
      )}
    </div>
  );
};