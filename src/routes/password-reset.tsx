import React, { useState } from 'react';
import { createRoute, Link, useSearch, useParams } from '@tanstack/react-router';
import { rootRoute } from './root';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { userService } from '../services/user.service';
import { useFormValidation } from '../hooks/useFormValidation';
import { passwordResetSchema, type PasswordResetFields } from '../validation/schemas';
import { SITE_NAME, DEFAULT_IMAGE } from './../lib/seo';
import { useBackNavigation } from '../context/NavigationContext';

interface PasswordResetSearchParams {
    email?: string;
}

const PasswordReset: React.FC = () => {
    const { token } = useParams({ from: '/password/reset/$token' });
    const { email } = useSearch({ from: '/password/reset/$token' });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const { backHref, isFallback } = useBackNavigation('/login');

    const {
        values,
        handleChange,
        handleBlur,
        validateForm,
        getFieldError,
        generalError,
        setGeneralError,
    } = useFormValidation<PasswordResetFields>({
        initialValues: { password: '', confirmPassword: '' },
        schema: passwordResetSchema,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setGeneralError('');

        if (!email) {
            setError('Email address is required.');
            return;
        }

        if (!token) {
            setError('Reset token is required.');
            return;
        }

        const isValid = validateForm();
        if (!isValid) {
            return;
        }

        setIsLoading(true);
        try {
            await userService.resetPassword({
                email,
                password: values.password,
                secret: import.meta.env.VITE_API_KEY,
                token,
            });
            setMessage('Your password has been successfully reset. You can now log in with your new password.');
            setIsSubmitted(true);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else {
                setError('An error occurred while resetting your password. Please try again or request a new reset link.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="max-w-md mx-auto p-4 space-y-4">
                <h2 className="text-xl font-bold">Password Reset Successful</h2>
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-green-800">{message}</p>
                </div>
                <div className="text-center">
                    <Link
                        to={backHref}
                        className="text-600 hover:text-800 hover:underline"
                    >
                        {isFallback ? 'Go to Login' : 'Back'}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto p-4 space-y-4">
            <h2 className="text-xl font-bold">Reset Your Password</h2>
            <p className="text-gray-600">
                Enter a new password for your account.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                        id="email"
                        type="email"
                        value={email || ''}
                        disabled
                        className="bg-gray-50"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Enter your new password"
                        required
                    />
                    {getFieldError('password') && (
                        <div className="text-red-500 text-sm">{getFieldError('password')}</div>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={values.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Confirm your new password"
                        required
                    />
                    {getFieldError('confirmPassword') && (
                        <div className="text-red-500 text-sm">{getFieldError('confirmPassword')}</div>
                    )}
                </div>

                {(error || generalError) && (
                    <div className="text-red-500 text-sm">{error || generalError}</div>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Resetting Password...' : 'Reset Password'}
                </Button>
            </form>

            <div className="text-center space-y-2">
                <Link
                    to={backHref}
                    className="text-600 hover:text-800 hover:underline block"
                >
                    {isFallback ? 'Back to Login' : 'Back'}
                </Link>
                <div className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link
                        to="/register"
                        className="text-600 hover:text-800 hover:underline"
                    >
                        Sign up
                    </Link>
                </div>
            </div>
        </div>
    );
};

export const PasswordResetRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/password/reset/$token',
    validateSearch: (search: Record<string, unknown>): PasswordResetSearchParams => ({
        email: typeof search.email === 'string' ? search.email : undefined,
    }),
    component: PasswordReset,
    head: () => {
        // Build current absolute URL in the client; SSR fallback to site root
        const url = typeof window !== 'undefined' ? window.location.href : 'https://arcane.city/password/reset';
        return {
            meta: [
                { title: `Password Reset • ${SITE_NAME}` },
                { property: 'og:url', content: `${url}` },
                { property: 'og:type', content: 'website' },
                { property: 'og:title', content: `Password Reset • ${SITE_NAME}` },
                { property: 'og:image', content: DEFAULT_IMAGE },
                { property: 'og:description', content: `Enter your new password to reset your account password.` },
                { name: 'description', content: `Enter your new password to reset your account password.` },
            ],
        };
    },
});