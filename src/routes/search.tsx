import React, { useState, useEffect } from 'react';
import { createRoute, useNavigate, useSearch } from '@tanstack/react-router';
import { rootRoute } from './root';
import { useEvents } from '../hooks/useEvents';
import { useEntities } from '../hooks/useEntities';
import { useSeries } from '../hooks/useSeries';
import { useTags } from '../hooks/useTags';
import { Input } from '@/components/ui/input';
import EventCardCondensed from '../components/EventCardCondensed';
import EntityCardCondensed from '../components/EntityCardCondensed';
import SeriesCardCondensed from '../components/SeriesCardCondensed';
import TagCard from '../components/TagCard';

interface ParsedQuery {
  name: string;
  createdBefore?: string;
  createdAfter?: string;
}

function parseSearchQuery(q: string): ParsedQuery {
  const tokens = q.split(/\s+/).filter(Boolean);
  const nameParts: string[] = [];
  let createdBefore: string | undefined;
  let createdAfter: string | undefined;

  tokens.forEach((t) => {
    const [key, val] = t.split(':');
    if (/^CreatedBefore$/i.test(key) && val) {
      createdBefore = val;
    } else if (/^CreatedAfter$/i.test(key) && val) {
      createdAfter = val;
    } else {
      nameParts.push(t);
    }
  });

  return { name: nameParts.join(' '), createdBefore, createdAfter };
}

interface SearchParams { q?: string }

const Search: React.FC = () => {
  const navigate = useNavigate();
  const { q = '' } = useSearch({ from: '/search' }) as SearchParams;
  const [input, setInput] = useState(q);

  useEffect(() => {
    setInput(q);
  }, [q]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: '/search', search: { q: input.trim() } });
  };

  const { name, createdBefore, createdAfter } = parseSearchQuery(q);

  const dateFilter = createdBefore || createdAfter ? { start: createdAfter, end: createdBefore } : undefined;

  const { data: eventData } = useEvents({ itemsPerPage: 5, filters: { name, created_at: dateFilter } });
  const { data: entityData } = useEntities({ itemsPerPage: 5, filters: { name, created_at: dateFilter } });
  const { data: seriesData } = useSeries({ itemsPerPage: 5, filters: { name, created_at: dateFilter } });
  const { data: tagData } = useTags({ itemsPerPage: 5, filters: { name, created_at: dateFilter } });

  const allEventImages = eventData?.data
    .filter(ev => ev.primary_photo && ev.primary_photo_thumbnail)
    .map(ev => ({ src: ev.primary_photo!, alt: ev.name, thumbnail: ev.primary_photo_thumbnail })) ?? [];

  const allEntityImages = entityData?.data
    .filter(en => en.primary_photo && en.primary_photo_thumbnail)
    .map(en => ({ src: en.primary_photo!, alt: en.name, thumbnail: en.primary_photo_thumbnail })) ?? [];

  const allSeriesImages = seriesData?.data
    .filter(se => se.primary_photo && se.primary_photo_thumbnail)
    .map(se => ({ src: se.primary_photo!, alt: se.name, thumbnail: se.primary_photo_thumbnail })) ?? [];

  return (
    <div className="bg-background text-foreground min-h-screen p-4">
      <div className="mx-auto px-6 py-8 max-w-[2400px] space-y-8">
        <div className="flex flex-col space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Search</h1>
          <p className="text-lg text-gray-500">Find events, entities, series and tags</p>
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-md">
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Search" />
          <button type="submit" className="px-4 py-2 border rounded">Search</button>
        </form>

        {q && (
          <div className="space-y-8">
          {eventData?.data?.length ? (
            <section>
              <h2 className="text-2xl font-semibold mb-4">Events</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {eventData.data.map((ev) => (
                  <EventCardCondensed
                    key={ev.id}
                    event={ev}
                    allImages={allEventImages}
                    imageIndex={allEventImages.findIndex(img => img.src === ev.primary_photo)}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {entityData?.data?.length ? (
            <section>
              <h2 className="text-2xl font-semibold mb-4">Entities</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {entityData.data.map((en) => (
                  <EntityCardCondensed
                    key={en.id}
                    entity={en}
                    allImages={allEntityImages}
                    imageIndex={allEntityImages.findIndex(img => img.src === en.primary_photo)}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {seriesData?.data?.length ? (
            <section>
              <h2 className="text-2xl font-semibold mb-4">Series</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {seriesData.data.map((se) => (
                  <SeriesCardCondensed
                    key={se.id}
                    series={se}
                    allImages={allSeriesImages}
                    imageIndex={allSeriesImages.findIndex(img => img.src === se.primary_photo)}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {tagData?.data?.length ? (
            <section>
              <h2 className="text-2xl font-semibold mb-4">Tags</h2>
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {tagData.data.map((tag) => (
                  <TagCard key={tag.id} tag={tag} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
      </div>
    </div>
  );
};

export const SearchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/search',
  component: Search,
});

