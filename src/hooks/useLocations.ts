import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { LocationResponse, PaginatedResponse } from '../types/api';

export interface LocationFilters {
    name?: string;
    address_one?: string;
    neighborhood?: string;
    city?: string;
    search?: string;
}

interface UseLocationsParams {
    page?: number;
    itemsPerPage?: number;
    filters?: LocationFilters;
    sort?: string;
    direction?: 'desc' | 'asc';
}

export const useLocations = ({ page = 1, itemsPerPage = 25, filters, sort = 'name', direction = 'asc' }: UseLocationsParams = {}) => {
    return useQuery<PaginatedResponse<LocationResponse>>({
        queryKey: ['locations', page, itemsPerPage, filters, sort, direction],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('limit', itemsPerPage.toString());
            if (filters?.name) params.append('filters[name]', filters.name);
            if (filters?.address_one) params.append('filters[address_one]', filters.address_one);
            if (filters?.neighborhood) params.append('filters[neighborhood]', filters.neighborhood);
            if (filters?.city) params.append('filters[city]', filters.city);
            if (filters?.search) params.append('filters[search]', filters.search);
            if (sort) params.append('sort', sort);
            if (direction) params.append('direction', direction);

            const { data } = await api.get<PaginatedResponse<LocationResponse>>(`/locations?${params.toString()}`);
            return data;
        },
    });
};
