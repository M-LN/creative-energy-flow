// Global State Manager for the Creative Energy Flow application
import type { AppState, EnergyLevel, SocialBatteryEntry, AIInsight, PWAState } from '@/shared/types';
import { EventSystem, EVENTS } from './EventSystem';

export class StateManager {
  private static instance: StateManager;
  private state: AppState;
  private eventSystem: EventSystem;
  private stateListeners: Set<(state: AppState) => void> = new Set();

  private constructor() {
    this.eventSystem = EventSystem.getInstance();
    this.state = this.getInitialState();
    this.setupEventListeners();
  }

  public static getInstance(): StateManager {
    if (!StateManager.instance) {
      StateManager.instance = new StateManager();
    }
    return StateManager.instance;
  }

  private getInitialState(): AppState {
    return {
      energyData: [],
      socialBatteryData: [],
      aiInsights: [],
      pwaState: {
        isOnline: navigator.onLine,
        isInstalled: false,
        updateAvailable: false,
        syncStatus: 'synced',
      },
      currentView: 'dashboard',
      user: {
        preferences: {
          theme: 'warm',
          notifications: true,
          autoSync: true,
          reminderFrequency: 4,
          privacyLevel: 'balanced',
        },
        settings: {
          energyTrackingEnabled: true,
          socialBatteryEnabled: true,
          aiInsightsEnabled: true,
          chartAnimations: true,
          dataRetentionDays: 365,
        },
      },
    };
  }

  private setupEventListeners(): void {
    // Energy tracking events
    this.eventSystem.subscribe(EVENTS.ENERGY_LOGGED, (payload) => {
      this.addEnergyEntry(payload.data);
    });

    this.eventSystem.subscribe(EVENTS.ENERGY_UPDATED, (payload) => {
      this.updateEnergyEntry(payload.data);
    });

    this.eventSystem.subscribe(EVENTS.ENERGY_DELETED, (payload) => {
      this.deleteEnergyEntry(payload.data.id);
    });

    // Social battery events
    this.eventSystem.subscribe(EVENTS.SOCIAL_BATTERY_LOGGED, (payload) => {
      this.addSocialBatteryEntry(payload.data);
    });

    // AI insight events
    this.eventSystem.subscribe(EVENTS.AI_INSIGHT_GENERATED, (payload) => {
      this.addAIInsight(payload.data);
    });

    // PWA state events
    this.eventSystem.subscribe(EVENTS.PWA_ONLINE, () => {
      this.updatePWAState({ isOnline: true });
    });

    this.eventSystem.subscribe(EVENTS.PWA_OFFLINE, () => {
      this.updatePWAState({ isOnline: false });
    });

    // Navigation events
    this.eventSystem.subscribe(EVENTS.NAVIGATION_CHANGED, (payload) => {
      this.updateCurrentView(payload.data.view);
    });
  }

  public getState(): AppState {
    return { ...this.state };
  }

  public subscribe(listener: (state: AppState) => void): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  private notifyStateChange(): void {
    const currentState = this.getState();
    this.stateListeners.forEach(listener => {
      try {
        listener(currentState);
      } catch (error) {
        console.error('Error in state listener:', error);
      }
    });
  }

  // Energy data methods
  public addEnergyEntry(entry: EnergyLevel): void {
    this.state.energyData.push(entry);
    this.notifyStateChange();
    this.eventSystem.emit(EVENTS.CHART_DATA_UPDATED, { type: 'energy' }, 'StateManager');
  }

  public updateEnergyEntry(updatedEntry: EnergyLevel): void {
    const index = this.state.energyData.findIndex(entry => entry.id === updatedEntry.id);
    if (index !== -1) {
      this.state.energyData[index] = updatedEntry;
      this.notifyStateChange();
      this.eventSystem.emit(EVENTS.CHART_DATA_UPDATED, { type: 'energy' }, 'StateManager');
    }
  }

  public deleteEnergyEntry(id: string): void {
    this.state.energyData = this.state.energyData.filter(entry => entry.id !== id);
    this.notifyStateChange();
    this.eventSystem.emit(EVENTS.CHART_DATA_UPDATED, { type: 'energy' }, 'StateManager');
  }

  // Social battery methods
  public addSocialBatteryEntry(entry: SocialBatteryEntry): void {
    this.state.socialBatteryData.push(entry);
    this.notifyStateChange();
    this.eventSystem.emit(EVENTS.CHART_DATA_UPDATED, { type: 'social' }, 'StateManager');
  }

  // AI insights methods
  public addAIInsight(insight: AIInsight): void {
    this.state.aiInsights.push(insight);
    // Keep only recent insights
    if (this.state.aiInsights.length > 50) {
      this.state.aiInsights = this.state.aiInsights.slice(-50);
    }
    this.notifyStateChange();
  }

  // PWA state methods
  public updatePWAState(updates: Partial<PWAState>): void {
    this.state.pwaState = { ...this.state.pwaState, ...updates };
    this.notifyStateChange();
  }

  // Navigation methods
  public updateCurrentView(view: string): void {
    this.state.currentView = view;
    this.notifyStateChange();
  }

  // User preferences methods
  public updateUserPreferences(updates: Partial<AppState['user']['preferences']>): void {
    this.state.user.preferences = { ...this.state.user.preferences, ...updates };
    this.notifyStateChange();
  }

  public updateAppSettings(updates: Partial<AppState['user']['settings']>): void {
    this.state.user.settings = { ...this.state.user.settings, ...updates };
    this.notifyStateChange();
  }

  // Data access methods
  public getEnergyData(): EnergyLevel[] {
    return [...this.state.energyData];
  }

  public getSocialBatteryData(): SocialBatteryEntry[] {
    return [...this.state.socialBatteryData];
  }

  public getAIInsights(): AIInsight[] {
    return [...this.state.aiInsights];
  }

  public getCurrentView(): string {
    return this.state.currentView;
  }

  // Data filtering methods
  public getEnergyDataByDateRange(startDate: Date, endDate: Date): EnergyLevel[] {
    return this.state.energyData.filter(entry => 
      entry.timestamp >= startDate && entry.timestamp <= endDate
    );
  }

  public getSocialBatteryDataByDateRange(startDate: Date, endDate: Date): SocialBatteryEntry[] {
    return this.state.socialBatteryData.filter(entry => 
      entry.timestamp >= startDate && entry.timestamp <= endDate
    );
  }

  // Add a reset method for testing
  public resetState(): void {
    this.state = this.getInitialState();
  }
}