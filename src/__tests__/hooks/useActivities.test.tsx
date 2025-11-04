import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useActivities } from '../../hooks/useActivities';
import { api } from '../../lib/api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock the API
vi.mock('../../lib/api', () => ({
    api: {
        get: vi.fn(),
    },
}));

describe('useActivities', () => {
    const mockActivitiesResponse = {
        data: [
            {
                id: 81078,
                object_table: 'event',
                object_id: 6833,
                object_name: "Painted Dog 'Mirror' Album Release Show",
                child_object_table: '',
                child_object_id: 0,
                child_object_name: '',
                action: 'Instagram Post',
                user_id: 1,
                user_full_name: 'Geoffrey Maddock',
                ip_address: '74.109.235.248',
                created_at: '2025-11-04T00:43:00Z',
            },
            {
                id: 81077,
                object_table: 'event',
                object_id: 6833,
                object_name: "Painted Dog 'Mirror' Album Release Show",
                child_object_table: '',
                child_object_id: 0,
                child_object_name: '',
                action: 'Update',
                user_id: 1,
                user_full_name: 'Geoffrey Maddock',
                ip_address: '74.109.235.248',
                created_at: '2025-11-04T00:41:00Z',
            },
        ],
        current_page: 1,
        last_page: 10,
        per_page: 25,
        total: 250,
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
    });

    afterEach(() => {
        queryClient.clear();
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );

    it('should fetch activities with default parameters', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: mockActivitiesResponse });

        const { result } = renderHook(() => useActivities(), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(api.get).toHaveBeenCalledTimes(1);
        const apiCall = vi.mocked(api.get).mock.calls[0];
        const url = apiCall[0] as string;

        expect(url).toContain('/activities?');
        const searchParams = new URLSearchParams(url.split('?')[1]);
        expect(searchParams.get('page')).toBe('1');
        expect(searchParams.get('limit')).toBe('25');
        expect(searchParams.get('sort')).toBe('created_at');
        expect(searchParams.get('direction')).toBe('desc');
    });

    it('should fetch activities with custom pagination', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: mockActivitiesResponse });

        const { result } = renderHook(
            () => useActivities({ page: 2, itemsPerPage: 50 }),
            { wrapper }
        );

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        const apiCall = vi.mocked(api.get).mock.calls[0];
        const url = apiCall[0] as string;
        const searchParams = new URLSearchParams(url.split('?')[1]);

        expect(searchParams.get('page')).toBe('2');
        expect(searchParams.get('limit')).toBe('50');
    });

    it('should apply filters when provided', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: mockActivitiesResponse });

        const { result } = renderHook(
            () => useActivities({
                filters: {
                    object_table: 'event',
                    action: 'Create',
                    message: 'Test message',
                    user_id: '1',
                },
            }),
            { wrapper }
        );

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        const apiCall = vi.mocked(api.get).mock.calls[0];
        const url = apiCall[0] as string;
        const searchParams = new URLSearchParams(url.split('?')[1]);

        expect(searchParams.get('filters[object_table]')).toBe('event');
        expect(searchParams.get('filters[action]')).toBe('Create');
        expect(searchParams.get('filters[message]')).toBe('Test message');
        expect(searchParams.get('filters[user_id]')).toBe('1');
    });

    it('should return correct data structure', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: mockActivitiesResponse });

        const { result } = renderHook(() => useActivities(), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toBeDefined();
        expect(result.current.data?.data).toHaveLength(2);
        expect(result.current.data?.data[0].id).toBe(81078);
        expect(result.current.data?.data[0].object_table).toBe('event');
        expect(result.current.data?.data[0].user_full_name).toBe('Geoffrey Maddock');
    });

    it('should handle sort and direction parameters', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: mockActivitiesResponse });

        const { result } = renderHook(
            () => useActivities({ sort: 'id', direction: 'asc' }),
            { wrapper }
        );

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        const apiCall = vi.mocked(api.get).mock.calls[0];
        const url = apiCall[0] as string;
        const searchParams = new URLSearchParams(url.split('?')[1]);

        expect(searchParams.get('sort')).toBe('id');
        expect(searchParams.get('direction')).toBe('asc');
    });
});
