import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Series, PaginatedResponse } from '../types/api';
import { toKebabCase } from '../lib/utils';

interface DateRange {
    start?: string;
    end?: string;
}

interface SeriesFilters {
    name: string;
    series_type: string;
    tag: string;
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
    return useQuery<PaginatedResponse<Series>>({
        queryKey: ['series', page, itemsPerPage, filters, sort, direction],
        queryFn: async () => {
            const params = new URLSearchParams();

            params.append('page', page.toString());
            params.append('limit', itemsPerPage.toString());
            if (filters?.name) params.append('filters[name]', filters.name);
            if (filters?.series_type) params.append('filters[series_type]', filters.series_type);
            if (filters?.tag) params.append('filters[tag]', toKebabCase(filters.tag));
            if (filters?.created_at?.start) params.append('filters[created_at][start]', filters.created_at.start);
            if (filters?.created_at?.end) params.append('filters[created_at][end]', filters.created_at.end);
            if (sort) params.append('sort', sort);
            if (direction) params.append('direction', direction);

            const { data } = await api.get<PaginatedResponse<Series>>(`/series?${params.toString()}`);
            return data;
        },
    });
};
