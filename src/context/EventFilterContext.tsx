import { createContext } from 'react';

export const EventFilterContext = createContext({
    filters: {},
    setFilters: (filters) => { }
});