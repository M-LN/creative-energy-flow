// PWA Feature - Progressive Web App capabilities and offline functionality
import { EventSystem, EVENTS } from '@/core/EventSystem';
import { StateManager } from '@/core/StateManager';
import { Workbox } from 'workbox-window';

export class PWAFeature {
  private static instance: PWAFeature;
  private eventSystem: EventSystem;
  private stateManager: StateManager;
  private isInitialized = false;
  private workbox: Workbox | null = null;
  private isOnline = navigator.onLine;
  private syncQueue: Array<{ type: string; data: any; timestamp: Date }> = [];
  private installPrompt: any = null;

  private constructor() {
    this.eventSystem = EventSystem.getInstance();
    this.stateManager = StateManager.getInstance();
  }

  public static getInstance(): PWAFeature {
    if (!PWAFeature.instance) {
      PWAFeature.instance = new PWAFeature();
    }
    return PWAFeature.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Set up event listeners
      this.setupEventListeners();
      
      // Initialize service worker
      await this.initializeServiceWorker();
      
      // Set up offline/online detection
      this.setupNetworkDetection();
      
      // Set up install prompt handling
      this.setupInstallPrompt();
      
      // Initialize data sync
      this.setupDataSync();
      
      // Update PWA state
      this.updatePWAState();
      
      this.isInitialized = true;
      this.eventSystem.emit('feature:pwa-ready', {}, 'PWAFeature');
      
    } catch (error) {
      this.eventSystem.emit(EVENTS.ERROR_OCCURRED, {
        type: 'pwa-initialization-error',
        error: (error as Error).message,
      }, 'PWAFeature');
      throw error;
    }
  }

  private setupEventListeners(): void {
    // Listen for data updates that need to be synced
    this.eventSystem.subscribe(EVENTS.ENERGY_LOGGED, (payload) => {
      this.queueDataForSync('energy-logged', payload.data);
    });

    this.eventSystem.subscribe(EVENTS.SOCIAL_BATTERY_LOGGED, (payload) => {
      this.queueDataForSync('social-logged', payload.data);
    });

    // Listen for PWA events
    this.eventSystem.subscribe('pwa:data-update', (payload) => {
      this.handleDataUpdate(payload.data);
    });

    // Listen for external updates
    this.eventSystem.subscribe('pwa:external-update', (payload) => {
      this.handleExternalUpdate(payload.data);
    });

    // Listen for sync requests
    this.eventSystem.subscribe('pwa:sync-request', () => {
      this.performDataSync();
    });
  }

  private async initializeServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        this.workbox = new Workbox('/sw.js');
        
        // Listen for service worker events
        this.workbox.addEventListener('installed', (event) => {
          if (event.isUpdate) {
            this.eventSystem.emit(EVENTS.PWA_UPDATE_AVAILABLE, {
              message: 'A new version is available!',
            }, 'PWAFeature');
          }
        });

        this.workbox.addEventListener('controlling', () => {
          // Reload the page when the new service worker takes control
          window.location.reload();
        });

        this.workbox.addEventListener('waiting', () => {
          this.eventSystem.emit('pwa:update-waiting', {
            message: 'New version is ready to install',
          }, 'PWAFeature');
        });

        // Register the service worker
        await this.workbox.register();
        
        console.log('Service worker registered successfully');
        
      } catch (error) {
        console.error('Service worker registration failed:', error);
        throw error;
      }
    } else {
      console.warn('Service workers are not supported in this browser');
    }
  }

  private setupNetworkDetection(): void {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.eventSystem.emit(EVENTS.PWA_ONLINE, {
        timestamp: new Date(),
      }, 'PWAFeature');
      this.updatePWAState();
      
      // Attempt to sync queued data
      this.performDataSync();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.eventSystem.emit(EVENTS.PWA_OFFLINE, {
        timestamp: new Date(),
      }, 'PWAFeature');
      this.updatePWAState();
    });

    // Periodic connectivity check
    setInterval(() => {
      this.checkConnectivity();
    }, 30000); // Check every 30 seconds
  }

  private async checkConnectivity(): Promise<void> {
    try {
      const response = await fetch('/manifest.json', {
        method: 'HEAD',
        cache: 'no-cache',
      });
      
      const wasOnline = this.isOnline;
      this.isOnline = response.ok;
      
      if (wasOnline !== this.isOnline) {
        this.eventSystem.emit(this.isOnline ? EVENTS.PWA_ONLINE : EVENTS.PWA_OFFLINE, {
          timestamp: new Date(),
        }, 'PWAFeature');
        this.updatePWAState();
      }
      
    } catch (error) {
      const wasOnline = this.isOnline;
      this.isOnline = false;
      
      if (wasOnline) {
        this.eventSystem.emit(EVENTS.PWA_OFFLINE, {
          timestamp: new Date(),
        }, 'PWAFeature');
        this.updatePWAState();
      }
    }
  }

  private setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (event) => {
      // Prevent the default browser install prompt
      event.preventDefault();
      
      // Store the install prompt for later use
      this.installPrompt = event;
      
      // Emit event for UI to show custom install button
      this.eventSystem.emit('pwa:install-available', {
        canInstall: true,
      }, 'PWAFeature');
    });

    window.addEventListener('appinstalled', () => {
      this.installPrompt = null;
      this.eventSystem.emit(EVENTS.PWA_INSTALLED, {
        timestamp: new Date(),
      }, 'PWAFeature');
      this.updatePWAState();
    });
  }

  private setupDataSync(): void {
    // Load queued sync data from localStorage
    this.loadSyncQueue();
    
    // Set up periodic sync attempts
    setInterval(() => {
      if (this.isOnline && this.syncQueue.length > 0) {
        this.performDataSync();
      }
    }, 60000); // Try to sync every minute when online
  }

  private updatePWAState(): void {
    this.stateManager.updatePWAState({
      isOnline: this.isOnline,
      isInstalled: this.isAppInstalled(),
      updateAvailable: false, // This would be set by service worker events
      syncStatus: this.getSyncStatus(),
    });
  }

  private isAppInstalled(): boolean {
    // Check if app is installed (display mode is standalone)
    return window.matchMedia('(display-mode: standalone)').matches || 
           (window.navigator as any).standalone === true;
  }

  private getSyncStatus(): 'synced' | 'syncing' | 'error' | 'offline' {
    if (!this.isOnline) return 'offline';
    if (this.syncQueue.length === 0) return 'synced';
    return 'syncing';
  }

  private queueDataForSync(type: string, data: any): void {
    const syncItem = {
      type,
      data,
      timestamp: new Date(),
    };
    
    this.syncQueue.push(syncItem);
    this.saveSyncQueue();
    
    // Try immediate sync if online
    if (this.isOnline) {
      setTimeout(() => this.performDataSync(), 1000);
    }
  }

  private async performDataSync(): Promise<void> {
    if (!this.isOnline || this.syncQueue.length === 0) return;
    
    this.eventSystem.emit(EVENTS.DATA_SYNC_START, {
      queueSize: this.syncQueue.length,
    }, 'PWAFeature');
    
    this.updatePWAState();
    
    try {
      // Process sync queue
      const successfulSyncs: any[] = [];
      const failedSyncs: any[] = [];
      
      for (const item of this.syncQueue) {
        try {
          await this.syncDataItem(item);
          successfulSyncs.push(item);
        } catch (error) {
          failedSyncs.push({ item, error });
        }
      }
      
      // Remove successfully synced items
      this.syncQueue = this.syncQueue.filter(item => 
        !successfulSyncs.includes(item)
      );
      
      this.saveSyncQueue();
      
      if (failedSyncs.length === 0) {
        this.eventSystem.emit(EVENTS.DATA_SYNC_COMPLETE, {
          syncedCount: successfulSyncs.length,
          message: 'All data synced successfully',
        }, 'PWAFeature');
      } else {
        this.eventSystem.emit(EVENTS.DATA_SYNC_ERROR, {
          syncedCount: successfulSyncs.length,
          failedCount: failedSyncs.length,
          errors: failedSyncs,
        }, 'PWAFeature');
      }
      
    } catch (error) {
      this.eventSystem.emit(EVENTS.DATA_SYNC_ERROR, {
        error: (error as Error).message,
      }, 'PWAFeature');
    }
    
    this.updatePWAState();
  }

  private async syncDataItem(item: { type: string; data: any; timestamp: Date }): Promise<void> {
    // In a real app, this would sync with a backend API
    // For now, we'll simulate the sync process
    
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
    
    switch (item.type) {
      case 'energy-logged':
        // Sync energy data
        console.log('Syncing energy data:', item.data);
        break;
      case 'social-logged':
        // Sync social battery data
        console.log('Syncing social battery data:', item.data);
        break;
      default:
        console.log('Syncing unknown data type:', item.type, item.data);
    }
    
    // Emit sync success for this item
    this.eventSystem.emit('pwa:item-synced', {
      type: item.type,
      timestamp: item.timestamp,
    }, 'PWAFeature');
  }

  private saveSyncQueue(): void {
    try {
      localStorage.setItem('pwa-sync-queue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Failed to save sync queue:', error);
    }
  }

  private loadSyncQueue(): void {
    try {
      const stored = localStorage.getItem('pwa-sync-queue');
      if (stored) {
        const queue = JSON.parse(stored);
        this.syncQueue = queue.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
      }
    } catch (error) {
      console.error('Failed to load sync queue:', error);
      this.syncQueue = [];
    }
  }

  private handleDataUpdate(data: any): void {
    // Handle data updates from other features
    console.log('PWA data update:', data);
  }

  private handleExternalUpdate(data: any): void {
    console.log('PWA external update:', data);
  }

  // Public API methods
  public async installApp(): Promise<boolean> {
    if (!this.installPrompt) {
      return false;
    }
    
    try {
      // Show the install prompt
      this.installPrompt.prompt();
      
      // Wait for user response
      const result = await this.installPrompt.userChoice;
      
      if (result.outcome === 'accepted') {
        this.eventSystem.emit('pwa:install-accepted', {
          timestamp: new Date(),
        }, 'PWAFeature');
        return true;
      } else {
        this.eventSystem.emit('pwa:install-dismissed', {
          timestamp: new Date(),
        }, 'PWAFeature');
        return false;
      }
      
    } catch (error) {
      this.eventSystem.emit(EVENTS.ERROR_OCCURRED, {
        type: 'install-error',
        error: (error as Error).message,
      }, 'PWAFeature');
      return false;
    } finally {
      this.installPrompt = null;
    }
  }

  public canInstall(): boolean {
    return this.installPrompt !== null;
  }

  public isInstalled(): boolean {
    return this.isAppInstalled();
  }

  public isOnlineStatus(): boolean {
    return this.isOnline;
  }

  public getSyncQueueSize(): number {
    return this.syncQueue.length;
  }

  public async forceSyncNow(): Promise<void> {
    if (this.isOnline) {
      await this.performDataSync();
    } else {
      throw new Error('Cannot sync while offline');
    }
  }

  public clearSyncQueue(): void {
    this.syncQueue = [];
    this.saveSyncQueue();
    this.updatePWAState();
  }

  public async updateServiceWorker(): Promise<void> {
    if (this.workbox) {
      try {
        await this.workbox.messageSkipWaiting();
        this.eventSystem.emit('pwa:update-applied', {
          timestamp: new Date(),
        }, 'PWAFeature');
      } catch (error) {
        this.eventSystem.emit(EVENTS.ERROR_OCCURRED, {
          type: 'service-worker-update-error',
          error: (error as Error).message,
        }, 'PWAFeature');
      }
    }
  }

  public getOfflineCapabilities(): {
    canWorkOffline: boolean;
    offlineFeatures: string[];
    limitations: string[];
  } {
    return {
      canWorkOffline: true,
      offlineFeatures: [
        'Energy level logging',
        'Social battery tracking',
        'View historical data',
        'Basic chart visualization',
        'Cached AI insights'
      ],
      limitations: [
        'New AI insights require internet',
        'Data sync requires connection',
        'Software updates need internet'
      ],
    };
  }

  public async exportOfflineData(): Promise<{
    energyData: any[];
    socialData: any[];
    aiInsights: any[];
    syncQueue: any[];
    exportDate: Date;
  }> {
    const state = this.stateManager.getState();
    
    return {
      energyData: state.energyData,
      socialData: state.socialBatteryData,
      aiInsights: state.aiInsights,
      syncQueue: this.syncQueue,
      exportDate: new Date(),
    };
  }

  public async importOfflineData(data: {
    energyData: any[];
    socialData: any[];
    aiInsights: any[];
    syncQueue?: any[];
  }): Promise<void> {
    try {
      // Import energy data
      data.energyData.forEach(entry => {
        entry.timestamp = new Date(entry.timestamp);
        this.stateManager.addEnergyEntry(entry);
      });
      
      // Import social battery data
      data.socialData.forEach(entry => {
        entry.timestamp = new Date(entry.timestamp);
        this.stateManager.addSocialBatteryEntry(entry);
      });
      
      // Import AI insights
      data.aiInsights.forEach(insight => {
        insight.timestamp = new Date(insight.timestamp);
        this.stateManager.addAIInsight(insight);
      });
      
      // Import sync queue if provided
      if (data.syncQueue) {
        this.syncQueue = [...this.syncQueue, ...data.syncQueue.map(item => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }))];
        this.saveSyncQueue();
      }
      
      this.eventSystem.emit('pwa:data-imported', {
        energyCount: data.energyData.length,
        socialCount: data.socialData.length,
        insightsCount: data.aiInsights.length,
      }, 'PWAFeature');
      
    } catch (error) {
      this.eventSystem.emit(EVENTS.ERROR_OCCURRED, {
        type: 'data-import-error',
        error: (error as Error).message,
      }, 'PWAFeature');
      throw error;
    }
  }

  public getStorageUsage(): {
    estimated: number;
    quota: number;
    usageDetails: {
      localStorage: number;
      indexedDB: number;
      caches: number;
    };
  } {
    // Estimate storage usage
    let localStorageSize = 0;
    try {
      const localStorageData = JSON.stringify(localStorage);
      localStorageSize = new Blob([localStorageData]).size;
    } catch (error) {
      // Handle quota exceeded or other errors
    }
    
    return {
      estimated: localStorageSize,
      quota: 0, // Would need Storage API for accurate quota
      usageDetails: {
        localStorage: localStorageSize,
        indexedDB: 0, // Would need IndexedDB usage calculation
        caches: 0,    // Would need Cache API usage calculation
      },
    };
  }

  public async clearOfflineData(): Promise<void> {
    try {
      // Clear sync queue
      this.clearSyncQueue();
      
      // Clear cached data (in a real app, this would clear IndexedDB and caches)
      localStorage.removeItem('pwa-sync-queue');
      
      this.eventSystem.emit('pwa:offline-data-cleared', {
        timestamp: new Date(),
      }, 'PWAFeature');
      
    } catch (error) {
      this.eventSystem.emit(EVENTS.ERROR_OCCURRED, {
        type: 'clear-offline-data-error',
        error: (error as Error).message,
      }, 'PWAFeature');
      throw error;
    }
  }

  public getFeatureStatus(): {
    isInitialized: boolean;
    isOnline: boolean;
    isInstalled: boolean;
    canInstall: boolean;
    serviceWorkerReady: boolean;
    syncQueueSize: number;
    lastSync: Date | null;
    storageUsed: number;
  } {
    const storageUsage = this.getStorageUsage();
    
    return {
      isInitialized: this.isInitialized,
      isOnline: this.isOnline,
      isInstalled: this.isAppInstalled(),
      canInstall: this.canInstall(),
      serviceWorkerReady: this.workbox !== null,
      syncQueueSize: this.syncQueue.length,
      lastSync: this.syncQueue.length === 0 ? new Date() : null,
      storageUsed: storageUsage.estimated,
    };
  }
}