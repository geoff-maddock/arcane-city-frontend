import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

interface Option {
    id: number;
    name: string;
}

export const useSearchOptions = (
    endpoint: string,
    search: string,
    extraParams: Record<string, string | number> = {}
) => {
    return useQuery<Option[]>({
        queryKey: ['search', endpoint, search, extraParams],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.set('limit', '20');
            params.set('sort', 'name');
            if (search) params.set('filters[name]', search);
            for (const [k, v] of Object.entries(extraParams)) {
                params.set(k, String(v));
            }
            const { data } = await api.get<{ data: Option[] }>(
                `/${endpoint}?${params.toString()}`
            );
            return data.data.sort((a, b) => a.name.localeCompare(b.name));
        },
    });
};
