import { describe, it, expect, vi } from 'vitest';
import { AxiosError } from 'axios';
import {
    handleApiError,
    getErrorMessage,
    isValidationError,
    getValidationErrors,
    parseValidationErrors,
    formatValidationErrors,
    handleFormError,
    logError,
} from '@/lib/errorHandler';

describe('errorHandler', () => {
    describe('parseValidationErrors', () => {
        it('should parse validation errors correctly', () => {
            const errors = {
                name: ['Name is required', 'Name must be unique'],
                email: ['Email is invalid'],
            };

            const result = parseValidationErrors(errors);

            expect(result).toEqual({
                name: 'Name is required',
                email: 'Email is invalid',
            });
        });

        it('should handle empty errors object', () => {
            const result = parseValidationErrors({});
            expect(result).toEqual({});
        });
    });

    describe('formatValidationErrors', () => {
        it('should format validation errors as a single string', () => {
            const errors = {
                name: ['Name is required'],
                email: ['Email is invalid'],
            };

            const result = formatValidationErrors(errors);

            expect(result).toContain('Name: Name is required');
            expect(result).toContain('Email: Email is invalid');
            expect(result).toContain(';');
        });

        it('should format field names with underscores', () => {
            const errors = {
                start_at: ['Start date is required'],
            };

            const result = formatValidationErrors(errors);

            expect(result).toBe('Start At: Start date is required');
        });
    });

    describe('handleApiError', () => {
        it('should handle validation errors (422)', () => {
            const axiosError = {
                isAxiosError: true,
                response: {
                    status: 422,
                    data: {
                        message: 'Validation failed',
                        errors: {
                            name: ['Name is required'],
                            email: ['Email is invalid'],
                        },
                    },
                },
                message: 'Request failed',
            } as AxiosError;

            const result = handleApiError(axiosError);

            expect(result.message).toBe('Name is required');
            expect(result.statusCode).toBe(422);
            expect(result.code).toBe('VALIDATION_ERROR');
            expect(result.field).toBe('name');
        });

        it('should handle unauthorized errors (401)', () => {
            const axiosError = {
                isAxiosError: true,
                response: {
                    status: 401,
                    data: {
                        message: 'Unauthorized',
                    },
                },
                message: 'Request failed',
            } as AxiosError;

            const result = handleApiError(axiosError);

            expect(result.message).toBe('Unauthorized');
            expect(result.statusCode).toBe(401);
            expect(result.code).toBe('UNAUTHORIZED');
        });

        it('should handle forbidden errors (403)', () => {
            const axiosError = {
                isAxiosError: true,
                response: {
                    status: 403,
                    data: {},
                },
                message: 'Forbidden',
            } as AxiosError;

            const result = handleApiError(axiosError);

            expect(result.message).toBe('You do not have permission to perform this action.');
            expect(result.statusCode).toBe(403);
            expect(result.code).toBe('FORBIDDEN');
        });

        it('should handle not found errors (404)', () => {
            const axiosError = {
                isAxiosError: true,
                response: {
                    status: 404,
                    data: {
                        message: 'Event not found',
                    },
                },
                message: 'Request failed',
            } as AxiosError;

            const result = handleApiError(axiosError);

            expect(result.message).toBe('Event not found');
            expect(result.statusCode).toBe(404);
            expect(result.code).toBe('NOT_FOUND');
        });

        it('should handle server errors (500+)', () => {
            const axiosError = {
                isAxiosError: true,
                response: {
                    status: 500,
                    data: {},
                },
                message: 'Internal Server Error',
            } as AxiosError;

            const result = handleApiError(axiosError);

            expect(result.message).toBe('A server error occurred. Please try again later.');
            expect(result.statusCode).toBe(500);
            expect(result.code).toBe('SERVER_ERROR');
        });

        it('should handle network errors', () => {
            const axiosError = {
                isAxiosError: true,
                code: 'ERR_NETWORK',
                message: 'Network Error',
            } as AxiosError;

            const result = handleApiError(axiosError);

            expect(result.message).toBe('Network error. Please check your connection and try again.');
            expect(result.code).toBe('NETWORK_ERROR');
        });

        it('should handle generic axios errors', () => {
            const axiosError = {
                isAxiosError: true,
                response: {
                    status: 400,
                    data: {
                        message: 'Bad Request',
                    },
                },
                message: 'Request failed',
                code: 'ERR_BAD_REQUEST',
            } as AxiosError;

            const result = handleApiError(axiosError);

            expect(result.message).toBe('Bad Request');
            expect(result.statusCode).toBe(400);
            expect(result.code).toBe('ERR_BAD_REQUEST');
        });

        it('should handle standard JavaScript errors', () => {
            const error = new Error('Something went wrong');

            const result = handleApiError(error);

            expect(result.message).toBe('Something went wrong');
            expect(result.code).toBe('Error');
        });

        it('should handle unknown error types', () => {
            const error = 'string error';

            const result = handleApiError(error);

            expect(result.message).toBe('An unexpected error occurred');
            expect(result.code).toBe('UNKNOWN_ERROR');
        });
    });

    describe('getErrorMessage', () => {
        it('should extract message from axios error', () => {
            const axiosError = {
                isAxiosError: true,
                response: {
                    status: 400,
                    data: {
                        message: 'Bad Request',
                    },
                },
                message: 'Request failed',
            } as AxiosError;

            const result = getErrorMessage(axiosError);

            expect(result).toBe('Bad Request');
        });

        it('should extract message from standard error', () => {
            const error = new Error('Test error');
            const result = getErrorMessage(error);
            expect(result).toBe('Test error');
        });
    });

    describe('isValidationError', () => {
        it('should return true for 422 errors', () => {
            const axiosError = {
                isAxiosError: true,
                response: {
                    status: 422,
                    data: {},
                },
            } as AxiosError;

            expect(isValidationError(axiosError)).toBe(true);
        });

        it('should return false for non-422 errors', () => {
            const axiosError = {
                isAxiosError: true,
                response: {
                    status: 400,
                    data: {},
                },
            } as AxiosError;

            expect(isValidationError(axiosError)).toBe(false);
        });

        it('should return false for non-axios errors', () => {
            const error = new Error('Test');
            expect(isValidationError(error)).toBe(false);
        });
    });

    describe('getValidationErrors', () => {
        it('should extract validation errors from 422 response', () => {
            const axiosError = {
                isAxiosError: true,
                response: {
                    status: 422,
                    data: {
                        errors: {
                            name: ['Name is required'],
                            email: ['Email is invalid'],
                        },
                    },
                },
            } as AxiosError;

            const result = getValidationErrors(axiosError);

            expect(result).toEqual({
                name: ['Name is required'],
                email: ['Email is invalid'],
            });
        });

        it('should return null for non-422 errors', () => {
            const axiosError = {
                isAxiosError: true,
                response: {
                    status: 400,
                    data: {},
                },
            } as AxiosError;

            expect(getValidationErrors(axiosError)).toBeNull();
        });

        it('should return null for non-axios errors', () => {
            const error = new Error('Test');
            expect(getValidationErrors(error)).toBeNull();
        });

        it('should return null when errors field is missing', () => {
            const axiosError = {
                isAxiosError: true,
                response: {
                    status: 422,
                    data: {
                        message: 'Validation failed',
                    },
                },
            } as AxiosError;

            expect(getValidationErrors(axiosError)).toBeNull();
        });
    });

    describe('handleFormError', () => {
        it('should handle validation errors and set field errors', () => {
            const setFieldErrors = vi.fn();
            const setGeneralError = vi.fn();

            const axiosError = {
                isAxiosError: true,
                response: {
                    status: 422,
                    data: {
                        errors: {
                            name: ['Name is required'],
                            email: ['Email is invalid'],
                        },
                    },
                },
            } as AxiosError;

            const result = handleFormError(axiosError, setFieldErrors, setGeneralError);

            expect(result).toBe(true);
            expect(setFieldErrors).toHaveBeenCalledWith({
                name: ['Name is required'],
                email: ['Email is invalid'],
            });
            expect(setGeneralError).toHaveBeenCalledWith(
                expect.stringContaining('Name: Name is required')
            );
        });

        it('should handle non-validation errors and set general error only', () => {
            const setFieldErrors = vi.fn();
            const setGeneralError = vi.fn();

            const axiosError = {
                isAxiosError: true,
                response: {
                    status: 500,
                    data: {
                        message: 'Server error',
                    },
                },
            } as AxiosError;

            const result = handleFormError(axiosError, setFieldErrors, setGeneralError);

            expect(result).toBe(false);
            expect(setFieldErrors).not.toHaveBeenCalled();
            expect(setGeneralError).toHaveBeenCalledWith(
                'A server error occurred. Please try again later.'
            );
        });
    });

    describe('logError', () => {
        it('should log errors in development mode', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
            const error = new Error('Test error');

            logError(error, 'Test Context');

            expect(consoleSpy).toHaveBeenCalledWith('[Test Context]', error);

            consoleSpy.mockRestore();
        });

        it('should log errors without context', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
            const error = new Error('Test error');

            logError(error);

            expect(consoleSpy).toHaveBeenCalledWith('[Error]', error);

            consoleSpy.mockRestore();
        });
    });
});
