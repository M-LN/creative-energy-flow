// Core Event System for inter-component communication
import type { EventPayload } from '@/shared/types';

type EventListener = (payload: EventPayload) => void;

export class EventSystem {
  private static instance: EventSystem;
  private listeners: Map<string, Set<EventListener>> = new Map();
  private eventHistory: EventPayload[] = [];
  private maxHistorySize = 100;

  private constructor() {}

  public static getInstance(): EventSystem {
    if (!EventSystem.instance) {
      EventSystem.instance = new EventSystem();
    }
    return EventSystem.instance;
  }

  public subscribe(eventType: string, listener: EventListener): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    
    this.listeners.get(eventType)!.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.get(eventType)?.delete(listener);
      if (this.listeners.get(eventType)?.size === 0) {
        this.listeners.delete(eventType);
      }
    };
  }

  public emit(eventType: string, data: any, source = 'unknown'): void {
    const payload: EventPayload = {
      type: eventType,
      data,
      source,
      timestamp: new Date(),
    };

    // Add to history
    this.eventHistory.push(payload);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // Notify listeners
    const eventListeners = this.listeners.get(eventType);
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(payload);
        } catch (error) {
          console.error(`Error in event listener for ${eventType}:`, error);
        }
      });
    }

    // Also emit to wildcard listeners
    const wildcardListeners = this.listeners.get('*');
    if (wildcardListeners) {
      wildcardListeners.forEach(listener => {
        try {
          listener(payload);
        } catch (error) {
          console.error(`Error in wildcard event listener:`, error);
        }
      });
    }
  }

  public getEventHistory(): EventPayload[] {
    return [...this.eventHistory];
  }

  public getEventHistoryByType(eventType: string): EventPayload[] {
    return this.eventHistory.filter(event => event.type === eventType);
  }

  public clearHistory(): void {
    this.eventHistory = [];
  }

  public getActiveListeners(): string[] {
    return Array.from(this.listeners.keys());
  }
}

// Global event types
export const EVENTS = {
  // Energy tracking events
  ENERGY_LOGGED: 'energy:logged',
  ENERGY_UPDATED: 'energy:updated',
  ENERGY_DELETED: 'energy:deleted',
  
  // Social battery events
  SOCIAL_BATTERY_LOGGED: 'social:logged',
  SOCIAL_BATTERY_UPDATED: 'social:updated',
  
  // Chart events
  CHART_DATA_UPDATED: 'chart:data-updated',
  CHART_VIEW_CHANGED: 'chart:view-changed',
  
  // AI events
  AI_INSIGHT_GENERATED: 'ai:insight-generated',
  AI_RECOMMENDATION_CREATED: 'ai:recommendation-created',
  AI_MODEL_UPDATED: 'ai:model-updated',
  
  // PWA events
  PWA_INSTALLED: 'pwa:installed',
  PWA_UPDATE_AVAILABLE: 'pwa:update-available',
  PWA_OFFLINE: 'pwa:offline',
  PWA_ONLINE: 'pwa:online',
  
  // Navigation events
  NAVIGATION_CHANGED: 'nav:changed',
  
  // Data sync events
  DATA_SYNC_START: 'data:sync-start',
  DATA_SYNC_COMPLETE: 'data:sync-complete',
  DATA_SYNC_ERROR: 'data:sync-error',
  
  // Error events
  ERROR_OCCURRED: 'error:occurred',
} as const;