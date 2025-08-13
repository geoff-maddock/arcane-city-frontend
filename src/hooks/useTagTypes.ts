import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { TagType, PaginatedResponse } from '../types/api';

export const useTagTypes = () => {
  return useQuery<TagType[]>({
    queryKey: ['tag-types'],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<TagType>>('/tag-types?limit=100&sort=name&direction=asc');
      return data.data;
    },
  });
};
