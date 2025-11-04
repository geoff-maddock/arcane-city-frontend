import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Activity, PaginatedResponse, UseActivitiesParams } from '../types/api';

export const useActivities = ({ page = 1, itemsPerPage = 25, filters, sort = 'created_at', direction = 'desc' }: UseActivitiesParams = {}) => {
    return useQuery<PaginatedResponse<Activity>>({
        queryKey: ['activities', page, itemsPerPage, filters, sort, direction],
        queryFn: async () => {
            const params = new URLSearchParams();

            params.append('page', page.toString());
            params.append('limit', itemsPerPage.toString());
            if (filters?.object_table) params.append('filters[object_table]', filters.object_table);
            if (filters?.action) params.append('filters[action]', filters.action);
            if (filters?.message) params.append('filters[message]', filters.message);
            if (filters?.user_id) params.append('filters[user_id]', filters.user_id);
            if (sort) params.append('sort', sort);
            if (direction) params.append('direction', direction);

            const { data } = await api.get<PaginatedResponse<Activity>>(`/activities?${params.toString()}`);
            return data;
        },
    });
};
