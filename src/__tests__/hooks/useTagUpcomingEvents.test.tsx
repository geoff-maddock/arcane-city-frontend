import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTagUpcomingEvents } from '../../hooks/useTagUpcomingEvents';
import { api } from '../../lib/api';
import { AllTheProviders } from '../test-utils';

vi.mock('../../lib/api', () => ({
    api: {
        get: vi.fn(),
    },
}));

describe('useTagUpcomingEvents', () => {
    const mockEvents = [
        {
            id: 1,
            name: 'Event 1',
            slug: 'event-1',
            start_at: '2025-12-01T20:00:00Z',
            primary_photo: 'photo1.jpg',
            event_type: { id: 1, name: 'Concert', slug: 'concert' },
        },
        {
            id: 2,
            name: 'Event 2',
            slug: 'event-2',
            start_at: '2025-12-02T20:00:00Z',
            primary_photo: 'photo2.jpg',
            event_type: { id: 2, name: 'Festival', slug: 'festival' },
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('fetches upcoming events for a tag', async () => {
        vi.mocked(api.get).mockResolvedValue({
            data: {
                data: mockEvents,
                current_page: 1,
                last_page: 1,
                per_page: 4,
                total: 2,
            },
        });

        const { result } = renderHook(
            () => useTagUpcomingEvents({ tagSlug: 'electronic', limit: 4 }),
            { wrapper: AllTheProviders }
        );

        await waitFor(() => {
            expect(result.current.data).toEqual(mockEvents);
        });

        expect(api.get).toHaveBeenCalledWith(
            expect.stringContaining('/events?')
        );
        
        const callUrl = vi.mocked(api.get).mock.calls[0][0] as string;
        const params = new URLSearchParams(callUrl.split('?')[1]);
        
        expect(params.get('filters[tag]')).toBe('electronic');
        expect(params.get('limit')).toBe('4');
        expect(params.get('sort')).toBe('start_at');
        expect(params.get('direction')).toBe('asc');
        expect(params.get('filters[start_at][start]')).toBeTruthy();
    });

    it('returns empty array when no events found', async () => {
        vi.mocked(api.get).mockResolvedValue({
            data: {
                data: [],
                current_page: 1,
                last_page: 1,
                per_page: 4,
                total: 0,
            },
        });

        const { result } = renderHook(
            () => useTagUpcomingEvents({ tagSlug: 'unknown-tag', limit: 4 }),
            { wrapper: AllTheProviders }
        );

        await waitFor(() => {
            expect(result.current.data).toEqual([]);
        });
    });

    it('uses custom limit parameter', async () => {
        vi.mocked(api.get).mockResolvedValue({
            data: {
                data: mockEvents.slice(0, 2),
                current_page: 1,
                last_page: 1,
                per_page: 2,
                total: 2,
            },
        });

        renderHook(
            () => useTagUpcomingEvents({ tagSlug: 'electronic', limit: 2 }),
            { wrapper: AllTheProviders }
        );

        await waitFor(() => {
            expect(api.get).toHaveBeenCalled();
        });

        const callUrl = vi.mocked(api.get).mock.calls[0][0] as string;
        const params = new URLSearchParams(callUrl.split('?')[1]);
        
        expect(params.get('limit')).toBe('2');
    });
});
