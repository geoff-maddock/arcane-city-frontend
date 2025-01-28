import { createContext, Dispatch, SetStateAction } from 'react';
import { SeriesFilters } from '../types/filters';

interface SeriesFilterContextProps {
    filters: SeriesFilters;
    setFilters: Dispatch<SetStateAction<SeriesFilters>>;
}

export const SeriesFilterContext = createContext<SeriesFilterContextProps>({
    filters: {
        name: '',
        series_type: '',
        tag: '',
        created_at: {
            start: '',
            end: undefined
        }
    },
    setFilters: () => { }
});
