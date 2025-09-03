import { useState, useEffect } from 'react';
import { useMediaPlayerContext } from '../context/MediaPlayerContext';

interface UseMediaPlayerToggleOptions {
    /**
     * The localStorage key to persist the media player toggle state.
     * Defaults to 'mediaPlayersEnabled'
     */
    storageKey?: string;
    /**
     * The default enabled state when no stored value exists.
     * Defaults to true to keep players enabled by default
     */
    defaultEnabled?: boolean;
}

/**
 * A reusable hook for managing media player visibility state with localStorage persistence.
 * This hook provides a global toggle for showing/hiding media players across the application.
 * 
 * @deprecated Consider using useMediaPlayerContext directly instead for better global state synchronization
 * @param options Configuration options for the hook
 * @returns An object containing the enabled state and toggle function
 */
export function useMediaPlayerToggle(options: UseMediaPlayerToggleOptions = {}) {
    const { storageKey = 'mediaPlayersEnabled', defaultEnabled = true } = options;
    // Always initialize local state
    const [localMediaPlayersEnabled, setLocalMediaPlayersEnabled] = useState<boolean>(() => {
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
            localStorage.setItem(storageKey, JSON.stringify(localMediaPlayersEnabled));
        } catch (error) {
            console.warn(`Failed to save ${storageKey} to localStorage:`, error);
        }
    }, [localMediaPlayersEnabled, storageKey]);

    const localToggleMediaPlayers = () => {
        setLocalMediaPlayersEnabled(prev => !prev);
    };

    // Try to use context, fallback to local state
    try {
        const context = useMediaPlayerContext();
        return {
            mediaPlayersEnabled: context.mediaPlayersEnabled,
            setMediaPlayersEnabled: context.setMediaPlayersEnabled,
            toggleMediaPlayers: context.toggleMediaPlayers
        };
    } catch {
        // Context not available, use local state
        return {
            mediaPlayersEnabled: localMediaPlayersEnabled,
            setMediaPlayersEnabled: setLocalMediaPlayersEnabled,
            toggleMediaPlayers: localToggleMediaPlayers
        };
    }
}