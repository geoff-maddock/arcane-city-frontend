import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

interface Option {
    id: number;
    name: string;
}

export const useSearchOptions = (
    endpoint: string,
    search: string,
    extraParams: Record<string, string | number> = {},
    queryOverrides: Record<string, string | number> = {}
) => {
    return useQuery<Option[]>({
        queryKey: ['search', endpoint, search, extraParams, queryOverrides],
        queryFn: async () => {
            const defaultQueryParts = {
                limit: '20',
                sort: 'name',
                direction: 'asc'
            };

            const mergedQuery = { ...defaultQueryParts, ...queryOverrides };
            const queryParts = Object.entries(mergedQuery).map(([key, value]) =>
                `${key}=${encodeURIComponent(String(value))}`
            );

            if (search) {
                queryParts.push(`filters[name]=${encodeURIComponent(search)}`);
            }

            for (const [k, v] of Object.entries(extraParams)) {
                queryParts.push(`${k}=${encodeURIComponent(String(v))}`);
            }

            const queryString = queryParts.join('&');
            const { data } = await api.get<{ data: Option[] }>(
                `/${endpoint}?${queryString}`
            );
            return data.data;
        },
    });
};