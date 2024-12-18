// src/hooks/useEvents.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Event, PaginatedResponse } from '../types/api';

interface UseEventsParams {
    page?: number;
    itemsPerPage?: number;
    filters?: {
        name?: string;
        venue?: string;
        promoter?: string;
        start_at?: {
            start?: string;
            end?: string;
        };
    };
    sort?: string;
    direction?: 'desc' | 'asc';

}

export const useEvents = ({ page = 1, itemsPerPage = 25, filters, sort, direction }: UseEventsParams = {}) => {
    return useQuery<PaginatedResponse<Event>>({
        queryKey: ['events', page, itemsPerPage, filters, sort, direction],
        queryFn: async () => {
            const params = new URLSearchParams();

            params.append('page', page.toString());
            params.append('limit', itemsPerPage.toString());
            if (filters?.name) params.append('filters[name]', filters.name);
            if (filters?.venue) params.append('filters[venue]', filters.venue);
            if (filters?.promoter) params.append('filters[promoter]', filters.promoter);
            if (filters?.start_at?.start) params.append('filters[start_at][start]', filters.start_at.start);
            if (filters?.start_at?.end) params.append('filters[start_at][end]', filters.start_at.end);
            if (sort) params.append('sort', sort);
            if (direction) params.append('direction', direction);

            const { data } = await api.get<PaginatedResponse<Event>>(`/events?${params.toString()}`);
            return data;
        },
    });
};