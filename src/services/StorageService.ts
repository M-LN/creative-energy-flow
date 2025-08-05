// Local storage service for persisting energy data
export class StorageService {
  private static readonly ENERGY_DATA_KEY = 'creative-energy-flow-data';
  private static readonly USER_PREFERENCES_KEY = 'creative-energy-flow-preferences';
  private static readonly APP_VERSION = '1.0.0';

  // Save energy data to localStorage
  static saveEnergyData(data: any[]): void {
    try {
      const storageData = {
        version: this.APP_VERSION,
        timestamp: new Date().toISOString(),
        data: data
      };
      localStorage.setItem(this.ENERGY_DATA_KEY, JSON.stringify(storageData));
    } catch (error) {
      console.error('Failed to save energy data:', error);
    }
  }

  // Load energy data from localStorage
  static loadEnergyData(): any[] {
    try {
      const stored = localStorage.getItem(this.ENERGY_DATA_KEY);
      if (!stored) return [];
      
      const storageData = JSON.parse(stored);
      
      // Check version compatibility
      if (storageData.version !== this.APP_VERSION) {
        console.warn('Data version mismatch, migrating...');
        // Could implement data migration here
      }
      
      return storageData.data || [];
    } catch (error) {
      console.error('Failed to load energy data:', error);
      return [];
    }
  }

  // Save user preferences
  static savePreferences(preferences: any): void {
    try {
      const storageData = {
        version: this.APP_VERSION,
        timestamp: new Date().toISOString(),
        preferences: preferences
      };
      localStorage.setItem(this.USER_PREFERENCES_KEY, JSON.stringify(storageData));
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  }

  // Load user preferences
  static loadPreferences(): any {
    try {
      const stored = localStorage.getItem(this.USER_PREFERENCES_KEY);
      if (!stored) return null;
      
      const storageData = JSON.parse(stored);
      return storageData.preferences;
    } catch (error) {
      console.error('Failed to load preferences:', error);
      return null;
    }
  }

  // Clear all stored data
  static clearAllData(): void {
    try {
      localStorage.removeItem(this.ENERGY_DATA_KEY);
      localStorage.removeItem(this.USER_PREFERENCES_KEY);
    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  }

  // Export data for backup
  static exportData(): string {
    const energyData = this.loadEnergyData();
    const preferences = this.loadPreferences();
    
    const exportData = {
      version: this.APP_VERSION,
      exportDate: new Date().toISOString(),
      energyData,
      preferences
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  // Import data from backup
  static importData(jsonString: string): boolean {
    try {
      const importData = JSON.parse(jsonString);
      
      if (importData.energyData) {
        this.saveEnergyData(importData.energyData);
      }
      
      if (importData.preferences) {
        this.savePreferences(importData.preferences);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  // Get storage usage info
  static getStorageInfo(): { used: number; available: number; percentage: number } {
    try {
      const used = new Blob(Object.values(localStorage)).size;
      const available = 5 * 1024 * 1024; // Approximate 5MB limit
      const percentage = (used / available) * 100;
      
      return { used, available, percentage };
    } catch (error) {
      return { used: 0, available: 0, percentage: 0 };
    }
  }
}
