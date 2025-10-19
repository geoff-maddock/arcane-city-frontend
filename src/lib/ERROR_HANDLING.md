# Error Handling Guide

This guide explains how to use the centralized error handling system in the Arcane City Frontend application.

## Overview

The `errorHandler.ts` module provides a standardized way to handle errors throughout the application, particularly for API calls. It replaces the scattered error handling logic and provides consistent user feedback.

## Core Concepts

### AppError Interface

All errors are transformed into a standardized `AppError` structure:

```typescript
interface AppError {
  message: string;        // User-friendly error message
  statusCode?: number;    // HTTP status code (if applicable)
  code?: string;          // Error code for programmatic handling
  field?: string;         // Field name for validation errors
  originalError?: unknown; // Original error for debugging
}
```

## Main Functions

### `handleApiError(error: unknown): AppError`

The primary function for handling API errors. Converts any error into a standardized `AppError`.

**Features:**
- ✅ Handles validation errors (422) with field-specific messages
- ✅ Handles authentication errors (401)
- ✅ Handles authorization errors (403)
- ✅ Handles not found errors (404)
- ✅ Handles server errors (500+)
- ✅ Handles network errors
- ✅ Provides user-friendly messages

**Example:**
```typescript
try {
  await api.post('/events', eventData);
} catch (error) {
  const appError = handleApiError(error);
  console.log(appError.message); // User-friendly message
  console.log(appError.code);    // Error code
  console.log(appError.statusCode); // HTTP status
}
```

### `getErrorMessage(error: unknown): string`

Convenience function that extracts just the message from an error.

**Example:**
```typescript
try {
  await api.post('/events', eventData);
} catch (error) {
  toast.error(getErrorMessage(error));
}
```

### `handleFormError(error, setFieldErrors, setGeneralError): boolean`

Specialized handler for form submissions. Automatically separates validation errors from general errors.

**Parameters:**
- `error` - The error from the API call
- `setFieldErrors` - Function to set field-level errors
- `setGeneralError` - Function to set general error message

**Returns:** `true` if it was a validation error, `false` otherwise

**Example:**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    const { data } = await api.post('/events', formData);
    navigate({ to: '/events/$slug', params: { slug: data.slug } });
  } catch (error) {
    // This replaces 15+ lines of error handling code!
    handleFormError(
      error,
      (fieldErrors) => applyExternalErrors(fieldErrors),
      setGeneralError
    );
  }
};
```

### `getValidationErrors(error: unknown): ValidationErrors | null`

Extracts validation errors from a 422 response.

**Example:**
```typescript
try {
  await api.post('/events', eventData);
} catch (error) {
  const validationErrors = getValidationErrors(error);
  if (validationErrors) {
    // Handle validation errors
    console.log(validationErrors);
    // { name: ['Name is required'], email: ['Email is invalid'] }
  }
}
```

### `parseValidationErrors(errors: ValidationErrors): Record<string, string>`

Converts Laravel-style validation errors (arrays) to simple key-value pairs.

**Example:**
```typescript
const validationErrors = {
  name: ['Name is required', 'Name must be unique'],
  email: ['Email is invalid'],
};

const parsed = parseValidationErrors(validationErrors);
// Result: { name: 'Name is required', email: 'Email is invalid' }
```

### `formatValidationErrors(errors: ValidationErrors): string`

Formats all validation errors into a single readable string.

**Example:**
```typescript
const validationErrors = {
  name: ['Name is required'],
  start_at: ['Start date is invalid'],
};

const message = formatValidationErrors(validationErrors);
// Result: "Name: Name is required; Start At: Start date is invalid"
```

### `isValidationError(error: unknown): boolean`

Checks if an error is a validation error (422 status).

**Example:**
```typescript
try {
  await api.post('/events', eventData);
} catch (error) {
  if (isValidationError(error)) {
    console.log('Form has validation errors');
  } else {
    console.log('Other type of error');
  }
}
```

### `logError(error: unknown, context?: string): void`

Logs errors to console in development. Can be extended for production error tracking.

**Example:**
```typescript
try {
  await api.post('/events', eventData);
} catch (error) {
  logError(error, 'EventCreate.handleSubmit');
  throw error;
}
```

## Migration Guide

### Before (Old Pattern)

```typescript
import { AxiosError } from 'axios';
import { formatApiError } from '@/lib/utils';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const { data } = await api.post('/events', payload);
    navigate({ to: '/events/$slug', params: { slug: data.slug } });
  } catch (err) {
    if ((err as AxiosError).response?.status === 422) {
      const resp = (err as AxiosError<{ errors: ValidationErrors }>).response;
      if (resp?.data?.errors) {
        const fieldMsgs = Object.entries(resp.data.errors).map(
          ([f, errs]) => `${f}: ${errs[0]}`
        );
        setGeneralError(fieldMsgs.join('; '));
        return;
      }
    }
    setGeneralError(formatApiError(err));
  }
};
```

### After (New Pattern)

```typescript
import { handleFormError } from '@/lib/errorHandler';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const { data } = await api.post('/events', payload);
    navigate({ to: '/events/$slug', params: { slug: data.slug } });
  } catch (error) {
    handleFormError(
      error,
      (fieldErrors) => applyExternalErrors(fieldErrors),
      setGeneralError
    );
  }
};
```

**Benefits:**
- ✅ Reduces code from ~15 lines to ~5 lines
- ✅ Removes type assertions (`as AxiosError`)
- ✅ Consistent error handling across all forms
- ✅ Better user feedback with formatted messages
- ✅ Easier to test and maintain

## Common Use Cases

### 1. Simple API Call with Toast Notification

```typescript
import { getErrorMessage } from '@/lib/errorHandler';
import { toast } from '@/components/ui/use-toast';

async function deleteEvent(slug: string) {
  try {
    await api.delete(`/events/${slug}`);
    toast({ title: 'Event deleted successfully' });
  } catch (error) {
    toast({
      title: 'Error',
      description: getErrorMessage(error),
      variant: 'destructive',
    });
  }
}
```

### 2. Form Submission with Field-Level Errors

```typescript
import { handleFormError } from '@/lib/errorHandler';

const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
const [generalError, setGeneralError] = useState('');

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setFieldErrors({});
  setGeneralError('');
  
  try {
    await api.post('/events', formData);
    navigate({ to: '/events' });
  } catch (error) {
    handleFormError(error, setFieldErrors, setGeneralError);
  }
};
```

### 3. Conditional Error Handling

```typescript
import { handleApiError, isValidationError } from '@/lib/errorHandler';

try {
  await api.post('/events', eventData);
} catch (error) {
  if (isValidationError(error)) {
    // Handle validation errors specially
    const appError = handleApiError(error);
    showFieldError(appError.field!, appError.message);
  } else {
    // Handle other errors
    const appError = handleApiError(error);
    if (appError.statusCode === 401) {
      redirectToLogin();
    } else {
      showGeneralError(appError.message);
    }
  }
}
```

### 4. React Query Error Handling

```typescript
import { handleApiError } from '@/lib/errorHandler';
import { useMutation } from '@tanstack/react-query';

const mutation = useMutation({
  mutationFn: (data) => api.post('/events', data),
  onError: (error) => {
    const appError = handleApiError(error);
    toast({
      title: 'Error',
      description: appError.message,
      variant: 'destructive',
    });
  },
});
```

### 5. Error Logging with Context

```typescript
import { logError, handleApiError } from '@/lib/errorHandler';

async function importEvents(file: File) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    await api.post('/events/import', formData);
  } catch (error) {
    logError(error, 'EventImport.importEvents');
    const appError = handleApiError(error);
    throw new Error(appError.message);
  }
}
```

## Best Practices

### ✅ DO

- **Use `handleFormError` for all form submissions** - It handles both validation and general errors
- **Use `getErrorMessage` for simple cases** - When you just need a message string
- **Log errors with context** - Use `logError(error, 'ComponentName.functionName')`
- **Display user-friendly messages** - The error handler provides good defaults
- **Handle authentication errors globally** - Consider using an interceptor

### ❌ DON'T

- **Don't use type assertions** - Let the error handler deal with types
- **Don't duplicate error handling logic** - Use the centralized functions
- **Don't expose technical details to users** - The error handler provides user-friendly messages
- **Don't swallow errors silently** - Always log or handle them
- **Don't use `formatApiError` for new code** - It's deprecated, use `getErrorMessage` instead

## Error Messages by Status Code

The error handler provides these default messages:

| Status | Message |
|--------|---------|
| 401 | "Authentication required. Please log in." |
| 403 | "You do not have permission to perform this action." |
| 404 | "The requested resource was not found." |
| 422 | First validation error message |
| 500+ | "A server error occurred. Please try again later." |
| Network | "Network error. Please check your connection and try again." |

## Testing

The error handler is fully tested. See `src/__tests__/lib/errorHandler.test.ts` for examples.

**Example test:**
```typescript
import { handleApiError } from '@/lib/errorHandler';

it('should handle validation errors', () => {
  const error = createAxiosError(422, {
    errors: { name: ['Name is required'] }
  });
  
  const result = handleApiError(error);
  
  expect(result.message).toBe('Name is required');
  expect(result.code).toBe('VALIDATION_ERROR');
  expect(result.field).toBe('name');
});
```

## Future Enhancements

Planned improvements:

1. **Error Tracking Integration** - Send errors to Sentry in production
2. **Retry Logic** - Automatic retry for network errors
3. **Rate Limiting** - Handle 429 errors with retry-after
4. **Offline Detection** - Better handling of offline state
5. **Error Recovery** - Automatic token refresh for 401 errors

## Questions?

If you have questions about error handling, check:

1. This documentation
2. The tests in `src/__tests__/lib/errorHandler.test.ts`
3. Example usage in `src/routes/tag-create.tsx`
4. The source code in `src/lib/errorHandler.ts`
