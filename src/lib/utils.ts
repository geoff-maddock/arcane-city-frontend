// src/lib/utils.ts
import axios from 'axios';
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export const EASTERN_TZ = 'America/New_York';

function isDSTInZone(date: Date, timeZone: string): boolean {
  // Detect 'EDT' vs 'EST' via Intl parts
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: '2-digit',
    timeZoneName: 'short',
  }).formatToParts(date);
  const tzName = parts.find((p) => p.type === 'timeZoneName')?.value ?? '';
  return /DT$/i.test(tzName); // EDT => true, EST => false
}

/**
 * Formats an event datetime in a specific IANA zone and optionally applies a 1h DST correction
 * for backends that computed UTC with fixed EST (-05:00) year-round.
 */
export function formatEventDate(
  dateString: string,
  opts?: { timeZone?: string; fixESTUtcBug?: boolean }
): string {
  const timeZone = opts?.timeZone ?? EASTERN_TZ;
  const raw = new Date(dateString);

  const corrected =
    opts?.fixESTUtcBug && isDSTInZone(raw, timeZone)
      ? new Date(raw.getTime() - 60 * 60 * 1000)
      : raw;

  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
    timeZone,
  };

  return new Intl.DateTimeFormat('en-US', options).format(corrected);
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const toKebabCase = (str: string): string => {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
};

export function formatDate(dateString: string): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  };

  return new Date(dateString).toLocaleDateString('en-US', options);
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, "PPPp");
}

export function formatApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message;
  }
  return 'An unexpected error occurred';
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

// Add date validation
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

// Generate Google Calendar link for an event
export function generateGoogleCalendarLink(event: {
  name: string;
  description?: string;
  start_at: string;
  end_at?: string;
  venue?: { name: string };
}): string {
  const action = 'TEMPLATE';
  const text = encodeURIComponent(event.name);

  // Helper: format date to 'YYYYMMDDTHHMMSS' in UTC to avoid local TZ differences
  const toGoogleUtc = (d: Date) => {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    const hh = String(d.getUTCHours()).padStart(2, '0');
    const mm = String(d.getUTCMinutes()).padStart(2, '0');
    const ss = String(d.getUTCSeconds()).padStart(2, '0');
    return `${y}${m}${day}T${hh}${mm}${ss}`;
  };

  // Format dates to UTC 'YYYYMMDDTHHMMSS'
  const startDate = new Date(event.start_at);
  const start = toGoogleUtc(startDate);

  // Use end_at if available, otherwise use start_at (following the PHP pattern)
  const endDate = event.end_at ? new Date(event.end_at) : startDate;
  const end = toGoogleUtc(endDate);

  const details = encodeURIComponent(event.description || '');
  const location = encodeURIComponent(event.venue?.name || 'Unknown');
  const sf = 'true';

  const url = `https://www.google.com/calendar/render?action=${action}&text=${text}&dates=${start}/${end}&details=${details}&location=${location}&sf=${sf}&output=xml`;

  return url;
}