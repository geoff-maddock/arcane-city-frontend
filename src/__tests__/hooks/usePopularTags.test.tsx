import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { usePopularTags } from '../../hooks/usePopularTags';
import { api } from '../../lib/api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock the API
vi.mock('../../lib/api', () => ({
    api: {
        get: vi.fn(),
    },
}));

describe('usePopularTags', () => {
    const mockPopularTagsResponse = {
        data: [
            {
                id: 24,
                name: 'Electronic',
                slug: 'electronic',
                description: null,
                tag_type_id: 1,
                tag_type: {
                    id: 1,
                    name: 'Genre',
                    created_at: '2016-02-25T12:54:14.000000Z',
                    updated_at: '2016-02-25T12:54:14.000000Z',
                },
                created_at: '2016-02-29T13:45:26.000000Z',
                updated_at: '2025-08-14T01:51:52.000000Z',
                created_by: 1,
                updated_by: 1,
                popularity_score: 16,
            },
            {
                id: 42,
                name: 'Punk',
                slug: 'punk',
                description: null,
                tag_type_id: 1,
                tag_type: {
                    id: 1,
                    name: 'Genre',
                    created_at: '2016-02-25T12:54:14.000000Z',
                    updated_at: '2016-02-25T12:54:14.000000Z',
                },
                created_at: '2016-03-06T05:42:40.000000Z',
                updated_at: '2025-08-14T01:51:53.000000Z',
                created_by: 1,
                updated_by: 1,
                popularity_score: 10,
            },
        ],
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 2,
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

    it('should fetch popular tags with default parameters', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: mockPopularTagsResponse });

        const { result } = renderHook(() => usePopularTags(), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(api.get).toHaveBeenCalledTimes(1);
        const apiCall = vi.mocked(api.get).mock.calls[0];
        const url = apiCall[0] as string;

        expect(url).toContain('/tags/popular?');
        const searchParams = new URLSearchParams(url.split('?')[1]);
        expect(searchParams.get('days')).toBe('60');
        expect(searchParams.get('limit')).toBe('5');
        expect(searchParams.get('style')).toBe('future');
    });

    it('should fetch popular tags with custom parameters', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: mockPopularTagsResponse });

        const { result } = renderHook(
            () => usePopularTags({ days: 30, limit: 10, style: 'past' }),
            { wrapper }
        );

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        const apiCall = vi.mocked(api.get).mock.calls[0];
        const url = apiCall[0] as string;
        const searchParams = new URLSearchParams(url.split('?')[1]);

        expect(searchParams.get('days')).toBe('30');
        expect(searchParams.get('limit')).toBe('10');
        expect(searchParams.get('style')).toBe('past');
    });

    it('should return correct data structure with popularity scores', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: mockPopularTagsResponse });

        const { result } = renderHook(() => usePopularTags(), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toBeDefined();
        expect(result.current.data?.data).toHaveLength(2);
        expect(result.current.data?.data[0].id).toBe(24);
        expect(result.current.data?.data[0].name).toBe('Electronic');
        expect(result.current.data?.data[0].slug).toBe('electronic');
        expect(result.current.data?.data[0].popularity_score).toBe(16);
        expect(result.current.data?.data[1].popularity_score).toBe(10);
    });
});
