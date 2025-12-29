/**
 * Push Notifications Utility
 * 
 * Handles browser push notification permissions and scheduling
 * for daily practice reminders.
 */

export interface NotificationPermissionResult {
  granted: boolean;
  error?: string;
}

/**
 * Request browser notification permission from user
 */
export async function requestNotificationPermission(): Promise<NotificationPermissionResult> {
  if (!('Notification' in window)) {
    return {
      granted: false,
      error: 'Notifications not supported in this browser'
    };
  }

  if (Notification.permission === 'granted') {
    return { granted: true };
  }

  if (Notification.permission === 'denied') {
    return {
      granted: false,
      error: 'Notification permission was previously denied. Please enable in browser settings.'
    };
  }

  try {
    const permission = await Notification.requestPermission();
    return {
      granted: permission === 'granted',
      error: permission === 'denied' ? 'Permission denied' : undefined
    };
  } catch (error) {
    return {
      granted: false,
      error: 'Failed to request notification permission'
    };
  }
}

/**
 * Check if notifications are currently enabled
 */
export function areNotificationsEnabled(): boolean {
  return 'Notification' in window && Notification.permission === 'granted';
}

/**
 * Send a local notification (for testing or immediate notifications)
 */
export function sendLocalNotification(title: string, options?: NotificationOptions) {
  if (!areNotificationsEnabled()) {
    console.warn('Notifications not enabled');
    return;
  }

  try {
    const notification = new Notification(title, {
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      ...options
    });

    // Auto-close after 10 seconds
    setTimeout(() => notification.close(), 10000);

    // Handle click to focus app
    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return notification;
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}

/**
 * Schedule daily reminder notification
 * Note: Browser notifications don't support true scheduling.
 * This would need to be implemented server-side with push service.
 * For now, we'll use service worker for basic scheduling.
 */
export async function scheduleDailyReminder(hour: number, minute: number) {
  if (!areNotificationsEnabled()) {
    throw new Error('Notifications not enabled');
  }

  // Register service worker if not already registered
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Store reminder time in localStorage for service worker to check
      localStorage.setItem('reminderTime', JSON.stringify({ hour, minute }));
      
      // Send message to service worker to set up reminder
      if (registration.active) {
        registration.active.postMessage({
          type: 'SCHEDULE_REMINDER',
          hour,
          minute
        });
      }

      return true;
    } catch (error) {
      console.error('Failed to schedule reminder:', error);
      return false;
    }
  }

  return false;
}

/**
 * Cancel scheduled daily reminder
 */
export async function cancelDailyReminder() {
  localStorage.removeItem('reminderTime');
  
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      if (registration.active) {
        registration.active.postMessage({
          type: 'CANCEL_REMINDER'
        });
      }
    } catch (error) {
      console.error('Failed to cancel reminder:', error);
    }
  }
}

/**
 * Get current reminder settings
 */
export function getReminderSettings(): { hour: number; minute: number } | null {
  const stored = localStorage.getItem('reminderTime');
  if (!stored) return null;
  
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}
