// src/__tests__/components/Captcha.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Captcha } from '../../components/ui/captcha';

// Mock hCaptcha component
vi.mock('@hcaptcha/react-hcaptcha', () => ({
  default: React.forwardRef((props: { onVerify: (token: string) => void; onExpire?: () => void; onError?: (error: string) => void; sitekey: string }) => {
    const { onVerify, onExpire, onError, sitekey } = props;
    
    // Mock the behavior - if no sitekey, don't render (similar to real component)
    if (!sitekey) {
      return null;
    }
    
    return (
      <div data-testid="hcaptcha-mock">
        <button 
          onClick={() => onVerify('test-token')}
          data-testid="verify-button"
        >
          Verify
        </button>
        <button 
          onClick={() => onExpire?.()}
          data-testid="expire-button"
        >
          Expire
        </button>
        <button 
          onClick={() => onError?.('test-error')}
          data-testid="error-button"
        >
          Error
        </button>
        <span data-testid="sitekey">{sitekey}</span>
      </div>
    );
  }),
}));

describe('Captcha', () => {
  const mockOnVerify = vi.fn();
  const mockOnExpire = vi.fn();
  const mockOnError = vi.fn();

  beforeEach(() => {
    mockOnVerify.mockClear();
    mockOnExpire.mockClear();
    mockOnError.mockClear();
    
    // Mock console.warn to avoid noise in tests
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('should render CAPTCHA when site key is configured', () => {
    // Mock environment variable
    const originalSiteKey = import.meta.env.VITE_HCAPTCHA_SITE_KEY;
    import.meta.env.VITE_HCAPTCHA_SITE_KEY = 'test-site-key';

    render(
      <Captcha
        onVerify={mockOnVerify}
        onExpire={mockOnExpire}
        onError={mockOnError}
      />
    );

    expect(screen.getByTestId('hcaptcha-mock')).toBeInTheDocument();
    expect(screen.getByTestId('sitekey')).toHaveTextContent('test-site-key');

    // Restore original value
    import.meta.env.VITE_HCAPTCHA_SITE_KEY = originalSiteKey;
  });

  test('should not render CAPTCHA when site key is missing', () => {
    // Mock environment variable as undefined
    const originalSiteKey = import.meta.env.VITE_HCAPTCHA_SITE_KEY;
    delete import.meta.env.VITE_HCAPTCHA_SITE_KEY;

    render(
      <Captcha
        onVerify={mockOnVerify}
        onExpire={mockOnExpire}
        onError={mockOnError}
      />
    );

    expect(screen.queryByTestId('hcaptcha-mock')).not.toBeInTheDocument();
    expect(console.warn).toHaveBeenCalledWith(
      'CAPTCHA is not configured: VITE_HCAPTCHA_SITE_KEY environment variable is missing'
    );

    // Restore original value
    if (originalSiteKey !== undefined) {
      import.meta.env.VITE_HCAPTCHA_SITE_KEY = originalSiteKey;
    }
  });

  test('should call onVerify when CAPTCHA is verified', () => {
    const originalSiteKey = import.meta.env.VITE_HCAPTCHA_SITE_KEY;
    import.meta.env.VITE_HCAPTCHA_SITE_KEY = 'test-site-key';

    render(
      <Captcha
        onVerify={mockOnVerify}
        onExpire={mockOnExpire}
        onError={mockOnError}
      />
    );

    screen.getByTestId('verify-button').click();

    expect(mockOnVerify).toHaveBeenCalledWith('test-token');

    import.meta.env.VITE_HCAPTCHA_SITE_KEY = originalSiteKey;
  });

  test('should call onExpire when CAPTCHA expires', () => {
    const originalSiteKey = import.meta.env.VITE_HCAPTCHA_SITE_KEY;
    import.meta.env.VITE_HCAPTCHA_SITE_KEY = 'test-site-key';

    render(
      <Captcha
        onVerify={mockOnVerify}
        onExpire={mockOnExpire}
        onError={mockOnError}
      />
    );

    screen.getByTestId('expire-button').click();

    expect(mockOnExpire).toHaveBeenCalled();

    import.meta.env.VITE_HCAPTCHA_SITE_KEY = originalSiteKey;
  });

  test('should call onError when CAPTCHA encounters error', () => {
    const originalSiteKey = import.meta.env.VITE_HCAPTCHA_SITE_KEY;
    import.meta.env.VITE_HCAPTCHA_SITE_KEY = 'test-site-key';

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <Captcha
        onVerify={mockOnVerify}
        onExpire={mockOnExpire}
        onError={mockOnError}
      />
    );

    screen.getByTestId('error-button').click();

    expect(mockOnError).toHaveBeenCalledWith('test-error');
    expect(consoleSpy).toHaveBeenCalledWith('CAPTCHA error:', 'test-error');

    consoleSpy.mockRestore();
    import.meta.env.VITE_HCAPTCHA_SITE_KEY = originalSiteKey;
  });

  test('should handle missing onExpire and onError callbacks', () => {
    const originalSiteKey = import.meta.env.VITE_HCAPTCHA_SITE_KEY;
    import.meta.env.VITE_HCAPTCHA_SITE_KEY = 'test-site-key';

    render(
      <Captcha onVerify={mockOnVerify} />
    );

    // Should not throw when callbacks are undefined
    expect(() => {
      screen.getByTestId('expire-button').click();
      screen.getByTestId('error-button').click();
    }).not.toThrow();

    import.meta.env.VITE_HCAPTCHA_SITE_KEY = originalSiteKey;
  });
});