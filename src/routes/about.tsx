import React from 'react';
import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './root';

const About: React.FC = () => (
  <div className="min-h-[calc(100vh-4rem)] xl:min-h-screen w-full bg-white dark:bg-black transition-colors">
    <div className="max-w-3xl mx-auto p-6 xl:p-8 space-y-6">
      <h1 className="text-4xl font-bold tracking-tight">About Arcane City</h1>
      <div className="rounded-lg overflow-hidden shadow md:shadow-lg">
        <img src="/images/pittsburgh-skyline.jpg" alt="Pittsburgh skyline" className="w-full object-cover" />
      </div>
      <p>
        <b>Arcane City</b> is calendar of events, concerts, club nights, weekly and
        monthly events series, promoters, artists, producers, djs, venues and other
        entities that make up the Pittsburgh scene. You can sign up and follow an
        artist, venue, genre or anything else to get weekly and daily updates on
        what's upcoming. If you are a promoter, you can add your events and have
        them shared on the site, with anybody who signs up and also reposted in the
        Arcane City page events and to our instagram account.
      </p>
      <div className="aspect-video w-full rounded-lg overflow-hidden shadow bg-black/60">
        <iframe
          className="w-full h-full"
          src="https://www.youtube.com/embed/DXDJUYP2Ytg"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <p>
        The site is an open source project built by Geoff Maddock, using Laravel,
        PHP, MySQL and Javascript. You can view and contribute to the code base on
        Github.&nbsp;
        <a className="underline hover:text-blue-600 dark:hover:text-blue-400" href="https://github.com/geoff-maddock/events-tracker" target="_blank" rel="noopener noreferrer">https://github.com/geoff-maddock/events-tracker</a>
      </p>
      <p>
        Follow us on Instagram at&nbsp;
        <a className="underline hover:text-pink-600 dark:hover:text-pink-400" href="https://www.instagram.com/arcane.city" target="_blank" rel="noopener noreferrer">https://www.instagram.com/arcane.city</a>
        <br />
        Like our page on Facebook at&nbsp;
        <a className="underline hover:text-blue-600 dark:hover:text-blue-400" href="https://www.facebook.com/arcanecity/" target="_blank" rel="noopener noreferrer">https://www.facebook.com/arcanecity/</a>
      </p>
      <p>
        For any other questions, feedback or queries, contact&nbsp;
        <a className="underline hover:text-blue-600 dark:hover:text-blue-400" href="mailto:geoff.maddock@gmail.com">geoff.maddock at gmail.com</a>
      </p>
      <div className="rounded-lg overflow-hidden shadow md:shadow-lg">
        <img src="/images/arcane-city-promo.jpg" alt="Arcane City promo" className="w-full object-cover" />
      </div>
    </div>
  </div>
);

export const AboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: About,
});
