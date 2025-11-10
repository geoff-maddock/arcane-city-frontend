import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLocations } from '../../hooks/useLocations';
import { api } from '../../lib/api';
import type { Location, PaginatedResponse } from '../../types/api';

vi.mock('../../lib/api');

describe('useLocations', () => {
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

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    it('should fetch locations with default parameters', async () => {
        const mockResponse: PaginatedResponse<Location> = {
            data: [
                {
                    id: 1,
                    name: 'Test Location',
                    slug: 'test-location',
                    city: 'Pittsburgh',
                    neighborhood: 'Downtown',
                },
            ],
            current_page: 1,
            last_page: 1,
            per_page: 25,
            total: 1,
        };

        vi.mocked(api.get).mockResolvedValue({ data: mockResponse });

        const { result } = renderHook(() => useLocations(), { wrapper });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data).toEqual(mockResponse);
        expect(api.get).toHaveBeenCalledWith(
            expect.stringContaining('/locations?')
        );
        expect(api.get).toHaveBeenCalledWith(
            expect.stringContaining('page=1')
        );
        expect(api.get).toHaveBeenCalledWith(
            expect.stringContaining('limit=25')
        );
    });

    it('should apply city filter', async () => {
        const mockResponse: PaginatedResponse<Location> = {
            data: [],
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: 0,
        };

        vi.mocked(api.get).mockResolvedValue({ data: mockResponse });

        const { result } = renderHook(
            () => useLocations({ page: 1, itemsPerPage: 10, filters: { city: 'Pittsburgh' } }),
            { wrapper }
        );

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(api.get).toHaveBeenCalledWith(
            expect.stringContaining('filters%5Bcity%5D=Pittsburgh')
        );
    });

    it('should apply neighborhood filter', async () => {
        const mockResponse: PaginatedResponse<Location> = {
            data: [],
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: 0,
        };

        vi.mocked(api.get).mockResolvedValue({ data: mockResponse });

        const { result } = renderHook(
            () => useLocations({ page: 1, itemsPerPage: 10, filters: { neighborhood: 'Downtown' } }),
            { wrapper }
        );

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(api.get).toHaveBeenCalledWith(
            expect.stringContaining('filters%5Bneighborhood%5D=Downtown')
        );
    });

    it('should apply name filter', async () => {
        const mockResponse: PaginatedResponse<Location> = {
            data: [],
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: 0,
        };

        vi.mocked(api.get).mockResolvedValue({ data: mockResponse });

        const { result } = renderHook(
            () => useLocations({ page: 1, itemsPerPage: 10, filters: { name: 'Test' } }),
            { wrapper }
        );

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(api.get).toHaveBeenCalledWith(
            expect.stringContaining('filters%5Bname%5D=Test')
        );
    });
});
