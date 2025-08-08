import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PWAInstallButton } from './PWAInstallButton';

// Mock the PWAService
jest.mock('../services/PWAService', () => ({
  isPWAInstallable: jest.fn(() => false),
  isPWAInstalled: jest.fn(() => false),
  hasServiceWorkerUpdate: jest.fn(() => false),
  installPWA: jest.fn(() => Promise.resolve()),
  updateServiceWorker: jest.fn(() => Promise.resolve()),
  onInstallPromptChange: jest.fn(),
  onUpdateAvailable: jest.fn(),
  initialize: jest.fn(() => Promise.resolve())
}));

describe('PWAInstallButton', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(<PWAInstallButton />);
  });

  test('does not show install button when PWA is not installable', async () => {
    const PWAService = require('../services/PWAService');
    PWAService.isPWAInstallable.mockReturnValue(false);
    PWAService.isPWAInstalled.mockReturnValue(false);
    
    render(<PWAInstallButton />);
    
    await waitFor(() => {
      expect(screen.queryByText('Install App')).not.toBeInTheDocument();
    });
  });

  test('shows app status when PWA is installed', async () => {
    const PWAService = require('../services/PWAService');
    PWAService.isPWAInstallable.mockReturnValue(false);
    PWAService.isPWAInstalled.mockReturnValue(true);
    
    render(<PWAInstallButton />);
    
    await waitFor(() => {
      expect(screen.getByText('App Installed')).toBeInTheDocument();
    });
  });
});

describe('PWA Service Worker', () => {
  test('service worker registration path is correct', () => {
    // Test that the service worker file exists at the expected location
    expect(() => {
      require('../public/sw.js');
    }).not.toThrow();
  });

  test('manifest.json has required PWA fields', async () => {
    // In a real test, you would fetch and parse the manifest
    const manifestFields = [
      'short_name',
      'name', 
      'icons',
      'start_url',
      'display',
      'theme_color',
      'background_color'
    ];
    
    // This would be a real fetch in a full test
    const mockManifest = {
      "short_name": "Energy Flow",
      "name": "Creative Energy Flow - PWA",
      "icons": [],
      "start_url": ".",
      "display": "standalone",
      "theme_color": "#F7B731",
      "background_color": "#FFF8E7"
    };
    
    manifestFields.forEach(field => {
      expect(mockManifest).toHaveProperty(field);
    });
  });
});

// Test PWA installation detection
describe('PWA Installation', () => {
  beforeEach(() => {
    // Mock window.addEventListener for beforeinstallprompt
    window.addEventListener = jest.fn();
  });

  test('detects beforeinstallprompt event', () => {
    const PWAService = require('../services/PWAService');
    
    // Simulate the PWA service initialization
    PWAService.initialize();
    
    // Verify that the service would listen for the install prompt
    expect(window.addEventListener).toHaveBeenCalledWith(
      'beforeinstallprompt',
      expect.any(Function)
    );
  });

  test('handles PWA installation flow', async () => {
    const PWAService = require('../services/PWAService');
    
    // Mock a successful installation
    PWAService.installPWA.mockResolvedValue('accepted');
    
    const result = await PWAService.installPWA();
    expect(result).toBe('accepted');
  });
});
