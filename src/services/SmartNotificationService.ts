import { EnergyLevel } from '../types/energy';

export interface NotificationSchedule {
  id: string;
  type: 'daily-checkin' | 'creative-challenge' | 'energy-reminder' | 'weekly-reflection';
  title: string;
  body: string;
  scheduledTime: string; // HH:MM format
  days: number[]; // 0=Sunday, 1=Monday, etc.
  enabled: boolean;
}

export interface SmartNotificationContext {
  lastEnergyEntry?: EnergyLevel;
  energyTrend?: 'increasing' | 'decreasing' | 'stable';
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: string;
  consecutiveDaysWithoutEntry: number;
  userPreferences: {
    primaryGoal?: string;
    energyStyle?: string;
    notificationFrequency: 'minimal' | 'moderate' | 'frequent';
  };
}

export class SmartNotificationService {
  private static instance: SmartNotificationService;
  private permission: NotificationPermission = 'default';
  private schedules: NotificationSchedule[] = [];
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

  private constructor() {
    this.initializeService();
  }

  public static getInstance(): SmartNotificationService {
    if (!SmartNotificationService.instance) {
      SmartNotificationService.instance = new SmartNotificationService();
    }
    return SmartNotificationService.instance;
  }

  private async initializeService() {
    // Register service worker for background notifications
    if ('serviceWorker' in navigator) {
      try {
        this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered for notifications');
      } catch (error) {
        console.log('Service Worker registration failed:', error);
      }
    }

    // Load existing schedules
    this.loadSchedules();

    // Setup default schedules if first time
    if (this.schedules.length === 0) {
      this.setupDefaultSchedules();
    }
  }

  // Request notification permission
  public async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    const permission = await Notification.requestPermission();
    this.permission = permission;
    
    if (permission === 'granted') {
      console.log('Notification permission granted');
      return true;
    } else {
      console.log('Notification permission denied');
      return false;
    }
  }

  // Show immediate notification
  public async showNotification(
    title: string, 
    options: NotificationOptions & { actionButtons?: Array<{action: string, title: string}> } = {}
  ): Promise<void> {
    if (this.permission !== 'granted') {
      console.log('Notifications not permitted');
      return;
    }

    try {
      if (this.serviceWorkerRegistration) {
        // Use service worker for better reliability
        await this.serviceWorkerRegistration.showNotification(title, {
          ...options,
          badge: '/icon-192.png',
          icon: '/icon-192.png',
          actions: options.actionButtons?.map(btn => ({
            action: btn.action,
            title: btn.title
          }))
        });
      } else {
        // Fallback to regular notification
        new Notification(title, {
          ...options,
          icon: '/icon-192.png'
        });
      }
    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  }

  // Smart context-aware notifications
  public async sendSmartNotification(context: SmartNotificationContext): Promise<void> {
    const notification = this.generateContextualNotification(context);
    
    if (notification) {
      await this.showNotification(notification.title, {
        body: notification.body,
        tag: notification.tag,
        actionButtons: notification.actions
      });
    }
  }

  private generateContextualNotification(context: SmartNotificationContext) {
    const { lastEnergyEntry, energyTrend, timeOfDay, consecutiveDaysWithoutEntry, userPreferences } = context;

    // No entry for multiple days
    if (consecutiveDaysWithoutEntry >= 2) {
      return {
        title: "Missing you! 🌱",
        body: `It's been ${consecutiveDaysWithoutEntry} days since your last energy check-in. How are you feeling?`,
        tag: 'missing-checkin',
        actions: [
          { action: 'quick-entry', title: 'Quick Entry' },
          { action: 'remind-later', title: 'Remind Later' }
        ]
      };
    }

    // Morning energy check-in
    if (timeOfDay === 'morning' && (!lastEnergyEntry || this.isYesterday(lastEnergyEntry.timestamp))) {
      const morningMessages = [
        "Good morning! ☀️ How's your energy starting today?",
        "Rise and shine! 🌅 Let's capture your morning energy.",
        "New day, fresh energy! 🌟 How are you feeling?"
      ];
      
      return {
        title: "Morning Check-in",
        body: morningMessages[Math.floor(Math.random() * morningMessages.length)],
        tag: 'morning-checkin',
        actions: [
          { action: 'morning-entry', title: 'Log Energy' },
          { action: 'creative-challenge', title: 'Daily Challenge' }
        ]
      };
    }

    // Energy trend-based notifications
    if (lastEnergyEntry && energyTrend === 'decreasing') {
      return {
        title: "Energy dip detected 📉",
        body: "Your energy seems lower lately. Need some personalized tips to boost it?",
        tag: 'energy-support',
        actions: [
          { action: 'get-tips', title: 'Get Tips' },
          { action: 'log-current', title: 'Update Energy' }
        ]
      };
    }

    // Goal-based notifications
    if (userPreferences.primaryGoal === 'creativity' && timeOfDay === 'afternoon') {
      return {
        title: "Creative peak time! 🎨",
        body: "Afternoon is often great for creativity. Ready for today's creative challenge?",
        tag: 'creativity-boost',
        actions: [
          { action: 'creative-challenge', title: 'Take Challenge' },
          { action: 'log-energy', title: 'Check Energy' }
        ]
      };
    }

    return null;
  }

  // Schedule regular notifications
  public scheduleNotifications(schedules: NotificationSchedule[]): void {
    this.schedules = schedules;
    this.saveSchedules();
    this.setupNotificationTiming();
  }

  private setupDefaultSchedules(): void {
    const defaultSchedules: NotificationSchedule[] = [
      {
        id: 'morning-checkin',
        type: 'daily-checkin',
        title: 'Good morning! ☀️',
        body: 'How\'s your energy starting today?',
        scheduledTime: '09:00',
        days: [1, 2, 3, 4, 5], // Weekdays
        enabled: true
      },
      {
        id: 'afternoon-creative',
        type: 'creative-challenge',
        title: 'Creative peak time! 🎨',
        body: 'Ready for today\'s creative challenge?',
        scheduledTime: '14:00',
        days: [1, 2, 3, 4, 5],
        enabled: true
      },
      {
        id: 'evening-reflection',
        type: 'energy-reminder',
        title: 'End of day reflection 🌙',
        body: 'How did your energy serve you today?',
        scheduledTime: '20:00',
        days: [0, 1, 2, 3, 4, 5, 6], // Every day
        enabled: true
      },
      {
        id: 'weekly-reflection',
        type: 'weekly-reflection',
        title: 'Week in review 📊',
        body: 'Check out your energy patterns from this week!',
        scheduledTime: '10:00',
        days: [0], // Sunday
        enabled: true
      }
    ];

    this.schedules = defaultSchedules;
    this.saveSchedules();
  }

  private setupNotificationTiming(): void {
    // Clear existing timers and set new ones
    if (typeof window !== 'undefined') {
      this.schedules.forEach(schedule => {
        if (schedule.enabled) {
          this.scheduleNotification(schedule);
        }
      });
    }
  }

  private scheduleNotification(schedule: NotificationSchedule): void {
    const now = new Date();
    const [hours, minutes] = schedule.scheduledTime.split(':').map(Number);
    
    // Calculate next occurrence
    const nextNotification = new Date();
    nextNotification.setHours(hours, minutes, 0, 0);
    
    // If time has passed today, schedule for tomorrow or next valid day
    if (nextNotification <= now) {
      nextNotification.setDate(nextNotification.getDate() + 1);
    }
    
    // Find next valid day
    while (!schedule.days.includes(nextNotification.getDay())) {
      nextNotification.setDate(nextNotification.getDate() + 1);
    }
    
    const delay = nextNotification.getTime() - now.getTime();
    
    setTimeout(async () => {
      await this.showNotification(schedule.title, {
        body: schedule.body,
        tag: schedule.id,
        actionButtons: [
          { action: 'open-app', title: 'Open App' },
          { action: 'snooze', title: 'Remind Later' }
        ]
      });
      
      // Reschedule for next occurrence
      this.scheduleNotification(schedule);
    }, delay);
  }

  // Utility methods
  private isYesterday(date: Date): boolean {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date.toDateString() === yesterday.toDateString();
  }

  private saveSchedules(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('notification_schedules', JSON.stringify(this.schedules));
    }
  }

  private loadSchedules(): void {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('notification_schedules');
      if (saved) {
        this.schedules = JSON.parse(saved);
      }
    }
  }

  // Public methods for managing notifications
  public getSchedules(): NotificationSchedule[] {
    return this.schedules;
  }

  public updateSchedule(scheduleId: string, updates: Partial<NotificationSchedule>): void {
    const index = this.schedules.findIndex(s => s.id === scheduleId);
    if (index !== -1) {
      this.schedules[index] = { ...this.schedules[index], ...updates };
      this.saveSchedules();
      this.setupNotificationTiming();
    }
  }

  public toggleSchedule(scheduleId: string): void {
    const schedule = this.schedules.find(s => s.id === scheduleId);
    if (schedule) {
      schedule.enabled = !schedule.enabled;
      this.saveSchedules();
      this.setupNotificationTiming();
    }
  }

  // Handle notification actions (when user clicks notification buttons)
  public handleNotificationAction(action: string, notificationTag: string): void {
    switch (action) {
      case 'quick-entry':
      case 'morning-entry':
      case 'log-energy':
        // Open app to energy entry
        window.focus();
        window.location.href = '/#/energy-entry';
        break;
      
      case 'creative-challenge':
        // Open to creative challenge
        window.focus();
        window.location.href = '/#/creative-challenge';
        break;
      
      case 'get-tips':
        // Open AI assistant
        window.focus();
        window.location.href = '/#/ai-chat';
        break;
      
      case 'remind-later':
      case 'snooze':
        // Snooze for 2 hours
        setTimeout(() => {
          const schedule = this.schedules.find(s => s.id === notificationTag);
          if (schedule) {
            this.showNotification('Gentle reminder 🔔', {
              body: schedule.body,
              tag: schedule.id
            });
          }
        }, 2 * 60 * 60 * 1000); // 2 hours
        break;
    }
  }
}
