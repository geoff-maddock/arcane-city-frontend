import { QueryClient } from '@tanstack/react-query';

// Create a test QueryClient for React Query
export const createTestQueryClient = () => {
    return new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                staleTime: 0,
                gcTime: 0,
            },
            mutations: {
                retry: false,
            },
        },
    });
};
