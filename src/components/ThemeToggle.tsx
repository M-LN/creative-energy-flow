import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import './ThemeToggle.css';

export const ThemeToggle: React.FC = () => {
  const { theme, effectiveTheme, toggleTheme } = useTheme();

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return '☀️';
      case 'dark':
        return '🌙';
      case 'auto':
        return '🌓';
      default:
        return '🌓';
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light theme';
      case 'dark':
        return 'Dark theme';
      case 'auto':
        return `Auto theme (${effectiveTheme})`;
      default:
        return 'Theme toggle';
    }
  };

  const getNextThemeHint = () => {
    switch (theme) {
      case 'light':
        return 'Switch to dark theme';
      case 'dark':
        return 'Switch to auto theme';
      case 'auto':
        return 'Switch to light theme';
      default:
        return 'Toggle theme';
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label={getNextThemeHint()}
      title={getNextThemeHint()}
      type="button"
    >
      <span className="theme-toggle-icon" role="img" aria-hidden="true">
        {getThemeIcon()}
      </span>
      <span className="theme-toggle-label">
        {getThemeLabel()}
      </span>
    </button>
  );
};
