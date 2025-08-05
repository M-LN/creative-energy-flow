import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { 
  SocialBatteryState, 
  SocialInteraction, 
  EnergyLevel,
  DashboardMetrics,
  RecoveryRecommendation 
} from '../types';
import { SocialBatteryCalculator, RecoveryRecommendationEngine, DateUtils } from '../utils/socialBatteryCalculator';

// Action types
type SocialBatteryAction = 
  | { type: 'ADD_INTERACTION'; payload: SocialInteraction }
  | { type: 'UPDATE_ENERGY_LEVEL'; payload: { level: number } }
  | { type: 'UPDATE_RECOVERY_RATE'; payload: { rate: number } }
  | { type: 'LOAD_DATA'; payload: { interactions: SocialInteraction[]; batteryState: SocialBatteryState } }
  | { type: 'TICK_RECOVERY' }
  | { type: 'RESET_STATE' };

// Initial state
const initialSocialBatteryState: SocialBatteryState = {
  currentLevel: 75,
  recoveryRate: 8, // % per hour
  personalLimits: {
    dailyInteractionLimit: 240, // 4 hours
    weeklyInteractionLimit: 1200, // 20 hours
    recoveryTimeNeeded: 8, // 8 hours
    optimalSocialLevel: 70
  },
  weeklyStats: {
    totalInteractionTime: 0,
    averageEnergyLevel: 75,
    mostDrainingDay: 'Monday',
    preferredInteractionTypes: [],
    recoveryPatterns: []
  }
};

// App state
interface AppState {
  socialBattery: SocialBatteryState;
  interactions: SocialInteraction[];
  energyLevels: EnergyLevel[];
  recommendations: RecoveryRecommendation[];
  lastUpdate: Date;
}

const initialAppState: AppState = {
  socialBattery: initialSocialBatteryState,
  interactions: [],
  energyLevels: [],
  recommendations: [],
  lastUpdate: new Date()
};

// Reducer
function socialBatteryReducer(state: AppState, action: SocialBatteryAction): AppState {
  switch (action.type) {
    case 'ADD_INTERACTION': {
      const newInteraction = action.payload;
      const newInteractions = [...state.interactions, newInteraction];
      
      // Update social battery level based on interaction
      const newLevel = Math.max(0, newInteraction.energyAfter);
      
      // Recalculate personal limits
      const updatedLimits = SocialBatteryCalculator.calculatePersonalLimits(newInteractions);
      
      // Generate new recommendations
      const newRecommendations = RecoveryRecommendationEngine.generateRecommendations(
        newLevel,
        newInteractions.slice(-10), // last 10 interactions
        new Date().getHours()
      );
      
      return {
        ...state,
        interactions: newInteractions,
        socialBattery: {
          ...state.socialBattery,
          currentLevel: newLevel,
          lastInteraction: newInteraction,
          personalLimits: updatedLimits
        },
        recommendations: newRecommendations,
        lastUpdate: new Date()
      };
    }
    
    case 'UPDATE_ENERGY_LEVEL': {
      return {
        ...state,
        socialBattery: {
          ...state.socialBattery,
          currentLevel: Math.min(100, Math.max(0, action.payload.level))
        },
        lastUpdate: new Date()
      };
    }
    
    case 'UPDATE_RECOVERY_RATE': {
      return {
        ...state,
        socialBattery: {
          ...state.socialBattery,
          recoveryRate: action.payload.rate
        }
      };
    }
    
    case 'TICK_RECOVERY': {
      const now = new Date();
      const hoursElapsed = (now.getTime() - state.lastUpdate.getTime()) / (1000 * 60 * 60);
      
      // Only apply recovery if enough time has passed and no recent draining interactions
      if (hoursElapsed >= 0.25) { // 15 minutes minimum
        const lastInteraction = state.socialBattery.lastInteraction;
        const timeSinceLastInteraction = lastInteraction 
          ? (now.getTime() - lastInteraction.timestamp.getTime()) / (1000 * 60 * 60)
          : 24;
        
        // Only recover if it's been at least 30 minutes since last draining interaction
        if (timeSinceLastInteraction >= 0.5) {
          const recoveredLevel = SocialBatteryCalculator.calculateRecovery(
            state.socialBattery.currentLevel,
            hoursElapsed,
            state.socialBattery.recoveryRate
          );
          
          return {
            ...state,
            socialBattery: {
              ...state.socialBattery,
              currentLevel: recoveredLevel
            },
            lastUpdate: now
          };
        }
      }
      
      return state;
    }
    
    case 'LOAD_DATA': {
      return {
        ...state,
        interactions: action.payload.interactions,
        socialBattery: action.payload.batteryState,
        lastUpdate: new Date()
      };
    }
    
    case 'RESET_STATE': {
      return initialAppState;
    }
    
    default:
      return state;
  }
}

// Context
interface SocialBatteryContextType {
  state: AppState;
  dispatch: React.Dispatch<SocialBatteryAction>;
  addInteraction: (interaction: Omit<SocialInteraction, 'id' | 'timestamp'>) => void;
  updateSocialBattery: (level: number) => void;
  getDashboardMetrics: () => DashboardMetrics;
  getTodayInteractions: () => SocialInteraction[];
  getWeeklyInteractions: () => SocialInteraction[];
}

const SocialBatteryContext = createContext<SocialBatteryContextType | undefined>(undefined);

// Provider component
interface SocialBatteryProviderProps {
  children: ReactNode;
}

export function SocialBatteryProvider({ children }: SocialBatteryProviderProps) {
  const [state, dispatch] = useReducer(socialBatteryReducer, initialAppState);
  
  // Auto-recovery timer
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'TICK_RECOVERY' });
    }, 15 * 60 * 1000); // every 15 minutes
    
    return () => clearInterval(interval);
  }, []);
  
  // Persistence (localStorage)
  useEffect(() => {
    const savedData = localStorage.getItem('socialBatteryData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Convert date strings back to Date objects
        const interactions = parsed.interactions.map((i: any) => ({
          ...i,
          timestamp: new Date(i.timestamp)
        }));
        
        dispatch({ 
          type: 'LOAD_DATA', 
          payload: { 
            interactions, 
            batteryState: parsed.socialBattery 
          } 
        });
      } catch (error) {
        console.error('Failed to load saved data:', error);
      }
    }
  }, []);
  
  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('socialBatteryData', JSON.stringify({
      interactions: state.interactions,
      socialBattery: state.socialBattery
    }));
  }, [state.interactions, state.socialBattery]);
  
  // Helper functions
  const addInteraction = (interactionData: Omit<SocialInteraction, 'id' | 'timestamp'>) => {
    const interaction: SocialInteraction = {
      ...interactionData,
      id: `interaction_${Date.now()}_${Math.random()}`,
      timestamp: new Date()
    };
    
    dispatch({ type: 'ADD_INTERACTION', payload: interaction });
  };
  
  const updateSocialBattery = (level: number) => {
    dispatch({ type: 'UPDATE_ENERGY_LEVEL', payload: { level } });
  };
  
  const getDashboardMetrics = (): DashboardMetrics => {
    const today = DateUtils.getStartOfDay();
    const thisWeek = DateUtils.getStartOfWeek();
    
    const todayInteractions = state.interactions.filter(
      i => i.timestamp >= today
    );
    
    const weeklyInteractions = state.interactions.filter(
      i => i.timestamp >= thisWeek
    );
    
    const todayTime = todayInteractions.reduce((sum, i) => sum + i.duration, 0);
    const weeklyTime = weeklyInteractions.reduce((sum, i) => sum + i.duration, 0);
    
    // Calculate next recovery time
    const recoveryNeeded = 100 - state.socialBattery.currentLevel;
    const hoursToRecover = recoveryNeeded / state.socialBattery.recoveryRate;
    const nextRecoveryTime = new Date(Date.now() + hoursToRecover * 60 * 60 * 1000);
    
    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (state.socialBattery.currentLevel < 20) riskLevel = 'critical';
    else if (state.socialBattery.currentLevel < 40) riskLevel = 'high';
    else if (state.socialBattery.currentLevel < 60) riskLevel = 'medium';
    
    // Energy trend (simplified)
    const recentLevels = state.interactions.slice(-5).map(i => i.energyAfter);
    let energyTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (recentLevels.length >= 2) {
      const firstHalf = recentLevels.slice(0, Math.floor(recentLevels.length / 2));
      const secondHalf = recentLevels.slice(Math.floor(recentLevels.length / 2));
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      
      if (secondAvg > firstAvg + 5) energyTrend = 'increasing';
      else if (secondAvg < firstAvg - 5) energyTrend = 'decreasing';
    }
    
    return {
      currentSocialBattery: state.socialBattery.currentLevel,
      todayInteractionTime: todayTime,
      weeklyInteractionTime: weeklyTime,
      nextRecoveryTime,
      energyTrend,
      riskLevel
    };
  };
  
  const getTodayInteractions = () => {
    const today = DateUtils.getStartOfDay();
    return state.interactions.filter(i => i.timestamp >= today);
  };
  
  const getWeeklyInteractions = () => {
    const thisWeek = DateUtils.getStartOfWeek();
    return state.interactions.filter(i => i.timestamp >= thisWeek);
  };
  
  const value: SocialBatteryContextType = {
    state,
    dispatch,
    addInteraction,
    updateSocialBattery,
    getDashboardMetrics,
    getTodayInteractions,
    getWeeklyInteractions
  };
  
  return (
    <SocialBatteryContext.Provider value={value}>
      {children}
    </SocialBatteryContext.Provider>
  );
}

// Hook to use the context
export function useSocialBattery() {
  const context = useContext(SocialBatteryContext);
  if (context === undefined) {
    throw new Error('useSocialBattery must be used within a SocialBatteryProvider');
  }
  return context;
}