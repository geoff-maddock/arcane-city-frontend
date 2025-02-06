import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Event, PaginatedResponse, UseEventsParams } from '../types/api';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { toKebabCase } from '../lib/utils';

interface UseCalendarEventsParams {
    currentDate: Date;
    filters?: UseEventsParams['filters'];
}

export const useCalendarEvents = ({ currentDate, filters }: UseCalendarEventsParams) => {
    return useQuery<PaginatedResponse<Event>>({
        queryKey: ['calendarEvents', currentDate, filters],
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

            // Sort by start date
            params.append('sort', 'start_at');
            params.append('direction', 'asc');

            const { data } = await api.get<PaginatedResponse<Event>>(`/events?${params.toString()}`);
            return data;
        },
    });
};