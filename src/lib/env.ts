// Environment variable validation utility
// This ensures all required environment variables are present at startup

interface EnvConfig {
  VITE_API_URL: string;
  VITE_API_USERNAME?: string;
  VITE_API_PASSWORD?: string;
  VITE_API_KEY?: string;
  VITE_RECAPTCHA_SITE_KEY?: string;
  VITE_FRONTEND_URL?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates the environment configuration
 * Returns validation result with errors for missing required variables
 * and warnings for missing optional variables
 */
export function validateEnvironment(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required variables
  if (!import.meta.env.VITE_API_URL) {
    errors.push('VITE_API_URL is required but not set');
  }

  // Optional but recommended variables
  if (!import.meta.env.VITE_FRONTEND_URL) {
    warnings.push('VITE_FRONTEND_URL is not set - some features may not work correctly');
  }

  if (!import.meta.env.VITE_RECAPTCHA_SITE_KEY) {
    warnings.push('VITE_RECAPTCHA_SITE_KEY is not set - CAPTCHA will be disabled');
  }

  // Check for authentication credentials
  const hasUsername = !!import.meta.env.VITE_API_USERNAME;
  const hasPassword = !!import.meta.env.VITE_API_PASSWORD;

  if (hasUsername && !hasPassword) {
    warnings.push('VITE_API_USERNAME is set but VITE_API_PASSWORD is missing');
  } else if (!hasUsername && hasPassword) {
    warnings.push('VITE_API_PASSWORD is set but VITE_API_USERNAME is missing');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Gets the validated environment configuration
 * Throws an error if validation fails
 */
export function getEnvironmentConfig(): EnvConfig {
  const validation = validateEnvironment();

  // Throw error if validation fails
  if (!validation.isValid) {
    const errorMessage = [
      'Environment configuration errors:',
      ...validation.errors.map(err => `  - ${err}`),
      '',
      'Please check your .env file and ensure all required variables are set.',
    ].join('\n');
    throw new Error(errorMessage);
  }

  return {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_API_USERNAME: import.meta.env.VITE_API_USERNAME,
    VITE_API_PASSWORD: import.meta.env.VITE_API_PASSWORD,
    VITE_API_KEY: import.meta.env.VITE_API_KEY,
    VITE_RECAPTCHA_SITE_KEY: import.meta.env.VITE_RECAPTCHA_SITE_KEY,
    VITE_FRONTEND_URL: import.meta.env.VITE_FRONTEND_URL,
  };
}
