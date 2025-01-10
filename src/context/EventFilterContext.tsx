import { createContext, Dispatch, SetStateAction } from 'react';
import { EventFilters } from '../types/filters';

interface EventFilterContextProps {
    filters: EventFilters;
    setFilters: Dispatch<SetStateAction<EventFilters>>;
}

export const EventFilterContext = createContext<EventFilterContextProps>({
    filters: {
        name: '',
        venue: '',
        promoter: '',
        event_type: '',
        entity: '',
        tag: '',
        start_at: {
            start: '',
            end: undefined
        }
    },
    setFilters: () => { }
});