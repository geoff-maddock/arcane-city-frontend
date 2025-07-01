import { createContext, Dispatch, SetStateAction } from 'react';
import { TagFilters } from '../types/filters';

interface TagFilterContextProps {
    filters: TagFilters;
    setFilters: Dispatch<SetStateAction<TagFilters>>;
}

export const TagFilterContext = createContext<TagFilterContextProps>({
    filters: {
        name: '',
    },
    setFilters: () => {},
});
