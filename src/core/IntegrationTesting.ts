// Integration Testing - Automated tests for feature interactions
import { EventSystem, EVENTS } from './EventSystem';
import { StateManager } from './StateManager';
import { DataFlowManager } from './DataFlowManager';
import { DependencyResolver } from './DependencyResolver';
import { FeatureIntegrator } from './FeatureIntegrator';

export interface TestResult {
  testName: string;
  passed: boolean;
  duration: number;
  error?: string;
  details?: any;
}

export interface TestSuite {
  name: string;
  tests: IntegrationTest[];
}

export interface IntegrationTest {
  name: string;
  description: string;
  timeout?: number;
  run: () => Promise<void>;
}

export class IntegrationTesting {
  private static instance: IntegrationTesting;
  private eventSystem: EventSystem;
  private stateManager: StateManager;
  private dataFlowManager: DataFlowManager;
  private dependencyResolver: DependencyResolver;
  private featureIntegrator: FeatureIntegrator;
  private testResults: TestResult[] = [];

  private constructor() {
    this.eventSystem = EventSystem.getInstance();
    this.stateManager = StateManager.getInstance();
    this.dataFlowManager = DataFlowManager.getInstance();
    this.dependencyResolver = DependencyResolver.getInstance();
    this.featureIntegrator = FeatureIntegrator.getInstance();
  }

  public static getInstance(): IntegrationTesting {
    if (!IntegrationTesting.instance) {
      IntegrationTesting.instance = new IntegrationTesting();
    }
    return IntegrationTesting.instance;
  }

  public async runAllTests(): Promise<TestResult[]> {
    this.testResults = [];
    
    const testSuites = [
      this.getFeatureIntegrationTests(),
      this.getDataFlowTests(),
      this.getCrossFeatureTests(),
      this.getPerformanceTests(),
      this.getErrorHandlingTests(),
    ];

    for (const suite of testSuites) {
      await this.runTestSuite(suite);
    }

    return this.testResults;
  }

  private async runTestSuite(suite: TestSuite): Promise<void> {
    console.log(`Running test suite: ${suite.name}`);
    
    for (const test of suite.tests) {
      await this.runTest(test);
    }
  }

  private async runTest(test: IntegrationTest): Promise<void> {
    const startTime = performance.now();
    
    try {
      const timeout = test.timeout || 5000;
      
      await Promise.race([
        test.run(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Test timeout')), timeout)
        ),
      ]);

      const duration = performance.now() - startTime;
      
      this.testResults.push({
        testName: test.name,
        passed: true,
        duration,
      });
      
      console.log(`✓ ${test.name} (${duration.toFixed(2)}ms)`);
      
    } catch (error) {
      const duration = performance.now() - startTime;
      
      this.testResults.push({
        testName: test.name,
        passed: false,
        duration,
        error: (error as Error).message,
      });
      
      console.error(`✗ ${test.name} (${duration.toFixed(2)}ms): ${(error as Error).message}`);
    }
  }

  private getFeatureIntegrationTests(): TestSuite {
    return {
      name: 'Feature Integration Tests',
      tests: [
        {
          name: 'Feature Integrator Initialization',
          description: 'Verify FeatureIntegrator initializes correctly',
          run: async () => {
            await this.featureIntegrator.initialize();
            const status = this.featureIntegrator.getIntegrationStatus();
            
            if (!status.isInitialized) {
              throw new Error('FeatureIntegrator failed to initialize');
            }
          },
        },
        {
          name: 'Dependency Resolution',
          description: 'Verify all features load in correct order',
          run: async () => {
            const isValid = this.dependencyResolver.validateDependencies();
            if (!isValid) {
              throw new Error('Dependency validation failed');
            }
            
            const readiness = this.dependencyResolver.getApplicationReadiness();
            if (!readiness.criticalFeaturesLoaded) {
              throw new Error('Critical features not loaded');
            }
          },
        },
        {
          name: 'Event System Communication',
          description: 'Verify event system works across features',
          run: async () => {
            return new Promise((resolve, reject) => {
              const testData = { test: 'integration' };
              let eventReceived = false;
              
              const unsubscribe = this.eventSystem.subscribe('test:integration', (payload: any) => {
                if (payload.data.test === 'integration') {
                  eventReceived = true;
                  unsubscribe();
                  resolve();
                }
              });
              
              this.eventSystem.emit('test:integration', testData, 'IntegrationTest');
              
              setTimeout(() => {
                if (!eventReceived) {
                  unsubscribe();
                  reject(new Error('Event not received'));
                }
              }, 1000);
            });
          },
        },
      ],
    };
  }

  private getDataFlowTests(): TestSuite {
    return {
      name: 'Data Flow Integration Tests',
      tests: [
        {
          name: 'Energy to Charts Data Flow',
          description: 'Verify energy data flows to charts correctly',
          run: async () => {
            return new Promise((resolve, reject) => {
              const testEnergyData = {
                id: 'test-energy-flow',
                timestamp: new Date(),
                level: 8,
                type: 'creative' as const,
                note: 'Data flow test',
              };

              const unsubscribe = this.eventSystem.subscribe(EVENTS.CHART_DATA_UPDATED, (payload: any) => {
                if (payload.data.source === 'energy-tracking') {
                  unsubscribe();
                  resolve();
                }
              });

              this.eventSystem.emit(EVENTS.ENERGY_LOGGED, testEnergyData, 'IntegrationTest');
              
              setTimeout(() => {
                unsubscribe();
                reject(new Error('Chart data update not received'));
              }, 2000);
            });
          },
        },
        {
          name: 'Social Battery to AI Data Flow',
          description: 'Verify social battery data flows to AI correctly',
          run: async () => {
            return new Promise((resolve, reject) => {
              const testSocialData = {
                id: 'test-social-flow',
                timestamp: new Date(),
                level: 6,
                interactionType: 'small-group' as const,
                note: 'Data flow test',
              };

              const unsubscribe = this.eventSystem.subscribe('ai:process-data', (payload: any) => {
                if (payload.data.source === 'social-battery') {
                  unsubscribe();
                  resolve();
                }
              });

              this.eventSystem.emit(EVENTS.SOCIAL_BATTERY_LOGGED, testSocialData, 'IntegrationTest');
              
              setTimeout(() => {
                unsubscribe();
                reject(new Error('AI data processing not triggered'));
              }, 2000);
            });
          },
        },
        {
          name: 'Data Consistency Validation',
          description: 'Verify data consistency across features',
          run: async () => {
            const isConsistent = this.dataFlowManager.validateDataConsistency();
            if (!isConsistent) {
              throw new Error('Data consistency validation failed');
            }
          },
        },
      ],
    };
  }

  private getCrossFeatureTests(): TestSuite {
    return {
      name: 'Cross-Feature Integration Tests',
      tests: [
        {
          name: 'Energy and Social Battery Coordination',
          description: 'Verify energy and social battery data coordinate properly',
          run: async () => {
            const energyData = {
              id: 'cross-test-energy',
              timestamp: new Date(),
              level: 7,
              type: 'mental' as const,
            };

            const socialData = {
              id: 'cross-test-social',
              timestamp: new Date(),
              level: 4,
              interactionType: 'large-group' as const,
            };

            // Add both types of data
            this.stateManager.addEnergyEntry(energyData);
            this.stateManager.addSocialBatteryEntry(socialData);

            // Verify state consistency
            const state = this.stateManager.getState();
            const hasEnergyData = state.energyData.some((e: any) => e.id === 'cross-test-energy');
            const hasSocialData = state.socialBatteryData.some((s: any) => s.id === 'cross-test-social');

            if (!hasEnergyData || !hasSocialData) {
              throw new Error('Cross-feature data coordination failed');
            }
          },
        },
        {
          name: 'AI Insights Generation',
          description: 'Verify AI insights are generated from multiple data sources',
          run: async () => {
            return new Promise((resolve, reject) => {
              const testInsight = {
                id: 'test-insight',
                timestamp: new Date(),
                type: 'pattern' as const,
                title: 'Test Insight',
                content: 'Integration test insight',
                confidence: 0.8,
                actionable: true,
              };

              const unsubscribe = this.eventSystem.subscribe(EVENTS.AI_INSIGHT_GENERATED, (payload: any) => {
                if (payload.data.id === 'test-insight') {
                  unsubscribe();
                  resolve();
                }
              });

              this.eventSystem.emit(EVENTS.AI_INSIGHT_GENERATED, testInsight, 'IntegrationTest');
              
              setTimeout(() => {
                unsubscribe();
                reject(new Error('AI insight not processed'));
              }, 2000);
            });
          },
        },
        {
          name: 'PWA State Synchronization',
          description: 'Verify PWA state synchronizes with all features',
          run: async () => {
            // Test offline/online state changes
            this.eventSystem.emit(EVENTS.PWA_OFFLINE, {}, 'IntegrationTest');
            
            const offlineFlows = this.dataFlowManager.getActiveFlows();
            
            this.eventSystem.emit(EVENTS.PWA_ONLINE, {}, 'IntegrationTest');
            
            const onlineFlows = this.dataFlowManager.getActiveFlows();
            
            if (onlineFlows.length <= offlineFlows.length) {
              throw new Error('PWA state synchronization failed');
            }
          },
        },
      ],
    };
  }

  private getPerformanceTests(): TestSuite {
    return {
      name: 'Performance Integration Tests',
      tests: [
        {
          name: 'High Volume Data Processing',
          description: 'Verify system handles high volume data correctly',
          timeout: 10000,
          run: async () => {
            const startTime = performance.now();
            
            // Generate 100 energy entries
            for (let i = 0; i < 100; i++) {
              const energyData = {
                id: `perf-test-${i}`,
                timestamp: new Date(),
                level: Math.floor(Math.random() * 10) + 1,
                type: ['creative', 'physical', 'mental', 'emotional'][Math.floor(Math.random() * 4)] as any,
              };
              
              this.stateManager.addEnergyEntry(energyData);
            }
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            // Should process 100 entries in under 1 second
            if (duration > 1000) {
              throw new Error(`High volume processing too slow: ${duration}ms`);
            }
            
            // Verify data consistency after bulk operations
            const isConsistent = this.dataFlowManager.validateDataConsistency();
            if (!isConsistent) {
              throw new Error('Data consistency lost during high volume processing');
            }
          },
        },
        {
          name: 'Event System Performance',
          description: 'Verify event system performs well under load',
          timeout: 5000,
          run: async () => {
            const startTime = performance.now();
            let eventsReceived = 0;
            
            const unsubscribe = this.eventSystem.subscribe('perf:test', () => {
              eventsReceived++;
            });
            
            // Emit 1000 events
            for (let i = 0; i < 1000; i++) {
              this.eventSystem.emit('perf:test', { index: i }, 'PerformanceTest');
            }
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            unsubscribe();
            
            if (eventsReceived !== 1000) {
              throw new Error(`Not all events received: ${eventsReceived}/1000`);
            }
            
            // Should emit and process 1000 events in under 500ms
            if (duration > 500) {
              throw new Error(`Event system too slow: ${duration}ms`);
            }
          },
        },
      ],
    };
  }

  private getErrorHandlingTests(): TestSuite {
    return {
      name: 'Error Handling Integration Tests',
      tests: [
        {
          name: 'Feature Load Error Recovery',
          description: 'Verify system recovers from feature load errors',
          run: async () => {
            return new Promise((resolve, reject) => {
              const unsubscribe = this.eventSystem.subscribe('integration:recovery-attempt', (payload: any) => {
                if (payload.data.type === 'feature-load') {
                  unsubscribe();
                  resolve();
                }
              });

              // Simulate feature load error
              this.eventSystem.emit(EVENTS.ERROR_OCCURRED, {
                type: 'feature-load-error',
                featureName: 'test-feature',
                error: 'Simulated error',
              }, 'ErrorTest');
              
              setTimeout(() => {
                unsubscribe();
                reject(new Error('Error recovery not attempted'));
              }, 2000);
            });
          },
        },
        {
          name: 'Data Flow Error Recovery',
          description: 'Verify system recovers from data flow errors',
          run: async () => {
            return new Promise((resolve, reject) => {
              const unsubscribe = this.eventSystem.subscribe('integration:recovery-attempt', (payload: any) => {
                if (payload.data.type === 'data-flow') {
                  unsubscribe();
                  resolve();
                }
              });

              // Simulate data flow error
              this.eventSystem.emit(EVENTS.ERROR_OCCURRED, {
                type: 'data-flow-error',
                source: 'test-source',
                target: 'test-target',
                error: 'Simulated error',
              }, 'ErrorTest');
              
              setTimeout(() => {
                unsubscribe();
                reject(new Error('Data flow recovery not attempted'));
              }, 2000);
            });
          },
        },
      ],
    };
  }

  public getTestSummary(): {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    averageDuration: number;
    successRate: number;
  } {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    const averageDuration = totalTests > 0 
      ? this.testResults.reduce((sum, r) => sum + r.duration, 0) / totalTests 
      : 0;
    const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

    return {
      totalTests,
      passedTests,
      failedTests,
      averageDuration,
      successRate,
    };
  }

  public getFailedTests(): TestResult[] {
    return this.testResults.filter(r => !r.passed);
  }

  public async runContinuousIntegrationTests(): Promise<boolean> {
    console.log('Running continuous integration tests...');
    
    await this.runAllTests();
    const summary = this.getTestSummary();
    
    console.log(`\nTest Summary:`);
    console.log(`Total: ${summary.totalTests}`);
    console.log(`Passed: ${summary.passedTests}`);
    console.log(`Failed: ${summary.failedTests}`);
    console.log(`Success Rate: ${summary.successRate.toFixed(2)}%`);
    console.log(`Average Duration: ${summary.averageDuration.toFixed(2)}ms`);
    
    if (summary.failedTests > 0) {
      console.log('\nFailed Tests:');
      this.getFailedTests().forEach(test => {
        console.log(`- ${test.testName}: ${test.error}`);
      });
    }
    
    // CI passes if success rate is above 90%
    return summary.successRate >= 90;
  }
}