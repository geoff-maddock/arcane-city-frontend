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
            if (filters?.tag) params.append('filters[tag]', toKebabCase(filters.tag));
            if (filters?.entity) params.append('filters[related]', filters.entity);
            if (filters?.event_type) params.append('filters[event_type]', toKebabCase(filters.event_type));
            if (filters?.series) params.append('filters[series]', filters.series);
            if (filters?.description) params.append('filters[description]', filters.description);
            if (filters?.presale_price_min) params.append('filters[presale_price][min]', filters.presale_price_min);
            if (filters?.presale_price_max) params.append('filters[presale_price][max]', filters.presale_price_max);
            if (filters?.door_price_min) params.append('filters[door_price][min]', filters.door_price_min);
            if (filters?.door_price_max) params.append('filters[door_price][max]', filters.door_price_max);
            if (filters?.min_age) params.append('filters[min_age]', filters.min_age);
            if (filters?.is_benefit !== undefined) params.append('filters[is_benefit]', filters.is_benefit.toString());
            if (filters?.created_at?.start) params.append('filters[created_at][start]', filters.created_at.start);
            if (filters?.created_at?.end) params.append('filters[created_at][end]', filters.created_at.end);
            if (filters?.start_at?.start) params.append('filters[start_at][start]', filters.start_at.start);
            if (filters?.start_at?.end) params.append('filters[start_at][end]', filters.start_at.end);
            if (sort) params.append('sort', sort);
            if (direction) params.append('direction', direction);

            const { data } = await api.get<PaginatedResponse<Event>>(`/events?${params.toString()}`);
            return data;
        },
    });
};
