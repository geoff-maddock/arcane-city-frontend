// src/hooks/useRateLimit.ts
import { useState, useEffect, useCallback } from 'react';

interface RateLimitConfig {
  /** Maximum number of attempts allowed */
  maxAttempts: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Key to store attempts in localStorage */
  storageKey: string;
}

interface AttemptRecord {
  timestamp: number;
  count: number;
}

interface RateLimitResult {
  /** Whether the action is currently rate limited */
  isRateLimited: boolean;
  /** Number of attempts remaining in current window */
  attemptsRemaining: number;
  /** Time in milliseconds until rate limit resets */
  resetTimeMs: number;
  /** Function to record a new attempt */
  recordAttempt: () => void;
  /** Function to manually reset the rate limit */
  reset: () => void;
}

/**
 * Hook for client-side rate limiting of actions like registration attempts.
 * Tracks attempts in localStorage to persist across browser sessions.
 */
export const useRateLimit = (config: RateLimitConfig): RateLimitResult => {
  const { maxAttempts, windowMs, storageKey } = config;
  const [attempts, setAttempts] = useState<AttemptRecord[]>([]);

  // Load attempts from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as AttemptRecord[];
        setAttempts(parsed);
      }
    } catch (error) {
      console.warn('Failed to load rate limit data from localStorage:', error);
      setAttempts([]);
    }
  }, [storageKey]);

  // Save attempts to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(attempts));
    } catch (error) {
      console.warn('Failed to save rate limit data to localStorage:', error);
    }
  }, [attempts, storageKey]);

  // Clean up old attempts that are outside the time window
  const cleanupOldAttempts = useCallback((currentAttempts: AttemptRecord[]): AttemptRecord[] => {
    const now = Date.now();
    return currentAttempts.filter(attempt => now - attempt.timestamp < windowMs);
  }, [windowMs]);

  // Calculate current rate limit status
  const getCurrentStatus = useCallback(() => {
    const now = Date.now();
    const recentAttempts = cleanupOldAttempts(attempts);
    const totalAttempts = recentAttempts.reduce((sum, attempt) => sum + attempt.count, 0);
    
    const isRateLimited = totalAttempts >= maxAttempts;
    const attemptsRemaining = Math.max(0, maxAttempts - totalAttempts);
    
    // Calculate reset time based on oldest recent attempt
    let resetTimeMs = 0;
    if (recentAttempts.length > 0) {
      const oldestAttempt = Math.min(...recentAttempts.map(a => a.timestamp));
      resetTimeMs = Math.max(0, windowMs - (now - oldestAttempt));
    }

    return {
      isRateLimited,
      attemptsRemaining,
      resetTimeMs,
    };
  }, [attempts, maxAttempts, windowMs, cleanupOldAttempts]);

  // Record a new attempt
  const recordAttempt = useCallback(() => {
    const now = Date.now();
    setAttempts(currentAttempts => {
      const cleaned = cleanupOldAttempts(currentAttempts);
      
      // Check if there's a recent attempt (within last 5 seconds) to group with
      const recentAttempt = cleaned.find(attempt => now - attempt.timestamp < 5000);
      
      if (recentAttempt) {
        // Increment count of recent attempt
        return cleaned.map(attempt => 
          attempt === recentAttempt 
            ? { ...attempt, count: attempt.count + 1 }
            : attempt
        );
      } else {
        // Add new attempt record
        return [...cleaned, { timestamp: now, count: 1 }];
      }
    });
  }, [cleanupOldAttempts]);

  // Reset rate limit manually
  const reset = useCallback(() => {
    setAttempts([]);
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn('Failed to clear rate limit data from localStorage:', error);
    }
  }, [storageKey]);

  const status = getCurrentStatus();

  return {
    ...status,
    recordAttempt,
    reset,
  };
};

// Predefined configurations for common use cases
export const RATE_LIMIT_CONFIGS = {
  // Allow 3 registration attempts per 15 minutes
  REGISTRATION: {
    maxAttempts: 3,
    windowMs: 15 * 60 * 1000, // 15 minutes
    storageKey: 'registration_attempts',
  },
  // Allow 5 login attempts per 5 minutes
  LOGIN: {
    maxAttempts: 5,
    windowMs: 5 * 60 * 1000, // 5 minutes
    storageKey: 'login_attempts',
  },
  // Allow 10 password reset attempts per hour
  PASSWORD_RESET: {
    maxAttempts: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
    storageKey: 'password_reset_attempts',
  },
} as const;