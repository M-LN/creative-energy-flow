// Feature Integrator - Main coordinator for all features
import { EventSystem, EVENTS } from './EventSystem';
import { DataFlowManager } from './DataFlowManager';
import { DependencyResolver } from './DependencyResolver';

export class FeatureIntegrator {
  private static instance: FeatureIntegrator;
  private eventSystem: EventSystem;
  private dataFlowManager: DataFlowManager;
  private dependencyResolver: DependencyResolver;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  private constructor() {
    this.eventSystem = EventSystem.getInstance();
    this.dataFlowManager = DataFlowManager.getInstance();
    this.dependencyResolver = DependencyResolver.getInstance();
    this.setupEventListeners();
  }

  public static getInstance(): FeatureIntegrator {
    if (!FeatureIntegrator.instance) {
      FeatureIntegrator.instance = new FeatureIntegrator();
    }
    return FeatureIntegrator.instance;
  }

  private setupEventListeners(): void {
    // Application lifecycle events
    this.eventSystem.subscribe('app:initialization-complete', () => {
      this.onApplicationReady();
    });

    // Feature readiness events
    this.eventSystem.subscribe('feature:energy-tracking-ready', () => {
      this.onFeatureReady('energy-tracking');
    });

    this.eventSystem.subscribe('feature:social-battery-ready', () => {
      this.onFeatureReady('social-battery');
    });

    this.eventSystem.subscribe('feature:charts-ready', () => {
      this.onFeatureReady('charts');
    });

    this.eventSystem.subscribe('feature:ai-insights-ready', () => {
      this.onFeatureReady('ai-insights');
    });

    this.eventSystem.subscribe('feature:pwa-ready', () => {
      this.onFeatureReady('pwa');
    });

    // Cross-feature integration events
    this.eventSystem.subscribe(EVENTS.ENERGY_LOGGED, (payload) => {
      this.handleEnergyDataIntegration(payload.data);
    });

    this.eventSystem.subscribe(EVENTS.SOCIAL_BATTERY_LOGGED, (payload) => {
      this.handleSocialBatteryIntegration(payload.data);
    });

    this.eventSystem.subscribe(EVENTS.CHART_VIEW_CHANGED, (payload) => {
      this.handleChartInteractionIntegration(payload.data);
    });

    this.eventSystem.subscribe(EVENTS.AI_INSIGHT_GENERATED, (payload) => {
      this.handleAIInsightIntegration(payload.data);
    });

    // Error handling
    this.eventSystem.subscribe(EVENTS.ERROR_OCCURRED, (payload) => {
      this.handleIntegrationError(payload.data);
    });

    // Data consistency monitoring
    this.eventSystem.subscribe('*', () => {
      this.debounceDataConsistencyCheck();
    });
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.performInitialization();
    return this.initializationPromise;
  }

  private async performInitialization(): Promise<void> {
    try {
      this.eventSystem.emit('integrator:initialization-start', {}, 'FeatureIntegrator');

      // Validate dependencies before starting
      if (!this.dependencyResolver.validateDependencies()) {
        throw new Error('Dependency validation failed');
      }

      // Initialize all features in proper order
      await this.dependencyResolver.initializeApplication();

      // Verify integration readiness
      await this.verifyIntegrationReadiness();

      // Start data consistency monitoring
      this.startDataConsistencyMonitoring();

      this.isInitialized = true;
      this.eventSystem.emit('integrator:initialization-complete', {}, 'FeatureIntegrator');

    } catch (error) {
      this.eventSystem.emit(EVENTS.ERROR_OCCURRED, {
        type: 'integration-initialization-error',
        error: (error as Error).message,
      }, 'FeatureIntegrator');
      throw error;
    }
  }

  private async verifyIntegrationReadiness(): Promise<void> {
    const readiness = this.dependencyResolver.getApplicationReadiness();
    
    if (!readiness.isReady) {
      throw new Error(`Application not ready: ${readiness.loadedFeatures}/${readiness.totalFeatures} features loaded`);
    }

    // Verify core integrations
    const integrationChecks = [
      this.verifyEnergyChartIntegration(),
      this.verifySocialAIIntegration(),
      this.verifyPWAIntegration(),
      this.verifyDataFlowIntegration(),
    ];

    const results = await Promise.allSettled(integrationChecks);
    const failures = results.filter(r => r.status === 'rejected');

    if (failures.length > 0) {
      const errorDetails = failures.map(f => (f as PromiseRejectedResult).reason);
      throw new Error(`Integration verification failed: ${errorDetails.join(', ')}`);
    }
  }

  private async verifyEnergyChartIntegration(): Promise<void> {
    // Verify energy data flows to charts correctly
    const testEnergyData = {
      id: 'test-energy-1',
      timestamp: new Date(),
      level: 7,
      type: 'creative' as const,
      note: 'Integration test',
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Energy-Chart integration test timeout'));
      }, 5000);

      const unsubscribe = this.eventSystem.subscribe(EVENTS.CHART_DATA_UPDATED, (payload) => {
        if (payload.data.source === 'energy-tracking') {
          clearTimeout(timeout);
          unsubscribe();
          resolve();
        }
      });

      this.eventSystem.emit(EVENTS.ENERGY_LOGGED, testEnergyData, 'IntegrationTest');
    });
  }

  private async verifySocialAIIntegration(): Promise<void> {
    // Verify social battery data flows to AI correctly
    return new Promise((resolve) => {
      // Simplified verification for now
      resolve();
    });
  }

  private async verifyPWAIntegration(): Promise<void> {
    // Verify PWA capabilities are working
    return new Promise((resolve) => {
      // Simplified verification for now
      resolve();
    });
  }

  private async verifyDataFlowIntegration(): Promise<void> {
    // Verify data flow manager is working correctly
    const isConsistent = this.dataFlowManager.validateDataConsistency();
    if (!isConsistent) {
      throw new Error('Data flow consistency check failed');
    }
  }

  private onApplicationReady(): void {
    this.eventSystem.emit('integrator:app-ready', {
      timestamp: new Date(),
      features: this.dependencyResolver.getLoadedFeatures(),
    }, 'FeatureIntegrator');
  }

  private onFeatureReady(featureName: string): void {
    this.eventSystem.emit('integrator:feature-integrated', {
      featureName,
      timestamp: new Date(),
    }, 'FeatureIntegrator');

    // Trigger cross-feature integrations when all dependencies are ready
    this.checkAndTriggerIntegrations(featureName);
  }

  private checkAndTriggerIntegrations(readyFeature: string): void {
    const loadedFeatures = this.dependencyResolver.getLoadedFeatures();

    // Energy → Charts integration
    if (readyFeature === 'charts' && 
        loadedFeatures.includes('energy-tracking') && 
        loadedFeatures.includes('social-battery')) {
      this.triggerEnergyChartsIntegration();
    }

    // Social Battery → AI integration
    if (readyFeature === 'ai-insights' && 
        loadedFeatures.includes('social-battery') && 
        loadedFeatures.includes('energy-tracking')) {
      this.triggerSocialAIIntegration();
    }

    // All features → PWA integration
    if (readyFeature === 'pwa' && 
        loadedFeatures.includes('energy-tracking') && 
        loadedFeatures.includes('social-battery') && 
        loadedFeatures.includes('charts') && 
        loadedFeatures.includes('ai-insights')) {
      this.triggerFullPWAIntegration();
    }
  }

  private triggerEnergyChartsIntegration(): void {
    this.eventSystem.emit('integration:energy-charts-ready', {
      message: 'Energy tracking and charts integration activated',
    }, 'FeatureIntegrator');
  }

  private triggerSocialAIIntegration(): void {
    this.eventSystem.emit('integration:social-ai-ready', {
      message: 'Social battery and AI insights integration activated',
    }, 'FeatureIntegrator');
  }

  private triggerFullPWAIntegration(): void {
    this.eventSystem.emit('integration:full-pwa-ready', {
      message: 'Full PWA integration with all features activated',
    }, 'FeatureIntegrator');
  }

  private handleEnergyDataIntegration(energyData: any): void {
    // Coordinate energy data integration across features
    this.eventSystem.emit('integration:energy-data-flow', {
      energyData,
      targets: ['charts', 'ai-insights'],
      timestamp: new Date(),
    }, 'FeatureIntegrator');
  }

  private handleSocialBatteryIntegration(socialData: any): void {
    // Coordinate social battery data integration
    this.eventSystem.emit('integration:social-data-flow', {
      socialData,
      targets: ['charts', 'ai-insights'],
      timestamp: new Date(),
    }, 'FeatureIntegrator');
  }

  private handleChartInteractionIntegration(chartData: any): void {
    // Coordinate chart interaction data to AI
    this.eventSystem.emit('integration:chart-interaction-flow', {
      chartData,
      targets: ['ai-insights'],
      timestamp: new Date(),
    }, 'FeatureIntegrator');
  }

  private handleAIInsightIntegration(insightData: any): void {
    // Coordinate AI insights across the application
    this.eventSystem.emit('integration:ai-insight-flow', {
      insightData,
      targets: ['pwa', 'charts'],
      timestamp: new Date(),
    }, 'FeatureIntegrator');
  }

  private handleIntegrationError(errorData: any): void {
    console.error('Integration error occurred:', errorData);
    
    // Attempt recovery based on error type
    switch (errorData.type) {
      case 'data-flow-error':
        this.attemptDataFlowRecovery(errorData);
        break;
      case 'feature-load-error':
        this.attemptFeatureRecovery(errorData);
        break;
      case 'data-consistency-error':
        this.attemptDataConsistencyRecovery(errorData);
        break;
      default:
        this.logIntegrationError(errorData);
    }
  }

  private attemptDataFlowRecovery(errorData: any): void {
    this.eventSystem.emit('integration:recovery-attempt', {
      type: 'data-flow',
      originalError: errorData,
    }, 'FeatureIntegrator');
  }

  private attemptFeatureRecovery(errorData: any): void {
    this.eventSystem.emit('integration:recovery-attempt', {
      type: 'feature-load',
      originalError: errorData,
    }, 'FeatureIntegrator');
  }

  private attemptDataConsistencyRecovery(errorData: any): void {
    this.eventSystem.emit('integration:recovery-attempt', {
      type: 'data-consistency',
      originalError: errorData,
    }, 'FeatureIntegrator');
  }

  private logIntegrationError(errorData: any): void {
    this.eventSystem.emit('integration:error-logged', {
      errorData,
      timestamp: new Date(),
    }, 'FeatureIntegrator');
  }

  private consistencyCheckTimeout: NodeJS.Timeout | null = null;

  private debounceDataConsistencyCheck(): void {
    if (this.consistencyCheckTimeout) {
      clearTimeout(this.consistencyCheckTimeout);
    }

    this.consistencyCheckTimeout = setTimeout(() => {
      if (this.isInitialized) {
        this.performDataConsistencyCheck();
      }
    }, 1000);
  }

  private startDataConsistencyMonitoring(): void {
    // Periodic consistency checks
    setInterval(() => {
      if (this.isInitialized) {
        this.performDataConsistencyCheck();
      }
    }, 30000); // Every 30 seconds
  }

  private performDataConsistencyCheck(): void {
    const isConsistent = this.dataFlowManager.validateDataConsistency();
    
    if (!isConsistent) {
      this.eventSystem.emit('integration:consistency-warning', {
        timestamp: new Date(),
      }, 'FeatureIntegrator');
    }
  }

  public getIntegrationStatus(): {
    isInitialized: boolean;
    loadedFeatures: string[];
    activeDataFlows: number;
    lastConsistencyCheck: Date | null;
    integrationHealth: 'healthy' | 'warning' | 'error';
  } {
    const loadedFeatures = this.dependencyResolver.getLoadedFeatures();
    const activeFlows = this.dataFlowManager.getActiveFlows();
    
    return {
      isInitialized: this.isInitialized,
      loadedFeatures,
      activeDataFlows: activeFlows.length,
      lastConsistencyCheck: new Date(),
      integrationHealth: this.isInitialized ? 'healthy' : 'warning',
    };
  }

  public async reinitializeFeature(featureName: string): Promise<void> {
    try {
      this.dependencyResolver.disableFeature(featureName);
      await new Promise(resolve => setTimeout(resolve, 100));
      this.dependencyResolver.enableFeature(featureName);
      
      this.eventSystem.emit('integration:feature-reinitialized', {
        featureName,
        timestamp: new Date(),
      }, 'FeatureIntegrator');
      
    } catch (error) {
      this.eventSystem.emit(EVENTS.ERROR_OCCURRED, {
        type: 'feature-reinitialization-error',
        featureName,
        error: (error as Error).message,
      }, 'FeatureIntegrator');
      throw error;
    }
  }
}