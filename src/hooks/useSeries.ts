import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Series, PaginatedResponse } from '../types/api';
import { toKebabCase, stableStringify } from '../lib/utils';

interface DateRange {
    start?: string;
    end?: string;
}

interface SeriesFilters {
    name?: string;
    event_type?: string;
    tag?: string;
    entity?: string;
    description?: string;
    created_at?: DateRange;
}

interface UseSeriesParams {
    page?: number;
    itemsPerPage?: number;
    filters?: SeriesFilters;
    sort?: string;
    direction?: 'desc' | 'asc';
}

export const useSeries = ({ page = 1, itemsPerPage = 25, filters, sort = 'name', direction = 'asc' }: UseSeriesParams = {}) => {
    const serializedFilters = stableStringify(filters || {});
    return useQuery<PaginatedResponse<Series>>({
        queryKey: ['series', page, itemsPerPage, serializedFilters, sort, direction],
        queryFn: async () => {
            const params = new URLSearchParams();

            params.append('page', page.toString());
            params.append('limit', itemsPerPage.toString());
            if (filters?.name) params.append('filters[name]', filters.name);
            if (filters?.event_type) params.append('filters[series_type]', filters.event_type);
            if (filters?.tag) params.append('filters[tag]', toKebabCase(filters.tag));
            if (filters?.entity) params.append('filters[entity]', toKebabCase(filters.entity));
            if (filters?.description) params.append('filters[description]', filters.description);
            if (filters?.created_at?.start) params.append('filters[created_at][start]', filters.created_at.start);
            if (filters?.created_at?.end) params.append('filters[created_at][end]', filters.created_at.end);
            if (sort) params.append('sort', sort);
            if (direction) params.append('direction', direction);

            const { data } = await api.get<PaginatedResponse<Series>>(`/series?${params.toString()}`);
            return data;
        },
    });
};
