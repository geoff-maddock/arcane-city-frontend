import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createRoute, useNavigate, useSearch } from '@tanstack/react-router';
import { rootRoute } from './root';
import { useEvents } from '../hooks/useEvents';
import { useEntities } from '../hooks/useEntities';
import { useSeries } from '../hooks/useSeries';
import { useTags } from '../hooks/useTags';
import { useLocations } from '../hooks/useLocations';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import EventCardCondensed from '../components/EventCardCondensed';
import EntityCardCondensed from '../components/EntityCardCondensed';
import SeriesCardCondensed from '../components/SeriesCardCondensed';
import TagCard from '../components/TagCard';
import LocationCardCondensed from '../components/LocationCardCondensed';
import type { Event, Entity, Series, Tag, LocationResponse } from '../types/api';
import { SITE_NAME, DEFAULT_IMAGE } from './../lib/seo';

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
  // debounced navigation handled internally (no external use of debounced value)
  const debounceTimerRef = useRef<number | undefined>();

  useEffect(() => {
    setInput(q);
    setIsDeep(deepEnabled);
    // sync already handled by input state
  }, [q, deepEnabled]);

  // Debounce user typing to auto-trigger search navigation
  useEffect(() => {
    if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = window.setTimeout(() => {
      const trimmed = input.trim();
      if (trimmed !== q) {
        navigate({ to: '/search', search: { q: trimmed, deep: isDeep ? 'true' : undefined } });
      }
    }, 400);
    return () => { if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, isDeep]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Immediate navigate bypassing debounce
    const trimmed = input.trim();
    navigate({ to: '/search', search: { q: trimmed, deep: isDeep ? 'true' : undefined } });
  };

  const { name, createdBefore, createdAfter } = parseSearchQuery(q);

  const dateFilter = createdBefore || createdAfter ? { start: createdAfter, end: createdBefore } : undefined;

  // Default: search name only. Deep: search description only (broader text field) without name duplication.
  const baseFilters = isDeep
    ? { description: name, created_at: dateFilter }
    : { name, created_at: dateFilter };

  // Pagination state
  const [eventPage, setEventPage] = useState(1);
  const [entityPage, setEntityPage] = useState(1);
  const [seriesPage, setSeriesPage] = useState(1);
  const [tagPage, setTagPage] = useState(1);
  const [locationPage, setLocationPage] = useState(1);

  // Accumulated results
  const [eventMap, setEventMap] = useState<Map<number, Event>>(new Map());
  const [entityResults, setEntityResults] = useState<Entity[]>([]);
  const [seriesResults, setSeriesResults] = useState<Series[]>([]);
  const [tagResults, setTagResults] = useState<Tag[]>([]);
  const [locationResults, setLocationResults] = useState<LocationResponse[]>([]);

  // Reset pagination & accumulators when query/deep changes
  useEffect(() => {
    setEventPage(1); setEntityPage(1); setSeriesPage(1); setTagPage(1); setLocationPage(1);
    setEventMap(new Map());
    setEntityResults([]); setSeriesResults([]); setTagResults([]); setLocationResults([]);
  }, [q, isDeep]);

  const { data: eventNameData } = useEvents({ page: eventPage, itemsPerPage: 10, filters: baseFilters, sort: 'start_at', direction: 'desc' });
  const { data: eventTagData } = useEvents({ page: eventPage, itemsPerPage: 10, filters: { tag: name, created_at: dateFilter }, sort: 'start_at', direction: 'desc' });
  const { data: eventEntityData } = useEvents({ page: eventPage, itemsPerPage: 10, filters: { entity: name, created_at: dateFilter }, sort: 'start_at', direction: 'desc' });
  const { data: entityData } = useEntities({ page: entityPage, itemsPerPage: 10, filters: baseFilters, sort: 'created_at', direction: 'desc' });
  const { data: seriesData } = useSeries({ page: seriesPage, itemsPerPage: 10, filters: baseFilters, sort: 'created_at', direction: 'desc' });
  const { data: tagData } = useTags({ page: tagPage, itemsPerPage: 10, filters: baseFilters, sort: 'created_at', direction: 'desc' });

  // Location search - search across name, address, neighborhood, and city
  const locationFilters = {
    search: name,
  };
  const { data: locationData } = useLocations({ page: locationPage, itemsPerPage: 10, filters: locationFilters, sort: 'name', direction: 'asc' });

  // Accumulate event results (merged across three queries)
  useEffect(() => {
    // Use functional update to avoid stale closure and remove need to depend on eventMap
    setEventMap(prev => {
      const updated = new Map(prev);
      eventNameData?.data?.forEach(ev => updated.set(ev.id, ev));
      eventTagData?.data?.forEach(ev => updated.set(ev.id, ev));
      eventEntityData?.data?.forEach(ev => updated.set(ev.id, ev));
      return updated;
    });
  }, [eventNameData, eventTagData, eventEntityData]);

  // Accumulate other resource results, avoiding duplicates
  useEffect(() => {
    if (entityData?.data) {
      setEntityResults(prev => {
        const ids = new Set(prev.map(e => e.id));
        const merged = [...prev];
        entityData.data.forEach(e => { if (!ids.has(e.id)) merged.push(e); });
        return merged;
      });
    }
  }, [entityData]);

  useEffect(() => {
    if (seriesData?.data) {
      setSeriesResults(prev => {
        const ids = new Set(prev.map(s => s.id));
        const merged = [...prev];
        seriesData.data.forEach(s => { if (!ids.has(s.id)) merged.push(s); });
        return merged;
      });
    }
  }, [seriesData]);

  useEffect(() => {
    if (tagData?.data) {
      setTagResults(prev => {
        const ids = new Set(prev.map(t => t.id));
        const merged = [...prev];
        tagData.data.forEach(t => { if (!ids.has(t.id)) merged.push(t); });
        return merged;
      });
    }
  }, [tagData]);

  useEffect(() => {
    if (locationData?.data) {
      setLocationResults(prev => {
        const ids = new Set(prev.map(l => l.id));
        const merged = [...prev];
        locationData.data.forEach(l => { if (!ids.has(l.id)) merged.push(l); });
        return merged;
      });
    }
  }, [locationData]);

  const events = useMemo(() => Array.from(eventMap.values()), [eventMap]);

  const allEventImages = events
    .filter(ev => ev.primary_photo && ev.primary_photo_thumbnail)
    .map(ev => ({ src: ev.primary_photo!, alt: ev.name, thumbnail: ev.primary_photo_thumbnail })) ?? [];

  const allEntityImages = entityResults
    .filter(en => en.primary_photo && en.primary_photo_thumbnail)
    .map(en => ({ src: en.primary_photo!, alt: en.name, thumbnail: en.primary_photo_thumbnail })) ?? [];

  const allSeriesImages = seriesResults
    .filter(se => se.primary_photo && se.primary_photo_thumbnail)
    .map(se => ({ src: se.primary_photo!, alt: se.name, thumbnail: se.primary_photo_thumbnail })) ?? [];

  const eventCount = events.length;
  const entityCount = entityResults.length;
  const seriesCount = seriesResults.length;
  const tagCount = tagResults.length;
  const locationCount = locationResults.length;

  // Totals from API (events need special handling due to multiple queries)
  const eventTotal = Math.max(
    eventNameData?.total ?? 0,
    eventTagData?.total ?? 0,
    eventEntityData?.total ?? 0
  );
  const entityTotal = entityData?.total ?? 0;
  const seriesTotal = seriesData?.total ?? 0;
  const tagTotal = tagData?.total ?? 0;
  const locationTotal = locationData?.total ?? 0;

  const canLoadMoreEvents = [eventNameData, eventTagData, eventEntityData].some(d => d && d.current_page < d.last_page);
  const canLoadMoreEntities = !!entityData && entityData.current_page < entityData.last_page;
  const canLoadMoreSeries = !!seriesData && seriesData.current_page < seriesData.last_page;
  const canLoadMoreTags = !!tagData && tagData.current_page < tagData.last_page;
  const canLoadMoreLocations = !!locationData && locationData.current_page < locationData.last_page;

  const [activeSection, setActiveSection] = useState<string | undefined>();

  const prefersReducedMotion = useMemo(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);

  const handleSectionLink = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    }
    // Update hash manually
    const url = new URL(window.location.href);
    url.hash = id;
    window.history.replaceState(null, '', url.toString());
  };

  // Observe sections for active highlighting
  useEffect(() => {
    const sectionIds = ['events', 'entities', 'series', 'tags', 'locations'];
    const observer = new IntersectionObserver(
      (entries) => {
        // Find entry with highest intersection ratio that is intersecting
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length) {
          visible.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
          const top = visible[0].target.id;
          setActiveSection(prev => (prev === top ? prev : top));
        }
      },
      {
        root: null,
        threshold: [0.25, 0.4, 0.6, 0.75],
        rootMargin: '0px 0px -40% 0px', // bias toward sections near top
      }
    );
    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [eventCount, entityCount, seriesCount, tagCount, locationCount]);

  // On initial mount, scroll to hash if present
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
        }, 50);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const linkClass = (id: string, total: number) => {
    const baseInactive = total ? 'underline cursor-pointer' : 'text-muted-foreground cursor-not-allowed';
    if (!total) return baseInactive;
    return activeSection === id ? 'underline cursor-pointer font-semibold text-primary' : baseInactive;
  };

  return (
    <div className="bg-background text-foreground min-h-screen md:p-4 p-2">
      <div className="mx-auto md:px-6 md:py-8 px-3 py-4 max-w-[2400px] space-y-8">
        <div className="flex flex-col space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Search</h1>
          <p className="text-lg text-gray-500">Find events, entities, series, tags and locations</p>
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
            <p className="text-lg space-x-1 flex flex-wrap items-center">
              <span>Found</span>
              <a
                href="#events"
                onClick={(e) => handleSectionLink(e, 'events')}
                className={linkClass('events', eventTotal)}
              >{eventCount} of {eventTotal} events</a>,
              <a
                href="#entities"
                onClick={(e) => handleSectionLink(e, 'entities')}
                className={linkClass('entities', entityTotal)}
              >{entityCount} of {entityTotal} entities</a>,
              <a
                href="#series"
                onClick={(e) => handleSectionLink(e, 'series')}
                className={linkClass('series', seriesTotal)}
              >{seriesCount} of {seriesTotal} series</a>,
              <a
                href="#tags"
                onClick={(e) => handleSectionLink(e, 'tags')}
                className={linkClass('tags', tagTotal)}
              >{tagCount} of {tagTotal} tags</a>,
              <a
                href="#locations"
                onClick={(e) => handleSectionLink(e, 'locations')}
                className={linkClass('locations', locationTotal)}
              >{locationCount} of {locationTotal} locations</a>
            </p>
            {eventCount ? (
              <section id="events">
                <h2 className="text-2xl font-semibold mb-4">Events ({eventCount} of {eventTotal})</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-4">
                  {events.map((ev) => (
                    <EventCardCondensed
                      key={ev.id}
                      event={ev}
                      allImages={allEventImages}
                      imageIndex={allEventImages.findIndex(img => img.src === ev.primary_photo)}
                    />
                  ))}
                </div>
                {canLoadMoreEvents && (
                  <div className="mt-4 flex justify-center">
                    <button type="button" onClick={() => setEventPage(p => p + 1)} className="px-4 py-2 border rounded">Load more events</button>
                  </div>
                )}
              </section>
            ) : null}

            {entityCount ? (
              <section id="entities">
                <h2 className="text-2xl font-semibold mb-4">Entities ({entityCount} of {entityTotal})</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-4">
                  {entityResults.map((en) => (
                    <EntityCardCondensed
                      key={en.id}
                      entity={en}
                      allImages={allEntityImages}
                      imageIndex={allEntityImages.findIndex(img => img.src === en.primary_photo)}
                    />
                  ))}
                </div>
                {canLoadMoreEntities && (
                  <div className="mt-4 flex justify-center">
                    <button type="button" onClick={() => setEntityPage(p => p + 1)} className="px-4 py-2 border rounded">Load more entities</button>
                  </div>
                )}
              </section>
            ) : null}

            {seriesCount ? (
              <section id="series">
                <h2 className="text-2xl font-semibold mb-4">Series ({seriesCount} of {seriesTotal})</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-4">
                  {seriesResults.map((se) => (
                    <SeriesCardCondensed
                      key={se.id}
                      series={se}
                      allImages={allSeriesImages}
                      imageIndex={allSeriesImages.findIndex(img => img.src === se.primary_photo)}
                    />
                  ))}
                </div>
                {canLoadMoreSeries && (
                  <div className="mt-4 flex justify-center">
                    <button type="button" onClick={() => setSeriesPage(p => p + 1)} className="px-4 py-2 border rounded">Load more series</button>
                  </div>
                )}
              </section>
            ) : null}

            {tagCount ? (
              <section id="tags">
                <h2 className="text-2xl font-semibold mb-4">Tags ({tagCount} of {tagTotal})</h2>
                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {tagResults.map((tag) => (
                    <TagCard key={tag.id} tag={tag} />
                  ))}
                </div>
                {canLoadMoreTags && (
                  <div className="mt-4 flex justify-center">
                    <button type="button" onClick={() => setTagPage(p => p + 1)} className="px-4 py-2 border rounded">Load more tags</button>
                  </div>
                )}
              </section>
            ) : null}

            {locationCount ? (
              <section id="locations">
                <h2 className="text-2xl font-semibold mb-4">Locations ({locationCount} of {locationTotal})</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-4">
                  {locationResults.map((location) => (
                    <LocationCardCondensed key={location.id} location={location} />
                  ))}
                </div>
                {canLoadMoreLocations && (
                  <div className="mt-4 flex justify-center">
                    <button type="button" onClick={() => setLocationPage(p => p + 1)} className="px-4 py-2 border rounded">Load more locations</button>
                  </div>
                )}
              </section>
            ) : null}
            {(!eventCount && !entityCount && !seriesCount && !tagCount && !locationCount) && (
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
  head: () => {
    // Build current absolute URL in the client; SSR fallback to site root
    const url = typeof window !== 'undefined' ? window.location.href : 'https://arcane.city/search';
    return {
      meta: [
        { title: `Search • ${SITE_NAME}` },
        { property: 'og:url', content: `${url}` },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: `Search • ${SITE_NAME}` },
        { property: 'og:image', content: DEFAULT_IMAGE },
        { property: 'og:description', content: `Search results for events, entities, series, tags, and locations in Pittsburgh.` },
        { name: 'description', content: `Search results for events, entities, series, tags, and locations in Pittsburgh.` },
      ],
    };
  },
});

