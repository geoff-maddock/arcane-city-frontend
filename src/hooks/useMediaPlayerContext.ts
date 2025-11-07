import { useContext } from 'react';
import { MediaPlayerContext, MediaPlayerContextType } from '../context/MediaPlayerContextDefinition';

export const useMediaPlayerContext = (): MediaPlayerContextType => {
  const context = useContext(MediaPlayerContext);
  if (context === undefined) {
    throw new Error('useMediaPlayerContext must be used within a MediaPlayerProvider');
  }
  return context;
};
