import { useState, useEffect } from 'react';

interface UseMediaPlayerToggleOptions {
    /**
     * The localStorage key to persist the media player toggle state.
     * Defaults to 'mediaPlayersEnabled'
     */
    storageKey?: string;
    /**
     * The default enabled state when no stored value exists.
     * Defaults to false to keep players disabled by default
     */
    defaultEnabled?: boolean;
}

/**
 * A reusable hook for managing media player visibility state with localStorage persistence.
 * This hook provides a global toggle for showing/hiding media players across the application.
 * 
 * @param options Configuration options for the hook
 * @returns An object containing the enabled state and toggle function
 */
export function useMediaPlayerToggle(options: UseMediaPlayerToggleOptions = {}) {
    const { storageKey = 'mediaPlayersEnabled', defaultEnabled = false } = options;

    const [mediaPlayersEnabled, setMediaPlayersEnabled] = useState<boolean>(() => {
        try {
            const savedState = localStorage.getItem(storageKey);
            return savedState ? JSON.parse(savedState) : defaultEnabled;
        } catch (error) {
            console.warn(`Failed to parse ${storageKey} from localStorage:`, error);
            return defaultEnabled;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(mediaPlayersEnabled));
        } catch (error) {
            console.warn(`Failed to save ${storageKey} to localStorage:`, error);
        }
    }, [mediaPlayersEnabled, storageKey]);

    const toggleMediaPlayers = () => {
        setMediaPlayersEnabled(prev => !prev);
    };

    return {
        mediaPlayersEnabled,
        setMediaPlayersEnabled,
        toggleMediaPlayers
    };
}