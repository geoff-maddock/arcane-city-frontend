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

// New hook for fetching selected options by IDs
export const useSelectedOptions = (
    endpoint: string,
    selectedIds: number[],
    enabled: boolean = true
) => {
    return useQuery<Option[]>({
        queryKey: ['selected', endpoint, selectedIds],
        queryFn: async () => {
            if (selectedIds.length === 0) {
                return [];
            }

            const queryParts = [`filters[id]=${selectedIds.join(',')}`];
            const queryString = queryParts.join('&');
            const { data } = await api.get<{ data: Option[] }>(
                `/${endpoint}?${queryString}`
            );
            return data.data;
        },
        enabled: enabled && selectedIds.length > 0,
    });
};