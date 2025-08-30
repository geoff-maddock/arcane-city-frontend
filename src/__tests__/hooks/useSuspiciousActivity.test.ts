// src/__tests__/hooks/useSuspiciousActivity.test.ts
import { renderHook, act } from '@testing-library/react';
import { useSuspiciousActivity } from '../../hooks/useSuspiciousActivity';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useSuspiciousActivity', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const config = {
    failedAttemptThreshold: 3,
    windowMs: 10000, // 10 seconds for testing
    storageKey: 'test_suspicious_activity',
  };

  test('should initialize with no suspicious activity', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useSuspiciousActivity(config));

    expect(result.current.isSuspicious).toBe(false);
    expect(result.current.failedAttempts).toBe(0);
    expect(result.current.requiresCaptcha).toBe(false);
  });

  test('should require CAPTCHA after half threshold', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useSuspiciousActivity(config));

    // Record 2 failed attempts (half of 3, rounded up = 2)
    act(() => {
      result.current.recordFailedAttempt('failed_registration');
      result.current.recordFailedAttempt('failed_registration');
    });

    expect(result.current.isSuspicious).toBe(false);
    expect(result.current.requiresCaptcha).toBe(true);
    expect(result.current.failedAttempts).toBe(2);
  });

  test('should detect suspicious activity after threshold', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useSuspiciousActivity(config));

    // Record 3 failed attempts
    act(() => {
      result.current.recordFailedAttempt('failed_registration');
      result.current.recordFailedAttempt('validation_error');
      result.current.recordFailedAttempt('network_error');
    });

    expect(result.current.isSuspicious).toBe(true);
    expect(result.current.requiresCaptcha).toBe(true);
    expect(result.current.failedAttempts).toBe(3);
  });

  test('should reset tracking on successful attempt', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useSuspiciousActivity(config));

    // Record failed attempts
    act(() => {
      result.current.recordFailedAttempt('failed_registration');
      result.current.recordFailedAttempt('failed_registration');
    });

    expect(result.current.requiresCaptcha).toBe(true);

    // Record successful attempt
    act(() => {
      result.current.recordSuccessfulAttempt();
    });

    expect(result.current.isSuspicious).toBe(false);
    expect(result.current.requiresCaptcha).toBe(false);
    expect(result.current.failedAttempts).toBe(0);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('test_suspicious_activity');
  });

  test('should clean up old activities outside time window', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useSuspiciousActivity(config));

    // Record failed attempts
    act(() => {
      result.current.recordFailedAttempt('failed_registration');
      result.current.recordFailedAttempt('failed_registration');
    });

    expect(result.current.failedAttempts).toBe(2);

    // Advance time beyond window
    act(() => {
      vi.advanceTimersByTime(11000);
    });

    // Record new attempt to trigger cleanup
    act(() => {
      result.current.recordFailedAttempt('failed_registration');
    });

    // Should only have the new attempt
    expect(result.current.failedAttempts).toBe(1);
  });

  test('should load activities from localStorage', () => {
    const storedActivities = JSON.stringify([
      { timestamp: Date.now() - 5000, type: 'failed_registration' },
      { timestamp: Date.now() - 3000, type: 'validation_error' },
    ]);
    localStorageMock.getItem.mockReturnValue(storedActivities);
    
    const { result } = renderHook(() => useSuspiciousActivity(config));

    expect(result.current.failedAttempts).toBe(2);
    expect(result.current.requiresCaptcha).toBe(true);
  });

  test('should save activities to localStorage', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useSuspiciousActivity(config));

    act(() => {
      result.current.recordFailedAttempt('failed_registration', 'Test details');
    });

    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  test('should manually reset tracking', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useSuspiciousActivity(config));

    // Record failed attempts
    act(() => {
      result.current.recordFailedAttempt('failed_registration');
      result.current.recordFailedAttempt('failed_registration');
      result.current.recordFailedAttempt('failed_registration');
    });

    expect(result.current.isSuspicious).toBe(true);

    // Reset manually
    act(() => {
      result.current.reset();
    });

    expect(result.current.isSuspicious).toBe(false);
    expect(result.current.requiresCaptcha).toBe(false);
    expect(result.current.failedAttempts).toBe(0);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('test_suspicious_activity');
  });

  test('should handle localStorage errors gracefully', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage not available');
    });
    
    // Should not throw error
    const { result } = renderHook(() => useSuspiciousActivity(config));

    expect(result.current.failedAttempts).toBe(0);
    expect(result.current.isSuspicious).toBe(false);
  });
});