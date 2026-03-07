import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './root';
import { FantasyFlipGame } from '../components/fantasy-flip/FantasyFlipGame';
import { SITE_NAME } from '../lib/seo';

export const FantasyFlipRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/fantasy-flip',
  component: FantasyFlipGame,
  head: () => {
    const url = typeof window !== 'undefined' ? window.location.href : 'https://arcane.city/fantasy-flip';
    return {
      meta: [
        { title: `Fantasy Flip • ${SITE_NAME}` },
        { name: 'description', content: 'A playable web prototype of Fantasy Flip: a two-deck fantasy flip-and-write board game with solo and bot modes.' },
        { property: 'og:url', content: `${url}` },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: `Fantasy Flip • ${SITE_NAME}` },
        { property: 'og:description', content: 'Play Fantasy Flip in your browser with full setup and game loop support.' },
      ],
    };
  },
});
