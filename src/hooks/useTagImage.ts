import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Event, Entity, PaginatedResponse } from '../types/api';

interface TagImageResult {
    url: string | null;
    alt: string;
}

export const useTagImage = (slug: string) => {
    const fetchLatestEvent = async () => {
        const params = new URLSearchParams();
        params.append('page', '1');
        params.append('limit', '1');
        params.append('filters[tag]', slug);
        params.append('sort', 'created_at');
        params.append('direction', 'desc');
        const { data } = await api.get<PaginatedResponse<Event>>(`/events?${params.toString()}`);
        return data.data[0];
    };

    const fetchLatestEntity = async () => {
        const params = new URLSearchParams();
        params.append('page', '1');
        params.append('limit', '1');
        params.append('filters[tag]', slug);
        params.append('sort', 'created_at');
        params.append('direction', 'desc');
        const { data } = await api.get<PaginatedResponse<Entity>>(`/entities?${params.toString()}`);
        return data.data[0];
    };

    const { data: event } = useQuery<Event | undefined>({
        queryKey: ['tagLatestEvent', slug],
        queryFn: fetchLatestEvent,
    });

    const { data: entity } = useQuery<Entity | undefined>({
        queryKey: ['tagLatestEntity', slug],
        queryFn: fetchLatestEntity,
    });

    let url: string | null = null;
    let alt = '';

    if (event && entity) {
        const eventDate = (event as any).created_at ? new Date((event as any).created_at).getTime() : new Date((event as any).start_at).getTime();
        const entityDate = new Date((entity as any).created_at).getTime();
        const latest = eventDate >= entityDate ? event : entity;
        url = latest.primary_photo_thumbnail || latest.primary_photo || null;
        alt = latest.name;
    } else if (event) {
        url = event.primary_photo_thumbnail || event.primary_photo || null;
        alt = event.name;
    } else if (entity) {
        url = entity.primary_photo_thumbnail || entity.primary_photo || null;
        alt = entity.name;
    }

    return { url, alt } as TagImageResult;
};
