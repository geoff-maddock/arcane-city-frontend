import React, { useState, useRef } from 'react';
import { createRoute, useNavigate } from '@tanstack/react-router';
import { AxiosError } from 'axios';
import { rootRoute } from './root';
import { userService } from '../services/user.service';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Captcha, type CaptchaRef } from '../components/ui/captcha';
import { useRateLimit, RATE_LIMIT_CONFIGS } from '../hooks/useRateLimit';
import { useSuspiciousActivity, SUSPICIOUS_ACTIVITY_CONFIGS } from '../hooks/useSuspiciousActivity';
import { formatApiError } from '../lib/utils';

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  captcha?: string;
  rateLimit?: string;
  general?: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const captchaRef = useRef<CaptchaRef>(null);

  // Rate limiting for registration attempts
  const rateLimit = useRateLimit(RATE_LIMIT_CONFIGS.REGISTRATION);
  
  // Suspicious activity detection
  const suspiciousActivity = useSuspiciousActivity(SUSPICIOUS_ACTIVITY_CONFIGS.REGISTRATION);

  const validate = (): FieldErrors => {
    const validationErrors: FieldErrors = {};
    
    // Check rate limiting first
    if (rateLimit.isRateLimited) {
      const minutes = Math.ceil(rateLimit.resetTimeMs / (1000 * 60));
      validationErrors.rateLimit = `Too many registration attempts. Please wait ${minutes} minute${minutes > 1 ? 's' : ''} before trying again.`;
      return validationErrors;
    }
    
    if (name.length < 6 || name.length > 60) {
      validationErrors.name = 'Name must be between 6 and 60 characters';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (
      email.length < 6 ||
      email.length > 60 ||
      !emailRegex.test(email)
    ) {
      validationErrors.email = 'Enter a valid email address';
    }
    if (password.length < 8 || password.length > 60) {
      validationErrors.password = 'Password must be between 8 and 60 characters';
    }
    if (password !== confirmPassword) {
      validationErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Check CAPTCHA if required
    if (suspiciousActivity.requiresCaptcha && !captchaToken) {
      validationErrors.captcha = 'Please complete the CAPTCHA verification';
    }
    
    return validationErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setErrors({});
    setIsSubmitting(true);
    
    try {
      // Record the attempt and check rate limiting
      rateLimit.recordAttempt();
      
      await userService.createUser({ name, email, password });
      
      // Registration successful - reset tracking
      suspiciousActivity.recordSuccessfulAttempt();
      
      navigate({ to: '/register/success', search: { name, email } });
    } catch (err) {
      // Record failed attempt for suspicious activity tracking
      const axiosErr = err as AxiosError<{ message?: string; errors?: FieldErrors }>;
      
      if (axiosErr.response?.status === 429) {
        // Rate limited by server
        suspiciousActivity.recordFailedAttempt('failed_registration', 'Server rate limit');
        setErrors({ general: 'Registration temporarily unavailable. Your IP may have been temporarily blocked due to suspicious activity. Please try again later.' });
      } else if (axiosErr.response && axiosErr.response.status >= 400 && axiosErr.response.status < 500) {
        // Client error
        suspiciousActivity.recordFailedAttempt('validation_error', axiosErr.response.data?.message);
        const serverErrors = axiosErr.response.data?.errors;
        if (serverErrors) {
          setErrors(serverErrors);
        } else {
          setErrors({ general: axiosErr.response.data?.message || formatApiError(err) });
        }
      } else {
        // Network or server error
        suspiciousActivity.recordFailedAttempt('network_error', axiosErr.message);
        setErrors({ general: formatApiError(err) });
      }
      
      // Reset CAPTCHA on error
      if (captchaRef.current) {
        captchaRef.current.reset();
        setCaptchaToken(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCaptchaVerify = (token: string) => {
    setCaptchaToken(token);
    setErrors(prev => ({ ...prev, captcha: undefined }));
  };

  const handleCaptchaExpire = () => {
    setCaptchaToken(null);
  };

  const handleCaptchaError = (error: string) => {
    setCaptchaToken(null);
    setErrors(prev => ({ ...prev, captcha: `CAPTCHA error: ${error}` }));
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] xl:min-h-screen w-full bg-white dark:bg-black transition-colors flex items-start xl:items-center">
      <div className="w-full max-w-md mx-auto p-6 xl:p-8 space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Register</h2>
        
        {/* Rate limit warning */}
        {rateLimit.isRateLimited && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
              Registration temporarily limited. Please wait {Math.ceil(rateLimit.resetTimeMs / (1000 * 60))} minute(s) before trying again.
            </p>
          </div>
        )}
        
        {/* Suspicious activity warning */}
        {suspiciousActivity.isSuspicious && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
            <p className="text-red-800 dark:text-red-200 text-sm">
              Multiple failed attempts detected. Additional verification required.
            </p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              disabled={rateLimit.isRateLimited || isSubmitting}
            />
            {errors.name && <div className="text-red-500 text-sm">{errors.name}</div>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              disabled={rateLimit.isRateLimited || isSubmitting}
            />
            {errors.email && <div className="text-red-500 text-sm">{errors.email}</div>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              disabled={rateLimit.isRateLimited || isSubmitting}
            />
            {errors.password && <div className="text-red-500 text-sm">{errors.password}</div>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm Password</Label>
            <Input 
              id="confirm" 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={rateLimit.isRateLimited || isSubmitting}
            />
            {errors.confirmPassword && <div className="text-red-500 text-sm">{errors.confirmPassword}</div>}
          </div>
          
          {/* CAPTCHA - show when suspicious activity is detected */}
          {suspiciousActivity.requiresCaptcha && (
            <div className="space-y-2">
              <Label>Human Verification</Label>
              <Captcha
                ref={captchaRef}
                onVerify={handleCaptchaVerify}
                onExpire={handleCaptchaExpire}
                onError={handleCaptchaError}
                theme="light"
                className="flex justify-center"
              />
              {errors.captcha && <div className="text-red-500 text-sm">{errors.captcha}</div>}
            </div>
          )}
          
          {errors.rateLimit && <div className="text-red-500 text-sm">{errors.rateLimit}</div>}
          {errors.general && <div className="text-red-500 text-sm">{errors.general}</div>}
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={rateLimit.isRateLimited || isSubmitting}
          >
            {isSubmitting ? 'Registering...' : 'Register'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export const RegisterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: Register,
});
