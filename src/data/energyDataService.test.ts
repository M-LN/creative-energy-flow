import { EnergyDataService } from './energyDataService';

describe('EnergyDataService', () => {
  test('generateEnergyData creates correct number of entries', () => {
    const data = EnergyDataService.generateEnergyData(7);
    // Each day has 3 entries (morning, afternoon, evening), plus today
    expect(data.length).toBe(24); // 8 days * 3 entries per day
  });

  test('generateEnergyData creates valid energy levels', () => {
    const data = EnergyDataService.generateEnergyData(1);
    data.forEach(entry => {
      expect(entry.physical).toBeGreaterThanOrEqual(0);
      expect(entry.physical).toBeLessThanOrEqual(100);
      expect(entry.mental).toBeGreaterThanOrEqual(0);
      expect(entry.mental).toBeLessThanOrEqual(100);
      expect(entry.emotional).toBeGreaterThanOrEqual(0);
      expect(entry.emotional).toBeLessThanOrEqual(100);
      expect(entry.creative).toBeGreaterThanOrEqual(0);
      expect(entry.creative).toBeLessThanOrEqual(100);
      expect(entry.overall).toBeGreaterThanOrEqual(0);
      expect(entry.overall).toBeLessThanOrEqual(100);
    });
  });

  test('generateSocialBatteryData creates correct structure', () => {
    const data = EnergyDataService.generateSocialBatteryData(3);
    expect(data.length).toBe(4); // 4 days including today
    
    data.forEach(entry => {
      expect(entry.level).toBeGreaterThanOrEqual(0);
      expect(entry.level).toBeLessThanOrEqual(100);
      expect(entry.socialInteractions).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(entry.drainEvents)).toBe(true);
      expect(Array.isArray(entry.rechargeEvents)).toBe(true);
    });
  });

  test('calculateStatistics returns valid statistics', () => {
    const data = EnergyDataService.generateEnergyData(5);
    const stats = EnergyDataService.calculateStatistics(data, 'physical');
    
    expect(stats).toBeDefined();
    expect(stats!.average).toBeGreaterThanOrEqual(0);
    expect(stats!.average).toBeLessThanOrEqual(100);
    expect(stats!.min).toBeGreaterThanOrEqual(0);
    expect(stats!.max).toBeLessThanOrEqual(100);
    expect(stats!.min).toBeLessThanOrEqual(stats!.max);
    expect(typeof stats!.trend).toBe('number');
    expect(stats!.variance).toBeGreaterThanOrEqual(0);
    expect(stats!.correlationWithSocial).toBeGreaterThanOrEqual(-1);
    expect(stats!.correlationWithSocial).toBeLessThanOrEqual(1);
  });

  test('getDailyAverages aggregates data correctly', () => {
    const data = EnergyDataService.generateEnergyData(2);
    const dailyAverages = EnergyDataService.getDailyAverages(data);
    
    // Should have fewer entries than original (aggregated by day)
    expect(dailyAverages.length).toBeLessThan(data.length);
    expect(dailyAverages.length).toBeGreaterThan(0);
    
    dailyAverages.forEach(entry => {
      expect(entry.physical).toBeGreaterThanOrEqual(0);
      expect(entry.physical).toBeLessThanOrEqual(100);
      expect(entry.overall).toBeGreaterThanOrEqual(0);
      expect(entry.overall).toBeLessThanOrEqual(100);
    });
  });
});