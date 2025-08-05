// Main application entry point
import { FeatureIntegrator } from './core/FeatureIntegrator';
import { EventSystem, EVENTS } from './core/EventSystem';
import { IntegrationTesting } from './core/IntegrationTesting';
import { initializeUI } from './shared/components/AppComponent';
import './shared/styles/main.css';

class CreativeEnergyFlowApp {
  private featureIntegrator: FeatureIntegrator;
  private eventSystem: EventSystem;
  private integrationTesting: IntegrationTesting;

  constructor() {
    this.featureIntegrator = FeatureIntegrator.getInstance();
    this.eventSystem = EventSystem.getInstance();
    this.integrationTesting = IntegrationTesting.getInstance();
    
    this.setupApplicationListeners();
  }

  private setupApplicationListeners(): void {
    // Application ready event
    this.eventSystem.subscribe('integrator:app-ready', () => {
      this.onApplicationReady();
    });

    // Error handling
    this.eventSystem.subscribe(EVENTS.ERROR_OCCURRED, (payload) => {
      this.handleApplicationError(payload.data);
    });

    // PWA events
    this.eventSystem.subscribe(EVENTS.PWA_INSTALLED, () => {
      this.onPWAInstalled();
    });

    this.eventSystem.subscribe(EVENTS.PWA_UPDATE_AVAILABLE, () => {
      this.onPWAUpdateAvailable();
    });

    // Online/offline events
    window.addEventListener('online', () => {
      this.eventSystem.emit(EVENTS.PWA_ONLINE, {}, 'App');
    });

    window.addEventListener('offline', () => {
      this.eventSystem.emit(EVENTS.PWA_OFFLINE, {}, 'App');
    });
  }

  public async initialize(): Promise<void> {
    try {
      console.log('🚀 Initializing Creative Energy Flow PWA...');
      
      // Show loading screen
      this.showLoadingScreen();
      
      // Initialize the feature integrator
      await this.featureIntegrator.initialize();
      
      // Run integration tests in development
      if (import.meta.env.DEV) {
        console.log('🧪 Running integration tests...');
        const testsPassed = await this.integrationTesting.runContinuousIntegrationTests();
        if (!testsPassed) {
          console.warn('⚠️ Some integration tests failed, but continuing...');
        }
      }
      
      // Initialize UI
      this.initializeUserInterface();
      
      console.log('✅ Creative Energy Flow PWA initialized successfully!');
      
    } catch (error) {
      console.error('❌ Failed to initialize application:', error);
      this.showErrorScreen(error);
    }
  }

  private showLoadingScreen(): void {
    const loadingElement = document.querySelector('.loading-screen');
    if (loadingElement) {
      // Add loading animation and progress tracking
      this.eventSystem.subscribe('feature:loaded', (payload) => {
        const progress = (payload.data.loadedCount / payload.data.totalCount) * 100;
        this.updateLoadingProgress(progress, payload.data.featureName);
      });
    }
  }

  private updateLoadingProgress(progress: number, featureName: string): void {
    const loadingElement = document.querySelector('.loading-screen p');
    if (loadingElement) {
      loadingElement.textContent = `Loading ${featureName}... ${Math.round(progress)}%`;
    }
  }

  private initializeUserInterface(): void {
    const appElement = document.getElementById('app');
    if (appElement) {
      // Initialize the main UI component
      initializeUI(appElement);
    }
  }

  private onApplicationReady(): void {
    console.log('🎉 Application ready - all features integrated!');
    
    // Hide loading screen
    const loadingElement = document.querySelector('.loading-screen') as HTMLElement;
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
    
    // Show main application
    const appContent = document.querySelector('.app-content') as HTMLElement;
    if (appContent) {
      appContent.style.display = 'block';
    }
    
    // Send welcome event
    this.eventSystem.emit('app:welcome', {
      timestamp: new Date(),
      message: 'Welcome to Creative Energy Flow!',
    }, 'App');
  }

  private handleApplicationError(errorData: any): void {
    console.error('Application error:', errorData);
    
    // Show user-friendly error message
    this.showErrorNotification(errorData);
  }

  private showErrorNotification(errorData: any): void {
    // In a real app, this would show a user-friendly notification
    console.log('Error notification:', errorData.type || 'Unknown error occurred');
  }

  private showErrorScreen(error: any): void {
    const appElement = document.getElementById('app');
    if (appElement) {
      appElement.innerHTML = `
        <div class="error-screen">
          <h1>⚠️ Application Error</h1>
          <p>Sorry, Creative Energy Flow encountered an error during initialization.</p>
          <details>
            <summary>Error Details</summary>
            <pre>${error.message || error}</pre>
          </details>
          <button onclick="location.reload()">Reload Application</button>
        </div>
      `;
    }
  }

  private onPWAInstalled(): void {
    console.log('📱 PWA installed successfully!');
    this.showInstallSuccessMessage();
  }

  private onPWAUpdateAvailable(): void {
    console.log('🔄 PWA update available');
    this.showUpdateAvailableMessage();
  }

  private showInstallSuccessMessage(): void {
    // Show a subtle notification about successful installation
    console.log('✨ Creative Energy Flow is now installed on your device!');
  }

  private showUpdateAvailableMessage(): void {
    // Show update notification
    console.log('🆕 A new version of Creative Energy Flow is available. Refresh to update.');
  }

  public getApplicationStatus(): {
    isReady: boolean;
    features: string[];
    integrationHealth: string;
    uptime: number;
  } {
    const integrationStatus = this.featureIntegrator.getIntegrationStatus();
    const uptime = performance.now();
    
    return {
      isReady: integrationStatus.isInitialized,
      features: integrationStatus.loadedFeatures,
      integrationHealth: integrationStatus.integrationHealth,
      uptime: uptime,
    };
  }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  const app = new CreativeEnergyFlowApp();
  
  // Make app instance globally available for debugging
  (window as any).app = app;
  
  // Initialize the application
  await app.initialize();
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  
  const eventSystem = EventSystem.getInstance();
  eventSystem.emit(EVENTS.ERROR_OCCURRED, {
    type: 'unhandled-promise-rejection',
    error: event.reason?.message || 'Unknown promise rejection',
  }, 'App');
});

// Handle global errors
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  
  const eventSystem = EventSystem.getInstance();
  eventSystem.emit(EVENTS.ERROR_OCCURRED, {
    type: 'global-error',
    error: event.error?.message || 'Unknown global error',
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
  }, 'App');
});

export { CreativeEnergyFlowApp };