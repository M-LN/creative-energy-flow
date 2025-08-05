// Mock data service for energy tracking visualization

import { EnergyLevel, SocialBatteryData, EnergyType } from '../types/energy';
import { addHours, subDays, format } from 'date-fns';

export class EnergyDataService {
  // Generate sample energy data for the last N days
  static generateEnergyData(days: number = 30): EnergyLevel[] {
    const data: EnergyLevel[] = [];
    const now = new Date();
    
    for (let i = days; i >= 0; i--) {
      const date = subDays(now, i);
      
      // Generate multiple readings per day (morning, afternoon, evening)
      for (let hour of [8, 14, 20]) {
        const timestamp = addHours(date, hour);
        
        // Simulate realistic energy patterns
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        
        // Base energy levels with some variation
        const basePhysical = isWeekend ? 70 : 60;
        const baseMental = hour === 8 ? 80 : hour === 14 ? 65 : 40;
        const baseEmotional = isWeekend ? 75 : 60;
        const baseCreative = hour === 14 ? 85 : hour === 8 ? 70 : 50;
        
        // Add some randomness and daily patterns
        const variation = () => (Math.random() - 0.5) * 30;
        
        const physical = Math.max(0, Math.min(100, basePhysical + variation()));
        const mental = Math.max(0, Math.min(100, baseMental + variation()));
        const emotional = Math.max(0, Math.min(100, baseEmotional + variation()));
        const creative = Math.max(0, Math.min(100, baseCreative + variation()));
        const overall = (physical + mental + emotional + creative) / 4;
        
        data.push({
          timestamp,
          physical,
          mental,
          emotional,
          creative,
          overall
        });
      }
    }
    
    return data.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
  
  // Generate social battery data
  static generateSocialBatteryData(days: number = 30): SocialBatteryData[] {
    const data: SocialBatteryData[] = [];
    const now = new Date();
    
    for (let i = days; i >= 0; i--) {
      const date = subDays(now, i);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      // Simulate social battery levels
      const baseLevel = isWeekend ? 80 : 50;
      const level = Math.max(0, Math.min(100, baseLevel + (Math.random() - 0.5) * 40));
      
      // Generate social interactions
      const socialInteractions = isWeekend ? 
        Math.floor(Math.random() * 3) : 
        Math.floor(Math.random() * 8) + 2;
      
      // Generate drain and recharge events
      const drainEvents = [];
      const rechargeEvents = [];
      
      if (!isWeekend && Math.random() > 0.3) {
        drainEvents.push({
          timestamp: addHours(date, 9 + Math.random() * 8),
          intensity: Math.floor(Math.random() * 5) + 3,
          type: ['meeting', 'call', 'social_event'][Math.floor(Math.random() * 3)] as any,
          description: 'Work interaction'
        });
      }
      
      if (Math.random() > 0.4) {
        rechargeEvents.push({
          timestamp: addHours(date, 18 + Math.random() * 4),
          intensity: Math.floor(Math.random() * 5) + 3,
          type: ['alone_time', 'hobby', 'nature'][Math.floor(Math.random() * 3)] as any,
          description: 'Personal time'
        });
      }
      
      data.push({
        timestamp: date,
        level,
        socialInteractions,
        drainEvents,
        rechargeEvents
      });
    }
    
    return data.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
  
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