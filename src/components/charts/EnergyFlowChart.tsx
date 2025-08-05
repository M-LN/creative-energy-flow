import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { EnergyLevel, EnergyType, TimeRange } from '../../types/energy';
import { ENERGY_COLORS, getEnergyTypeColor } from '../../utils/colors';
import { format } from 'date-fns';
import './EnergyFlowChart.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface EnergyFlowChartProps {
  data: EnergyLevel[];
  energyTypes: EnergyType[];
  timeRange: TimeRange;
  showArea?: boolean;
  showOverall?: boolean;
  height?: number;
}

export const EnergyFlowChart: React.FC<EnergyFlowChartProps> = ({
  data,
  energyTypes,
  timeRange,
  showArea = false,
  showOverall = true,
  height = 400,
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
        default:
          return format(entry.timestamp, 'MM/dd');
      }
    });

    const datasets = [];

    // Add overall energy if requested
    if (showOverall) {
      datasets.push({
        label: 'Overall Energy',
        data: data.map(entry => entry.overall),
        borderColor: ENERGY_COLORS.chart.selection,
        backgroundColor: showArea ? `${ENERGY_COLORS.chart.selection}20` : 'transparent',
        borderWidth: 3,
        fill: showArea,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: ENERGY_COLORS.chart.selection,
        pointBorderColor: ENERGY_COLORS.background,
        pointBorderWidth: 2,
      });
    }

    // Add individual energy types
    energyTypes.forEach(energyType => {
      const color = getEnergyTypeColor(energyType);
      datasets.push({
        label: `${energyType.charAt(0).toUpperCase() + energyType.slice(1)} Energy`,
        data: data.map(entry => entry[energyType]),
        borderColor: color,
        backgroundColor: showArea ? `${color}20` : 'transparent',
        borderWidth: 2,
        fill: showArea,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: color,
        pointBorderColor: ENERGY_COLORS.background,
        pointBorderWidth: 1,
      });
    });

    return {
      labels,
      datasets,
    };
  }, [data, energyTypes, timeRange, showArea, showOverall]);

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
          pointStyle: 'circle',
        },
      },
      title: {
        display: true,
        text: 'Energy Flow Over Time',
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
        displayColors: true,
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
            const dataIndex = context[0].dataIndex;
            const entry = data[dataIndex];
            return [
              '',
              `Physical: ${Math.round(entry.physical)}%`,
              `Mental: ${Math.round(entry.mental)}%`,
              `Emotional: ${Math.round(entry.emotional)}%`,
              `Creative: ${Math.round(entry.creative)}%`,
              `Overall: ${Math.round(entry.overall)}%`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
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
        min: 0,
        max: 100,
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
          text: 'Energy Level (%)',
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
  }), [data]);

  return (
    <div 
      className="energy-flow-chart"
      data-chart-height={typeof height === 'number' ? `${height}px` : height}
    >
      <Line data={chartData} options={options} />
    </div>
  );
};