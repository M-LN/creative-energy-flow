// Dependency Resolver - Manages feature dependencies and loading order
import type { FeatureConfig } from '@/shared/types';
import { EventSystem, EVENTS } from './EventSystem';

export class DependencyResolver {
  private static instance: DependencyResolver;
  private eventSystem: EventSystem;
  private features: Map<string, FeatureConfig> = new Map();
  private loadedFeatures: Set<string> = new Set();
  private isLoading = false;

  private constructor() {
    this.eventSystem = EventSystem.getInstance();
    this.setupFeatureConfigs();
  }

  public static getInstance(): DependencyResolver {
    if (!DependencyResolver.instance) {
      DependencyResolver.instance = new DependencyResolver();
    }
    return DependencyResolver.instance;
  }

  private setupFeatureConfigs(): void {
    // Core features configuration with dependencies
    this.registerFeature({
      name: 'core-systems',
      enabled: true,
      dependencies: [],
      priority: 1,
    });

    this.registerFeature({
      name: 'data-storage',
      enabled: true,
      dependencies: ['core-systems'],
      priority: 2,
    });

    this.registerFeature({
      name: 'energy-tracking',
      enabled: true,
      dependencies: ['core-systems', 'data-storage'],
      priority: 3,
    });

    this.registerFeature({
      name: 'social-battery',
      enabled: true,
      dependencies: ['core-systems', 'data-storage'],
      priority: 3,
    });

    this.registerFeature({
      name: 'charts',
      enabled: true,
      dependencies: ['core-systems', 'energy-tracking', 'social-battery'],
      priority: 4,
    });

    this.registerFeature({
      name: 'ai-insights',
      enabled: true,
      dependencies: ['core-systems', 'data-storage', 'energy-tracking', 'social-battery'],
      priority: 5,
    });

    this.registerFeature({
      name: 'pwa',
      enabled: true,
      dependencies: ['core-systems', 'data-storage'],
      priority: 2,
    });

    this.registerFeature({
      name: 'ui-components',
      enabled: true,
      dependencies: ['core-systems'],
      priority: 2,
    });
  }

  public registerFeature(config: FeatureConfig): void {
    this.features.set(config.name, config);
  }

  public async initializeApplication(): Promise<void> {
    try {
      this.eventSystem.emit('app:initialization-start', {}, 'DependencyResolver');
      
      const loadOrder = this.resolveDependencyOrder();
      await this.loadFeaturesInOrder(loadOrder);
      
      this.eventSystem.emit('app:initialization-complete', {
        loadedFeatures: Array.from(this.loadedFeatures),
      }, 'DependencyResolver');
      
    } catch (error) {
      this.eventSystem.emit(EVENTS.ERROR_OCCURRED, {
        type: 'initialization-error',
        error: (error as Error).message,
      }, 'DependencyResolver');
      throw error;
    }
  }

  private resolveDependencyOrder(): string[] {
    const resolved: string[] = [];
    const visiting: Set<string> = new Set();
    const visited: Set<string> = new Set();

    const visit = (featureName: string): void => {
      if (visited.has(featureName)) return;
      if (visiting.has(featureName)) {
        throw new Error(`Circular dependency detected involving ${featureName}`);
      }

      const feature = this.features.get(featureName);
      if (!feature || !feature.enabled) return;

      visiting.add(featureName);

      // Visit dependencies first
      feature.dependencies.forEach(dep => {
        visit(dep);
      });

      visiting.delete(featureName);
      visited.add(featureName);
      resolved.push(featureName);
    };

    // Sort features by priority and visit each
    const sortedFeatures = Array.from(this.features.entries())
      .filter(([_, config]) => config.enabled)
      .sort(([_, a], [__, b]) => a.priority - b.priority);

    sortedFeatures.forEach(([name, _]) => {
      visit(name);
    });

    return resolved;
  }

  private async loadFeaturesInOrder(loadOrder: string[]): Promise<void> {
    this.isLoading = true;
    
    for (const featureName of loadOrder) {
      try {
        await this.loadFeature(featureName);
        this.loadedFeatures.add(featureName);
        
        this.eventSystem.emit('feature:loaded', {
          featureName,
          loadedCount: this.loadedFeatures.size,
          totalCount: loadOrder.length,
        }, 'DependencyResolver');
        
      } catch (error) {
        console.error(`Failed to load feature ${featureName}:`, error);
        
        this.eventSystem.emit(EVENTS.ERROR_OCCURRED, {
          type: 'feature-load-error',
          featureName,
          error: (error as Error).message,
        }, 'DependencyResolver');
        
        // Decide whether to continue or fail completely
        const feature = this.features.get(featureName);
        if (feature && feature.priority <= 2) {
          // Critical feature failed, stop loading
          throw new Error(`Critical feature ${featureName} failed to load`);
        }
        // Non-critical feature failed, continue with warning
      }
    }
    
    this.isLoading = false;
  }

  private async loadFeature(featureName: string): Promise<void> {
    // Check if dependencies are loaded
    const feature = this.features.get(featureName);
    if (!feature) {
      throw new Error(`Feature ${featureName} not found`);
    }

    for (const dep of feature.dependencies) {
      if (!this.loadedFeatures.has(dep)) {
        throw new Error(`Dependency ${dep} not loaded for feature ${featureName}`);
      }
    }

    // Simulate feature loading (in a real app, this would load actual modules)
    await this.simulateFeatureLoad(featureName);
    
    // Initialize the feature
    await this.initializeFeature(featureName);
  }

  private async simulateFeatureLoad(featureName: string): Promise<void> {
    // Simulate loading time based on feature complexity
    const loadTimes: Record<string, number> = {
      'core-systems': 100,
      'data-storage': 200,
      'energy-tracking': 150,
      'social-battery': 150,
      'charts': 300,
      'ai-insights': 500,
      'pwa': 250,
      'ui-components': 100,
    };

    const loadTime = loadTimes[featureName] || 100;
    
    return new Promise(resolve => {
      setTimeout(resolve, loadTime);
    });
  }

  private async initializeFeature(featureName: string): Promise<void> {
    switch (featureName) {
      case 'core-systems':
        await this.initializeCoreServices();
        break;
      case 'data-storage':
        await this.initializeDataStorage();
        break;
      case 'energy-tracking':
        await this.initializeEnergyTracking();
        break;
      case 'social-battery':
        await this.initializeSocialBattery();
        break;
      case 'charts':
        await this.initializeCharts();
        break;
      case 'ai-insights':
        await this.initializeAIInsights();
        break;
      case 'pwa':
        await this.initializePWA();
        break;
      case 'ui-components':
        await this.initializeUIComponents();
        break;
      default:
        console.warn(`Unknown feature: ${featureName}`);
    }
  }

  private async initializeCoreServices(): Promise<void> {
    // Core services are already initialized when this class is instantiated
    this.eventSystem.emit('feature:core-systems-ready', {}, 'DependencyResolver');
  }

  private async initializeDataStorage(): Promise<void> {
    this.eventSystem.emit('feature:data-storage-ready', {}, 'DependencyResolver');
  }

  private async initializeEnergyTracking(): Promise<void> {
    const { EnergyTrackingFeature } = await import('@/features/energy-tracking/EnergyTrackingFeature');
    const feature = EnergyTrackingFeature.getInstance();
    await feature.initialize();
    this.eventSystem.emit('feature:energy-tracking-ready', {}, 'DependencyResolver');
  }

  private async initializeSocialBattery(): Promise<void> {
    const { SocialBatteryFeature } = await import('@/features/social-battery/SocialBatteryFeature');
    const feature = SocialBatteryFeature.getInstance();
    await feature.initialize();
    this.eventSystem.emit('feature:social-battery-ready', {}, 'DependencyResolver');
  }

  private async initializeCharts(): Promise<void> {
    const { ChartsFeature } = await import('@/features/charts/ChartsFeature');
    const feature = ChartsFeature.getInstance();
    await feature.initialize();
    this.eventSystem.emit('feature:charts-ready', {}, 'DependencyResolver');
  }

  private async initializeAIInsights(): Promise<void> {
    const { AIInsightsFeature } = await import('@/features/ai-insights/AIInsightsFeature');
    const feature = AIInsightsFeature.getInstance();
    await feature.initialize();
    this.eventSystem.emit('feature:ai-insights-ready', {}, 'DependencyResolver');
  }

  private async initializePWA(): Promise<void> {
    const { PWAFeature } = await import('@/features/pwa/PWAFeature');
    const feature = PWAFeature.getInstance();
    await feature.initialize();
    this.eventSystem.emit('feature:pwa-ready', {}, 'DependencyResolver');
  }

  private async initializeUIComponents(): Promise<void> {
    this.eventSystem.emit('feature:ui-components-ready', {}, 'DependencyResolver');
  }

  public isFeatureLoaded(featureName: string): boolean {
    return this.loadedFeatures.has(featureName);
  }

  public getLoadedFeatures(): string[] {
    return Array.from(this.loadedFeatures);
  }

  public getFeatureDependencies(featureName: string): string[] {
    const feature = this.features.get(featureName);
    return feature ? feature.dependencies : [];
  }

  public validateDependencies(): boolean {
    try {
      this.resolveDependencyOrder();
      return true;
    } catch (error) {
      console.error('Dependency validation failed:', error);
      return false;
    }
  }

  public enableFeature(featureName: string): void {
    const feature = this.features.get(featureName);
    if (feature) {
      feature.enabled = true;
      this.eventSystem.emit('feature:enabled', { featureName }, 'DependencyResolver');
    }
  }

  public disableFeature(featureName: string): void {
    const feature = this.features.get(featureName);
    if (feature) {
      feature.enabled = false;
      this.loadedFeatures.delete(featureName);
      this.eventSystem.emit('feature:disabled', { featureName }, 'DependencyResolver');
    }
  }

  public getApplicationReadiness(): {
    isReady: boolean;
    loadedFeatures: number;
    totalFeatures: number;
    criticalFeaturesLoaded: boolean;
  } {
    const enabledFeatures = Array.from(this.features.values())
      .filter(f => f.enabled);
    
    const criticalFeatures = enabledFeatures
      .filter(f => f.priority <= 2)
      .map(f => f.name);
    
    const criticalFeaturesLoaded = criticalFeatures
      .every(name => this.loadedFeatures.has(name));

    return {
      isReady: criticalFeaturesLoaded && !this.isLoading,
      loadedFeatures: this.loadedFeatures.size,
      totalFeatures: enabledFeatures.length,
      criticalFeaturesLoaded,
    };
  }
}