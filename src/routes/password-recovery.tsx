import React, { useState } from 'react';
import { createRoute, Link } from '@tanstack/react-router';
import { rootRoute } from './root';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { userService } from '../services/user.service';
import { SITE_NAME, DEFAULT_IMAGE } from './../lib/seo';

const PasswordRecovery: React.FC = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!email) {
            setError('Please enter your email address');
            return;
        }

        try {
            await userService.sendPasswordResetEmail(email);
            setMessage('If an account with this email exists, you will receive a password recovery link shortly.');
            setIsSubmitted(true);
        } catch {
            setError('An error occurred. Please try again.');
        }
    };

    if (isSubmitted) {
        return (
            <div className="max-w-md mx-auto p-4 space-y-4">
                <h2 className="text-xl font-bold">Check Your Email</h2>
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-green-800">{message}</p>
                </div>
                <div className="text-center">
                    <Link
                        to="/login"
                        className="text-600 hover:text-800 hover:underline"
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto p-4 space-y-4">
            <h2 className="text-xl font-bold">Password Recovery</h2>
            <p className="text-gray-600">
                Enter your email address and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        required
                    />
                </div>

                {error && <div className="text-red-500 text-sm">{error}</div>}

                <Button type="submit" className="w-full">
                    Send Recovery Link
                </Button>
            </form>

            <div className="text-center space-y-2">
                <Link
                    to="/login"
                    className="text-600 hover:text-800 hover:underline block"
                >
                    Back to Login
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

export const PasswordRecoveryRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/password-recovery',
    component: PasswordRecovery,
    head: () => {
        // Build current absolute URL in the client; SSR fallback to site root
        const url = typeof window !== 'undefined' ? window.location.href : 'https://arcane.city/password-recovery';
        return {
            meta: [
                { title: `Password Recovery • ${SITE_NAME}` },
                { property: 'og:url', content: `${url}` },
                { property: 'og:type', content: 'website' },
                { property: 'og:title', content: `Password Recovery • ${SITE_NAME}` },
                { property: 'og:image', content: DEFAULT_IMAGE },
                { property: 'og:description', content: `Enter your email address to receive a password recovery link.` },
                { name: 'description', content: `Enter your email address to receive a password recovery link.` },
            ],
        };
    },
});
