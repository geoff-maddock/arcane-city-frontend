// src/hooks/useEvents.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Event, PaginatedResponse, UseEventsParams } from '../types/api';
import { toKebabCase } from '../lib/utils';

export const useEvents = ({ page = 1, itemsPerPage = 25, filters, sort = 'start_at', direction = 'asc' }: UseEventsParams = {}) => {
    return useQuery<PaginatedResponse<Event>>({
        queryKey: ['events', page, itemsPerPage, filters, sort, direction],
        queryFn: async () => {
            const params = new URLSearchParams();

            params.append('page', page.toString());
            params.append('limit', itemsPerPage.toString());
            if (filters?.name) params.append('filters[name]', filters.name);
            if (filters?.venue) params.append('filters[venue]', filters.venue);
            if (filters?.promoter) params.append('filters[promoter]', filters.promoter);
            if (filters?.tag) params.append('filters[tag]', filters.tag);
            if (filters?.entity) params.append('filters[related]', filters.entity);
            if (filters?.event_type) params.append('filters[event_type]', toKebabCase(filters.event_type));
            if (filters?.start_at?.start) params.append('filters[start_at][start]', filters.start_at.start);
            if (filters?.start_at?.end) params.append('filters[start_at][end]', filters.start_at.end);
            if (sort) params.append('sort', sort);
            if (direction) params.append('direction', direction);

            const { data } = await api.get<PaginatedResponse<Event>>(`/events?${params.toString()}`);
            return data;
        },
    });
};