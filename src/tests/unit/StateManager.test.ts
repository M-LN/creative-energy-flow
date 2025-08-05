// Unit tests for StateManager
import { describe, it, expect, beforeEach } from 'vitest';
import { StateManager } from '@/core/StateManager';
import type { EnergyLevel, SocialBatteryEntry } from '@/shared/types';

describe('StateManager', () => {
  let stateManager: StateManager;

  beforeEach(() => {
    stateManager = StateManager.getInstance();
    stateManager.resetState(); // Reset state between tests
  });

  it('should be a singleton', () => {
    const instance1 = StateManager.getInstance();
    const instance2 = StateManager.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should have initial state', () => {
    const state = stateManager.getState();
    
    expect(state.energyData).toEqual([]);
    expect(state.socialBatteryData).toEqual([]);
    expect(state.aiInsights).toEqual([]);
    expect(state.currentView).toBe('dashboard');
    expect(state.user.preferences.theme).toBe('warm');
  });

  it('should add energy entries', () => {
    const energyEntry: EnergyLevel = {
      id: 'test-energy-1',
      timestamp: new Date(),
      level: 8,
      type: 'creative',
      note: 'Test entry',
    };

    stateManager.addEnergyEntry(energyEntry);
    
    const state = stateManager.getState();
    expect(state.energyData).toHaveLength(1);
    expect(state.energyData[0]).toEqual(energyEntry);
  });

  it('should update energy entries', () => {
    const energyEntry: EnergyLevel = {
      id: 'test-energy-update',
      timestamp: new Date(),
      level: 5,
      type: 'mental',
    };

    stateManager.addEnergyEntry(energyEntry);

    const updatedEntry: EnergyLevel = {
      ...energyEntry,
      level: 9,
      note: 'Updated',
    };

    stateManager.updateEnergyEntry(updatedEntry);
    
    const state = stateManager.getState();
    expect(state.energyData[0].level).toBe(9);
    expect(state.energyData[0].note).toBe('Updated');
  });

  it('should delete energy entries', () => {
    const energyEntry: EnergyLevel = {
      id: 'test-energy-delete',
      timestamp: new Date(),
      level: 3,
      type: 'physical',
    };

    stateManager.addEnergyEntry(energyEntry);
    expect(stateManager.getState().energyData).toHaveLength(1);

    stateManager.deleteEnergyEntry('test-energy-delete');
    expect(stateManager.getState().energyData).toHaveLength(0);
  });

  it('should add social battery entries', () => {
    const socialEntry: SocialBatteryEntry = {
      id: 'test-social-1',
      timestamp: new Date(),
      level: 6,
      interactionType: 'small-group',
      note: 'Team meeting',
    };

    stateManager.addSocialBatteryEntry(socialEntry);
    
    const state = stateManager.getState();
    expect(state.socialBatteryData).toHaveLength(1);
    expect(state.socialBatteryData[0]).toEqual(socialEntry);
  });

  it('should filter energy data by date range', () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const energyEntry1: EnergyLevel = {
      id: 'test-1',
      timestamp: yesterday,
      level: 5,
      type: 'creative',
    };

    const energyEntry2: EnergyLevel = {
      id: 'test-2',
      timestamp: now,
      level: 7,
      type: 'mental',
    };

    const energyEntry3: EnergyLevel = {
      id: 'test-3',
      timestamp: tomorrow,
      level: 4,
      type: 'physical',
    };

    stateManager.addEnergyEntry(energyEntry1);
    stateManager.addEnergyEntry(energyEntry2);
    stateManager.addEnergyEntry(energyEntry3);

    const filteredData = stateManager.getEnergyDataByDateRange(
      new Date(now.getTime() - 1000),
      new Date(now.getTime() + 1000)
    );

    expect(filteredData).toHaveLength(1);
    expect(filteredData[0].id).toBe('test-2');
  });

  it('should notify state listeners', () => {
    let notificationCount = 0;
    let lastState: any = null;

    const unsubscribe = stateManager.subscribe((state) => {
      notificationCount++;
      lastState = state;
    });

    const energyEntry: EnergyLevel = {
      id: 'test-notification',
      timestamp: new Date(),
      level: 6,
      type: 'emotional',
    };

    stateManager.addEnergyEntry(energyEntry);

    expect(notificationCount).toBe(1);
    expect(lastState.energyData).toHaveLength(1);

    unsubscribe();
  });

  it('should update current view', () => {
    stateManager.updateCurrentView('charts');
    expect(stateManager.getCurrentView()).toBe('charts');
    
    const state = stateManager.getState();
    expect(state.currentView).toBe('charts');
  });

  it('should update user preferences', () => {
    stateManager.updateUserPreferences({
      theme: 'dark',
      notifications: false,
    });

    const state = stateManager.getState();
    expect(state.user.preferences.theme).toBe('dark');
    expect(state.user.preferences.notifications).toBe(false);
    // Should preserve other preferences
    expect(state.user.preferences.autoSync).toBe(true);
  });
});