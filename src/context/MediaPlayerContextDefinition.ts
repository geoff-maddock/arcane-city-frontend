import { createContext } from 'react';

export interface MediaPlayerContextType {
  mediaPlayersEnabled: boolean;
  setMediaPlayersEnabled: (enabled: boolean) => void;
  toggleMediaPlayers: () => void;
}

export const MediaPlayerContext = createContext<MediaPlayerContextType | undefined>(undefined);
