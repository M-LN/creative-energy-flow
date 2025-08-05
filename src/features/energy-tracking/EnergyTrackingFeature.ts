// Energy Tracking Feature - Core energy logging functionality
import { EventSystem, EVENTS } from '@/core/EventSystem';
import { StateManager } from '@/core/StateManager';
import type { EnergyLevel } from '@/shared/types';

export class EnergyTrackingFeature {
  private static instance: EnergyTrackingFeature;
  private eventSystem: EventSystem;
  private stateManager: StateManager;
  private isInitialized = false;

  private constructor() {
    this.eventSystem = EventSystem.getInstance();
    this.stateManager = StateManager.getInstance();
  }

  public static getInstance(): EnergyTrackingFeature {
    if (!EnergyTrackingFeature.instance) {
      EnergyTrackingFeature.instance = new EnergyTrackingFeature();
    }
    return EnergyTrackingFeature.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Set up event listeners
      this.setupEventListeners();
      
      // Initialize energy tracking database
      await this.initializeDatabase();
      
      // Set up periodic energy reminders
      this.setupEnergyReminders();
      
      this.isInitialized = true;
      this.eventSystem.emit('feature:energy-tracking-ready', {}, 'EnergyTrackingFeature');
      
    } catch (error) {
      this.eventSystem.emit(EVENTS.ERROR_OCCURRED, {
        type: 'energy-tracking-initialization-error',
        error: (error as Error).message,
      }, 'EnergyTrackingFeature');
      throw error;
    }
  }

  private setupEventListeners(): void {
    // Listen for energy logging requests
    this.eventSystem.subscribe(EVENTS.ENERGY_LOGGED, (payload) => {
      this.handleEnergyLogged(payload.data);
    });

    // Listen for energy updates
    this.eventSystem.subscribe(EVENTS.ENERGY_UPDATED, (payload) => {
      this.handleEnergyUpdated(payload.data);
    });

    // Listen for energy deletions
    this.eventSystem.subscribe(EVENTS.ENERGY_DELETED, (payload) => {
      this.handleEnergyDeleted(payload.data);
    });

    // Listen for external updates from other features
    this.eventSystem.subscribe('energy-tracking:external-update', (payload) => {
      this.handleExternalUpdate(payload.data);
    });
  }

  private async initializeDatabase(): Promise<void> {
    // In a real app, this would set up IndexedDB for offline storage
    // For now, we'll use the StateManager which holds data in memory
    console.log('Energy tracking database initialized');
  }

  private setupEnergyReminders(): void {
    const userPreferences = this.stateManager.getState().user.preferences;
    
    if (userPreferences.notifications) {
      const reminderInterval = userPreferences.reminderFrequency * 60 * 60 * 1000; // Convert hours to ms
      
      setInterval(() => {
        this.sendEnergyReminder();
      }, reminderInterval);
    }
  }

  private sendEnergyReminder(): void {
    const now = new Date();
    const lastEntry = this.getLastEnergyEntry();
    
    if (!lastEntry || (now.getTime() - lastEntry.timestamp.getTime()) > 4 * 60 * 60 * 1000) {
      this.eventSystem.emit('energy:reminder', {
        message: "Time to log your energy level! How are you feeling?",
        timestamp: now,
      }, 'EnergyTrackingFeature');
    }
  }

  private handleEnergyLogged(energyData: EnergyLevel): void {
    try {
      // Validate energy data
      this.validateEnergyData(energyData);
      
      // Add to state manager
      this.stateManager.addEnergyEntry(energyData);
      
      // Emit success event
      this.eventSystem.emit('energy:logged-success', {
        energy: energyData,
        message: 'Energy level logged successfully',
      }, 'EnergyTrackingFeature');
      
      // Trigger insights analysis
      this.triggerInsightsAnalysis(energyData);
      
    } catch (error) {
      this.eventSystem.emit(EVENTS.ERROR_OCCURRED, {
        type: 'energy-logging-error',
        error: (error as Error).message,
        data: energyData,
      }, 'EnergyTrackingFeature');
    }
  }

  private handleEnergyUpdated(energyData: EnergyLevel): void {
    try {
      this.validateEnergyData(energyData);
      this.stateManager.updateEnergyEntry(energyData);
      
      this.eventSystem.emit('energy:updated-success', {
        energy: energyData,
        message: 'Energy level updated successfully',
      }, 'EnergyTrackingFeature');
      
    } catch (error) {
      this.eventSystem.emit(EVENTS.ERROR_OCCURRED, {
        type: 'energy-update-error',
        error: (error as Error).message,
        data: energyData,
      }, 'EnergyTrackingFeature');
    }
  }

  private handleEnergyDeleted(data: { id: string }): void {
    try {
      this.stateManager.deleteEnergyEntry(data.id);
      
      this.eventSystem.emit('energy:deleted-success', {
        id: data.id,
        message: 'Energy entry deleted successfully',
      }, 'EnergyTrackingFeature');
      
    } catch (error) {
      this.eventSystem.emit(EVENTS.ERROR_OCCURRED, {
        type: 'energy-deletion-error',
        error: (error as Error).message,
        data,
      }, 'EnergyTrackingFeature');
    }
  }

  private handleExternalUpdate(data: any): void {
    // Handle updates from other features (e.g., AI insights affecting energy tracking)
    console.log('External update received:', data);
  }

  private validateEnergyData(energyData: EnergyLevel): void {
    if (!energyData.id) {
      throw new Error('Energy entry must have an ID');
    }
    
    if (!energyData.timestamp || !(energyData.timestamp instanceof Date)) {
      throw new Error('Energy entry must have a valid timestamp');
    }
    
    if (typeof energyData.level !== 'number' || energyData.level < 1 || energyData.level > 10) {
      throw new Error('Energy level must be a number between 1 and 10');
    }
    
    if (!['creative', 'physical', 'mental', 'emotional'].includes(energyData.type)) {
      throw new Error('Energy type must be creative, physical, mental, or emotional');
    }
  }

  private triggerInsightsAnalysis(energyData: EnergyLevel): void {
    // Trigger AI analysis of energy patterns
    this.eventSystem.emit('ai:analyze-energy-pattern', {
      newEntry: energyData,
      recentEntries: this.getRecentEnergyEntries(7), // Last 7 days
    }, 'EnergyTrackingFeature');
  }

  // Public API methods
  public logEnergy(energyData: Omit<EnergyLevel, 'id' | 'timestamp'>): void {
    const entry: EnergyLevel = {
      id: `energy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...energyData,
    };
    
    this.eventSystem.emit(EVENTS.ENERGY_LOGGED, entry, 'EnergyTrackingFeature');
  }

  public updateEnergy(energyData: EnergyLevel): void {
    this.eventSystem.emit(EVENTS.ENERGY_UPDATED, energyData, 'EnergyTrackingFeature');
  }

  public deleteEnergy(id: string): void {
    this.eventSystem.emit(EVENTS.ENERGY_DELETED, { id }, 'EnergyTrackingFeature');
  }

  public getEnergyHistory(): EnergyLevel[] {
    return this.stateManager.getEnergyData();
  }

  public getEnergyByDateRange(startDate: Date, endDate: Date): EnergyLevel[] {
    return this.stateManager.getEnergyDataByDateRange(startDate, endDate);
  }

  public getRecentEnergyEntries(days: number): EnergyLevel[] {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));
    return this.getEnergyByDateRange(startDate, endDate);
  }

  public getLastEnergyEntry(): EnergyLevel | null {
    const energyData = this.stateManager.getEnergyData();
    if (energyData.length === 0) return null;
    
    return energyData.reduce((latest, current) => 
      current.timestamp > latest.timestamp ? current : latest
    );
  }

  public getAverageEnergyLevel(type?: EnergyLevel['type']): number {
    const energyData = this.stateManager.getEnergyData();
    const filteredData = type ? energyData.filter(e => e.type === type) : energyData;
    
    if (filteredData.length === 0) return 0;
    
    const sum = filteredData.reduce((total, entry) => total + entry.level, 0);
    return sum / filteredData.length;
  }

  public getEnergyTrends(days: number = 30): {
    type: EnergyLevel['type'];
    trend: 'increasing' | 'decreasing' | 'stable';
    change: number;
  }[] {
    const recentData = this.getRecentEnergyEntries(days);
    const types: EnergyLevel['type'][] = ['creative', 'physical', 'mental', 'emotional'];
    
    return types.map(type => {
      const typeData = recentData.filter(e => e.type === type);
      if (typeData.length < 2) {
        return { type, trend: 'stable', change: 0 };
      }
      
      // Simple trend calculation: compare first half vs second half averages
      const midpoint = Math.floor(typeData.length / 2);
      const firstHalf = typeData.slice(0, midpoint);
      const secondHalf = typeData.slice(midpoint);
      
      const firstAvg = firstHalf.reduce((sum, e) => sum + e.level, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, e) => sum + e.level, 0) / secondHalf.length;
      
      const change = secondAvg - firstAvg;
      const trend = Math.abs(change) < 0.5 ? 'stable' : 
                   change > 0 ? 'increasing' : 'decreasing';
      
      return { type, trend, change };
    });
  }

  public exportEnergyData(): string {
    const energyData = this.stateManager.getEnergyData();
    return JSON.stringify(energyData, null, 2);
  }

  public importEnergyData(jsonData: string): void {
    try {
      const energyEntries: EnergyLevel[] = JSON.parse(jsonData);
      
      energyEntries.forEach(entry => {
        // Validate and convert timestamp
        entry.timestamp = new Date(entry.timestamp);
        this.validateEnergyData(entry);
        this.stateManager.addEnergyEntry(entry);
      });
      
      this.eventSystem.emit('energy:import-success', {
        count: energyEntries.length,
        message: `Successfully imported ${energyEntries.length} energy entries`,
      }, 'EnergyTrackingFeature');
      
    } catch (error) {
      this.eventSystem.emit(EVENTS.ERROR_OCCURRED, {
        type: 'energy-import-error',
        error: (error as Error).message,
      }, 'EnergyTrackingFeature');
    }
  }

  public getFeatureStatus(): {
    isInitialized: boolean;
    totalEntries: number;
    lastEntry: Date | null;
    averageLevel: number;
  } {
    const energyData = this.stateManager.getEnergyData();
    const lastEntry = this.getLastEnergyEntry();
    
    return {
      isInitialized: this.isInitialized,
      totalEntries: energyData.length,
      lastEntry: lastEntry ? lastEntry.timestamp : null,
      averageLevel: this.getAverageEnergyLevel(),
    };
  }
}