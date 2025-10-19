// Centralized error handling for the application
import axios, { AxiosError } from 'axios';

/**
 * Standardized error structure for the application
 */
export interface AppError {
    /** User-friendly error message */
    message: string;
    /** HTTP status code if available */
    statusCode?: number;
    /** Error code for programmatic handling */
    code?: string;
    /** Field name for validation errors */
    field?: string;
    /** Original error object for debugging */
    originalError?: unknown;
}

/**
 * Laravel/API validation error structure
 */
export interface ValidationErrors {
    [field: string]: string[];
}

/**
 * API error response structure from the backend
 */
interface ApiErrorResponse {
    message?: string;
    errors?: ValidationErrors;
}

/**
 * Parse validation errors from API response
 * 
 * @param errors - Validation errors object from API
 * @returns Object with field names as keys and error messages as values
 */
export function parseValidationErrors(errors: ValidationErrors): Record<string, string> {
    const fieldErrors: Record<string, string> = {};

    for (const [field, messages] of Object.entries(errors)) {
        // Take the first error message for each field
        fieldErrors[field] = messages[0];
    }

    return fieldErrors;
}

/**
 * Format validation errors into a single message
 * 
 * @param errors - Validation errors object from API
 * @returns Single string with all validation errors
 */
export function formatValidationErrors(errors: ValidationErrors): string {
    const messages = Object.entries(errors).map(([field, msgs]) => {
        const fieldName = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        return `${fieldName}: ${msgs[0]}`;
    });

    return messages.join('; ');
}

/**
 * Handle API errors and convert them to standardized AppError format
 * 
 * @param error - Error from API call (typically AxiosError)
 * @returns Standardized AppError object
 * 
 * @example
 * ```typescript
 * try {
 *   await api.post('/events', data);
 * } catch (error) {
 *   const appError = handleApiError(error);
 *   setError(appError.message);
 * }
 * ```
 */
export function handleApiError(error: unknown): AppError {
    // Handle Axios errors (most common case)
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        const statusCode = axiosError.response?.status;
        const responseData = axiosError.response?.data;

        // Handle validation errors (422 Unprocessable Entity)
        if (statusCode === 422 && responseData?.errors) {
            const firstField = Object.keys(responseData.errors)[0];
            const firstError = responseData.errors[firstField][0];

            return {
                message: firstError,
                statusCode,
                code: 'VALIDATION_ERROR',
                field: firstField,
                originalError: error,
            };
        }

        // Handle authentication errors
        if (statusCode === 401) {
            return {
                message: responseData?.message || 'Authentication required. Please log in.',
                statusCode,
                code: 'UNAUTHORIZED',
                originalError: error,
            };
        }

        // Handle forbidden errors
        if (statusCode === 403) {
            return {
                message: responseData?.message || 'You do not have permission to perform this action.',
                statusCode,
                code: 'FORBIDDEN',
                originalError: error,
            };
        }

        // Handle not found errors
        if (statusCode === 404) {
            return {
                message: responseData?.message || 'The requested resource was not found.',
                statusCode,
                code: 'NOT_FOUND',
                originalError: error,
            };
        }

        // Handle server errors
        if (statusCode && statusCode >= 500) {
            return {
                message: 'A server error occurred. Please try again later.',
                statusCode,
                code: 'SERVER_ERROR',
                originalError: error,
            };
        }

        // Handle network errors
        if (axiosError.code === 'ERR_NETWORK' || !axiosError.response) {
            return {
                message: 'Network error. Please check your connection and try again.',
                code: 'NETWORK_ERROR',
                originalError: error,
            };
        }

        // Generic API error with message from response
        return {
            message: responseData?.message || axiosError.message || 'An error occurred',
            statusCode,
            code: axiosError.code,
            originalError: error,
        };
    }

    // Handle standard JavaScript errors
    if (error instanceof Error) {
        return {
            message: error.message,
            code: error.name,
            originalError: error,
        };
    }

    // Handle unknown error types
    return {
        message: 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
        originalError: error,
    };
}

/**
 * Extract user-friendly message from any error
 * This is a convenience wrapper around handleApiError for simple use cases
 * 
 * @param error - Any error object
 * @returns User-friendly error message string
 * 
 * @example
 * ```typescript
 * try {
 *   await api.post('/events', data);
 * } catch (error) {
 *   toast.error(getErrorMessage(error));
 * }
 * ```
 */
export function getErrorMessage(error: unknown): string {
    return handleApiError(error).message;
}

/**
 * Check if error is a validation error (422)
 * 
 * @param error - Error to check
 * @returns True if error is a validation error
 */
export function isValidationError(error: unknown): boolean {
    if (!axios.isAxiosError(error)) return false;
    return error.response?.status === 422;
}

/**
 * Extract validation errors from API error
 * 
 * @param error - Error from API call
 * @returns Validation errors object or null if not a validation error
 * 
 * @example
 * ```typescript
 * try {
 *   await api.post('/events', data);
 * } catch (error) {
 *   const validationErrors = getValidationErrors(error);
 *   if (validationErrors) {
 *     setFieldErrors(parseValidationErrors(validationErrors));
 *   }
 * }
 * ```
 */
export function getValidationErrors(error: unknown): ValidationErrors | null {
    if (!axios.isAxiosError(error)) return null;

    const axiosError = error as AxiosError<ApiErrorResponse>;
    if (axiosError.response?.status !== 422) return null;

    return axiosError.response?.data?.errors || null;
}

/**
 * Handle form submission errors
 * This is a specialized handler for form submissions that sets appropriate field errors
 * 
 * @param error - Error from form submission
 * @param setFieldErrors - Function to set field-level errors (expects Laravel-style validation errors)
 * @param setGeneralError - Function to set general error message
 * @returns True if error was handled as validation error, false otherwise
 * 
 * @example
 * ```typescript
 * try {
 *   await api.post('/events', formData);
 * } catch (error) {
 *   const wasValidation = handleFormError(
 *     error,
 *     (errors) => applyExternalErrors(errors), // Laravel format
 *     setGeneralError
 *   );
 *   if (!wasValidation) {
 *     // Handle non-validation errors differently if needed
 *   }
 * }
 * ```
 */
export function handleFormError(
    error: unknown,
    setFieldErrors: (errors: ValidationErrors) => void,
    setGeneralError: (message: string) => void
): boolean {
    const validationErrors = getValidationErrors(error);

    if (validationErrors) {
        // Set field-level errors in Laravel format (arrays)
        setFieldErrors(validationErrors);

        // Also set a general error with all validation messages
        setGeneralError(formatValidationErrors(validationErrors));

        return true;
    }

    // Not a validation error, set general error
    const appError = handleApiError(error);
    setGeneralError(appError.message);

    return false;
}

/**
 * Log error to console in development
 * Can be extended to send errors to error tracking service in production
 * 
 * @param error - Error to log
 * @param context - Additional context about where the error occurred
 */
export function logError(error: unknown, context?: string): void {
    if (import.meta.env.DEV) {
        console.error(context ? `[${context}]` : '[Error]', error);
    }

    // TODO: In production, send to error tracking service (e.g., Sentry)
    // if (import.meta.env.PROD) {
    //   Sentry.captureException(error, { tags: { context } });
    // }
}
