import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface MediaPlayerContextType {
  mediaPlayersEnabled: boolean;
  setMediaPlayersEnabled: (enabled: boolean) => void;
  toggleMediaPlayers: () => void;
}

const MediaPlayerContext = createContext<MediaPlayerContextType | undefined>(undefined);

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

export const useMediaPlayerContext = (): MediaPlayerContextType => {
  const context = useContext(MediaPlayerContext);
  if (context === undefined) {
    throw new Error('useMediaPlayerContext must be used within a MediaPlayerProvider');
  }
  return context;
};