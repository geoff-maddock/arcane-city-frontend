import { createContext, Dispatch, SetStateAction } from 'react';
import { SeriesFilters } from '../types/filters';

interface SeriesFilterContextProps {
    filters: SeriesFilters;
    setFilters: Dispatch<SetStateAction<SeriesFilters>>;
}

export const SeriesFilterContext = createContext<SeriesFilterContextProps>({
    filters: {
        name: '',
        event_type: '',
        tag: '',
        entity: '',
        venue: '',
        promoter: '',
        occurrence_type: '',
        occurrence_week: '',
        occurrence_day: '',
        occurrence_repeat: '',
        founded_at: {
            start: '',
            end: undefined
        }
    },
    setFilters: () => { }
});
