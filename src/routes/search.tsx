import React, { useState } from 'react';
import { createRoute, Link } from '@tanstack/react-router';
import { rootRoute } from './root';
import { useEvents } from '../hooks/useEvents';
import { useEntities } from '../hooks/useEntities';
import { useSeries } from '../hooks/useSeries';
import { useTags } from '../hooks/useTags';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

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

const Search: React.FC = () => {
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(input.trim());
  };

  const { name, createdBefore, createdAfter } = parseSearchQuery(query);

  const dateFilter = createdBefore || createdAfter ? { start: createdAfter, end: createdBefore } : undefined;

  const { data: eventData } = useEvents({ itemsPerPage: 5, filters: { name, created_at: dateFilter } });
  const { data: entityData } = useEntities({ itemsPerPage: 5, filters: { name, created_at: dateFilter } });
  const { data: seriesData } = useSeries({ itemsPerPage: 5, filters: { name, created_at: dateFilter } });
  const { data: tagData } = useTags({ itemsPerPage: 5, filters: { name, created_at: dateFilter } });

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Search" />
        <button type="submit" className="px-4 py-2 border rounded">Search</button>
      </form>

      {query && (
        <div className="space-y-6">
          {eventData?.data?.length ? (
            <Card>
              <CardContent className="p-4 space-y-2">
                <h2 className="text-xl font-semibold">Events</h2>
                <ul className="list-disc ml-6 space-y-1">
                  {eventData.data.map((ev) => (
                    <li key={ev.id}>
                      <Link to="/events/$slug" params={{ slug: ev.slug }} className="hover:underline">
                        {ev.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}

          {entityData?.data?.length ? (
            <Card>
              <CardContent className="p-4 space-y-2">
                <h2 className="text-xl font-semibold">Entities</h2>
                <ul className="list-disc ml-6 space-y-1">
                  {entityData.data.map((en) => (
                    <li key={en.id}>
                      <Link to="/entities" search={{ name: en.name }} className="hover:underline">
                        {en.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}

          {seriesData?.data?.length ? (
            <Card>
              <CardContent className="p-4 space-y-2">
                <h2 className="text-xl font-semibold">Series</h2>
                <ul className="list-disc ml-6 space-y-1">
                  {seriesData.data.map((se) => (
                    <li key={se.id}>
                      <Link to="/series/$slug" params={{ slug: se.slug }} className="hover:underline">
                        {se.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}

          {tagData?.data?.length ? (
            <Card>
              <CardContent className="p-4 space-y-2">
                <h2 className="text-xl font-semibold">Tags</h2>
                <ul className="list-disc ml-6 space-y-1">
                  {tagData.data.map((tag) => (
                    <li key={tag.id}>
                      <Link to="/tags/$slug" params={{ slug: tag.slug }} className="hover:underline">
                        {tag.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}
    </div>
  );
};

export const SearchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/search',
  component: Search,
});

