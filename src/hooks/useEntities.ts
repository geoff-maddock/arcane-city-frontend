import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Entity, PaginatedResponse } from '../types/api';

interface UseEntitiesParams {
    page?: number;
    itemsPerPage?: number;
    filters?: {
        name?: string;
        type?: string;
        status?: string;
        start_at?: {
            start?: string;
            end?: string;
        };
    };
    sort?: string;
    direction?: 'desc' | 'asc';
}

export const useEntities = ({ page = 1, itemsPerPage = 25, filters, sort = 'name', direction = 'asc' }: UseEntitiesParams = {}) => {
    return useQuery<PaginatedResponse<Entity>>({
        queryKey: ['entities', page, itemsPerPage, filters, sort, direction],
        queryFn: async () => {
            const params = new URLSearchParams();

            params.append('page', page.toString());
            params.append('limit', itemsPerPage.toString());
            if (filters?.name) params.append('filters[name]', filters.name);
            if (filters?.type) params.append('filters[type]', filters.type);
            if (filters?.status) params.append('filters[status]', filters.status);
            if (filters?.start_at?.start) params.append('filters[start_at][start]', filters.start_at.start);
            if (filters?.start_at?.end) params.append('filters[start_at][end]', filters.start_at.end);
            if (sort) params.append('sort', sort);
            if (direction) params.append('direction', direction);

            const { data } = await api.get<PaginatedResponse<Entity>>(`/entities?${params.toString()}`);
            return data;
        },
    });
};