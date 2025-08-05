import type { DailyEnergyData, EnergyLevel } from '../types/energy';

const STORAGE_KEYS = {
  DAILY_ENERGY: 'daily-energy-',
  CURRENT_ENERGY: 'current-energy',
} as const;

export class EnergyStorage {
  /**
   * Save daily energy data to localStorage
   */
  static saveDailyData(date: string, data: DailyEnergyData): void {
    try {
      const key = STORAGE_KEYS.DAILY_ENERGY + date;
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save daily energy data:', error);
    }
  }

  /**
   * Get daily energy data from localStorage
   */
  static getDailyData(date: string): DailyEnergyData | null {
    try {
      const key = STORAGE_KEYS.DAILY_ENERGY + date;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load daily energy data:', error);
      return null;
    }
  }

  /**
   * Add energy level entry to daily data
   */
  static addEnergyEntry(energyLevel: EnergyLevel): void {
    const date = energyLevel.timestamp.split('T')[0]; // Extract YYYY-MM-DD
    let dailyData = this.getDailyData(date);

    if (!dailyData) {
      dailyData = {
        date,
        entries: [],
        averageLevel: 0,
      };
    }

    // Remove any existing entry for the same time of day and type
    dailyData.entries = dailyData.entries.filter(
      entry => !(entry.timeOfDay === energyLevel.timeOfDay && entry.type === energyLevel.type)
    );

    // Add new entry
    dailyData.entries.push(energyLevel);

    // Recalculate average
    dailyData.averageLevel = dailyData.entries.reduce((sum, entry) => sum + entry.value, 0) / dailyData.entries.length;

    this.saveDailyData(date, dailyData);
  }

  /**
   * Get energy data for a date range
   */
  static getDateRangeData(startDate: string, endDate: string): DailyEnergyData[] {
    const data: DailyEnergyData[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0];
      const dailyData = this.getDailyData(dateStr);
      if (dailyData) {
        data.push(dailyData);
      }
    }

    return data;
  }

  /**
   * Save current energy level
   */
  static saveCurrentEnergy(energyLevel: EnergyLevel): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_ENERGY, JSON.stringify(energyLevel));
    } catch (error) {
      console.error('Failed to save current energy:', error);
    }
  }

  /**
   * Get current energy level
   */
  static getCurrentEnergy(): EnergyLevel | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_ENERGY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load current energy:', error);
      return null;
    }
  }

  /**
   * Clear all energy data (for testing or reset)
   */
  static clearAllData(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(STORAGE_KEYS.DAILY_ENERGY) || key === STORAGE_KEYS.CURRENT_ENERGY) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Failed to clear energy data:', error);
    }
  }
}