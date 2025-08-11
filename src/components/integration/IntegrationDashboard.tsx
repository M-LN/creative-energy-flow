// Integration Dashboard - Calendar and Productivity App Integration

import React, { useState, useEffect, useCallback } from 'react';
import { 
  CalendarProvider,
  ProductivityProvider,
  CalendarEvent,
  Task,
  ScheduleOptimization,
  IntegrationAnalytics,
  SyncStatus
} from '../../types/integration';
import { calendarService } from '../../services/CalendarIntegrationService';
import { productivityService } from '../../services/ProductivityIntegrationService';
import './IntegrationDashboard.css';

interface IntegrationDashboardProps {}

const IntegrationDashboard: React.FC<IntegrationDashboardProps> = () => {
  const [activeTab, setActiveTab] = useState<'today' | 'overview' | 'calendar' | 'tasks' | 'optimizations' | 'settings'>('today');
  const [loading, setLoading] = useState(true);
  
  // State for integrations
  const [calendarProviders, setCalendarProviders] = useState<CalendarProvider[]>([]);
  const [productivityProviders, setProductivityProviders] = useState<ProductivityProvider[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [optimizations, setOptimizations] = useState<ScheduleOptimization[]>([]);
  const [syncStatus, setSyncStatus] = useState<{ calendar: SyncStatus; productivity: SyncStatus } | null>(null);
  const [analytics, setAnalytics] = useState<IntegrationAnalytics | null>(null);

  // Load integration data
  const loadIntegrationData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load from storage
      calendarService.loadFromStorage();
      productivityService.loadFromStorage();
      
      // Get current data
      setCalendarProviders(calendarService.getProviders());
      setProductivityProviders(productivityService.getProviders());
      setEvents(calendarService.getEvents());
      setTasks(productivityService.getTasks());
      
      // Get sync status
      setSyncStatus({
        calendar: calendarService.getSyncStatus(),
        productivity: productivityService.getSyncStatus()
      });
      
      // Generate optimizations
      const [calendarOpts, taskOpts] = await Promise.all([
        calendarService.generateOptimizations(),
        productivityService.generateTaskOptimizations()
      ]);
      setOptimizations([...calendarOpts, ...taskOpts]);
      
      // Generate analytics
      const meetingStats = await calendarService.analyzeEnergyPatterns();
      const taskStats = await productivityService.analyzeTaskCompletion();
      
      const analyticsData: IntegrationAnalytics = {
        totalEvents: events.length,
        totalTasks: tasks.length,
        averageEnergyUtilization: 0.75,
        optimizationsImplemented: 0,
        energyImprovementScore: 7.2,
        scheduleEfficiency: 0.82,
        meetingEnergyStats: meetingStats,
        taskCompletionStats: taskStats,
        weeklyTrends: []
      };
      setAnalytics(analyticsData);
      
    } catch (error) {
      console.error('Failed to load integration data:', error);
    } finally {
      setLoading(false);
    }
  }, [events.length, tasks.length]);

  useEffect(() => {
    loadIntegrationData();
  }, [loadIntegrationData]);

  // Provider connection handlers
  const handleConnectCalendar = async (provider: Omit<CalendarProvider, 'isConnected' | 'lastSync'>) => {
    const success = await calendarService.connectProvider(provider);
    if (success) {
      setCalendarProviders(calendarService.getProviders());
      setEvents(calendarService.getEvents());
    }
  };

  const handleConnectProductivity = async (provider: Omit<ProductivityProvider, 'isConnected' | 'lastSync'>) => {
    const success = await productivityService.connectProvider(provider);
    if (success) {
      setProductivityProviders(productivityService.getProviders());
      setTasks(productivityService.getTasks());
    }
  };

  const handleDisconnectProvider = async (type: 'calendar' | 'productivity', providerId: string) => {
    if (type === 'calendar') {
      await calendarService.disconnectProvider(providerId);
      setCalendarProviders(calendarService.getProviders());
      setEvents(calendarService.getEvents());
    } else {
      await productivityService.disconnectProvider(providerId);
      setProductivityProviders(productivityService.getProviders());
      setTasks(productivityService.getTasks());
    }
  };

  const handleSyncAll = async () => {
    const [calendarSync, productivitySync] = await Promise.all([
      calendarService.syncAllProviders(),
      productivityService.syncAllProviders()
    ]);
    
    setSyncStatus({
      calendar: calendarSync,
      productivity: productivitySync
    });
    
    // Refresh data
    setEvents(calendarService.getEvents());
    setTasks(productivityService.getTasks());
  };

  const handleScheduleTask = async (taskId: string) => {
    const result = await productivityService.scheduleTask(taskId);
    if (result.success) {
      setTasks(productivityService.getTasks());
    }
  };

  const handleImplementOptimization = async (optimizationId: string) => {
    // In a real implementation, this would apply the optimization
    setOptimizations(opts => opts.filter(opt => opt.id !== optimizationId));
  };

  // Get today's schedule and optimization opportunities
  const getTodaysSchedule = () => {
    const today = new Date();
    const todaysEvents = events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.toDateString() === today.toDateString();
    });
    
    return todaysEvents.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getTodaysTasks = () => {
    const today = new Date();
    return tasks.filter(task => {
      const dueDate = task.dueDate ? new Date(task.dueDate) : null;
      const isCompleted = task.status === 'completed';
      return !isCompleted && (!dueDate || dueDate.toDateString() === today.toDateString() || dueDate < today);
    }).slice(0, 5); // Limit to 5 most important
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getTodaysOptimizations = () => {
    return optimizations.filter(opt => 
      opt.type === 'break-suggestion' || opt.type === 'energy-block'
    ).slice(0, 3);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getEnergyOptimizedSchedule = () => {
    const schedule = getTodaysSchedule();
    
    return schedule.map(event => {
      const eventHour = new Date(event.startTime).getHours();
      let energyImpact = 'neutral';
      let suggestion = '';
      
      // Morning high energy
      if (eventHour >= 8 && eventHour <= 11) {
        energyImpact = 'good';
        suggestion = 'Peak energy time - great for important meetings';
      }
      // Afternoon dip
      else if (eventHour >= 13 && eventHour <= 15) {
        energyImpact = 'caution';
        suggestion = 'Post-lunch dip - consider lighter activities';
      }
      // Evening recharge
      else if (eventHour >= 17 && eventHour <= 19) {
        energyImpact = 'moderate';
        suggestion = 'End-of-day energy - good for wrapping up';
      }
      
      return { ...event, energyImpact, suggestion };
    });
  };

  if (loading) {
    return (
      <div className="integration-dashboard loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading integrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="integration-dashboard">
      <div className="integration-header">
        <div className="header-content">
          <h2>📅 Productivity Integration</h2>
          <p>Daily energy-optimized scheduling and task management</p>
        </div>
        <button 
          className="sync-btn primary"
          onClick={handleSyncAll}
          disabled={calendarProviders.length === 0 && productivityProviders.length === 0}
        >
          🔄 Sync All
        </button>
      </div>

      {/* Integration Tabs */}
      <div className="integration-tabs">
        <button 
          className={`tab-btn ${activeTab === 'today' ? 'active' : ''}`}
          onClick={() => setActiveTab('today')}
        >
          🌟 Today's Focus
        </button>
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          📅 Calendar
        </button>
        <button 
          className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          ✅ Tasks
        </button>
        <button 
          className={`tab-btn ${activeTab === 'optimizations' ? 'active' : ''}`}
          onClick={() => setActiveTab('optimizations')}
        >
          ⚡ Smart Scheduling
        </button>
        <button 
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Settings
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <OverviewTab 
            analytics={analytics}
            syncStatus={syncStatus}
            calendarProviders={calendarProviders}
            productivityProviders={productivityProviders}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarTab 
            events={events}
            providers={calendarProviders}
            onScheduleOptimization={handleImplementOptimization}
          />
        )}

        {activeTab === 'tasks' && (
          <TasksTab 
            tasks={tasks}
            providers={productivityProviders}
            onScheduleTask={handleScheduleTask}
            onCompleteTask={(taskId) => productivityService.markTaskCompleted(taskId)}
          />
        )}

        {activeTab === 'optimizations' && (
          <OptimizationsTab 
            optimizations={optimizations}
            onImplement={handleImplementOptimization}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab 
            calendarProviders={calendarProviders}
            productivityProviders={productivityProviders}
            onConnectCalendar={handleConnectCalendar}
            onConnectProductivity={handleConnectProductivity}
            onDisconnect={handleDisconnectProvider}
          />
        )}
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab: React.FC<{
  analytics: IntegrationAnalytics | null;
  syncStatus: { calendar: SyncStatus; productivity: SyncStatus } | null;
  calendarProviders: CalendarProvider[];
  productivityProviders: ProductivityProvider[];
}> = ({ analytics, syncStatus, calendarProviders, productivityProviders }) => {
  if (!analytics || !syncStatus) return <div>Loading analytics...</div>;

  const connectedCalendars = calendarProviders.filter(p => p.isConnected).length;
  const connectedProductivity = productivityProviders.filter(p => p.isConnected).length;

  return (
    <div className="overview-tab">
      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <div className="stat-value">{analytics.totalEvents}</div>
            <div className="stat-label">Calendar Events</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{analytics.totalTasks}</div>
            <div className="stat-label">Active Tasks</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-content">
            <div className="stat-value">{analytics.energyImprovementScore.toFixed(1)}</div>
            <div className="stat-label">Energy Score</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className="stat-value">{(analytics.scheduleEfficiency * 100).toFixed(0)}%</div>
            <div className="stat-label">Schedule Efficiency</div>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      <div className="connection-status">
        <h3>Integration Status</h3>
        <div className="status-grid">
          <div className="status-item">
            <div className="status-header">
              <span className="status-icon">📅</span>
              <span className="status-title">Calendar Apps</span>
            </div>
            <div className={`status-indicator ${connectedCalendars > 0 ? 'connected' : 'disconnected'}`}>
              {connectedCalendars > 0 ? `${connectedCalendars} Connected` : 'Not Connected'}
            </div>
          </div>
          <div className="status-item">
            <div className="status-header">
              <span className="status-icon">⚡</span>
              <span className="status-title">Productivity Apps</span>
            </div>
            <div className={`status-indicator ${connectedProductivity > 0 ? 'connected' : 'disconnected'}`}>
              {connectedProductivity > 0 ? `${connectedProductivity} Connected` : 'Not Connected'}
            </div>
          </div>
        </div>
      </div>

      {/* Energy Analysis */}
      <div className="energy-analysis">
        <h3>Energy Pattern Analysis</h3>
        <div className="analysis-grid">
          <div className="analysis-item">
            <h4>Meeting Energy Impact</h4>
            <div className="metric-display">
              <span className="metric-value">{analytics.meetingEnergyStats.averageEnergyCost.toFixed(1)}</span>
              <span className="metric-unit">avg energy cost</span>
            </div>
            <div className="metric-details">
              <p>Optimal meeting times: {analytics.meetingEnergyStats.optimalMeetingTimes.join(', ')}</p>
            </div>
          </div>
          <div className="analysis-item">
            <h4>Task Completion Rate</h4>
            <div className="metric-display">
              <span className="metric-value">{(analytics.taskCompletionStats.completionRate * 100).toFixed(0)}%</span>
              <span className="metric-unit">completion rate</span>
            </div>
            <div className="metric-details">
              <p>Avg duration: {analytics.taskCompletionStats.averageTaskDuration} min</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Calendar Tab Component
const CalendarTab: React.FC<{
  events: CalendarEvent[];
  providers: CalendarProvider[];
  onScheduleOptimization: (optimizationId: string) => void;
}> = ({ events, providers, onScheduleOptimization }) => {
  const upcomingEvents = events.filter(event => event.startTime > new Date()).slice(0, 10);

  return (
    <div className="calendar-tab">
      <div className="calendar-summary">
        <h3>📅 Upcoming Events</h3>
        <p>{upcomingEvents.length} events scheduled for the next 2 weeks</p>
      </div>

      <div className="events-list">
        {upcomingEvents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h4>No upcoming events</h4>
            <p>Connect your calendar to see upcoming events and get energy-optimized scheduling suggestions.</p>
          </div>
        ) : (
          upcomingEvents.map(event => (
            <div key={event.id} className="event-card">
              <div className="event-header">
                <div className="event-title-section">
                  <h4 className="event-title">{event.title}</h4>
                  <div className="event-meta">
                    <span className="event-time">
                      {event.startTime.toLocaleDateString()} at {event.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="event-duration">
                      ({Math.round((event.endTime.getTime() - event.startTime.getTime()) / (1000 * 60))} min)
                    </span>
                  </div>
                </div>
                <div className={`energy-cost-badge cost-${event.energyCost <= 3 ? 'low' : event.energyCost <= 6 ? 'medium' : 'high'}`}>
                  ⚡ {event.energyCost}/10
                </div>
              </div>
              
              {event.description && (
                <p className="event-description">{event.description}</p>
              )}
              
              <div className="event-details">
                <div className="detail-item">
                  <span className="detail-label">Type:</span>
                  <span className="detail-value">{event.meetingType}</span>
                </div>
                {event.location && (
                  <div className="detail-item">
                    <span className="detail-label">Location:</span>
                    <span className="detail-value">{event.location}</span>
                  </div>
                )}
                <div className="detail-item">
                  <span className="detail-label">Source:</span>
                  <span className="detail-value">{event.source.name}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Tasks Tab Component
const TasksTab: React.FC<{
  tasks: Task[];
  providers: ProductivityProvider[];
  onScheduleTask: (taskId: string) => void;
  onCompleteTask: (taskId: string) => void;
}> = ({ tasks, providers, onScheduleTask, onCompleteTask }) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'todo' | 'in-progress' | 'completed'>('all');
  
  const filteredTasks = filterStatus === 'all' 
    ? tasks 
    : tasks.filter(task => task.status === filterStatus);

  return (
    <div className="tasks-tab">
      <div className="tasks-header">
        <h3>✅ Task Management</h3>
        <div className="task-filters">
          <button 
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All ({tasks.length})
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'todo' ? 'active' : ''}`}
            onClick={() => setFilterStatus('todo')}
          >
            To Do ({tasks.filter(t => t.status === 'todo').length})
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'in-progress' ? 'active' : ''}`}
            onClick={() => setFilterStatus('in-progress')}
          >
            In Progress ({tasks.filter(t => t.status === 'in-progress').length})
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'completed' ? 'active' : ''}`}
            onClick={() => setFilterStatus('completed')}
          >
            Completed ({tasks.filter(t => t.status === 'completed').length})
          </button>
        </div>
      </div>

      <div className="tasks-list">
        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <h4>No tasks found</h4>
            <p>Connect your productivity apps to import tasks and get energy-optimized scheduling.</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div key={task.id} className={`task-card ${task.status}`}>
              <div className="task-header">
                <div className="task-title-section">
                  <h4 className="task-title">{task.title}</h4>
                  <div className="task-meta">
                    <span className={`priority-badge priority-${task.priority}`}>
                      {task.priority.toUpperCase()}
                    </span>
                    <span className={`category-badge category-${task.category}`}>
                      {task.category}
                    </span>
                    <span className={`energy-req-badge req-${task.energyRequirement}`}>
                      ⚡ {task.energyRequirement}
                    </span>
                  </div>
                </div>
                <div className={`status-badge status-${task.status}`}>
                  {task.status.replace('-', ' ')}
                </div>
              </div>
              
              {task.description && (
                <p className="task-description">{task.description}</p>
              )}
              
              <div className="task-details">
                <div className="detail-item">
                  <span className="detail-label">Duration:</span>
                  <span className="detail-value">{task.estimatedDuration} min</span>
                </div>
                {task.dueDate && (
                  <div className="detail-item">
                    <span className="detail-label">Due:</span>
                    <span className="detail-value">{task.dueDate.toLocaleDateString()}</span>
                  </div>
                )}
                <div className="detail-item">
                  <span className="detail-label">Source:</span>
                  <span className="detail-value">{task.source.name}</span>
                </div>
              </div>

              {task.energyOptimalTime && (
                <div className="optimal-time">
                  <span className="optimal-label">⚡ Optimal time:</span>
                  <span className="optimal-value">
                    {task.energyOptimalTime.start.toLocaleDateString()} at {task.energyOptimalTime.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
              
              {(task.status === 'todo' || task.status === 'in-progress') && (
                <div className="task-actions">
                  <button 
                    className="action-btn schedule-btn"
                    onClick={() => onScheduleTask(task.id)}
                  >
                    📅 Optimize Schedule
                  </button>
                  <button 
                    className="action-btn complete-btn"
                    onClick={() => onCompleteTask(task.id)}
                  >
                    ✅ Mark Complete
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Optimizations Tab Component
const OptimizationsTab: React.FC<{
  optimizations: ScheduleOptimization[];
  onImplement: (optimizationId: string) => void;
}> = ({ optimizations, onImplement }) => {
  const highPriority = optimizations.filter(opt => opt.priority === 'high');
  const mediumPriority = optimizations.filter(opt => opt.priority === 'medium');
  const lowPriority = optimizations.filter(opt => opt.priority === 'low');

  return (
    <div className="optimizations-tab">
      <div className="optimizations-header">
        <h3>⚡ Schedule Optimizations</h3>
        <p>{optimizations.length} energy-based optimization suggestions available</p>
      </div>

      {optimizations.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">⚡</div>
          <h4>No optimizations available</h4>
          <p>Great! Your schedule is already well-optimized for energy efficiency.</p>
        </div>
      ) : (
        <div className="optimizations-sections">
          {highPriority.length > 0 && (
            <OptimizationSection 
              title="🔥 High Priority" 
              optimizations={highPriority} 
              onImplement={onImplement}
            />
          )}
          {mediumPriority.length > 0 && (
            <OptimizationSection 
              title="⚡ Medium Priority" 
              optimizations={mediumPriority} 
              onImplement={onImplement}
            />
          )}
          {lowPriority.length > 0 && (
            <OptimizationSection 
              title="💡 Low Priority" 
              optimizations={lowPriority} 
              onImplement={onImplement}
            />
          )}
        </div>
      )}
    </div>
  );
};

const OptimizationSection: React.FC<{
  title: string;
  optimizations: ScheduleOptimization[];
  onImplement: (optimizationId: string) => void;
}> = ({ title, optimizations, onImplement }) => (
  <div className="optimization-section">
    <h4>{title}</h4>
    <div className="optimizations-list">
      {optimizations.map(optimization => (
        <div key={optimization.id} className={`optimization-card priority-${optimization.priority}`}>
          <div className="optimization-header">
            <h5 className="optimization-title">{optimization.title}</h5>
            <div className="energy-improvement">
              +{optimization.energyImprovement} energy
            </div>
          </div>
          
          <p className="optimization-description">{optimization.description}</p>
          
          <div className="optimization-details">
            <div className="detail-row">
              <span className="detail-label">Current:</span>
              <span className="detail-value">
                {optimization.currentSchedule.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                (Energy: {optimization.currentSchedule.energyLevel}/10)
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Suggested:</span>
              <span className="detail-value">
                {optimization.suggestedSchedule.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                (Energy: {optimization.suggestedSchedule.energyLevel}/10)
              </span>
            </div>
          </div>
          
          <div className="optimization-reasoning">
            <p>{optimization.reasoning}</p>
          </div>
          
          <div className="optimization-footer">
            <div className="optimization-meta">
              <span className={`effort-badge effort-${optimization.implementationEffort}`}>
                {optimization.implementationEffort} to implement
              </span>
              <span className="source-badge">
                From {optimization.source}
              </span>
            </div>
            <button 
              className="implement-btn"
              onClick={() => onImplement(optimization.id)}
            >
              ✅ Implement
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Settings Tab Component
const SettingsTab: React.FC<{
  calendarProviders: CalendarProvider[];
  productivityProviders: ProductivityProvider[];
  onConnectCalendar: (provider: Omit<CalendarProvider, 'isConnected' | 'lastSync'>) => void;
  onConnectProductivity: (provider: Omit<ProductivityProvider, 'isConnected' | 'lastSync'>) => void;
  onDisconnect: (type: 'calendar' | 'productivity', providerId: string) => void;
}> = ({ calendarProviders, productivityProviders, onConnectCalendar, onConnectProductivity, onDisconnect }) => {
  
  const availableCalendarProviders = [
    { id: 'google', name: 'google' as const, icon: '📅' },
    { id: 'outlook', name: 'outlook' as const, icon: '📧' },
    { id: 'apple', name: 'apple' as const, icon: '🍎' }
  ];

  const availableProductivityProviders = [
    { id: 'notion', name: 'notion' as const, icon: '📝' },
    { id: 'todoist', name: 'todoist' as const, icon: '✅' },
    { id: 'microsoft-todo', name: 'microsoft-todo' as const, icon: '📋' },
    { id: 'asana', name: 'asana' as const, icon: '🎯' }
  ];

  return (
    <div className="settings-tab">
      <div className="settings-section">
        <h3>📅 Calendar Integration</h3>
        <p>Connect your calendar apps to enable energy-optimized scheduling</p>
        
        <div className="providers-grid">
          {availableCalendarProviders.map(provider => {
            const connected = calendarProviders.find(p => p.name === provider.name && p.isConnected);
            return (
              <div key={provider.id} className={`provider-card ${connected ? 'connected' : ''}`}>
                <div className="provider-header">
                  <span className="provider-icon">{provider.icon}</span>
                  <h4 className="provider-name">{provider.name.charAt(0).toUpperCase() + provider.name.slice(1)}</h4>
                </div>
                
                {connected ? (
                  <div className="provider-connected">
                    <div className="connection-status">✅ Connected</div>
                    <div className="connection-details">
                      Last sync: {connected.lastSync?.toLocaleString() || 'Never'}
                    </div>
                    <button 
                      className="disconnect-btn"
                      onClick={() => onDisconnect('calendar', connected.id)}
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button 
                    className="connect-btn"
                    onClick={() => onConnectCalendar({
                      id: `${provider.name}-${Date.now()}`,
                      name: provider.name,
                      syncEnabled: true
                    })}
                  >
                    Connect
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="settings-section">
        <h3>⚡ Productivity Integration</h3>
        <p>Connect your task management apps for intelligent task scheduling</p>
        
        <div className="providers-grid">
          {availableProductivityProviders.map(provider => {
            const connected = productivityProviders.find(p => p.name === provider.name && p.isConnected);
            return (
              <div key={provider.id} className={`provider-card ${connected ? 'connected' : ''}`}>
                <div className="provider-header">
                  <span className="provider-icon">{provider.icon}</span>
                  <h4 className="provider-name">{provider.name.charAt(0).toUpperCase() + provider.name.slice(1).replace('-', ' ')}</h4>
                </div>
                
                {connected ? (
                  <div className="provider-connected">
                    <div className="connection-status">✅ Connected</div>
                    <div className="connection-details">
                      Last sync: {connected.lastSync?.toLocaleString() || 'Never'}
                    </div>
                    <button 
                      className="disconnect-btn"
                      onClick={() => onDisconnect('productivity', connected.id)}
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button 
                    className="connect-btn"
                    onClick={() => onConnectProductivity({
                      id: `${provider.name}-${Date.now()}`,
                      name: provider.name,
                      syncEnabled: true
                    })}
                  >
                    Connect
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="settings-section">
        <h3>⚙️ Integration Preferences</h3>
        <div className="preferences-grid">
          <div className="preference-item">
            <h4>Auto-sync Frequency</h4>
            <select 
              defaultValue="30"
              aria-label="Auto-sync frequency"
              title="Select how often to sync with connected apps"
            >
              <option value="15">Every 15 minutes</option>
              <option value="30">Every 30 minutes</option>
              <option value="60">Every hour</option>
              <option value="120">Every 2 hours</option>
            </select>
          </div>
          <div className="preference-item">
            <h4>Energy Optimization</h4>
            <label className="toggle-switch">
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider"></span>
              Enable smart scheduling
            </label>
          </div>
          <div className="preference-item">
            <h4>Notification Preferences</h4>
            <div className="notification-options">
              <label>
                <input type="checkbox" defaultChecked />
                Optimization suggestions
              </label>
              <label>
                <input type="checkbox" defaultChecked />
                Sync updates
              </label>
              <label>
                <input type="checkbox" />
                Schedule conflicts
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationDashboard;
