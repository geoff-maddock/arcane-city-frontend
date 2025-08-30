// src/components/ui/captcha.tsx
import { forwardRef, useImperativeHandle, useRef } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';

interface CaptchaProps {
  /** Callback when CAPTCHA is successfully verified */
  onVerify: (token: string) => void;
  /** Callback when CAPTCHA verification expires */
  onExpire?: () => void;
  /** Callback when CAPTCHA encounters an error */
  onError?: (error: string) => void;
  /** Size of the CAPTCHA widget */
  size?: 'normal' | 'compact' | 'invisible';
  /** Theme of the CAPTCHA widget */
  theme?: 'light' | 'dark';
  /** Custom class name */
  className?: string;
}

export interface CaptchaRef {
  /** Execute the CAPTCHA (for invisible mode) */
  execute: () => void;
  /** Reset the CAPTCHA */
  reset: () => void;
  /** Get the current response token */
  getResponse: () => string | null;
}

/**
 * CAPTCHA component using hCaptcha for human verification.
 * Helps prevent automated registration attempts and spam.
 */
export const Captcha = forwardRef<CaptchaRef, CaptchaProps>(({
  onVerify,
  onExpire,
  onError,
  size = 'normal',
  theme = 'light',
  className,
}, ref) => {
  const hcaptchaRef = useRef<HCaptcha>(null);

  // Get site key from environment variables
  const siteKey = import.meta.env.VITE_HCAPTCHA_SITE_KEY;

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    execute: () => {
      hcaptchaRef.current?.execute();
    },
    reset: () => {
      hcaptchaRef.current?.resetCaptcha();
    },
    getResponse: () => {
      return hcaptchaRef.current?.getResponse() || null;
    },
  }));

  // Don't render if no site key is configured
  if (!siteKey) {
    console.warn('CAPTCHA is not configured: VITE_HCAPTCHA_SITE_KEY environment variable is missing');
    return null;
  }

  const handleVerify = (token: string) => {
    onVerify(token);
  };

  const handleExpire = () => {
    onExpire?.();
  };

  const handleError = (error: string) => {
    console.error('CAPTCHA error:', error);
    onError?.(error);
  };

  return (
    <div className={className}>
      <HCaptcha
        ref={hcaptchaRef}
        sitekey={siteKey}
        onVerify={handleVerify}
        onExpire={handleExpire}
        onError={handleError}
        size={size}
        theme={theme}
      />
    </div>
  );
});

Captcha.displayName = 'Captcha';