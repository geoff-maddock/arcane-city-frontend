import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { createTestQueryClient } from './test-query-client';

// Wrapper component that provides QueryClient and reCAPTCHA
interface AllTheProvidersProps {
    children: React.ReactNode;
}

export const AllTheProviders: React.FC<AllTheProvidersProps> = ({ children }) => {
    const queryClient = createTestQueryClient();

    return (
        <QueryClientProvider client={queryClient}>
            <GoogleReCaptchaProvider reCaptchaKey="test-recaptcha-key">
                {children}
            </GoogleReCaptchaProvider>
        </QueryClientProvider>
    );
};
