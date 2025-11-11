import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { PaginatedResponse } from '../types/api';
import type { User } from '../types/auth';

export interface UserFilters {
    name: string;
    email: string;
    status: string;
    is_verified: string;
}

interface UseUsersParams {
    page?: number;
    itemsPerPage?: number;
    filters?: UserFilters;
    sort?: string;
    direction?: 'desc' | 'asc';
}

export const useUsers = ({ page = 1, itemsPerPage = 25, filters, sort = 'name', direction = 'asc' }: UseUsersParams = {}) => {
    return useQuery<PaginatedResponse<User>>({
        queryKey: ['users', page, itemsPerPage, filters, sort, direction],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('limit', itemsPerPage.toString());
            if (filters?.name) params.append('filters[name]', filters.name);
            if (filters?.email) params.append('filters[email]', filters.email);
            if (filters?.status) params.append('filters[status]', filters.status);
            if (filters?.is_verified) params.append('filters[is_verified]', filters.is_verified);
            if (sort) params.append('sort', sort);
            if (direction) params.append('direction', direction);

            const { data } = await api.get<PaginatedResponse<User>>(`/users?${params.toString()}`);
            return data;
        },
    });
};
