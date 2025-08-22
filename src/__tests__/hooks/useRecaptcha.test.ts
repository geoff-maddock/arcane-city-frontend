import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { useRecaptcha } from '../../hooks/useRecaptcha';

// Mock the react-google-recaptcha-v3 library
vi.mock('react-google-recaptcha-v3', () => ({
  useGoogleReCaptcha: () => ({
    executeRecaptcha: vi.fn().mockResolvedValue('mock-token')
  })
}));

describe('useRecaptcha', () => {
  it('should return executeRecaptchaAction function', () => {
    const { result } = renderHook(() => useRecaptcha());
    
    expect(result.current.executeRecaptchaAction).toBeDefined();
    expect(typeof result.current.executeRecaptchaAction).toBe('function');
  });

  it('should execute reCAPTCHA and return token', async () => {
    const { result } = renderHook(() => useRecaptcha());
    
    const token = await result.current.executeRecaptchaAction('test-action');
    
    expect(token).toBe('mock-token');
  });
});