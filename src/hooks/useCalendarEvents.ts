import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { authService } from '../services/auth.service';
import type { Event, PaginatedResponse, UseEventsParams } from '../types/api';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { toKebabCase } from '../lib/utils';

interface UseCalendarEventsParams {
    currentDate: Date;
    filters?: UseEventsParams['filters'];
    attendingOnly?: boolean;
}

export const useCalendarEvents = ({ currentDate, filters, attendingOnly = false }: UseCalendarEventsParams) => {
    const isAuthenticated = authService.isAuthenticated();
    return useQuery<PaginatedResponse<Event>>({
        queryKey: ['calendarEvents', attendingOnly ? 'attending' : 'all', currentDate, filters],
        queryFn: async () => {
            const params = new URLSearchParams();

            // Set high limit for calendar view
            params.append('limit', '1000');
            params.append('page', '1');

            // Calculate month range
            const monthStart = format(startOfMonth(currentDate), 'yyyy-MM-dd');
            const monthEnd = format(endOfMonth(currentDate), 'yyyy-MM-dd');

            // Always include date range
            params.append('filters[start_at][start]', monthStart);
            params.append('filters[start_at][end]', monthEnd);

            // Add other filters
            if (filters?.name) params.append('filters[name]', filters.name);
            if (filters?.venue) params.append('filters[venue]', filters.venue);
            if (filters?.promoter) params.append('filters[promoter]', filters.promoter);
            if (filters?.tag) params.append('filters[tag]', toKebabCase(filters.tag));
            if (filters?.entity) params.append('filters[related]', filters.entity);
            if (filters?.event_type) params.append('filters[event_type]', toKebabCase(filters.event_type));
            if (filters?.presale_price_min) params.append('filters[presale_price][min]', filters.presale_price_min);
            if (filters?.presale_price_max) params.append('filters[presale_price][max]', filters.presale_price_max);
            if (filters?.door_price_min) params.append('filters[door_price][min]', filters.door_price_min);
            if (filters?.door_price_max) params.append('filters[door_price][max]', filters.door_price_max);
            if (filters?.min_age) params.append('filters[min_age]', filters.min_age);
            if (filters?.is_benefit !== undefined) params.append('filters[is_benefit]', filters.is_benefit.toString());

            // Sort by start date
            params.append('sort', 'start_at');
            params.append('direction', 'asc');

            const endpoint = attendingOnly ? '/events/attending' : '/events';
            const { data } = await api.get<PaginatedResponse<Event>>(`${endpoint}?${params.toString()}`);
            return data;
        },
        enabled: attendingOnly ? isAuthenticated : true,
    });
};
