import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Blog, PaginatedResponse, UseBlogsParams } from '../types/api';

export const useBlogs = ({ page = 1, itemsPerPage = 1000, filters, sort = 'created_at', direction = 'desc' }: UseBlogsParams = {}) => {
    return useQuery<PaginatedResponse<Blog>>({
        queryKey: ['blogs', page, itemsPerPage, filters, sort, direction],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('limit', itemsPerPage.toString());
            if (filters?.name) params.append('filters[name]', filters.name);
            if (sort) params.append('sort', sort);
            if (direction) params.append('direction', direction);
            const { data } = await api.get<PaginatedResponse<Blog>>(`/blogs?${params.toString()}`);
            return data;
        },
    });
};
