// Unit tests for the EventSystem
import { describe, it, expect, beforeEach } from 'vitest';
import { EventSystem, EVENTS } from '@/core/EventSystem';

describe('EventSystem', () => {
  let eventSystem: EventSystem;

  beforeEach(() => {
    // Get a fresh instance for each test
    eventSystem = EventSystem.getInstance();
    eventSystem.clearHistory();
  });

  it('should be a singleton', () => {
    const instance1 = EventSystem.getInstance();
    const instance2 = EventSystem.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should emit and receive events', () => {
    let receivedPayload: any = null;
    
    const unsubscribe = eventSystem.subscribe('test-event', (payload) => {
      receivedPayload = payload;
    });

    const testData = { message: 'test' };
    eventSystem.emit('test-event', testData, 'test-source');

    expect(receivedPayload).toBeDefined();
    expect(receivedPayload.type).toBe('test-event');
    expect(receivedPayload.data).toEqual(testData);
    expect(receivedPayload.source).toBe('test-source');

    unsubscribe();
  });

  it('should handle multiple subscribers', () => {
    let count = 0;
    
    const unsubscribe1 = eventSystem.subscribe('multi-test', () => count++);
    const unsubscribe2 = eventSystem.subscribe('multi-test', () => count++);

    eventSystem.emit('multi-test', {}, 'test');

    expect(count).toBe(2);

    unsubscribe1();
    unsubscribe2();
  });

  it('should maintain event history', () => {
    eventSystem.emit('history-test', { id: 1 }, 'test');
    eventSystem.emit('history-test', { id: 2 }, 'test');

    const history = eventSystem.getEventHistory();
    expect(history).toHaveLength(2);
    expect(history[0].data.id).toBe(1);
    expect(history[1].data.id).toBe(2);
  });

  it('should filter event history by type', () => {
    eventSystem.emit('type-a', { value: 'a' }, 'test');
    eventSystem.emit('type-b', { value: 'b' }, 'test');
    eventSystem.emit('type-a', { value: 'a2' }, 'test');

    const typeAHistory = eventSystem.getEventHistoryByType('type-a');
    expect(typeAHistory).toHaveLength(2);
    expect(typeAHistory[0].data.value).toBe('a');
    expect(typeAHistory[1].data.value).toBe('a2');
  });

  it('should unsubscribe correctly', () => {
    let eventReceived = false;
    
    const unsubscribe = eventSystem.subscribe('unsubscribe-test', () => {
      eventReceived = true;
    });

    unsubscribe();
    eventSystem.emit('unsubscribe-test', {}, 'test');

    expect(eventReceived).toBe(false);
  });

  it('should handle wildcard listeners', () => {
    let receivedEvents: any[] = [];
    
    const unsubscribe = eventSystem.subscribe('*', (payload) => {
      receivedEvents.push(payload);
    });

    eventSystem.emit('test-1', { id: 1 }, 'test');
    eventSystem.emit('test-2', { id: 2 }, 'test');

    expect(receivedEvents).toHaveLength(2);
    expect(receivedEvents[0].type).toBe('test-1');
    expect(receivedEvents[1].type).toBe('test-2');

    unsubscribe();
  });

  it('should have predefined event constants', () => {
    expect(EVENTS.ENERGY_LOGGED).toBeDefined();
    expect(EVENTS.SOCIAL_BATTERY_LOGGED).toBeDefined();
    expect(EVENTS.AI_INSIGHT_GENERATED).toBeDefined();
    expect(EVENTS.PWA_INSTALLED).toBeDefined();
  });
});