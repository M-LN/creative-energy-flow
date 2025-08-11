import { EnergyDataService } from './energyDataService';
import { EnergyLevel } from '../types/energy';

describe('EnergyDataService', () => {
  // Create sample user data for testing
  const sampleUserData: EnergyLevel[] = [
    {
      timestamp: new Date('2025-01-01T08:00:00Z'),
      physical: 70,
      mental: 80,
      emotional: 60,
      creative: 75,
      overall: 71.25
    },
    {
      timestamp: new Date('2025-01-01T14:00:00Z'),
      physical: 65,
      mental: 70,
      emotional: 65,
      creative: 80,
      overall: 70
    },
    {
      timestamp: new Date('2025-01-02T08:00:00Z'),
      physical: 75,
      mental: 85,
      emotional: 70,
      creative: 85,
      overall: 78.75
    }
  ];

  test('getEnergyDataByRange filters data correctly', () => {
    const startDate = new Date('2025-01-01T00:00:00Z');
    const endDate = new Date('2025-01-01T23:59:59Z');
    
    const filteredData = EnergyDataService.getEnergyDataByRange(sampleUserData, startDate, endDate);
    
    expect(filteredData.length).toBe(2); // Only entries from Jan 1st
    filteredData.forEach(entry => {
      expect(entry.timestamp.getDate()).toBe(1);
    });
  });

  test('getDailyAverages aggregates data correctly', () => {
    const dailyAverages = EnergyDataService.getDailyAverages(sampleUserData);
    
    // Should have 2 days worth of data
    expect(dailyAverages.length).toBe(2);
    
    // First day should be average of first two entries
    const firstDay = dailyAverages[0];
    expect(firstDay.physical).toBe(67.5); // (70 + 65) / 2
    expect(firstDay.mental).toBe(75); // (80 + 70) / 2
    expect(firstDay.emotional).toBe(62.5); // (60 + 65) / 2
    expect(firstDay.creative).toBe(77.5); // (75 + 80) / 2
    expect(firstDay.overall).toBe(70.625); // (71.25 + 70) / 2
    
    // Second day should be the single entry
    const secondDay = dailyAverages[1];
    expect(secondDay.physical).toBe(75);
    expect(secondDay.mental).toBe(85);
    expect(secondDay.emotional).toBe(70);
    expect(secondDay.creative).toBe(85);
    expect(secondDay.overall).toBe(78.75);
  });

  test('calculateStatistics returns valid statistics for user data', () => {
    const stats = EnergyDataService.calculateStatistics(sampleUserData, 'physical');
    
    expect(stats).toBeDefined();
    expect(stats!.average).toBe(70); // (70 + 65 + 75) / 3
    expect(stats!.min).toBe(65);
    expect(stats!.max).toBe(75);
    expect(typeof stats!.trend).toBe('number');
    expect(stats!.variance).toBeGreaterThanOrEqual(0);
    expect(stats!.correlationWithSocial).toBeGreaterThanOrEqual(-1);
    expect(stats!.correlationWithSocial).toBeLessThanOrEqual(1);
  });

  test('calculateStatistics returns null for empty data', () => {
    const stats = EnergyDataService.calculateStatistics([], 'physical');
    expect(stats).toBeNull();
  });

  test('getEnergyDataByRange returns empty array when no data matches range', () => {
    const startDate = new Date('2024-12-01T00:00:00Z');
    const endDate = new Date('2024-12-31T23:59:59Z');
    
    const filteredData = EnergyDataService.getEnergyDataByRange(sampleUserData, startDate, endDate);
    expect(filteredData.length).toBe(0);
  });

  test('getDailyAverages returns empty array for empty input', () => {
    const dailyAverages = EnergyDataService.getDailyAverages([]);
    expect(dailyAverages.length).toBe(0);
  });
});