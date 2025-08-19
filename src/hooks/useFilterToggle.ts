import { useState, useEffect } from 'react';

interface UseFilterToggleOptions {
    /**
     * The localStorage key to persist the filter visibility state.
     * Defaults to 'filtersVisible'
     */
    storageKey?: string;
    /**
     * The default visibility state when no stored value exists.
     * Defaults to true
     */
    defaultVisible?: boolean;
}

/**
 * A reusable hook for managing filter visibility state with localStorage persistence.
 * 
 * @param options Configuration options for the hook
 * @returns An object containing the visibility state and toggle function
 */
export function useFilterToggle(options: UseFilterToggleOptions = {}) {
    const { storageKey = 'filtersVisible', defaultVisible = true } = options;

    const [filtersVisible, setFiltersVisible] = useState<boolean>(() => {
        try {
            const savedState = localStorage.getItem(storageKey);
            return savedState ? JSON.parse(savedState) : defaultVisible;
        } catch (error) {
            console.warn(`Failed to parse ${storageKey} from localStorage:`, error);
            return defaultVisible;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(filtersVisible));
        } catch (error) {
            console.warn(`Failed to save ${storageKey} to localStorage:`, error);
        }
    }, [filtersVisible, storageKey]);

    const toggleFilters = () => {
        setFiltersVisible(prev => !prev);
    };

    return {
        filtersVisible,
        setFiltersVisible,
        toggleFilters
    };
}
