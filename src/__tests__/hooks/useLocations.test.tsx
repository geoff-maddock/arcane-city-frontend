import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useLocations } from '../../hooks/useLocations';
import { api } from '../../lib/api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock the API
vi.mock('../../lib/api', () => ({
    api: {
        get: vi.fn(),
    },
}));

describe('useLocations', () => {
    const mockLocationsResponse = {
        data: [
            {
                id: 1,
                name: 'The Rex Theater',
                slug: 'the-rex-theater',
                address_one: '1602 E Carson St',
                neighborhood: 'South Side',
                city: 'Pittsburgh',
                state: 'PA',
                postcode: '15203',
                map_url: 'https://maps.google.com/?q=The+Rex+Theater',
            },
            {
                id: 2,
                name: 'Spirit Hall',
                slug: 'spirit-hall',
                address_one: '242 51st St',
                neighborhood: 'Lawrenceville',
                city: 'Pittsburgh',
                state: 'PA',
                postcode: '15201',
            },
        ],
        current_page: 1,
        last_page: 5,
        per_page: 25,
        total: 100,
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

    it('should fetch locations with default parameters', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: mockLocationsResponse });

        const { result } = renderHook(() => useLocations(), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(api.get).toHaveBeenCalledTimes(1);
        const apiCall = vi.mocked(api.get).mock.calls[0];
        const url = apiCall[0] as string;

        expect(url).toContain('/locations?');
        const searchParams = new URLSearchParams(url.split('?')[1]);
        expect(searchParams.get('page')).toBe('1');
        expect(searchParams.get('limit')).toBe('25');
        expect(searchParams.get('sort')).toBe('name');
        expect(searchParams.get('direction')).toBe('asc');
    });

    it('should fetch locations with custom pagination', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: mockLocationsResponse });

        const { result } = renderHook(
            () => useLocations({ page: 2, itemsPerPage: 50 }),
            { wrapper }
        );

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        const apiCall = vi.mocked(api.get).mock.calls[0];
        const url = apiCall[0] as string;
        const searchParams = new URLSearchParams(url.split('?')[1]);

        expect(searchParams.get('page')).toBe('2');
        expect(searchParams.get('limit')).toBe('50');
    });

    it('should apply name filter when provided', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: mockLocationsResponse });

        const { result } = renderHook(
            () => useLocations({
                filters: {
                    name: 'Rex',
                },
            }),
            { wrapper }
        );

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        const apiCall = vi.mocked(api.get).mock.calls[0];
        const url = apiCall[0] as string;
        const searchParams = new URLSearchParams(url.split('?')[1]);

        expect(searchParams.get('filters[name]')).toBe('Rex');
    });

    it('should apply address filter when provided', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: mockLocationsResponse });

        const { result } = renderHook(
            () => useLocations({
                filters: {
                    address_one: 'Carson',
                },
            }),
            { wrapper }
        );

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        const apiCall = vi.mocked(api.get).mock.calls[0];
        const url = apiCall[0] as string;
        const searchParams = new URLSearchParams(url.split('?')[1]);

        expect(searchParams.get('filters[address_one]')).toBe('Carson');
    });

    it('should apply neighborhood filter when provided', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: mockLocationsResponse });

        const { result } = renderHook(
            () => useLocations({
                filters: {
                    neighborhood: 'South Side',
                },
            }),
            { wrapper }
        );

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        const apiCall = vi.mocked(api.get).mock.calls[0];
        const url = apiCall[0] as string;
        const searchParams = new URLSearchParams(url.split('?')[1]);

        expect(searchParams.get('filters[neighborhood]')).toBe('South Side');
    });

    it('should apply city filter when provided', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: mockLocationsResponse });

        const { result } = renderHook(
            () => useLocations({
                filters: {
                    city: 'Pittsburgh',
                },
            }),
            { wrapper }
        );

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        const apiCall = vi.mocked(api.get).mock.calls[0];
        const url = apiCall[0] as string;
        const searchParams = new URLSearchParams(url.split('?')[1]);

        expect(searchParams.get('filters[city]')).toBe('Pittsburgh');
    });

    it('should apply multiple filters when provided', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: mockLocationsResponse });

        const { result } = renderHook(
            () => useLocations({
                filters: {
                    name: 'Rex',
                    city: 'Pittsburgh',
                    neighborhood: 'South Side',
                },
            }),
            { wrapper }
        );

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        const apiCall = vi.mocked(api.get).mock.calls[0];
        const url = apiCall[0] as string;
        const searchParams = new URLSearchParams(url.split('?')[1]);

        expect(searchParams.get('filters[name]')).toBe('Rex');
        expect(searchParams.get('filters[city]')).toBe('Pittsburgh');
        expect(searchParams.get('filters[neighborhood]')).toBe('South Side');
    });

    it('should return correct data structure', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: mockLocationsResponse });

        const { result } = renderHook(() => useLocations(), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toBeDefined();
        expect(result.current.data?.data).toHaveLength(2);
        expect(result.current.data?.data[0].id).toBe(1);
        expect(result.current.data?.data[0].name).toBe('The Rex Theater');
        expect(result.current.data?.data[0].city).toBe('Pittsburgh');
    });

    it('should handle sort and direction parameters', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: mockLocationsResponse });

        const { result } = renderHook(
            () => useLocations({ sort: 'city', direction: 'desc' }),
            { wrapper }
        );

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        const apiCall = vi.mocked(api.get).mock.calls[0];
        const url = apiCall[0] as string;
        const searchParams = new URLSearchParams(url.split('?')[1]);

        expect(searchParams.get('sort')).toBe('city');
        expect(searchParams.get('direction')).toBe('desc');
    });
});
