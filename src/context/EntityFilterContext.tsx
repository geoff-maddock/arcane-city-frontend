import { createContext, Dispatch, SetStateAction } from 'react';
import { EntityFilters } from '../types/filters';

interface EntityFilterContextProps {
    filters: EntityFilters;
    setFilters: Dispatch<SetStateAction<EntityFilters>>;
}

export const EntityFilterContext = createContext<EntityFilterContextProps>({
    filters: {
        name: '',
        entity_type: '',
        role: '',
        status: '',
        tag: '',
        created_at: {
            start: '',
            end: undefined
        }
    },
    setFilters: () => { }
});