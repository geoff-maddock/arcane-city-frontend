import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useMinimalEmbeds } from '../../hooks/useMinimalEmbeds';
import { api } from '../../lib/api';

// Mock the api module
vi.mock('../../lib/api', () => ({
    api: {
        get: vi.fn(),
    },
}));

type MockedApi = {
    get: ReturnType<typeof vi.fn>;
};

const mockApi = api as unknown as MockedApi;

describe('useMinimalEmbeds', () => {
    beforeEach(() => {
        // Clear localStorage and mocks before each test
        localStorage.clear();
        vi.clearAllMocks();
        vi.spyOn(console, 'log').mockImplementation(() => { });
        vi.spyOn(console, 'error').mockImplementation(() => { });
    });

    it('should return empty embeds when disabled', () => {
        const { result } = renderHook(() => useMinimalEmbeds({
            resourceType: 'events',
            slug: 'test-event',
            enabled: false
        }));

        expect(result.current.embeds).toEqual([]);
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(null);
        expect(mockApi.get).not.toHaveBeenCalled();
    });

    it('should return empty embeds when slug is empty', () => {
        const { result } = renderHook(() => useMinimalEmbeds({
            resourceType: 'events',
            slug: '',
            enabled: true
        }));

        expect(result.current.embeds).toEqual([]);
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(null);
        expect(mockApi.get).not.toHaveBeenCalled();
    });

    it('should fetch embeds successfully for events', async () => {
        const mockEmbeds = ['<iframe src="https://player.soundcloud.com/test"></iframe>'];
        mockApi.get.mockResolvedValue({ data: { data: mockEmbeds } });

        const { result } = renderHook(() => useMinimalEmbeds({
            resourceType: 'events',
            slug: 'test-event',
            enabled: true
        }));

        // Initially loading
        expect(result.current.loading).toBe(true);
        expect(result.current.embeds).toEqual([]);

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.embeds).toEqual(mockEmbeds);
        expect(result.current.error).toBe(null);
        expect(mockApi.get).toHaveBeenCalledWith('/events/test-event/minimal-embeds');
    });

    it('should fetch embeds successfully for entities', async () => {
        const mockEmbeds = ['<iframe src="https://bandcamp.com/test"></iframe>'];
        mockApi.get.mockResolvedValue({ data: { data: mockEmbeds } });

        const { result } = renderHook(() => useMinimalEmbeds({
            resourceType: 'entities',
            slug: 'test-entity',
            enabled: true
        }));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.embeds).toEqual(mockEmbeds);
        expect(mockApi.get).toHaveBeenCalledWith('/entities/test-entity/minimal-embeds');
    });

    it('should handle API errors gracefully', async () => {
        const mockError = new Error('API Error');
        mockApi.get.mockRejectedValue(mockError);

        const { result } = renderHook(() => useMinimalEmbeds({
            resourceType: 'events',
            slug: 'test-event',
            enabled: true
        }));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.embeds).toEqual([]);
        expect(result.current.error).toEqual(mockError);
        // Ensure API was called (cache miss)
        expect(mockApi.get).toHaveBeenCalled();
    });

    it('should handle null/undefined data from API', async () => {
        mockApi.get.mockResolvedValue({ data: { data: null } });

        const { result } = renderHook(() => useMinimalEmbeds({
            resourceType: 'events',
            slug: 'test-event',
            enabled: true
        }));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.embeds).toEqual([]);
        expect(result.current.error).toBe(null);
        // Ensure API was called (cache miss)
        expect(mockApi.get).toHaveBeenCalled();
    });

    it('should refetch embeds when refetch is called', async () => {
        const mockEmbeds = ['<iframe src="https://player.soundcloud.com/test"></iframe>'];
        mockApi.get.mockResolvedValue({ data: { data: mockEmbeds } });

        const { result } = renderHook(() => useMinimalEmbeds({
            resourceType: 'events',
            slug: 'test-event',
            enabled: true
        }));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        // Clear previous calls and cache
        mockApi.get.mockClear();
        localStorage.clear();

        // Call refetch
        result.current.refetch();

        await waitFor(() => {
            expect(mockApi.get).toHaveBeenCalledWith('/events/test-event/minimal-embeds');
        });
    });

    it('should update when dependencies change', async () => {
        const mockEmbeds1 = ['<iframe src="https://player.soundcloud.com/test1"></iframe>'];
        const mockEmbeds2 = ['<iframe src="https://player.soundcloud.com/test2"></iframe>'];

        mockApi.get.mockResolvedValueOnce({ data: { data: mockEmbeds1 } });

        const { result, rerender } = renderHook(
            ({ slug }) => useMinimalEmbeds({
                resourceType: 'events',
                slug,
                enabled: true
            }),
            { initialProps: { slug: 'test-event-1' } }
        );

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.embeds).toEqual(mockEmbeds1);

        // Change slug and mock new response
        mockApi.get.mockResolvedValueOnce({ data: { data: mockEmbeds2 } });
        rerender({ slug: 'test-event-2' });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(mockApi.get).toHaveBeenLastCalledWith('/events/test-event-2/minimal-embeds');
    });

    it('should use cache on subsequent calls with same slug', async () => {
        const mockEmbeds = ['<iframe src="https://player.soundcloud.com/test"></iframe>'];
        mockApi.get.mockResolvedValue({ data: { data: mockEmbeds } });

        // First render - should fetch from API
        const { result, unmount } = renderHook(() => useMinimalEmbeds({
            resourceType: 'events',
            slug: 'test-event',
            enabled: true
        }));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.embeds).toEqual(mockEmbeds);
        expect(mockApi.get).toHaveBeenCalledTimes(1);

        // Unmount and clear mock call history
        unmount();
        mockApi.get.mockClear();

        // Second render - should use cache, not fetch from API
        const { result: result2 } = renderHook(() => useMinimalEmbeds({
            resourceType: 'events',
            slug: 'test-event',
            enabled: true
        }));

        // Embeds should be available immediately from cache
        expect(result2.current.embeds).toEqual(mockEmbeds);
        expect(result2.current.loading).toBe(false);
        
        // API should not have been called
        expect(mockApi.get).not.toHaveBeenCalled();
    });
});