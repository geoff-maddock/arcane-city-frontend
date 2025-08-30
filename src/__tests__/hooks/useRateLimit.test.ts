// src/__tests__/hooks/useRateLimit.test.ts
import { renderHook, act } from '@testing-library/react';
import { useRateLimit } from '../../hooks/useRateLimit';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useRateLimit', () => {
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
    maxAttempts: 3,
    windowMs: 10000, // 10 seconds for testing
    storageKey: 'test_rate_limit',
  };

  test('should initialize with no rate limiting', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useRateLimit(config));

    expect(result.current.isRateLimited).toBe(false);
    expect(result.current.attemptsRemaining).toBe(3);
    expect(result.current.resetTimeMs).toBe(0);
  });

  test('should track attempts and trigger rate limiting', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useRateLimit(config));

    // Make 3 attempts
    act(() => {
      result.current.recordAttempt();
    });
    act(() => {
      result.current.recordAttempt();
    });
    act(() => {
      result.current.recordAttempt();
    });

    expect(result.current.isRateLimited).toBe(true);
    expect(result.current.attemptsRemaining).toBe(0);
    expect(result.current.resetTimeMs).toBeGreaterThan(0);
  });

  test('should reset rate limiting after time window', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result, rerender } = renderHook(() => useRateLimit(config));

    // Make 3 attempts
    act(() => {
      result.current.recordAttempt();
      result.current.recordAttempt();
      result.current.recordAttempt();
    });

    expect(result.current.isRateLimited).toBe(true);

    // Advance time beyond window
    act(() => {
      vi.advanceTimersByTime(11000);
    });

    // Force re-render to recalculate
    rerender();

    // Should be reset now
    expect(result.current.isRateLimited).toBe(false);
    expect(result.current.attemptsRemaining).toBe(3);
  });

  test('should load attempts from localStorage', () => {
    const storedAttempts = JSON.stringify([
      { timestamp: Date.now() - 5000, count: 2 },
    ]);
    localStorageMock.getItem.mockReturnValue(storedAttempts);
    
    const { result } = renderHook(() => useRateLimit(config));

    expect(result.current.attemptsRemaining).toBe(1);
  });

  test('should save attempts to localStorage', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useRateLimit(config));

    act(() => {
      result.current.recordAttempt();
    });

    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  test('should manually reset rate limiting', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useRateLimit(config));

    // Make attempts to trigger rate limiting
    act(() => {
      result.current.recordAttempt();
      result.current.recordAttempt();
      result.current.recordAttempt();
    });

    expect(result.current.isRateLimited).toBe(true);

    // Reset manually
    act(() => {
      result.current.reset();
    });

    expect(result.current.isRateLimited).toBe(false);
    expect(result.current.attemptsRemaining).toBe(3);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('test_rate_limit');
  });

  test('should group rapid attempts within 5 seconds', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useRateLimit(config));

    // Make rapid attempts
    act(() => {
      result.current.recordAttempt();
      vi.advanceTimersByTime(1000); // 1 second
      result.current.recordAttempt();
      vi.advanceTimersByTime(1000); // 1 second
      result.current.recordAttempt();
    });

    // Should be grouped as one attempt record with count 3
    expect(result.current.isRateLimited).toBe(true);
    expect(result.current.attemptsRemaining).toBe(0);
  });
});