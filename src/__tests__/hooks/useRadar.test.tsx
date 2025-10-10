import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useUserAttendingEvents } from '../../hooks/useRadar';
import { authService } from '../../services/auth.service';
import { api } from '../../lib/api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock the auth service
vi.mock('../../services/auth.service', () => ({
    authService: {
        isAuthenticated: vi.fn(),
        getCurrentUser: vi.fn(),
    },
}));

// Mock the API
vi.mock('../../lib/api', () => ({
    api: {
        get: vi.fn(),
    },
}));

describe('useUserAttendingEvents', () => {
    const mockUser = {
        id: 123,
        name: 'Test User',
        email: 'test@example.com',
        status: { id: 1, name: 'Active' },
        email_verified_at: null,
        last_active: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        followed_tags: [],
        followed_entities: [],
        followed_series: [],
        followed_threads: [],
        photos: [],
    };
    const mockEventsResponse = {
        data: [
            {
                id: 1,
                name: 'Test Event 1',
                start_at: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours from now
            },
            {
                id: 2,
                name: 'Test Event 2',
                start_at: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours from now
            },
        ],
        meta: {
            total: 2,
            per_page: 25,
            current_page: 1,
        },
    };

    let queryClient: QueryClient;

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
            },
        });
        
        vi.clearAllMocks();
        vi.mocked(authService.isAuthenticated).mockReturnValue(true);
        vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);
    });

    afterEach(() => {
        queryClient.clear();
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );

    it('should fetch events starting from midnight of current day', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: mockEventsResponse });

        const { result } = renderHook(() => useUserAttendingEvents(), { wrapper });

        // Wait for the query to complete
        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        // Verify the API was called
        expect(api.get).toHaveBeenCalledTimes(1);

        // Get the params that were passed to the API
        const apiCall = vi.mocked(api.get).mock.calls[0];
        const url = apiCall[0] as string;
        
        // Extract the search params from the URL
        const searchParams = new URLSearchParams(url.split('?')[1]);
        const startAtParam = searchParams.get('filters[start_at][start]');

        // Verify the start_at parameter is set to midnight (00:00:00.000) of current day
        expect(startAtParam).toBeTruthy();
        const startAtDate = new Date(startAtParam!);
        
        // Check that the time is set to midnight
        expect(startAtDate.getUTCHours()).toBe(0);
        expect(startAtDate.getUTCMinutes()).toBe(0);
        expect(startAtDate.getUTCSeconds()).toBe(0);
        expect(startAtDate.getUTCMilliseconds()).toBe(0);

        // Check that the date is today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        expect(startAtDate.toISOString()).toBe(today.toISOString());
    });

    it('should include events later in the day', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: mockEventsResponse });

        const { result } = renderHook(() => useUserAttendingEvents(), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        // Verify the response includes events
        expect(result.current.data?.data).toHaveLength(2);
        expect(result.current.data?.data[0].name).toBe('Test Event 1');
        expect(result.current.data?.data[1].name).toBe('Test Event 2');
    });

    it('should not fetch when user is not authenticated', () => {
        vi.mocked(authService.isAuthenticated).mockReturnValue(false);

        const { result } = renderHook(() => useUserAttendingEvents(), { wrapper });

        // The query should not be enabled
        expect(result.current.fetchStatus).toBe('idle');
    });

    it('should sort events by start_at ascending', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: mockEventsResponse });

        const { result } = renderHook(() => useUserAttendingEvents(), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        // Verify the API was called with correct sort parameters
        const apiCall = vi.mocked(api.get).mock.calls[0];
        const url = apiCall[0] as string;
        const searchParams = new URLSearchParams(url.split('?')[1]);

        expect(searchParams.get('sort')).toBe('start_at');
        expect(searchParams.get('direction')).toBe('asc');
    });
});
