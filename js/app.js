// Main Application - Creative Energy Flow PWA
import AIConstraintEngine from './ai/aiConstraintEngine.js';
import EnergyOptimizer from './ai/energyOptimizer.js';
import SocialBatteryAI from './ai/socialBatteryAI.js';
import TaskPriorityAI from './ai/taskPriorityAI.js';
import ScheduleOptimizer from './ai/scheduleOptimizer.js';
import EnergyForecastAI from './ai/energyForecastAI.js';

class CreativeEnergyFlowApp {
  constructor() {
    this.aiEngine = null;
    this.energyOptimizer = null;
    this.socialBatteryAI = null;
    this.taskPriorityAI = null;
    this.scheduleOptimizer = null;
    this.energyForecastAI = null;
    this.isInitialized = false;
    this.ui = {
      energyLevel: null,
      socialBattery: null,
      aiRecommendations: null,
      insightsContainer: null,
      scheduleContainer: null,
      aiStatus: null
    };
    this.init();
  }

  async init() {
    try {
      this.initializeUI();
      await this.initializeAI();
      this.setupEventListeners();
      this.startApp();
      console.log('Creative Energy Flow App initialized successfully');
    } catch (error) {
      console.error('Failed to initialize app:', error);
      this.showError('Failed to initialize AI systems. Using fallback mode.');
    }
  }

  initializeUI() {
    // Get UI elements
    this.ui.energyLevel = document.getElementById('energyLevel');
    this.ui.socialBattery = document.getElementById('socialBattery');
    this.ui.aiRecommendations = document.getElementById('aiRecommendations');
    this.ui.insightsContainer = document.getElementById('insightsContainer');
    this.ui.scheduleContainer = document.getElementById('scheduleContainer');
    this.ui.aiStatus = document.getElementById('aiStatus');

    // Initialize UI state
    this.updateEnergyDisplay(75);
    this.updateSocialDisplay(60);
    this.updateAIStatus('Initializing...');
  }

  async initializeAI() {
    try {
      // Initialize core AI constraint engine
      this.aiEngine = new AIConstraintEngine();
      await this.waitForInitialization(this.aiEngine);

      // Initialize specialized AI components
      this.energyOptimizer = new EnergyOptimizer(this.aiEngine);
      this.socialBatteryAI = new SocialBatteryAI(this.aiEngine);
      this.taskPriorityAI = new TaskPriorityAI(this.aiEngine);
      this.scheduleOptimizer = new ScheduleOptimizer(this.aiEngine);
      this.energyForecastAI = new EnergyForecastAI(this.aiEngine);

      // Wait for all components to initialize
      await Promise.all([
        this.waitForInitialization(this.energyOptimizer),
        this.waitForInitialization(this.socialBatteryAI),
        this.waitForInitialization(this.taskPriorityAI),
        this.waitForInitialization(this.scheduleOptimizer),
        this.waitForInitialization(this.energyForecastAI)
      ]);

      this.isInitialized = true;
      this.updateAIStatus('AI Ready');
    } catch (error) {
      console.error('AI initialization failed:', error);
      this.updateAIStatus('AI Error');
      throw error;
    }
  }

  waitForInitialization(component) {
    return new Promise((resolve) => {
      // Simple promise to simulate initialization time
      setTimeout(resolve, 100);
    });
  }

  setupEventListeners() {
    // Energy tracker events
    if (this.aiEngine?.energyTracker) {
      this.aiEngine.energyTracker.addEventListener('energyChanged', (data) => {
        this.updateEnergyDisplay(data.level);
        this.refreshRecommendations();
      });
    }

    // Social battery events
    if (this.aiEngine?.socialBattery) {
      this.aiEngine.socialBattery.addEventListener('socialLevelChanged', (data) => {
        this.updateSocialDisplay(data.level);
        this.refreshRecommendations();
      });
    }

    // AI engine events
    if (this.aiEngine) {
      this.aiEngine.addEventListener('analysisComplete', (data) => {
        this.updateRecommendations(data.recommendations);
        this.updateInsights(data.insights);
      });
    }

    // Energy optimizer events
    if (this.energyOptimizer) {
      this.energyOptimizer.addEventListener('optimizationComplete', (data) => {
        this.updateScheduleDisplay(data.optimizedSchedule);
      });
    }

    // Schedule optimizer events
    if (this.scheduleOptimizer) {
      this.scheduleOptimizer.addEventListener('scheduleOptimized', (data) => {
        this.updateScheduleDisplay(data.optimizedEvents);
      });
    }

    // Energy forecast events
    if (this.energyForecastAI) {
      this.energyForecastAI.addEventListener('forecastGenerated', (data) => {
        this.updateForecastDisplay(data);
      });
    }

    // UI event listeners
    this.setupUIEventListeners();
  }

  setupUIEventListeners() {
    // Energy level click handler
    if (this.ui.energyLevel) {
      this.ui.energyLevel.addEventListener('click', () => {
        this.showEnergyInput();
      });
    }

    // Social battery click handler
    if (this.ui.socialBattery) {
      this.ui.socialBattery.addEventListener('click', () => {
        this.showSocialInput();
      });
    }

    // Quick action buttons
    this.addQuickActionButtons();

    // Settings and configuration
    this.addSettingsButton();
  }

  addQuickActionButtons() {
    const header = document.querySelector('.app-header');
    if (!header) return;

    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'quick-actions';
    actionsContainer.innerHTML = `
      <button id="energyCheckin" class="quick-btn">⚡ Check-in</button>
      <button id="socialUpdate" class="quick-btn">👥 Social</button>
      <button id="optimizeSchedule" class="quick-btn">📅 Optimize</button>
      <button id="viewForecast" class="quick-btn">🔮 Forecast</button>
    `;

    header.appendChild(actionsContainer);

    // Add event listeners
    document.getElementById('energyCheckin')?.addEventListener('click', () => this.showEnergyCheckin());
    document.getElementById('socialUpdate')?.addEventListener('click', () => this.showSocialUpdate());
    document.getElementById('optimizeSchedule')?.addEventListener('click', () => this.optimizeSchedule());
    document.getElementById('viewForecast')?.addEventListener('click', () => this.showForecast());
  }

  addSettingsButton() {
    const header = document.querySelector('.app-header');
    if (!header) return;

    const settingsBtn = document.createElement('button');
    settingsBtn.className = 'settings-btn';
    settingsBtn.innerHTML = '⚙️';
    settingsBtn.addEventListener('click', () => this.showSettings());
    
    header.appendChild(settingsBtn);
  }

  startApp() {
    if (!this.isInitialized) {
      console.warn('App starting without full AI initialization');
    }

    // Initial data refresh
    this.refreshAllData();

    // Start periodic updates
    this.startPeriodicUpdates();

    // Show welcome message
    this.showWelcomeMessage();
  }

  async refreshAllData() {
    try {
      // Refresh current levels
      if (this.aiEngine?.energyTracker) {
        const currentEnergy = this.aiEngine.energyTracker.getCurrentEnergy();
        this.updateEnergyDisplay(currentEnergy);
      }

      if (this.aiEngine?.socialBattery) {
        const currentSocial = this.aiEngine.socialBattery.getCurrentLevel();
        this.updateSocialDisplay(currentSocial);
      }

      // Refresh recommendations and insights
      await this.refreshRecommendations();
      await this.refreshInsights();
      await this.refreshSchedule();
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  }

  async refreshRecommendations() {
    if (!this.aiEngine) return;

    try {
      const recommendations = this.aiEngine.getCurrentRecommendations();
      this.updateRecommendations(recommendations);
    } catch (error) {
      console.error('Failed to refresh recommendations:', error);
    }
  }

  async refreshInsights() {
    if (!this.aiEngine) return;

    try {
      const insights = this.aiEngine.getCurrentInsights();
      this.updateInsights(insights);
    } catch (error) {
      console.error('Failed to refresh insights:', error);
    }
  }

  async refreshSchedule() {
    if (!this.scheduleOptimizer) return;

    try {
      const optimizedSchedule = await this.scheduleOptimizer.getOptimizedSchedule();
      this.updateScheduleDisplay(optimizedSchedule.optimizedEvents);
    } catch (error) {
      console.error('Failed to refresh schedule:', error);
    }
  }

  startPeriodicUpdates() {
    // Update recommendations every 5 minutes
    setInterval(() => {
      this.refreshRecommendations();
    }, 5 * 60 * 1000);

    // Update insights every 15 minutes
    setInterval(() => {
      this.refreshInsights();
    }, 15 * 60 * 1000);

    // Update schedule every 30 minutes
    setInterval(() => {
      this.refreshSchedule();
    }, 30 * 60 * 1000);
  }

  // UI Update Methods
  updateEnergyDisplay(level) {
    if (this.ui.energyLevel) {
      this.ui.energyLevel.style.width = `${level}%`;
      
      // Update color based on level
      let color = '#ef4444'; // Red for low
      if (level >= 70) color = '#10b981'; // Green for high
      else if (level >= 40) color = '#f59e0b'; // Yellow for medium
      
      this.ui.energyLevel.style.background = `linear-gradient(90deg, ${color} 0%, ${color}88 100%)`;
    }
  }

  updateSocialDisplay(level) {
    if (this.ui.socialBattery) {
      this.ui.socialBattery.style.width = `${level}%`;
      
      // Update color based on level
      let color = '#ef4444'; // Red for low
      if (level >= 70) color = '#06b6d4'; // Cyan for high
      else if (level >= 40) color = '#4f46e5'; // Blue for medium
      
      this.ui.socialBattery.style.background = `linear-gradient(90deg, ${color} 0%, ${color}88 100%)`;
    }
  }

  updateRecommendations(recommendations) {
    if (!this.ui.aiRecommendations) return;

    if (!recommendations || recommendations.length === 0) {
      this.ui.aiRecommendations.innerHTML = '<p class="no-recommendations">No recommendations at this time</p>';
      return;
    }

    const recommendationsHTML = recommendations.map(rec => `
      <div class="recommendation-item">
        <div class="recommendation-title">${rec.title}</div>
        <div class="recommendation-description">${rec.description || rec.message}</div>
        <div class="recommendation-action">${rec.action}</div>
        <div class="recommendation-priority priority-${rec.priority}">${rec.priority}</div>
      </div>
    `).join('');

    this.ui.aiRecommendations.innerHTML = recommendationsHTML;
  }

  updateInsights(insights) {
    if (!this.ui.insightsContainer) return;

    if (!insights || insights.length === 0) {
      this.ui.insightsContainer.innerHTML = '<p class="no-insights">No insights available</p>';
      return;
    }

    const insightsHTML = insights.map(insight => `
      <div class="insight-card">
        <div class="insight-title">${insight.title}</div>
        <div class="insight-value">${insight.value}</div>
        <div class="insight-trend">${insight.description}</div>
      </div>
    `).join('');

    this.ui.insightsContainer.innerHTML = insightsHTML;
  }

  updateScheduleDisplay(scheduleItems) {
    if (!this.ui.scheduleContainer) return;

    if (!scheduleItems || scheduleItems.length === 0) {
      this.ui.scheduleContainer.innerHTML = '<p class="no-schedule">No optimized schedule available</p>';
      return;
    }

    const scheduleHTML = scheduleItems.slice(0, 5).map(item => {
      const time = item.scheduledTime ? new Date(item.scheduledTime).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      }) : 'TBD';
      
      const task = item.task || item;
      const energyCost = this.getEnergyCostClass(task.energyRequirement || 50);

      return `
        <div class="schedule-item">
          <div class="schedule-time">${time}</div>
          <div class="schedule-task">
            <div class="schedule-task-title">${task.title || task.type || 'Untitled'}</div>
            <div class="schedule-task-type">${task.type || 'General'}</div>
          </div>
          <div class="schedule-energy-cost ${energyCost}">
            ${Math.round(task.energyRequirement || 50)}%
          </div>
        </div>
      `;
    }).join('');

    this.ui.scheduleContainer.innerHTML = scheduleHTML;
  }

  updateForecastDisplay(forecast) {
    // This would update a forecast widget if present
    console.log('Energy forecast updated:', forecast);
  }

  updateAIStatus(status) {
    if (this.ui.aiStatus) {
      this.ui.aiStatus.textContent = status;
      
      // Update status color
      this.ui.aiStatus.className = 'ai-status';
      if (status.includes('Ready')) {
        this.ui.aiStatus.classList.add('status-ready');
      } else if (status.includes('Error')) {
        this.ui.aiStatus.classList.add('status-error');
      } else {
        this.ui.aiStatus.classList.add('status-loading');
      }
    }
  }

  getEnergyCostClass(energyRequirement) {
    if (energyRequirement >= 70) return 'energy-high';
    if (energyRequirement >= 40) return 'energy-medium';
    return 'energy-low';
  }

  // User Interaction Methods
  showEnergyInput() {
    const currentLevel = this.aiEngine?.energyTracker?.getCurrentEnergy() || 50;
    const newLevel = prompt(`Current energy level: ${currentLevel}%\nEnter new energy level (0-100):`, currentLevel);
    
    if (newLevel !== null && !isNaN(newLevel)) {
      const level = Math.max(0, Math.min(100, parseInt(newLevel)));
      this.aiEngine?.energyTracker?.setEnergyLevel(level, 'manual');
    }
  }

  showSocialInput() {
    const currentLevel = this.aiEngine?.socialBattery?.getCurrentLevel() || 50;
    const newLevel = prompt(`Current social battery: ${currentLevel}%\nEnter new social level (0-100):`, currentLevel);
    
    if (newLevel !== null && !isNaN(newLevel)) {
      const level = Math.max(0, Math.min(100, parseInt(newLevel)));
      this.aiEngine?.socialBattery?.setSocialLevel(level, 'manual');
    }
  }

  showEnergyCheckin() {
    const modal = this.createModal('Energy Check-in', `
      <div class="checkin-form">
        <label for="energySlider">Energy Level:</label>
        <input type="range" id="energySlider" min="0" max="100" value="${this.aiEngine?.energyTracker?.getCurrentEnergy() || 50}">
        <span id="energyValue">${this.aiEngine?.energyTracker?.getCurrentEnergy() || 50}%</span>
        
        <label for="moodSelect">Mood:</label>
        <select id="moodSelect">
          <option value="positive">Positive</option>
          <option value="neutral">Neutral</option>
          <option value="negative">Negative</option>
        </select>
        
        <label for="stressSlider">Stress Level:</label>
        <input type="range" id="stressSlider" min="1" max="10" value="5">
        <span id="stressValue">5</span>
        
        <label for="activityText">Recent Activity:</label>
        <input type="text" id="activityText" placeholder="What have you been doing?">
        
        <div class="modal-actions">
          <button onclick="app.submitEnergyCheckin()">Submit</button>
          <button onclick="app.closeModal()">Cancel</button>
        </div>
      </div>
    `);

    // Add slider listeners
    const energySlider = modal.querySelector('#energySlider');
    const energyValue = modal.querySelector('#energyValue');
    const stressSlider = modal.querySelector('#stressSlider');
    const stressValue = modal.querySelector('#stressValue');

    energySlider.addEventListener('input', () => {
      energyValue.textContent = energySlider.value + '%';
    });

    stressSlider.addEventListener('input', () => {
      stressValue.textContent = stressSlider.value;
    });
  }

  submitEnergyCheckin() {
    const modal = document.querySelector('.modal');
    if (!modal) return;

    const energyLevel = parseInt(modal.querySelector('#energySlider').value);
    const mood = modal.querySelector('#moodSelect').value;
    const stressLevel = parseInt(modal.querySelector('#stressSlider').value);
    const activity = modal.querySelector('#activityText').value;

    // Update energy tracker
    if (this.aiEngine?.energyTracker) {
      this.aiEngine.energyTracker.setEnergyLevel(energyLevel, 'checkin');
      
      // Store additional context
      this.aiEngine.energyTracker.storage.setLocalData('currentMood', mood);
      this.aiEngine.energyTracker.storage.setLocalData('currentStress', stressLevel);
      
      if (activity) {
        this.aiEngine.energyTracker.storage.setLocalData('recentActivity', {
          activity,
          timestamp: Date.now()
        });
      }
    }

    this.closeModal();
    this.showNotification('Energy check-in recorded successfully!');
  }

  showSocialUpdate() {
    const modal = this.createModal('Social Battery Update', `
      <div class="social-form">
        <label for="socialSlider">Social Battery Level:</label>
        <input type="range" id="socialSlider" min="0" max="100" value="${this.aiEngine?.socialBattery?.getCurrentLevel() || 50}">
        <span id="socialValue">${this.aiEngine?.socialBattery?.getCurrentLevel() || 50}%</span>
        
        <label for="interactionType">Recent Interaction:</label>
        <select id="interactionType">
          <option value="">None</option>
          <option value="meeting">Meeting</option>
          <option value="presentation">Presentation</option>
          <option value="social_event">Social Event</option>
          <option value="deep_conversation">Deep Conversation</option>
          <option value="small_talk">Small Talk</option>
        </select>
        
        <label for="peopleCount">Number of People:</label>
        <input type="number" id="peopleCount" min="0" max="50" value="0">
        
        <label for="duration">Duration (minutes):</label>
        <input type="number" id="duration" min="0" max="480" value="0">
        
        <div class="modal-actions">
          <button onclick="app.submitSocialUpdate()">Submit</button>
          <button onclick="app.closeModal()">Cancel</button>
        </div>
      </div>
    `);

    const socialSlider = modal.querySelector('#socialSlider');
    const socialValue = modal.querySelector('#socialValue');

    socialSlider.addEventListener('input', () => {
      socialValue.textContent = socialSlider.value + '%';
    });
  }

  submitSocialUpdate() {
    const modal = document.querySelector('.modal');
    if (!modal) return;

    const socialLevel = parseInt(modal.querySelector('#socialSlider').value);
    const interactionType = modal.querySelector('#interactionType').value;
    const peopleCount = parseInt(modal.querySelector('#peopleCount').value);
    const duration = parseInt(modal.querySelector('#duration').value);

    // Update social battery
    if (this.aiEngine?.socialBattery) {
      this.aiEngine.socialBattery.setSocialLevel(socialLevel, 'manual');
      
      // Record interaction if provided
      if (interactionType && peopleCount > 0 && duration > 0) {
        this.aiEngine.socialBattery.recordInteraction(
          interactionType,
          duration,
          peopleCount,
          'unknown',
          'Manual entry'
        );
      }
    }

    this.closeModal();
    this.showNotification('Social battery updated successfully!');
  }

  async optimizeSchedule() {
    if (!this.scheduleOptimizer) {
      this.showNotification('Schedule optimizer not available', 'error');
      return;
    }

    this.showNotification('Optimizing schedule...', 'info');

    try {
      const optimizedSchedule = await this.scheduleOptimizer.getOptimizedSchedule(7);
      this.updateScheduleDisplay(optimizedSchedule.optimizedEvents);
      
      const modal = this.createModal('Schedule Optimization Results', `
        <div class="optimization-results">
          <h3>Optimization Complete</h3>
          <p>Events optimized: ${optimizedSchedule.metrics?.eventsOptimized || 0}</p>
          <p>Events rescheduled: ${optimizedSchedule.metrics?.eventsRescheduled || 0}</p>
          <p>Energy alignment improvement: ${optimizedSchedule.metrics?.energyAlignment?.toFixed(1) || 0}%</p>
          
          ${optimizedSchedule.recommendations?.length > 0 ? `
            <h4>Recommendations:</h4>
            <ul>
              ${optimizedSchedule.recommendations.map(rec => `<li>${rec.title}: ${rec.description}</li>`).join('')}
            </ul>
          ` : ''}
          
          <div class="modal-actions">
            <button onclick="app.closeModal()">Close</button>
          </div>
        </div>
      `);
    } catch (error) {
      console.error('Schedule optimization failed:', error);
      this.showNotification('Schedule optimization failed', 'error');
    }
  }

  async showForecast() {
    if (!this.energyForecastAI) {
      this.showNotification('Energy forecast not available', 'error');
      return;
    }

    this.showNotification('Generating forecast...', 'info');

    try {
      const forecast = await this.energyForecastAI.getForecast(24);
      
      const forecastHTML = forecast.predictions.slice(0, 12).map(prediction => {
        const time = prediction.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const energy = Math.round(prediction.predictedEnergy);
        const energyClass = this.getEnergyCostClass(energy);
        
        return `
          <div class="forecast-item">
            <span class="forecast-time">${time}</span>
            <span class="forecast-energy ${energyClass}">${energy}%</span>
            <span class="forecast-confidence">${Math.round(prediction.confidence * 100)}%</span>
          </div>
        `;
      }).join('');

      const modal = this.createModal('Energy Forecast', `
        <div class="forecast-results">
          <h3>Next 12 Hours Energy Forecast</h3>
          <div class="forecast-header">
            <span>Time</span>
            <span>Energy</span>
            <span>Confidence</span>
          </div>
          <div class="forecast-list">
            ${forecastHTML}
          </div>
          
          ${forecast.insights?.length > 0 ? `
            <h4>Insights:</h4>
            <ul>
              ${forecast.insights.map(insight => `<li>${insight.description}</li>`).join('')}
            </ul>
          ` : ''}
          
          <div class="modal-actions">
            <button onclick="app.closeModal()">Close</button>
          </div>
        </div>
      `);
    } catch (error) {
      console.error('Forecast generation failed:', error);
      this.showNotification('Forecast generation failed', 'error');
    }
  }

  showSettings() {
    const constraints = this.aiEngine?.getConstraints() || {};
    
    const modal = this.createModal('Settings', `
      <div class="settings-form">
        <h3>AI Constraints</h3>
        
        <label for="minEnergyLevel">Minimum Energy Level:</label>
        <input type="number" id="minEnergyLevel" min="0" max="100" value="${constraints.minEnergyLevel || 20}">
        
        <label for="minSocialLevel">Minimum Social Level:</label>
        <input type="number" id="minSocialLevel" min="0" max="100" value="${constraints.minSocialLevel || 15}">
        
        <label for="maxDailyDrain">Max Daily Energy Drain:</label>
        <input type="number" id="maxDailyDrain" min="50" max="200" value="${constraints.maxDailyDrain || 80}">
        
        <label for="strictMode">Strict Mode:</label>
        <input type="checkbox" id="strictMode" ${constraints.strictMode ? 'checked' : ''}>
        
        <div class="modal-actions">
          <button onclick="app.saveSettings()">Save</button>
          <button onclick="app.closeModal()">Cancel</button>
        </div>
      </div>
    `);
  }

  saveSettings() {
    const modal = document.querySelector('.modal');
    if (!modal || !this.aiEngine) return;

    const newConstraints = {
      minEnergyLevel: parseInt(modal.querySelector('#minEnergyLevel').value),
      minSocialLevel: parseInt(modal.querySelector('#minSocialLevel').value),
      maxDailyDrain: parseInt(modal.querySelector('#maxDailyDrain').value),
      strictMode: modal.querySelector('#strictMode').checked
    };

    this.aiEngine.updateConstraints(newConstraints);
    this.closeModal();
    this.showNotification('Settings saved successfully!');
  }

  // Utility Methods
  createModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>${title}</h2>
          <button class="modal-close" onclick="app.closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          ${content}
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeModal();
      }
    });

    return modal;
  }

  closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
      modal.remove();
    }
  }

  showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  showWelcomeMessage() {
    if (this.isInitialized) {
      this.showNotification('Creative Energy Flow AI is ready! Click on energy levels to update.');
    } else {
      this.showNotification('App started in basic mode. Some AI features may be limited.', 'warning');
    }
  }

  // Public API for external integrations
  async updateEnergyLevel(level, source = 'external') {
    if (this.aiEngine?.energyTracker) {
      return this.aiEngine.energyTracker.setEnergyLevel(level, source);
    }
  }

  async updateSocialLevel(level, source = 'external') {
    if (this.aiEngine?.socialBattery) {
      return this.aiEngine.socialBattery.setSocialLevel(level, source);
    }
  }

  async recordActivity(activity) {
    if (this.aiEngine?.energyTracker) {
      return this.aiEngine.energyTracker.consumeEnergy(
        activity.energyDrain || 10,
        activity.name || 'Activity',
        activity.type || 'general'
      );
    }
  }

  async recordSocialInteraction(interaction) {
    if (this.aiEngine?.socialBattery) {
      return this.aiEngine.socialBattery.recordInteraction(
        interaction.type,
        interaction.duration,
        interaction.peopleCount,
        interaction.environment,
        interaction.notes
      );
    }
  }

  async getRecommendations() {
    return this.aiEngine?.getCurrentRecommendations() || [];
  }

  async getInsights() {
    return this.aiEngine?.getCurrentInsights() || [];
  }

  async getEnergyForecast(hours = 24) {
    return this.energyForecastAI?.getForecast(hours) || null;
  }

  async optimizeTasks(tasks) {
    return this.taskPriorityAI?.prioritizeTasks(tasks) || tasks;
  }

  // Export data
  async exportData() {
    const data = {
      energy: this.aiEngine?.energyTracker?.exportTrainingData(),
      social: this.aiEngine?.socialBattery?.exportTrainingData(),
      timestamp: Date.now(),
      version: '1.0.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `creative-energy-flow-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  }
}

// Global app instance
let app;

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    app = new CreativeEnergyFlowApp();
    window.app = app; // Make globally accessible
  });
} else {
  app = new CreativeEnergyFlowApp();
  window.app = app;
}

export default CreativeEnergyFlowApp;