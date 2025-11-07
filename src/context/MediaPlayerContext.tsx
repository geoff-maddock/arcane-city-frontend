import React, { useState, useEffect, ReactNode } from 'react';
import { MediaPlayerContext } from './MediaPlayerContextDefinition';

interface MediaPlayerProviderProps {
  children: ReactNode;
  storageKey?: string;
  defaultEnabled?: boolean;
}

export const MediaPlayerProvider: React.FC<MediaPlayerProviderProps> = ({
  children,
  storageKey = 'mediaPlayersEnabled',
  defaultEnabled = true
}) => {
  const [mediaPlayersEnabled, setMediaPlayersEnabledState] = useState<boolean>(() => {
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

  const setMediaPlayersEnabled = (enabled: boolean) => {
    setMediaPlayersEnabledState(enabled);
  };

  const toggleMediaPlayers = () => {
    setMediaPlayersEnabledState(prev => !prev);
  };

  return (
    <MediaPlayerContext.Provider value={{
      mediaPlayersEnabled,
      setMediaPlayersEnabled,
      toggleMediaPlayers
    }}>
      {children}
    </MediaPlayerContext.Provider>
  );
};