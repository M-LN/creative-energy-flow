// Theme-aware color utilities for charts
export const getThemeAwareColors = () => {
  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);

  return {
    primary: computedStyle.getPropertyValue('--color-primary').trim(),
    primaryLight: computedStyle.getPropertyValue('--color-primary-light').trim(),
    success: computedStyle.getPropertyValue('--color-success').trim(),
    warning: computedStyle.getPropertyValue('--color-warning').trim(),
    danger: computedStyle.getPropertyValue('--color-danger').trim(),
    info: computedStyle.getPropertyValue('--color-info').trim(),
    text: computedStyle.getPropertyValue('--color-text').trim(),
    textSecondary: computedStyle.getPropertyValue('--color-text-secondary').trim(),
    background: computedStyle.getPropertyValue('--color-background').trim(),
    surface: computedStyle.getPropertyValue('--color-surface').trim(),
    border: computedStyle.getPropertyValue('--color-border').trim(),
  };
};

// Generate theme-aware energy type colors
export const getThemeAwareEnergyColors = () => {
  const colors = getThemeAwareColors();
  
  return {
    physical: colors.danger,
    mental: colors.info,
    emotional: colors.warning,
    social: colors.success,
    spiritual: colors.primary,
    creative: '#9333ea', // Purple
    intellectual: '#0369a1', // Blue
    overall: colors.primary,
  };
};

// Create gradient colors with theme awareness
export const createThemeAwareGradient = (ctx: CanvasRenderingContext2D, baseColor: string, alpha = 0.2) => {
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, baseColor + Math.floor(alpha * 255).toString(16).padStart(2, '0'));
  gradient.addColorStop(1, baseColor + '00');
  return gradient;
};

// Enhanced chart configuration with theme awareness
export const getThemeAwareChartConfig = () => {
  const colors = getThemeAwareColors();
  
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: colors.text,
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            family: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          },
        },
      },
      tooltip: {
        backgroundColor: colors.surface,
        titleColor: colors.text,
        bodyColor: colors.textSecondary,
        borderColor: colors.border,
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        displayColors: true,
        titleFont: {
          size: 14,
          weight: '600',
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          title: (context: any) => {
            return context[0]?.label || '';
          },
          label: (context: any) => {
            const label = context.dataset?.label || '';
            const value = context.parsed?.y || 0;
            return `${label}: ${value}%`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          color: colors.border,
          lineWidth: 1,
        },
        ticks: {
          color: colors.textSecondary,
          font: {
            size: 11,
          },
        },
      },
      y: {
        display: true,
        min: 0,
        max: 100,
        grid: {
          color: colors.border,
          lineWidth: 1,
        },
        ticks: {
          color: colors.textSecondary,
          font: {
            size: 11,
          },
          callback: (value: any) => `${value}%`,
        },
      },
    },
    elements: {
      point: {
        radius: 4,
        hoverRadius: 6,
        borderWidth: 2,
        hoverBorderWidth: 3,
      },
      line: {
        borderWidth: 3,
        tension: 0.3,
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
    },
  };
};

// Chart.js plugins for enhanced functionality
export const chartPlugins = [
  {
    id: 'customHover',
    beforeDraw: (chart: any) => {
      const colors = getThemeAwareColors();
      if (chart.tooltip._active && chart.tooltip._active.length) {
        const ctx = chart.ctx;
        const activePoint = chart.tooltip._active[0];
        const x = activePoint.element.x;
        const topY = chart.scales.y.top;
        const bottomY = chart.scales.y.bottom;

        // Draw vertical line on hover
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x, topY);
        ctx.lineTo(x, bottomY);
        ctx.lineWidth = 1;
        ctx.strokeStyle = colors.primary + '40';
        ctx.stroke();
        ctx.restore();
      }
    }
  },
  {
    id: 'customLegend',
    afterUpdate: (chart: any) => {
      // Add custom legend styling
      const legend = chart.legend;
      if (legend && legend.legendItems) {
        legend.legendItems.forEach((item: any) => {
          item.fillStyle = item.strokeStyle;
          item.lineWidth = 0;
        });
      }
    }
  }
];

// Responsive chart options
export const getResponsiveChartOptions = (isMobile: boolean) => {
  const baseConfig = getThemeAwareChartConfig();
  
  if (isMobile) {
    return {
      ...baseConfig,
      plugins: {
        ...baseConfig.plugins,
        legend: {
          ...baseConfig.plugins.legend,
          position: 'bottom' as const,
          labels: {
            ...baseConfig.plugins.legend.labels,
            padding: 15,
            font: {
              ...baseConfig.plugins.legend.labels.font,
              size: 11,
            },
          },
        },
      },
      elements: {
        ...baseConfig.elements,
        point: {
          ...baseConfig.elements.point,
          radius: 3,
          hoverRadius: 5,
        },
      },
    };
  }
  
  return baseConfig;
};
