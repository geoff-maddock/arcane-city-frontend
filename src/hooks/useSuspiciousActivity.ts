// src/hooks/useSuspiciousActivity.ts
import { useState, useEffect, useCallback } from 'react';

interface SuspiciousActivityConfig {
  /** Number of failed attempts before triggering suspicious activity */
  failedAttemptThreshold: number;
  /** Time window in milliseconds to track failed attempts */
  windowMs: number;
  /** Storage key for tracking activity */
  storageKey: string;
}

interface ActivityRecord {
  timestamp: number;
  type: 'failed_registration' | 'failed_login' | 'validation_error' | 'network_error';
  details?: string;
}

interface SuspiciousActivityResult {
  /** Whether current activity is considered suspicious */
  isSuspicious: boolean;
  /** Number of failed attempts in current window */
  failedAttempts: number;
  /** Whether CAPTCHA should be required */
  requiresCaptcha: boolean;
  /** Function to record a failed attempt */
  recordFailedAttempt: (type: ActivityRecord['type'], details?: string) => void;
  /** Function to record a successful attempt (resets tracking) */
  recordSuccessfulAttempt: () => void;
  /** Function to manually reset tracking */
  reset: () => void;
}

/**
 * Hook for detecting suspicious activity patterns that might indicate
 * automated attacks or malicious behavior.
 */
export const useSuspiciousActivity = (config: SuspiciousActivityConfig): SuspiciousActivityResult => {
  const { failedAttemptThreshold, windowMs, storageKey } = config;
  const [activities, setActivities] = useState<ActivityRecord[]>([]);

  // Load activities from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as ActivityRecord[];
        setActivities(parsed);
      }
    } catch (error) {
      console.warn('Failed to load suspicious activity data from localStorage:', error);
      setActivities([]);
    }
  }, [storageKey]);

  // Save activities to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(activities));
    } catch (error) {
      console.warn('Failed to save suspicious activity data to localStorage:', error);
    }
  }, [activities, storageKey]);

  // Clean up old activities outside the time window
  const cleanupOldActivities = useCallback((currentActivities: ActivityRecord[]): ActivityRecord[] => {
    const now = Date.now();
    return currentActivities.filter(activity => now - activity.timestamp < windowMs);
  }, [windowMs]);

  // Calculate suspicious activity status
  const getActivityStatus = useCallback(() => {
    const recentActivities = cleanupOldActivities(activities);
    const failedAttempts = recentActivities.length;
    const isSuspicious = failedAttempts >= failedAttemptThreshold;
    
    // Require CAPTCHA after half the threshold is reached
    const requiresCaptcha = failedAttempts >= Math.ceil(failedAttemptThreshold / 2);

    return {
      isSuspicious,
      failedAttempts,
      requiresCaptcha,
    };
  }, [activities, failedAttemptThreshold, cleanupOldActivities]);

  // Record a failed attempt
  const recordFailedAttempt = useCallback((type: ActivityRecord['type'], details?: string) => {
    const now = Date.now();
    setActivities(currentActivities => {
      const cleaned = cleanupOldActivities(currentActivities);
      return [...cleaned, { timestamp: now, type, details }];
    });
  }, [cleanupOldActivities]);

  // Record a successful attempt (clears tracking)
  const recordSuccessfulAttempt = useCallback(() => {
    setActivities([]);
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn('Failed to clear suspicious activity data from localStorage:', error);
    }
  }, [storageKey]);

  // Reset tracking manually
  const reset = useCallback(() => {
    setActivities([]);
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn('Failed to clear suspicious activity data from localStorage:', error);
    }
  }, [storageKey]);

  const status = getActivityStatus();

  return {
    ...status,
    recordFailedAttempt,
    recordSuccessfulAttempt,
    reset,
  };
};

// Predefined configurations for common use cases
export const SUSPICIOUS_ACTIVITY_CONFIGS = {
  // Detect suspicious registration activity
  REGISTRATION: {
    failedAttemptThreshold: 3,
    windowMs: 30 * 60 * 1000, // 30 minutes
    storageKey: 'suspicious_registration_activity',
  },
  // Detect suspicious login activity
  LOGIN: {
    failedAttemptThreshold: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    storageKey: 'suspicious_login_activity',
  },
} as const;