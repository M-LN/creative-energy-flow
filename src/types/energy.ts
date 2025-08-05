export type EnergyType = 'physical' | 'mental' | 'emotional' | 'creative';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening';

export interface EnergyLevel {
  value: number; // 1-10 scale
  type: EnergyType;
  timeOfDay: TimeOfDay;
  timestamp: string; // ISO date string
  id: string;
}

export interface DailyEnergyData {
  date: string; // YYYY-MM-DD format
  entries: EnergyLevel[];
  averageLevel: number;
}

export interface EnergyTrend {
  date: string;
  averageEnergy: number;
  peakEnergy: number;
  lowEnergy: number;
}

export interface EnergyState {
  currentEnergy: EnergyLevel | null;
  todayData: DailyEnergyData | null;
  weeklyTrends: EnergyTrend[];
  isLoading: boolean;
  error: string | null;
}