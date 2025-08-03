import React, { useState, useEffect, useMemo } from 'react';
import { createRoute, useNavigate, useSearch } from '@tanstack/react-router';
import { rootRoute } from './root';
import { useEvents } from '../hooks/useEvents';
import { useEntities } from '../hooks/useEntities';
import { useSeries } from '../hooks/useSeries';
import { useTags } from '../hooks/useTags';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import EventCardCondensed from '../components/EventCardCondensed';
import EntityCardCondensed from '../components/EntityCardCondensed';
import SeriesCardCondensed from '../components/SeriesCardCondensed';
import TagCard from '../components/TagCard';
import type { Event } from '../types/api';

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

interface SearchParams { q?: string; deep?: string }

const Search: React.FC = () => {
  const navigate = useNavigate();
  const { q = '', deep } = useSearch({ from: '/search' }) as SearchParams;
  const deepEnabled = deep === 'true';
  const [input, setInput] = useState(q);
  const [isDeep, setIsDeep] = useState(deepEnabled);

  useEffect(() => {
    setInput(q);
    setIsDeep(deepEnabled);
  }, [q, deepEnabled]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: '/search', search: { q: input.trim(), deep: isDeep ? 'true' : undefined } });
  };

  const { name, createdBefore, createdAfter } = parseSearchQuery(q);

  const dateFilter = createdBefore || createdAfter ? { start: createdAfter, end: createdBefore } : undefined;

  const baseFilters = isDeep ? { name, description: name, created_at: dateFilter } : { name, created_at: dateFilter };

  const { data: eventNameData } = useEvents({ itemsPerPage: 5, filters: baseFilters });
  const { data: eventTagData } = useEvents({ itemsPerPage: 5, filters: { tag: name, created_at: dateFilter } });
  const { data: eventEntityData } = useEvents({ itemsPerPage: 5, filters: { entity: name, created_at: dateFilter } });
  const { data: entityData } = useEntities({ itemsPerPage: 5, filters: baseFilters });
  const { data: seriesData } = useSeries({ itemsPerPage: 5, filters: baseFilters });
  const { data: tagData } = useTags({ itemsPerPage: 5, filters: baseFilters });

  const events = useMemo(() => {
    const map = new Map<number, Event>();
    eventNameData?.data?.forEach(ev => map.set(ev.id, ev));
    eventTagData?.data?.forEach(ev => map.set(ev.id, ev));
    eventEntityData?.data?.forEach(ev => map.set(ev.id, ev));
    return Array.from(map.values());
  }, [eventNameData, eventTagData, eventEntityData]);

  const allEventImages = events
    .filter(ev => ev.primary_photo && ev.primary_photo_thumbnail)
    .map(ev => ({ src: ev.primary_photo!, alt: ev.name, thumbnail: ev.primary_photo_thumbnail })) ?? [];

  const allEntityImages = entityData?.data
    .filter(en => en.primary_photo && en.primary_photo_thumbnail)
    .map(en => ({ src: en.primary_photo!, alt: en.name, thumbnail: en.primary_photo_thumbnail })) ?? [];

  const allSeriesImages = seriesData?.data
    .filter(se => se.primary_photo && se.primary_photo_thumbnail)
    .map(se => ({ src: se.primary_photo!, alt: se.name, thumbnail: se.primary_photo_thumbnail })) ?? [];

  const eventCount = events.length;
  const entityCount = entityData?.data?.length ?? 0;
  const seriesCount = seriesData?.data?.length ?? 0;
  const tagCount = tagData?.data?.length ?? 0;

  return (
    <div className="bg-background text-foreground min-h-screen p-4">
      <div className="mx-auto px-6 py-8 max-w-[2400px] space-y-8">
        <div className="flex flex-col space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Search</h1>
          <p className="text-lg text-gray-500">Find events, entities, series and tags</p>
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-md items-center">
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Search" />
          <button type="submit" className="px-4 py-2 border rounded">Search</button>
          <div className="flex items-center space-x-2">
            <Switch id="deep-search" checked={isDeep} onCheckedChange={setIsDeep} />
            <Label htmlFor="deep-search">Deep Search</Label>
          </div>
        </form>

        {q && (
          <div className="space-y-8">
            <p className="text-lg">
              Found {eventCount} events, {entityCount} entities, {seriesCount} series, and {tagCount} tags
            </p>
            {eventCount ? (
              <section>
                <h2 className="text-2xl font-semibold mb-4">Events ({eventCount})</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                  {events.map((ev) => (
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

            {entityCount ? (
              <section>
                <h2 className="text-2xl font-semibold mb-4">Entities ({entityCount})</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                  {entityData!.data.map((en) => (
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

            {seriesCount ? (
              <section>
                <h2 className="text-2xl font-semibold mb-4">Series ({seriesCount})</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                  {seriesData!.data.map((se) => (
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

            {tagCount ? (
              <section>
                <h2 className="text-2xl font-semibold mb-4">Tags ({tagCount})</h2>
                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {tagData!.data.map((tag) => (
                    <TagCard key={tag.id} tag={tag} />
                  ))}
                </div>
              </section>
            ) : null}
            {(!eventCount && !entityCount && !seriesCount && !tagCount) && (
              <p>No results found.</p>
            )}
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

