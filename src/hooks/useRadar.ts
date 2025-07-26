import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Event, PaginatedResponse } from '../types/api';
import { authService } from '../services/auth.service';

export const useUserAttendingEvents = () => {
    const { data: user } = useQuery({
        queryKey: ['currentUser'],
        queryFn: authService.getCurrentUser,
        enabled: authService.isAuthenticated(),
    });

    return useQuery<PaginatedResponse<Event>>({
        queryKey: ['userAttendingEvents', user?.id],
        queryFn: async () => {
            console.log('Fetching user attending events for user:', user?.id);
            if (!user?.id) throw new Error('User ID not available');

            const params = new URLSearchParams();
            // Filter for future events only
            params.append('filters[start_at][start]', new Date().toISOString());
            // Sort by start date, oldest to newest
            params.append('sort', 'start_at');
            params.append('direction', 'asc');

            //const { data } = await api.get<PaginatedResponse<Event>>(`/users/${user.id}/events-attending?${params.toString()}`);
            const { data } = await api.get<PaginatedResponse<Event>>(`/events/attending?${params.toString()}`);
            return data;
        },
        enabled: authService.isAuthenticated() && !!user?.id,
    });
};

export const useUserRecommendedEvents = () => {
    const { data: user } = useQuery({
        queryKey: ['currentUser'],
        queryFn: authService.getCurrentUser,
        enabled: authService.isAuthenticated(),
    });

    return useQuery<Event[]>({
        queryKey: ['userRecommendedEvents', user?.id],
        queryFn: async () => {
            if (!user?.id) throw new Error('User ID not available');
            try {
                // Try the recommended events endpoint first
                const { data } = await api.get<PaginatedResponse<Event> | Event[]>(`/events/recommended`);

                // Handle both paginated and non-paginated responses
                if (Array.isArray(data)) {
                    return data;
                } else {
                    // If paginated, extract the data array
                    return data.data || [];
                }
            } catch (error) {
                // If the endpoint doesn't exist, return empty array for now
                console.warn('Recommended events endpoint not available:', error);
                return [];
            }
        },
        enabled: authService.isAuthenticated() && !!user?.id,
    });
};

export const useRecentEvents = (limit: number = 10) => {
    return useQuery<PaginatedResponse<Event>>({
        queryKey: ['recentEvents', limit],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.append('limit', limit.toString());
            params.append('sort', 'created_at');
            params.append('direction', 'desc');

            const { data } = await api.get<PaginatedResponse<Event>>(`/events?${params.toString()}`);
            return data;
        },
    });
};
