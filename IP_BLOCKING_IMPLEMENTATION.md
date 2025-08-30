# IP Blocking and DDoS Protection Implementation

This document describes the frontend IP blocking and DDoS protection mechanisms implemented to prevent suspicious registration attempts and high-volume attacks.

## Overview

The solution provides multiple layers of protection:

1. **Client-side Rate Limiting** - Prevents rapid successive attempts from the same browser
2. **Suspicious Activity Detection** - Monitors patterns that indicate automated attacks
3. **CAPTCHA Integration** - Human verification when suspicious activity is detected
4. **Enhanced Error Handling** - Better handling of backend IP blocking responses

## Features Implemented

### 1. Rate Limiting Hook (`useRateLimit`)

**File:** `src/hooks/useRateLimit.ts`

Tracks and limits the number of attempts within a time window using localStorage for persistence.

**Configuration:**
- Registration: 3 attempts per 15 minutes
- Login: 5 attempts per 5 minutes
- Password Reset: 10 attempts per hour

**Usage:**
```typescript
const rateLimit = useRateLimit(RATE_LIMIT_CONFIGS.REGISTRATION);

if (rateLimit.isRateLimited) {
  // Show rate limit message
}

// Record an attempt
rateLimit.recordAttempt();
```

### 2. Suspicious Activity Detection (`useSuspiciousActivity`)

**File:** `src/hooks/useSuspiciousActivity.ts`

Monitors failed attempts and triggers additional security measures.

**Features:**
- Tracks different types of failures (validation errors, network errors, etc.)
- Requires CAPTCHA after half the failure threshold
- Marks activity as suspicious after threshold is reached
- Automatically cleans up old activity records

**Usage:**
```typescript
const suspiciousActivity = useSuspiciousActivity(SUSPICIOUS_ACTIVITY_CONFIGS.REGISTRATION);

if (suspiciousActivity.requiresCaptcha) {
  // Show CAPTCHA
}

// Record failed attempt
suspiciousActivity.recordFailedAttempt('failed_registration', 'Details');

// Reset on success
suspiciousActivity.recordSuccessfulAttempt();
```

### 3. CAPTCHA Component (`Captcha`)

**File:** `src/components/ui/captcha.tsx`

Privacy-focused CAPTCHA using hCaptcha for human verification.

**Features:**
- Only renders when site key is configured
- Supports different themes and sizes
- Provides imperative API for external control
- Graceful handling of missing configuration

**Environment Configuration:**
```bash
VITE_HCAPTCHA_SITE_KEY=your-hcaptcha-site-key
```

**Usage:**
```typescript
<Captcha
  onVerify={handleVerify}
  onExpire={handleExpire}
  onError={handleError}
  theme="light"
/>
```

### 4. Enhanced Registration Form

**File:** `src/routes/register.tsx`

The registration form now includes all protection mechanisms:

**Protection Features:**
- Rate limiting with visual feedback
- Suspicious activity warnings
- CAPTCHA requirement for suspicious activity
- Enhanced error handling for IP blocking responses
- Form disabling during rate limit periods
- Loading states and user feedback

**Visual Indicators:**
- Yellow warning boxes for rate limiting
- Red warning boxes for suspicious activity
- CAPTCHA appears automatically when needed
- Clear error messages for different scenarios

## Integration with Backend

The frontend is designed to work with backend IP blocking systems:

### HTTP Status Code Handling

- **429 (Too Many Requests)**: Handled as server-side rate limiting
- **4xx Client Errors**: Tracked as validation or client errors
- **5xx Server Errors**: Tracked as network/server errors

### IP Blocking Messages

The frontend displays appropriate messages when the backend reports IP blocking:

```
"Registration temporarily unavailable. Your IP may have been temporarily blocked due to suspicious activity. Please try again later."
```

## Configuration

### Environment Variables

Add to `.env` file:

```bash
# Required for API communication
VITE_API_URL=http://your-api-url

# Optional: CAPTCHA configuration
VITE_HCAPTCHA_SITE_KEY=your-hcaptcha-site-key
```

### Rate Limiting Configuration

Default configurations can be customized in the hook files:

```typescript
// Registration rate limiting
REGISTRATION: {
  maxAttempts: 3,
  windowMs: 15 * 60 * 1000, // 15 minutes
  storageKey: 'registration_attempts',
}
```

### Suspicious Activity Configuration

```typescript
// Registration suspicious activity detection
REGISTRATION: {
  failedAttemptThreshold: 3,
  windowMs: 30 * 60 * 1000, // 30 minutes
  storageKey: 'suspicious_registration_activity',
}
```

## Testing

Comprehensive test suites are included:

- `src/__tests__/hooks/useRateLimit.test.ts` - Rate limiting functionality
- `src/__tests__/hooks/useSuspiciousActivity.test.ts` - Suspicious activity detection
- `src/__tests__/components/Captcha.test.tsx` - CAPTCHA component

Run tests with:
```bash
npm test -- --run
```

## Privacy and Security Considerations

1. **Local Storage**: All tracking data is stored locally in the browser and automatically expires
2. **Privacy-First CAPTCHA**: Uses hCaptcha which is more privacy-focused than alternatives
3. **No Server Tracking**: Frontend protection works independently without sending tracking data to servers
4. **Graceful Degradation**: All features work without CAPTCHA configuration
5. **User Experience**: Clear feedback and reasonable limits to avoid inconveniencing legitimate users

## Monitoring and Maintenance

### Local Storage Keys

The following localStorage keys are used for tracking:
- `registration_attempts` - Rate limiting data
- `suspicious_registration_activity` - Suspicious activity tracking
- `login_attempts` - Login rate limiting
- `suspicious_login_activity` - Login suspicious activity

### Cleanup

All data automatically expires based on time windows. Manual cleanup can be triggered by calling the `reset()` method on any hook.

### Browser Compatibility

The solution uses modern browser APIs but includes fallbacks:
- localStorage with error handling
- Graceful failure when APIs are unavailable
- Works in private/incognito mode with reduced persistence

## Future Enhancements

Potential improvements:
1. **Device Fingerprinting**: More sophisticated tracking across browser sessions
2. **Machine Learning**: Pattern detection for automated behavior
3. **Progressive Delays**: Increasing delays for repeated violations
4. **IP Geolocation**: Location-based suspicious activity detection
5. **Cross-Tab Coordination**: Shared rate limiting across browser tabs