import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { EnergyLevel, EnergyType, TimeRange } from '../../types/energy';
import { ENERGY_COLORS, getEnergyTypeColor } from '../../utils/colors';
import { format } from 'date-fns';
import './EnergyTypeChart.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface EnergyTypeChartProps {
  data: EnergyLevel[];
  energyTypes: EnergyType[];
  stacked?: boolean;
  timeRange?: TimeRange;
  height?: number;
}

export const EnergyTypeChart: React.FC<EnergyTypeChartProps> = ({
  data,
  energyTypes,
  stacked = true,
  timeRange = 'week',
  height = 500,
}) => {
  const chartData = useMemo(() => {
    const labels = data.map(entry => {
      switch (timeRange) {
        case 'day':
          return format(entry.timestamp, 'HH:mm');
        case 'week':
          return format(entry.timestamp, 'EEE dd');
        case 'month':
          return format(entry.timestamp, 'MMM dd');
        case 'quarter':
        case 'year':
          return format(entry.timestamp, 'MMM dd');
        default:
          return format(entry.timestamp, 'MM/dd');
      }
    });

    const datasets = energyTypes.map(energyType => ({
      label: `${energyType.charAt(0).toUpperCase() + energyType.slice(1)} Energy`,
      data: data.map(entry => entry[energyType]),
      backgroundColor: getEnergyTypeColor(energyType),
      borderColor: getEnergyTypeColor(energyType),
      borderWidth: 1,
      borderRadius: stacked ? 0 : 4,
      borderSkipped: false,
    }));

    return {
      labels,
      datasets,
    };
  }, [data, energyTypes, timeRange, stacked]);

  const options = useMemo(() => ({
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
          usePointStyle: true,
          pointStyle: 'rect',
        },
      },
      title: {
        display: true,
        text: stacked ? 'Energy Type Distribution' : 'Energy Type Comparison',
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
            const timestamp = data[dataIndex].timestamp;
            return format(timestamp, 'MMM dd, yyyy HH:mm');
          },
          label: (context: any): string => {
            return `${context.dataset.label}: ${Math.round(context.parsed.y)}%`;
          },
          afterBody: (context: any): string[] => {
            if (stacked) {
              const dataIndex = context[0].dataIndex;
              const entry = data[dataIndex];
              const total = energyTypes.reduce((sum, type) => sum + entry[type], 0);
              return [
                '',
                `Total Energy: ${Math.round(total / energyTypes.length)}%`,
                `Overall: ${Math.round(entry.overall)}%`,
              ];
            }
            return [];
          },
        },
      },
    },
    scales: {
      x: {
        stacked,
        grid: {
          color: ENERGY_COLORS.gridLines,
          lineWidth: 1,
        },
        ticks: {
          color: ENERGY_COLORS.textSecondary,
          font: {
            size: 11,
            family: 'Inter, sans-serif',
          },
          maxRotation: 45,
        },
      },
      y: {
        stacked,
        min: 0,
        max: stacked ? energyTypes.length * 100 : 100,
        grid: {
          color: ENERGY_COLORS.gridLines,
          lineWidth: 1,
        },
        ticks: {
          color: ENERGY_COLORS.textSecondary,
          font: {
            size: 11,
            family: 'Inter, sans-serif',
          },
          callback: (value: any): string => `${value}%`,
        },
        title: {
          display: true,
          text: stacked ? 'Cumulative Energy (%)' : 'Energy Level (%)',
          color: ENERGY_COLORS.text,
          font: {
            size: 12,
            family: 'Inter, sans-serif',
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    hover: {
      mode: 'index' as const,
      intersect: false,
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart' as const,
    },
    elements: {
      bar: {
        borderWidth: 2,
      },
    },
  }), [data, stacked, energyTypes]);

  return (
    <div 
      className="energy-type-chart"
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    >
      <Bar data={chartData} options={options} />
    </div>
  );
};