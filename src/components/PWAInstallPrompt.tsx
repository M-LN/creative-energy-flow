import React, { useState, useEffect } from 'react';
import './PWAInstallPrompt.css';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    console.log('PWA Install Prompt - Component mounted');
    
    // Check if app is already installed/running in standalone mode
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
                           (window.navigator as any).standalone === true ||
                           document.referrer.includes('android-app://');
    
    console.log('PWA Install Prompt - Is standalone:', isStandaloneMode);
    setIsStandalone(isStandaloneMode);

    // Check if device is desktop (not mobile/tablet)
    const checkIsDesktop = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const isTablet = /ipad|tablet/i.test(userAgent);
      const isDesktopSize = window.innerWidth >= 1024;
      console.log('PWA Install Prompt - User Agent:', userAgent);
      console.log('PWA Install Prompt - Is Mobile:', isMobile);
      console.log('PWA Install Prompt - Is Tablet:', isTablet);
      console.log('PWA Install Prompt - Window Width:', window.innerWidth);
      console.log('PWA Install Prompt - Is Desktop Size:', isDesktopSize);
      return !isMobile && !isTablet && isDesktopSize;
    };

    const isDesktopResult = checkIsDesktop();
    console.log('PWA Install Prompt - Is Desktop:', isDesktopResult);
    setIsDesktop(isDesktopResult);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('PWA Install Prompt - beforeinstallprompt event fired');
      e.preventDefault();
      const beforeInstallPromptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(beforeInstallPromptEvent);
      
      // Show install prompt only on desktop and if not already installed
      if (isDesktopResult && !isStandaloneMode) {
        console.log('PWA Install Prompt - Showing install prompt');
        setShowInstallPrompt(true);
      } else {
        console.log('PWA Install Prompt - Not showing prompt. Desktop:', isDesktopResult, 'Standalone:', isStandaloneMode);
      }
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA Install Prompt - App installed event fired');
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      console.log('PWA was installed successfully');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if install prompt was dismissed before
    const installDismissed = localStorage.getItem('energyFlow_installDismissed');
    if (installDismissed) {
      const dismissedTime = parseInt(installDismissed);
      const oneDayMs = 24 * 60 * 60 * 1000;
      const timeSinceDismissed = Date.now() - dismissedTime;
      console.log('PWA Install Prompt - Install dismissed', timeSinceDismissed, 'ms ago');
      if (timeSinceDismissed < oneDayMs) {
        console.log('PWA Install Prompt - Install dismissed recently, not showing');
        setShowInstallPrompt(false);
      }
    }

    // Add a small delay and then check if the prompt should show
    const timeoutId = setTimeout(() => {
      console.log('PWA Install Prompt - Final state check:');
      console.log('- isDesktop:', isDesktopResult);
      console.log('- isStandalone:', isStandaloneMode);
      console.log('- deferredPrompt will be set by event');
      
      // For testing purposes, show a test button if we're on desktop
      if (isDesktopResult && !isStandaloneMode) {
        console.log('PWA Install Prompt - Desktop detected, will show when beforeinstallprompt fires');
      }
    }, 1000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(timeoutId);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('Error during install:', error);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('energyFlow_installDismissed', Date.now().toString());
  };

  // Don't show if not desktop, already installed, no prompt available, or user dismissed
  if (!isDesktop || isStandalone) {
    return null;
  }

  // For testing - show a test version if we don't have the browser event yet
  if (!showInstallPrompt || !deferredPrompt) {
    // Show test version only on desktop
    if (isDesktop && !isStandalone) {
      return (
        <div className="pwa-install-prompt">
          <div className="install-prompt-content">
            <div className="install-prompt-icon">🚀</div>
            <div className="install-prompt-text">
              <h3>Install Energy Flow</h3>
              <p>
                {deferredPrompt 
                  ? 'Ready to install! Click to get the desktop app.' 
                  : 'Checking install availability... Make sure you\'re using Chrome/Edge and the site is served over HTTPS.'
                }
              </p>
            </div>
            <div className="install-prompt-actions">
              {deferredPrompt ? (
                <button 
                  className="install-btn"
                  onClick={handleInstallClick}
                >
                  Install App
                </button>
              ) : (
                <button 
                  className="install-btn install-btn-disabled"
                  disabled
                >
                  Checking...
                </button>
              )}
              <button 
                className="dismiss-btn"
                onClick={handleDismiss}
                aria-label="Dismiss install prompt"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="pwa-install-prompt">
      <div className="install-prompt-content">
        <div className="install-prompt-icon">🚀</div>
        <div className="install-prompt-text">
          <h3>Install Energy Flow</h3>
          <p>Get the full desktop app experience with faster loading and offline access!</p>
        </div>
        <div className="install-prompt-actions">
          <button 
            className="install-btn"
            onClick={handleInstallClick}
          >
            Install App
          </button>
          <button 
            className="dismiss-btn"
            onClick={handleDismiss}
            aria-label="Dismiss install prompt"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
