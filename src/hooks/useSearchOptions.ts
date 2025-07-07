import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

interface Option {
  id: number;
  name: string;
}

export const useSearchOptions = (endpoint: string, search: string) => {
  return useQuery<Option[]>({
    queryKey: [endpoint, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('limit', '20');
      if (search) params.set('filters[name]', search);
      const { data } = await api.get<{ data: Option[] }>(`/${endpoint}?${params.toString()}`);
      return data.data;
    },
  });
};
