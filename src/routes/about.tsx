import React from 'react';
import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './root';

const About: React.FC = () => (
  <div className="max-w-3xl mx-auto p-4 space-y-4">
    <h1 className="text-4xl font-bold tracking-tight text-gray-900">About Arcane City</h1>
    <img src="/images/pittsburgh-skyline.jpg" alt="Pittsburgh skyline" />
    <p>
      <b>Arcane City</b> is calendar of events, concerts, club nights, weekly and
      monthly events series, promoters, artists, producers, djs, venues and other
      entities that make up the Pittsburgh scene. You can sign up and follow an
      artist, venue, genre or anything else to get weekly and daily updates on
      what's upcoming.  If you are a promoter, you can add your events and have
      them shared on the site, with anybody who signs up and also reposted in the
      Arcane City page events and to our instagram account.
    </p>
    <iframe
      width="560"
      height="315"
      src="https://www.youtube.com/embed/DXDJUYP2Ytg"
      title="YouTube video player"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
    <p>
      The site is an open source project built by Geoff Maddock, using Laravel,
      PHP, MySQL and Javascript.  You can view and contribute to the code base on
      Github.
      <a href="https://github.com/geoff-maddock/events-tracker">https://github.com/geoff-maddock/events-tracker</a>
    </p>
    <p>
      Follow us on Instagram at
      <a href="https://www.instagram.com/arcane.city">https://www.instagram.com/arcane.city</a>
      <br />
      Like our page on Facebook at
      <a href="https://www.facebook.com/arcanecity/">https://www.facebook.com/arcanecity/</a>
    </p>
    <p>
      For any other questions, feedback or queries, contact
      <a href="mailto:geoff.maddock@gmail.com">geoff.maddock at gmail.com</a>
    </p>
    <img src="/images/arcane-city-promo.jpg" alt="Arcane City promo" />
  </div>
);

export const AboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: About,
});
