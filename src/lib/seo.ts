// Centralized SEO helpers & defaults
import type { Event, Series, EntityResponse } from '../types/api';
import { formatEventDate } from './utils';

export const SITE_NAME = 'Arcane City';
export const SITE_DESCRIPTION = 'Arcane City – events, entities, series, culture and community.';
export const SITE_ORIGIN = typeof window !== 'undefined' ? window.location.origin : 'https://arcane.city';
export const DEFAULT_IMAGE = `${SITE_ORIGIN}/arcane-city-pgh.gif`;

// Produce an event page title similar to legacy getDateLastTitleFormat (name + date at end)
export function buildEventTitle(event: Event): string {
    const dateStr = event.start_at ? formatEventDate(event.start_at, { timeZone: 'America/New_York', fixESTUtcBug: true }) : '';
    return `${event.name}${dateStr ? ' – ' + dateStr : ''}`;
}



export function truncate(str: string | null | undefined, max = 155): string | undefined {
    if (!str) return undefined;
    const clean = str.replace(/\s+/g, ' ').trim();
    if (clean.length <= max) return clean;
    return clean.slice(0, max - 1).trimEnd() + '…';
}

export function buildOgImage(event: Event): string | undefined {
    if (event.primary_photo) return event.primary_photo;
    return undefined; // Let callers fall back to DEFAULT_IMAGE if desired
}

// Build a Series title mirroring legacy PHP getTitleFormat implementation.
// Logic:
//  base: name
//  if occurrenceType present -> append " - {occurrenceType.name} {occurrence_repeat}"
//  if venue present -> append " at {venue.name || 'No venue specified'}"
export function buildSeriesTitle(series: Series): string {
    let format = series.name;

    if (series.occurrence_type?.name) {
        const repeat = series.occurrence_repeat ? ' ' + series.occurrence_repeat : '';
        format += ' - ' + series.occurrence_type.name + repeat;
    }

    if (series.venue) {
        const venue = series.venue as EntityResponse; // typed
        const venueName = venue.name || 'No venue specified';
        format += ' at ' + venueName;
    }

    return format;
}
