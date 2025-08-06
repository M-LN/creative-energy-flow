// PWA Service for handling service worker registration and PWA features
export class PWAService {
  private static instance: PWAService;
  private deferredPrompt: any = null;
  private isInstalled = false;

  private constructor() {
    this.init();
  }

  public static getInstance(): PWAService {
    if (!PWAService.instance) {
      PWAService.instance = new PWAService();
    }
    return PWAService.instance;
  }

  private init() {
    this.registerServiceWorker();
    this.handleInstallPrompt();
    this.checkIfInstalled();
  }

  private async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully:', registration.scope);
        
        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available
                this.showUpdateAvailable();
              }
            });
          }
        });
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  private handleInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      this.deferredPrompt = e;
      // Show install button
      this.showInstallButton();
    });

    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      this.isInstalled = true;
      this.hideInstallButton();
    });
  }

  private checkIfInstalled() {
    // Check if app is running in standalone mode (installed)
    if (window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true) {
      this.isInstalled = true;
    }
  }

  public async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    // Show the install prompt
    this.deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await this.deferredPrompt.userChoice;
    
    // Clear the deferredPrompt
    this.deferredPrompt = null;
    
    return outcome === 'accepted';
  }

  public isAppInstalled(): boolean {
    return this.isInstalled;
  }

  public canInstall(): boolean {
    return this.deferredPrompt !== null;
  }

  private showInstallButton() {
    // Dispatch custom event to show install button in UI
    window.dispatchEvent(new CustomEvent('pwa-install-available'));
  }

  private hideInstallButton() {
    // Dispatch custom event to hide install button in UI
    window.dispatchEvent(new CustomEvent('pwa-install-completed'));
  }

  private showUpdateAvailable() {
    // Dispatch custom event for app update available
    window.dispatchEvent(new CustomEvent('pwa-update-available'));
  }

  public async updateApp() {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration?.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    }
  }

  // Check if app is online/offline
  public isOnline(): boolean {
    return navigator.onLine;
  }

  // Handle offline data storage
  public async storeOfflineData(key: string, data: any): Promise<void> {
    try {
      const offlineData = JSON.parse(localStorage.getItem('offline_data') || '{}');
      offlineData[key] = {
        data,
        timestamp: new Date().toISOString(),
        synced: false
      };
      localStorage.setItem('offline_data', JSON.stringify(offlineData));
      
      // Request background sync if available
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        const registration = await navigator.serviceWorker.ready;
        if ('sync' in registration) {
          (registration as any).sync.register('energy-data-sync');
        }
      }
    } catch (error) {
      console.error('Failed to store offline data:', error);
    }
  }

  public getOfflineData(): any {
    try {
      return JSON.parse(localStorage.getItem('offline_data') || '{}');
    } catch {
      return {};
    }
  }
}
