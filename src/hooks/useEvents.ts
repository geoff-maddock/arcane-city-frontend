// src/hooks/useEvents.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Event } from '../types/api';

interface EventsResponse {
    data: Event[];
    current_page: number;
    total: number;
    per_page: number;
}

interface UseEventsParams {
    page?: number;
    filters?: {
        name?: string;
        venue?: string;
        promoter?: string;
        start_at?: {
            start?: string;
            end?: string;
        };
    };
}

export const useEvents = ({ page = 1, filters }: UseEventsParams = {}) => {
    return useQuery({
        queryKey: ['events', page, filters],
        queryFn: async () => {
            const params = new URLSearchParams();

            if (filters?.name) params.append('filters[name]', filters.name);
            if (filters?.venue) params.append('filters[venue]', filters.venue);
            if (filters?.promoter) params.append('filters[promoter]', filters.promoter);
            if (filters?.start_at?.start) params.append('filters[start_at][start]', filters.start_at.start);
            if (filters?.start_at?.end) params.append('filters[start_at][end]', filters.start_at.end);

            const { data } = await api.get<EventsResponse>(`/events?${params.toString()}`);
            return data;
        },
    });
};