import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Entity, PaginatedResponse } from '../types/api';
import { toKebabCase } from '../lib/utils';
import { authService } from '../services/auth.service';

interface DateRange {
    start?: string;
    end?: string;
}

interface EntityFilters {
    name?: string;
    entity_type?: string;
    role?: string;
    tag?: string;
    entity_status?: string;
    description?: string;
    created_at?: DateRange;
    started_at?: DateRange;
}

interface UseEntitiesParams {
    page?: number;
    itemsPerPage?: number;
    filters?: EntityFilters;
    sort?: string;
    direction?: 'desc' | 'asc';
    followedOnly?: boolean;
}

export const useEntities = ({ page = 1, itemsPerPage = 25, filters, sort = 'name', direction = 'asc', followedOnly = false }: UseEntitiesParams = {}) => {
    const isAuthenticated = authService.isAuthenticated();
    return useQuery<PaginatedResponse<Entity>>({
        queryKey: ['entities', followedOnly ? 'followed' : 'all', page, itemsPerPage, filters, sort, direction],
        queryFn: async () => {
            const params = new URLSearchParams();

            params.append('page', page.toString());
            params.append('limit', itemsPerPage.toString());
            if (filters?.name) params.append('filters[name]', filters.name);
            if (filters?.entity_type) params.append('filters[entity_type]', filters.entity_type);
            if (filters?.role) params.append('filters[role]', filters.role);
            if (filters?.tag) params.append('filters[tag]', toKebabCase(filters.tag));
            if (filters?.entity_status) params.append('filters[entity_status]', filters.entity_status);
            if (filters?.description) params.append('filters[description]', filters.description);
            if (filters?.created_at?.start) params.append('filters[created_at][start]', filters.created_at.start);
            if (filters?.created_at?.end) params.append('filters[created_at][end]', filters.created_at.end);
            if (filters?.started_at?.start) params.append('filters[started_at][start]', filters.started_at.start);
            if (filters?.started_at?.end) params.append('filters[started_at][end]', filters.started_at.end);
            if (sort) params.append('sort', sort);
            if (direction) params.append('direction', direction);

            const endpoint = followedOnly ? '/entities/following' : '/entities';
            const { data } = await api.get<PaginatedResponse<Entity>>(`${endpoint}?${params.toString()}`);
            return data;
        },
        enabled: followedOnly ? isAuthenticated : true,
    });
};