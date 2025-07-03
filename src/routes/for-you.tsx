import React, { useEffect } from 'react';
import { createRoute, useNavigate } from '@tanstack/react-router';
import { rootRoute } from './root';
import { authService } from '../services/auth.service';
import { useForYou } from '../hooks/useForYou';
import EventCardCondensed from '../components/EventCardCondensed';

const ForYou: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate({ to: '/login' });
    }
  }, [navigate]);

  const { data, isLoading, error } = useForYou();

  if (!authService.isAuthenticated()) return null;
  if (isLoading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Failed to load personalized data.</div>;
  if (!data) return null;

  const allEvents = [
    ...data.attending_events,
    ...data.tag_events,
    ...data.entity_events,
  ];

  const imageIndexMap = new Map<number, number>();
  const allImages: Array<{ src: string; alt: string; thumbnail: string }> = [];

  allEvents.forEach((event) => {
    if (event.primary_photo && event.primary_photo_thumbnail) {
      imageIndexMap.set(event.id, allImages.length);
      allImages.push({
        src: event.primary_photo,
        alt: event.name,
        thumbnail: event.primary_photo_thumbnail,
      });
    }
  });

  const renderEvents = (events: typeof allEvents) => (
    <div className="grid gap-4">
      {events.map((event) => (
        <EventCardCondensed
          key={event.id}
          event={event}
          allImages={allImages}
          imageIndex={imageIndexMap.get(event.id) ?? 0}
        />
      ))}
      {events.length === 0 && <p>No events found.</p>}
    </div>
  );

  return (
    <div className="p-4 space-y-8">
      <h2 className="text-2xl font-bold">For You</h2>

      <section>
        <h3 className="text-lg font-semibold mb-2">Events You're Attending</h3>
        {renderEvents(data.attending_events)}
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Events Matching Your Tags</h3>
        {renderEvents(data.tag_events)}
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Events Matching Your Entities</h3>
        {renderEvents(data.entity_events)}
      </section>
    </div>
  );
};

export const ForYouRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/for-you',
  component: ForYou,
});
