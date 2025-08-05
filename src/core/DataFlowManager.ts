// Data Flow Manager - Coordinates data flow between all features
import type { DataFlowConfig } from '@/shared/types';
import { EventSystem, EVENTS } from './EventSystem';
import { StateManager } from './StateManager';

export class DataFlowManager {
  private static instance: DataFlowManager;
  private eventSystem: EventSystem;
  private stateManager: StateManager;
  private dataFlows: Map<string, DataFlowConfig> = new Map();
  private transformers: Map<string, (data: any) => any> = new Map();

  private constructor() {
    this.eventSystem = EventSystem.getInstance();
    this.stateManager = StateManager.getInstance();
    this.setupDataFlows();
    this.setupEventListeners();
  }

  public static getInstance(): DataFlowManager {
    if (!DataFlowManager.instance) {
      DataFlowManager.instance = new DataFlowManager();
    }
    return DataFlowManager.instance;
  }

  private setupDataFlows(): void {
    // Energy → Charts Integration
    this.registerDataFlow({
      source: 'energy-tracking',
      target: 'charts',
      enabled: true,
    });

    // Social Battery → AI Integration
    this.registerDataFlow({
      source: 'social-battery',
      target: 'ai-insights',
      enabled: true,
    });

    // Energy → AI Integration
    this.registerDataFlow({
      source: 'energy-tracking',
      target: 'ai-insights',
      enabled: true,
    });

    // AI → PWA Integration
    this.registerDataFlow({
      source: 'ai-insights',
      target: 'pwa',
      enabled: true,
    });

    // Charts → AI Integration
    this.registerDataFlow({
      source: 'charts',
      target: 'ai-insights',
      enabled: true,
    });

    // PWA → All Features Integration
    this.registerDataFlow({
      source: 'pwa',
      target: 'all-features',
      enabled: true,
    });

    // Setup data transformers
    this.setupTransformers();
  }

  private setupTransformers(): void {
    // Energy data to chart format transformer
    this.transformers.set('energy-to-chart', (energyData) => {
      const chartData = {
        labels: energyData.map((entry: any) => 
          new Date(entry.timestamp).toLocaleDateString()
        ),
        datasets: [
          {
            label: 'Creative Energy',
            data: energyData.filter((e: any) => e.type === 'creative').map((e: any) => e.level),
            backgroundColor: 'rgba(255, 107, 107, 0.2)',
            borderColor: 'rgba(255, 107, 107, 1)',
            borderWidth: 2,
          },
          {
            label: 'Physical Energy',
            data: energyData.filter((e: any) => e.type === 'physical').map((e: any) => e.level),
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2,
          },
        ],
      };
      return chartData;
    });

    // Social battery to AI input transformer
    this.transformers.set('social-to-ai', (socialData) => {
      return {
        type: 'social-pattern',
        data: socialData.map((entry: any) => ({
          level: entry.level,
          interactionType: entry.interactionType,
          timestamp: entry.timestamp,
          drainFactors: entry.drainFactors || [],
          rechargeFactors: entry.rechargeFactors || [],
        })),
        timestamp: new Date(),
      };
    });

    // Energy data to AI input transformer
    this.transformers.set('energy-to-ai', (energyData) => {
      return {
        type: 'energy-pattern',
        data: energyData.map((entry: any) => ({
          level: entry.level,
          type: entry.type,
          timestamp: entry.timestamp,
          activities: entry.activities || [],
          mood: entry.mood,
        })),
        timestamp: new Date(),
      };
    });

    // Chart interactions to AI input transformer
    this.transformers.set('chart-to-ai', (chartInteraction) => {
      return {
        type: 'chart-interaction',
        data: {
          viewType: chartInteraction.viewType,
          timeRange: chartInteraction.timeRange,
          focusedDataPoints: chartInteraction.focusedDataPoints,
          timestamp: new Date(),
        },
      };
    });
  }

  private setupEventListeners(): void {
    // Energy tracking events
    this.eventSystem.subscribe(EVENTS.ENERGY_LOGGED, (payload) => {
      this.processDataFlow('energy-tracking', payload.data);
    });

    this.eventSystem.subscribe(EVENTS.ENERGY_UPDATED, (payload) => {
      this.processDataFlow('energy-tracking', payload.data);
    });

    // Social battery events
    this.eventSystem.subscribe(EVENTS.SOCIAL_BATTERY_LOGGED, (payload) => {
      this.processDataFlow('social-battery', payload.data);
    });

    // Chart interaction events
    this.eventSystem.subscribe(EVENTS.CHART_VIEW_CHANGED, (payload) => {
      this.processDataFlow('charts', payload.data);
    });

    // PWA state changes
    this.eventSystem.subscribe(EVENTS.PWA_OFFLINE, () => {
      this.handleOfflineMode();
    });

    this.eventSystem.subscribe(EVENTS.PWA_ONLINE, () => {
      this.handleOnlineMode();
    });
  }

  public registerDataFlow(config: DataFlowConfig): void {
    const flowId = `${config.source}-to-${config.target}`;
    this.dataFlows.set(flowId, config);
  }

  public processDataFlow(source: string, data: any): void {
    // Find all flows from this source
    const relevantFlows = Array.from(this.dataFlows.values())
      .filter(flow => flow.source === source && flow.enabled);

    relevantFlows.forEach(flow => {
      try {
        let processedData = data;

        // Apply transformation if specified
        if (flow.transform) {
          processedData = flow.transform(processedData);
        } else {
          // Use registered transformer
          const transformerKey = `${flow.source}-to-${flow.target.split('-')[0]}`;
          const transformer = this.transformers.get(transformerKey);
          if (transformer) {
            processedData = transformer(this.getContextualData(source));
          }
        }

        // Route to appropriate target
        this.routeDataToTarget(flow.target, processedData, source);

      } catch (error) {
        console.error(`Error processing data flow from ${source} to ${flow.target}:`, error);
        this.eventSystem.emit(EVENTS.ERROR_OCCURRED, {
          type: 'data-flow-error',
          source,
          target: flow.target,
          error: (error as Error).message,
        }, 'DataFlowManager');
      }
    });
  }

  private getContextualData(source: string): any {
    const state = this.stateManager.getState();
    
    switch (source) {
      case 'energy-tracking':
        return state.energyData;
      case 'social-battery':
        return state.socialBatteryData;
      case 'charts':
        return {
          energyData: state.energyData,
          socialData: state.socialBatteryData,
        };
      default:
        return {};
    }
  }

  private routeDataToTarget(target: string, data: any, source: string): void {
    switch (target) {
      case 'charts':
        this.eventSystem.emit(EVENTS.CHART_DATA_UPDATED, {
          source,
          data,
          timestamp: new Date(),
        }, 'DataFlowManager');
        break;

      case 'ai-insights':
        this.eventSystem.emit('ai:process-data', {
          source,
          data,
          timestamp: new Date(),
        }, 'DataFlowManager');
        break;

      case 'pwa':
        this.eventSystem.emit('pwa:data-update', {
          source,
          data,
          timestamp: new Date(),
        }, 'DataFlowManager');
        break;

      case 'all-features':
        this.broadcastToAllFeatures(data, source);
        break;

      default:
        console.warn(`Unknown data flow target: ${target}`);
    }
  }

  private broadcastToAllFeatures(data: any, source: string): void {
    const features = ['energy-tracking', 'social-battery', 'charts', 'ai-insights'];
    
    features.forEach(feature => {
      if (feature !== source) {
        this.eventSystem.emit(`${feature}:external-update`, {
          source,
          data,
          timestamp: new Date(),
        }, 'DataFlowManager');
      }
    });
  }

  private handleOfflineMode(): void {
    // Disable flows that require network connectivity
    const networkDependentFlows = ['ai-insights', 'pwa'];
    
    networkDependentFlows.forEach(target => {
      const flows = Array.from(this.dataFlows.values())
        .filter(flow => flow.target === target);
      
      flows.forEach(flow => {
        flow.enabled = false;
      });
    });

    this.eventSystem.emit('data-flow:offline-mode', {
      disabledFlows: networkDependentFlows,
    }, 'DataFlowManager');
  }

  private handleOnlineMode(): void {
    // Re-enable all flows
    this.dataFlows.forEach(flow => {
      flow.enabled = true;
    });

    // Trigger data sync
    this.eventSystem.emit(EVENTS.DATA_SYNC_START, {
      reason: 'online-mode-restored',
    }, 'DataFlowManager');
  }

  public getActiveFlows(): DataFlowConfig[] {
    return Array.from(this.dataFlows.values()).filter(flow => flow.enabled);
  }

  public enableFlow(source: string, target: string): void {
    const flowId = `${source}-to-${target}`;
    const flow = this.dataFlows.get(flowId);
    if (flow) {
      flow.enabled = true;
    }
  }

  public disableFlow(source: string, target: string): void {
    const flowId = `${source}-to-${target}`;
    const flow = this.dataFlows.get(flowId);
    if (flow) {
      flow.enabled = false;
    }
  }

  public validateDataConsistency(): boolean {
    const state = this.stateManager.getState();
    
    // Check for data consistency across features
    const energyCount = state.energyData.length;
    const socialCount = state.socialBatteryData.length;
    const insightCount = state.aiInsights.length;

    // Basic validation - should have some correlation between data volumes
    const isConsistent = energyCount >= 0 && socialCount >= 0 && 
                        (energyCount + socialCount === 0 || insightCount >= 0);

    if (!isConsistent) {
      this.eventSystem.emit(EVENTS.ERROR_OCCURRED, {
        type: 'data-consistency-error',
        details: { energyCount, socialCount, insightCount },
      }, 'DataFlowManager');
    }

    return isConsistent;
  }
}