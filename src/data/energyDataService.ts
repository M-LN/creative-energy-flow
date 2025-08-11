// User data service for energy tracking visualization

import { EnergyLevel, EnergyType } from '../types/energy';
import { format } from 'date-fns';

export class EnergyDataService {
  
  // Get energy data for a specific time range
  static getEnergyDataByRange(
    data: EnergyLevel[], 
    startDate: Date, 
    endDate: Date
  ): EnergyLevel[] {
    return data.filter(entry => 
      entry.timestamp >= startDate && entry.timestamp <= endDate
    );
  }
  
  // Get aggregated daily averages
  static getDailyAverages(data: EnergyLevel[]): EnergyLevel[] {
    const dailyGroups = new Map<string, EnergyLevel[]>();
    
    data.forEach(entry => {
      const dateKey = format(entry.timestamp, 'yyyy-MM-dd');
      if (!dailyGroups.has(dateKey)) {
        dailyGroups.set(dateKey, []);
      }
      dailyGroups.get(dateKey)!.push(entry);
    });
    
    const dailyAverages: EnergyLevel[] = [];
    
    dailyGroups.forEach((entries, dateKey) => {
      const avg = {
        timestamp: new Date(dateKey),
        physical: entries.reduce((sum, e) => sum + e.physical, 0) / entries.length,
        mental: entries.reduce((sum, e) => sum + e.mental, 0) / entries.length,
        emotional: entries.reduce((sum, e) => sum + e.emotional, 0) / entries.length,
        creative: entries.reduce((sum, e) => sum + e.creative, 0) / entries.length,
        overall: entries.reduce((sum, e) => sum + e.overall, 0) / entries.length,
      };
      dailyAverages.push(avg);
    });
    
    return dailyAverages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
  
  // Calculate energy statistics
  static calculateStatistics(data: EnergyLevel[], energyType: EnergyType) {
    if (data.length === 0) return null;
    
    const values = data.map(entry => entry[energyType]);
    const sum = values.reduce((a, b) => a + b, 0);
    const average = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    // Calculate trend (simple linear regression slope)
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;
    const trend = ((n * sumXY - sumX * sum) / (n * sumXX - sumX * sumX)) * 100;
    
    // Calculate variance
    const variance = values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / n;
    
    return {
      average: Math.round(average * 100) / 100,
      min,
      max,
      trend: Math.round(trend * 100) / 100,
      variance: Math.round(variance * 100) / 100,
      correlationWithSocial: 0.65 + (Math.random() - 0.5) * 0.3 // Mock correlation
    };
  }
}