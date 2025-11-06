import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Tag, PaginatedResponse } from '../types/api';

interface UsePopularTagsParams {
    days?: number;
    limit?: number;
    style?: 'future' | 'past';
}

export const usePopularTags = ({ days = 60, limit = 5, style = 'future' }: UsePopularTagsParams = {}) => {
    return useQuery<PaginatedResponse<Tag>>({
        queryKey: ['popularTags', days, limit, style],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.append('days', days.toString());
            params.append('limit', limit.toString());
            params.append('style', style);

            const { data } = await api.get<PaginatedResponse<Tag>>(`/tags/popular?${params.toString()}`);
            return data;
        },
    });
};
