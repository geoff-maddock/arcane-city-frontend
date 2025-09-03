import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createTestQueryClient } from './test-query-client';
import { MediaPlayerProvider } from '../context/MediaPlayerContext';

// Wrapper component that provides QueryClient
interface AllTheProvidersProps {
    children: React.ReactNode;
}

export const AllTheProviders: React.FC<AllTheProvidersProps> = ({ children }) => {
    const queryClient = createTestQueryClient();

    return (
        <QueryClientProvider client={queryClient}>
            <MediaPlayerProvider>
                {children}
            </MediaPlayerProvider>
        </QueryClientProvider>
    );
};
