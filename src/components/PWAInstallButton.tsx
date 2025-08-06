import React, { useState, useEffect } from 'react';
import { PWAService } from '../services/PWAService';
import './PWAInstallButton.css';

interface PWAInstallButtonProps {
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ className = '' }) => {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    const pwaService = PWAService.getInstance();
    
    // Check initial state
    setIsInstalled(pwaService.isAppInstalled());
    setCanInstall(pwaService.canInstall());

    // Listen for PWA events
    const handleInstallAvailable = () => setCanInstall(true);
    const handleInstallCompleted = () => {
      setIsInstalled(true);
      setCanInstall(false);
    };
    const handleUpdateAvailable = () => setShowUpdate(true);

    window.addEventListener('pwa-install-available', handleInstallAvailable);
    window.addEventListener('pwa-install-completed', handleInstallCompleted);
    window.addEventListener('pwa-update-available', handleUpdateAvailable);

    return () => {
      window.removeEventListener('pwa-install-available', handleInstallAvailable);
      window.removeEventListener('pwa-install-completed', handleInstallCompleted);
      window.removeEventListener('pwa-update-available', handleUpdateAvailable);
    };
  }, []);

  const handleInstall = async () => {
    setIsInstalling(true);
    const pwaService = PWAService.getInstance();
    
    try {
      const installed = await pwaService.promptInstall();
      if (installed) {
        setIsInstalled(true);
        setCanInstall(false);
      }
    } catch (error) {
      console.error('Installation failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleUpdate = async () => {
    const pwaService = PWAService.getInstance();
    await pwaService.updateApp();
  };

  if (isInstalled && !showUpdate) {
    return null;
  }

  return (
    <div className={`pwa-install-container ${className}`}>
      {showUpdate ? (
        <button
          className="pwa-button pwa-update-button"
          onClick={handleUpdate}
          title="Update app to latest version"
        >
          🔄 Update Available
        </button>
      ) : canInstall ? (
        <button
          className="pwa-button pwa-install-button"
          onClick={handleInstall}
          disabled={isInstalling}
          title="Install Creative Energy Flow as an app"
        >
          {isInstalling ? (
            <>
              ⏳ Installing...
            </>
          ) : (
            <>
              📱 Install App
            </>
          )}
        </button>
      ) : null}
    </div>
  );
};
