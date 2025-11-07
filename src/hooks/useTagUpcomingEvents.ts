import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Event, PaginatedResponse } from '../types/api';

interface UseTagUpcomingEventsParams {
    tagSlug: string;
    limit?: number;
}

export const useTagUpcomingEvents = ({ tagSlug, limit = 4 }: UseTagUpcomingEventsParams) => {
    return useQuery<Event[]>({
        queryKey: ['tagUpcomingEvents', tagSlug, limit],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.append('page', '1');
            params.append('limit', limit.toString());
            params.append('filters[tag]', tagSlug);
            params.append('sort', 'start_at');
            params.append('direction', 'asc');
            
            // Filter for upcoming events (start_at after now)
            const now = new Date().toISOString();
            params.append('filters[start_at][start]', now);

            const { data } = await api.get<PaginatedResponse<Event>>(`/events?${params.toString()}`);
            return data.data;
        },
    });
};
