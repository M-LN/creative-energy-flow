import { useState, useEffect, useCallback } from 'react';
import type { EnergyLevel, EnergyType, EnergyTrend, EnergyState } from '../types/energy';
import { EnergyStorage } from '../utils/energyStorage';
import { DateUtils } from '../utils/dateUtils';

export const useEnergyState = () => {
  const [state, setState] = useState<EnergyState>({
    currentEnergy: null,
    todayData: null,
    weeklyTrends: [],
    isLoading: true,
    error: null,
  });

  // Generate weekly trends from stored data
  const generateWeeklyTrends = useCallback((): EnergyTrend[] => {
    const last7Days = DateUtils.getLastNDays(7);
    return last7Days.map(date => {
      const dayData = EnergyStorage.getDailyData(date);
      if (!dayData || dayData.entries.length === 0) {
        return {
          date,
          averageEnergy: 0,
          peakEnergy: 0,
          lowEnergy: 0,
        };
      }

      const values = dayData.entries.map(entry => entry.value);
      return {
        date,
        averageEnergy: dayData.averageLevel,
        peakEnergy: Math.max(...values),
        lowEnergy: Math.min(...values),
      };
    });
  }, []);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        const currentEnergy = EnergyStorage.getCurrentEnergy();
        const todayData = EnergyStorage.getDailyData(DateUtils.getCurrentDate());
        const weeklyTrends = generateWeeklyTrends();

        setState({
          currentEnergy,
          todayData,
          weeklyTrends,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load energy data'
        }));
      }
    };

    loadInitialData();
  }, [generateWeeklyTrends]);

  // Add new energy entry
  const addEnergyLevel = useCallback((value: number, type: EnergyType) => {
    try {
      const energyLevel: EnergyLevel = {
        value,
        type,
        timeOfDay: DateUtils.getCurrentTimeOfDay(),
        timestamp: DateUtils.getCurrentTimestamp(),
        id: DateUtils.generateId(),
      };

      // Save to storage
      EnergyStorage.addEnergyEntry(energyLevel);
      EnergyStorage.saveCurrentEnergy(energyLevel);

      // Update state
      const todayData = EnergyStorage.getDailyData(DateUtils.getCurrentDate());
      const weeklyTrends = generateWeeklyTrends();

      setState(prev => ({
        ...prev,
        currentEnergy: energyLevel,
        todayData,
        weeklyTrends,
        error: null,
      }));

      return energyLevel;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save energy level';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw new Error(errorMessage);
    }
  }, [generateWeeklyTrends]);

  // Get today's energy for specific type and time
  const getTodayEnergyByTypeAndTime = useCallback((type: EnergyType, timeOfDay?: string) => {
    if (!state.todayData) return null;
    
    return state.todayData.entries.find(entry => {
      const typeMatch = entry.type === type;
      const timeMatch = timeOfDay ? entry.timeOfDay === timeOfDay : true;
      return typeMatch && timeMatch;
    });
  }, [state.todayData]);

  // Refresh data
  const refreshData = useCallback(() => {
    const todayData = EnergyStorage.getDailyData(DateUtils.getCurrentDate());
    const weeklyTrends = generateWeeklyTrends();

    setState(prev => ({
      ...prev,
      todayData,
      weeklyTrends,
    }));
  }, [generateWeeklyTrends]);

  return {
    ...state,
    addEnergyLevel,
    getTodayEnergyByTypeAndTime,
    refreshData,
  };
};