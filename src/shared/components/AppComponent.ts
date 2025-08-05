// Main App Component - Unified UI initialization
import { EventSystem, EVENTS } from '@/core/EventSystem';
import { StateManager } from '@/core/StateManager';
import type { AppState } from '@/shared/types';

export function initializeUI(appElement: HTMLElement): void {
  const eventSystem = EventSystem.getInstance();
  const stateManager = StateManager.getInstance();
  
  // Create main app structure
  const appHTML = `
    <div class="app-content">
      <header class="app-header">
        <div class="container">
          <div class="flex items-center justify-between">
            <div class="app-logo">
              <h1 class="text-2xl font-bold text-primary">Creative Energy Flow</h1>
              <p class="text-sm text-secondary">Track • Analyze • Optimize</p>
            </div>
            <nav class="app-nav">
              <button class="btn btn-outline" data-view="dashboard">Dashboard</button>
              <button class="btn btn-outline" data-view="energy">Energy</button>
              <button class="btn btn-outline" data-view="social">Social</button>
              <button class="btn btn-outline" data-view="charts">Charts</button>
              <button class="btn btn-outline" data-view="insights">AI Insights</button>
            </nav>
            <div class="app-status">
              <div class="pwa-status" title="PWA Status">
                <span class="status-indicator online">●</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main class="app-main">
        <div class="container">
          <div id="view-container" class="view-container">
            <!-- Dynamic content will be loaded here -->
          </div>
        </div>
      </main>
      
      <footer class="app-footer">
        <div class="container">
          <div class="flex items-center justify-between">
            <p class="text-sm text-secondary">
              © 2024 Creative Energy Flow - Track your energy, optimize your flow
            </p>
            <div class="integration-status">
              <span class="text-xs text-secondary" id="integration-status">
                All systems operational
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  `;
  
  appElement.innerHTML = appHTML;
  
  // Initialize event listeners
  setupUIEventListeners(eventSystem, stateManager);
  
  // Load initial view
  loadView('dashboard');
  
  // Subscribe to state changes
  stateManager.subscribe((state: AppState) => {
    updateUIFromState(state);
  });
  
  // Subscribe to integration events
  eventSystem.subscribe('integrator:app-ready', () => {
    updateIntegrationStatus('All features integrated');
  });
  
  eventSystem.subscribe(EVENTS.PWA_ONLINE, () => {
    updatePWAStatus(true);
  });
  
  eventSystem.subscribe(EVENTS.PWA_OFFLINE, () => {
    updatePWAStatus(false);
  });
  
  eventSystem.subscribe(EVENTS.ERROR_OCCURRED, (payload) => {
    showErrorNotification(payload.data);
  });
}

function setupUIEventListeners(eventSystem: EventSystem, _stateManager: StateManager): void {
  // Navigation event listeners
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    
    // Handle navigation buttons
    if (target.hasAttribute('data-view')) {
      event.preventDefault();
      const view = target.getAttribute('data-view')!;
      navigateToView(view, eventSystem);
    }
    
    // Handle energy logging (when energy tracking is implemented)
    if (target.hasAttribute('data-action')) {
      const action = target.getAttribute('data-action')!;
      handleUIAction(action, eventSystem, target);
    }
  });
  
  // Handle form submissions
  document.addEventListener('submit', (event) => {
    const form = event.target as HTMLFormElement;
    if (form.hasAttribute('data-feature')) {
      event.preventDefault();
      const feature = form.getAttribute('data-feature')!;
      handleFormSubmission(form, feature, eventSystem);
    }
  });
  
  // Handle keyboard shortcuts
  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case '1':
          event.preventDefault();
          navigateToView('dashboard', eventSystem);
          break;
        case '2':
          event.preventDefault();
          navigateToView('energy', eventSystem);
          break;
        case '3':
          event.preventDefault();
          navigateToView('social', eventSystem);
          break;
        case '4':
          event.preventDefault();
          navigateToView('charts', eventSystem);
          break;
        case '5':
          event.preventDefault();
          navigateToView('insights', eventSystem);
          break;
      }
    }
  });
}

function navigateToView(view: string, eventSystem: EventSystem): void {
  // Update active navigation state
  const navButtons = document.querySelectorAll('[data-view]');
  navButtons.forEach(button => {
    button.classList.remove('btn-primary');
    button.classList.add('btn-outline');
  });
  
  const activeButton = document.querySelector(`[data-view="${view}"]`);
  if (activeButton) {
    activeButton.classList.remove('btn-outline');
    activeButton.classList.add('btn-primary');
  }
  
  // Load the view content
  loadView(view);
  
  // Emit navigation event
  eventSystem.emit(EVENTS.NAVIGATION_CHANGED, { view }, 'UI');
}

function loadView(view: string): void {
  const viewContainer = document.getElementById('view-container');
  if (!viewContainer) return;
  
  let content = '';
  
  switch (view) {
    case 'dashboard':
      content = getDashboardContent();
      break;
    case 'energy':
      content = getEnergyTrackingContent();
      break;
    case 'social':
      content = getSocialBatteryContent();
      break;
    case 'charts':
      content = getChartsContent();
      break;
    case 'insights':
      content = getAIInsightsContent();
      break;
    default:
      content = getDashboardContent();
  }
  
  viewContainer.innerHTML = content;
  viewContainer.className = `view-container fade-in`;
}

function getDashboardContent(): string {
  return `
    <div class="dashboard-view">
      <div class="welcome-section mb-lg">
        <h2 class="text-3xl font-bold mb-md">Welcome to Creative Energy Flow</h2>
        <p class="text-lg text-secondary mb-lg">
          Track your creative energy and social battery with AI-powered insights for optimal productivity.
        </p>
        <div class="quick-actions grid grid-cols-2 gap-md">
          <button class="btn btn-primary" data-action="quick-energy-log">
            ⚡ Quick Energy Log
          </button>
          <button class="btn btn-secondary" data-action="quick-social-log">
            🔋 Log Social Battery
          </button>
        </div>
      </div>
      
      <div class="dashboard-cards grid grid-cols-3 gap-md">
        <div class="card">
          <h3 class="text-xl font-semibold mb-sm">Energy Overview</h3>
          <div class="energy-summary">
            <div class="energy-level text-3xl font-bold text-primary">7.5</div>
            <div class="text-sm text-secondary">Average today</div>
          </div>
        </div>
        
        <div class="card">
          <h3 class="text-xl font-semibold mb-sm">Social Battery</h3>
          <div class="social-summary">
            <div class="social-level text-3xl font-bold text-secondary">6.2</div>
            <div class="text-sm text-secondary">Current level</div>
          </div>
        </div>
        
        <div class="card">
          <h3 class="text-xl font-semibold mb-sm">AI Insights</h3>
          <div class="insights-summary">
            <div class="insight-count text-3xl font-bold text-warning">3</div>
            <div class="text-sm text-secondary">New recommendations</div>
          </div>
        </div>
      </div>
      
      <div class="recent-activity mt-lg">
        <h3 class="text-xl font-semibold mb-md">Recent Activity</h3>
        <div class="activity-list">
          <div class="activity-item card mb-sm">
            <div class="flex items-center justify-between">
              <div>
                <span class="font-medium">Creative energy logged</span>
                <span class="text-sm text-secondary ml-sm">Level 8 - Working on design</span>
              </div>
              <span class="text-xs text-secondary">2 hours ago</span>
            </div>
          </div>
          <div class="activity-item card mb-sm">
            <div class="flex items-center justify-between">
              <div>
                <span class="font-medium">Social battery updated</span>
                <span class="text-sm text-secondary ml-sm">Level 5 - Team meeting</span>
              </div>
              <span class="text-xs text-secondary">4 hours ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function getEnergyTrackingContent(): string {
  return `
    <div class="energy-view">
      <h2 class="text-3xl font-bold mb-lg">Energy Tracking</h2>
      
      <div class="energy-logging card mb-lg">
        <h3 class="text-xl font-semibold mb-md">Log Your Energy</h3>
        <form data-feature="energy-tracking" class="energy-form">
          <div class="form-grid grid grid-cols-2 gap-md">
            <div class="form-group">
              <label class="block text-sm font-medium mb-sm">Energy Type</label>
              <select name="type" class="form-select">
                <option value="creative">Creative</option>
                <option value="physical">Physical</option>
                <option value="mental">Mental</option>
                <option value="emotional">Emotional</option>
              </select>
            </div>
            <div class="form-group">
              <label class="block text-sm font-medium mb-sm">Energy Level (1-10)</label>
              <input type="range" name="level" min="1" max="10" value="5" class="form-range">
              <div class="text-center text-sm text-secondary mt-xs">Level: <span id="level-display">5</span></div>
            </div>
          </div>
          <div class="form-group mt-md">
            <label class="block text-sm font-medium mb-sm">Activities (optional)</label>
            <input type="text" name="activities" placeholder="e.g., writing, coding, designing" class="form-input">
          </div>
          <div class="form-group mt-md">
            <label class="block text-sm font-medium mb-sm">Notes (optional)</label>
            <textarea name="note" placeholder="How are you feeling? What's affecting your energy?" class="form-textarea"></textarea>
          </div>
          <button type="submit" class="btn btn-primary mt-md">Log Energy</button>
        </form>
      </div>
      
      <div class="recent-energy-logs">
        <h3 class="text-xl font-semibold mb-md">Recent Logs</h3>
        <div class="energy-logs-list">
          <!-- Energy logs will be populated here -->
          <div class="text-center text-secondary p-lg">
            Start logging your energy to see your patterns here!
          </div>
        </div>
      </div>
    </div>
  `;
}

function getSocialBatteryContent(): string {
  return `
    <div class="social-view">
      <h2 class="text-3xl font-bold mb-lg">Social Battery</h2>
      
      <div class="social-logging card mb-lg">
        <h3 class="text-xl font-semibold mb-md">Log Social Interaction</h3>
        <form data-feature="social-battery" class="social-form">
          <div class="form-grid grid grid-cols-2 gap-md">
            <div class="form-group">
              <label class="block text-sm font-medium mb-sm">Interaction Type</label>
              <select name="interactionType" class="form-select">
                <option value="solo">Solo time</option>
                <option value="small-group">Small group (2-5 people)</option>
                <option value="large-group">Large group (6+ people)</option>
                <option value="public">Public/presentation</option>
              </select>
            </div>
            <div class="form-group">
              <label class="block text-sm font-medium mb-sm">Battery Level (1-10)</label>
              <input type="range" name="level" min="1" max="10" value="5" class="form-range">
              <div class="text-center text-sm text-secondary mt-xs">Level: <span id="social-level-display">5</span></div>
            </div>
          </div>
          <div class="form-group mt-md">
            <label class="block text-sm font-medium mb-sm">What drained your energy?</label>
            <input type="text" name="drainFactors" placeholder="e.g., difficult conversation, large crowd" class="form-input">
          </div>
          <div class="form-group mt-md">
            <label class="block text-sm font-medium mb-sm">What recharged your energy?</label>
            <input type="text" name="rechargeFactors" placeholder="e.g., meaningful conversation, alone time" class="form-input">
          </div>
          <div class="form-group mt-md">
            <label class="block text-sm font-medium mb-sm">Notes (optional)</label>
            <textarea name="note" placeholder="How did social interactions affect you today?" class="form-textarea"></textarea>
          </div>
          <button type="submit" class="btn btn-secondary mt-md">Log Social Battery</button>
        </form>
      </div>
    </div>
  `;
}

function getChartsContent(): string {
  return `
    <div class="charts-view">
      <h2 class="text-3xl font-bold mb-lg">Analytics & Charts</h2>
      
      <div class="chart-controls mb-lg">
        <div class="flex gap-md">
          <select id="chart-type" class="form-select">
            <option value="energy-trends">Energy Trends</option>
            <option value="social-patterns">Social Patterns</option>
            <option value="combined-view">Combined View</option>
          </select>
          <select id="time-range" class="form-select">
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
          </select>
        </div>
      </div>
      
      <div class="charts-container">
        <div class="chart-placeholder card">
          <div class="text-center p-lg">
            <h3 class="text-xl font-semibold mb-md">📊 Charts Coming Soon</h3>
            <p class="text-secondary">Start logging your energy and social battery data to see beautiful visualizations here!</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function getAIInsightsContent(): string {
  return `
    <div class="insights-view">
      <h2 class="text-3xl font-bold mb-lg">AI Insights</h2>
      
      <div class="insights-summary mb-lg">
        <div class="grid grid-cols-3 gap-md">
          <div class="card text-center">
            <div class="text-2xl font-bold text-primary">🎯</div>
            <h3 class="font-semibold mt-sm">Patterns</h3>
            <p class="text-sm text-secondary">AI-detected patterns</p>
          </div>
          <div class="card text-center">
            <div class="text-2xl font-bold text-warning">💡</div>
            <h3 class="font-semibold mt-sm">Recommendations</h3>
            <p class="text-sm text-secondary">Personalized suggestions</p>
          </div>
          <div class="card text-center">
            <div class="text-2xl font-bold text-success">🔮</div>
            <h3 class="font-semibold mt-sm">Predictions</h3>
            <p class="text-sm text-secondary">Future insights</p>
          </div>
        </div>
      </div>
      
      <div class="insights-list">
        <h3 class="text-xl font-semibold mb-md">Recent Insights</h3>
        <div class="insight-placeholder card">
          <div class="text-center p-lg">
            <h4 class="text-lg font-semibold mb-md">🤖 AI Learning in Progress</h4>
            <p class="text-secondary">The AI is analyzing your energy patterns. Keep logging data to receive personalized insights!</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function handleUIAction(action: string, eventSystem: EventSystem, _target: HTMLElement): void {
  switch (action) {
    case 'quick-energy-log':
      navigateToView('energy', eventSystem);
      break;
    case 'quick-social-log':
      navigateToView('social', eventSystem);
      break;
    default:
      console.log('Unknown UI action:', action);
  }
}

function handleFormSubmission(form: HTMLFormElement, feature: string, eventSystem: EventSystem): void {
  const formData = new FormData(form);
  const data: any = {};
  
  for (const [key, value] of formData.entries()) {
    data[key] = value;
  }
  
  switch (feature) {
    case 'energy-tracking':
      handleEnergyFormSubmission(data, eventSystem);
      break;
    case 'social-battery':
      handleSocialFormSubmission(data, eventSystem);
      break;
    default:
      console.log('Unknown feature form:', feature);
  }
}

function handleEnergyFormSubmission(data: any, eventSystem: EventSystem): void {
  const energyEntry = {
    id: `energy-${Date.now()}`,
    timestamp: new Date(),
    level: parseInt(data.level),
    type: data.type,
    note: data.note || undefined,
    activities: data.activities ? data.activities.split(',').map((a: string) => a.trim()) : undefined,
  };
  
  eventSystem.emit(EVENTS.ENERGY_LOGGED, energyEntry, 'UI');
  
  // Show success feedback
  showSuccessNotification('Energy logged successfully!');
  
  // Clear form
  const form = document.querySelector('[data-feature="energy-tracking"]') as HTMLFormElement;
  if (form) form.reset();
}

function handleSocialFormSubmission(data: any, eventSystem: EventSystem): void {
  const socialEntry = {
    id: `social-${Date.now()}`,
    timestamp: new Date(),
    level: parseInt(data.level),
    interactionType: data.interactionType,
    drainFactors: data.drainFactors ? data.drainFactors.split(',').map((f: string) => f.trim()) : undefined,
    rechargeFactors: data.rechargeFactors ? data.rechargeFactors.split(',').map((f: string) => f.trim()) : undefined,
    note: data.note || undefined,
  };
  
  eventSystem.emit(EVENTS.SOCIAL_BATTERY_LOGGED, socialEntry, 'UI');
  
  // Show success feedback
  showSuccessNotification('Social battery logged successfully!');
  
  // Clear form
  const form = document.querySelector('[data-feature="social-battery"]') as HTMLFormElement;
  if (form) form.reset();
}

function updateUIFromState(state: AppState): void {
  // Update navigation active state
  const activeView = state.currentView;
  const navButtons = document.querySelectorAll('[data-view]');
  navButtons.forEach(button => {
    const view = button.getAttribute('data-view');
    if (view === activeView) {
      button.classList.remove('btn-outline');
      button.classList.add('btn-primary');
    } else {
      button.classList.remove('btn-primary');
      button.classList.add('btn-outline');
    }
  });
  
  // Update PWA status
  updatePWAStatus(state.pwaState.isOnline);
}

function updatePWAStatus(isOnline: boolean): void {
  const statusIndicator = document.querySelector('.status-indicator');
  if (statusIndicator) {
    statusIndicator.className = `status-indicator ${isOnline ? 'online' : 'offline'}`;
    statusIndicator.setAttribute('title', isOnline ? 'Online' : 'Offline');
  }
}

function updateIntegrationStatus(message: string): void {
  const statusElement = document.getElementById('integration-status');
  if (statusElement) {
    statusElement.textContent = message;
  }
}

function showSuccessNotification(message: string): void {
  // Simple notification implementation
  console.log('✅', message);
  // In a real app, this would show a toast notification
}

function showErrorNotification(errorData: any): void {
  // Simple error notification implementation
  console.error('❌', errorData.type || 'Error occurred');
  // In a real app, this would show an error toast
}