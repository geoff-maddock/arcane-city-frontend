import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Tag, PaginatedResponse } from '../types/api';

export interface TagFilters {
    name?: string;
    description?: string;
    created_at?: {
        start?: string;
        end?: string;
    };
}

interface UseTagsParams {
    page?: number;
    itemsPerPage?: number;
    filters?: TagFilters;
    sort?: string;
    direction?: 'desc' | 'asc';
}

export const useTags = ({ page = 1, itemsPerPage = 25, filters, sort = 'name', direction = 'asc' }: UseTagsParams = {}) => {
    return useQuery<PaginatedResponse<Tag>>({
        queryKey: ['tags', page, itemsPerPage, filters, sort, direction],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('limit', itemsPerPage.toString());
            if (filters?.name) params.append('filters[name]', filters.name);
            if (filters?.description) params.append('filters[description]', filters.description);
            if (filters?.created_at?.start) params.append('filters[created_at][start]', filters.created_at.start);
            if (filters?.created_at?.end) params.append('filters[created_at][end]', filters.created_at.end);
            if (sort) params.append('sort', sort);
            if (direction) params.append('direction', direction);

            const { data } = await api.get<PaginatedResponse<Tag>>(`/tags?${params.toString()}`);
            return data;
        },
    });
};
