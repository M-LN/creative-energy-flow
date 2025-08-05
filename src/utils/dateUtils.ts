import type { TimeOfDay } from '../types/energy';

export class DateUtils {
  /**
   * Get current date in YYYY-MM-DD format
   */
  static getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Get current timestamp in ISO format
   */
  static getCurrentTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Determine time of day based on current hour
   */
  static getCurrentTimeOfDay(): TimeOfDay {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      return 'morning';
    } else if (hour >= 12 && hour < 18) {
      return 'afternoon';
    } else {
      return 'evening';
    }
  }

  /**
   * Generate unique ID using timestamp and random string
   */
  static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Format date for display
   */
  static formatDisplayDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Format time for display
   */
  static formatDisplayTime(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  /**
   * Get date N days ago from today
   */
  static getDaysAgo(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  }

  /**
   * Check if date is today
   */
  static isToday(dateStr: string): boolean {
    return dateStr === this.getCurrentDate();
  }

  /**
   * Get last N days including today
   */
  static getLastNDays(n: number): string[] {
    const dates: string[] = [];
    for (let i = n - 1; i >= 0; i--) {
      dates.push(this.getDaysAgo(i));
    }
    return dates;
  }
}