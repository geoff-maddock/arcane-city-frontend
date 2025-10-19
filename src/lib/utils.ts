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

/**
 * Converts a UTC datetime string from the API to a local datetime-local input string.
 * Uses the same timezone logic as formatEventDate with optional DST correction.
 */
export function utcToLocalDatetimeInput(
  dateString: string | null | undefined,
  opts?: { timeZone?: string; fixESTUtcBug?: boolean }
): string {
  if (!dateString) return '';

  const timeZone = opts?.timeZone ?? EASTERN_TZ;
  const raw = new Date(dateString);

  // Check if date is valid
  if (isNaN(raw.getTime())) {
    return '';
  }

  const corrected =
    opts?.fixESTUtcBug && isDSTInZone(raw, timeZone)
      ? new Date(raw.getTime() - 60 * 60 * 1000)
      : raw;

  // Format to YYYY-MM-DDTHH:mm for datetime-local input
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(corrected);
  const year = parts.find(p => p.type === 'year')?.value ?? '';
  const month = parts.find(p => p.type === 'month')?.value ?? '';
  const day = parts.find(p => p.type === 'day')?.value ?? '';
  const hour = parts.find(p => p.type === 'hour')?.value ?? '';
  const minute = parts.find(p => p.type === 'minute')?.value ?? '';

  return `${year}-${month}-${day}T${hour}:${minute}`;
}

/**
 * Converts a local datetime-local input string to a UTC ISO string for the API.
 * Reverses the timezone conversion applied by utcToLocalDatetimeInput.
 */
export function localDatetimeInputToUtc(
  localString: string | null | undefined,
  opts?: { timeZone?: string; fixESTUtcBug?: boolean }
): string {
  if (!localString) return '';

  const timeZone = opts?.timeZone ?? EASTERN_TZ;

  // Parse the datetime-local string (YYYY-MM-DDTHH:mm)
  const [datePart, timePart] = localString.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);

  // Strategy: Use a reference UTC time to determine the timezone offset
  // Use a date in the same month/year for DST accuracy
  const referenceUtc = Date.UTC(year, month - 1, 15, 12, 0, 0, 0);

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  // See what the reference UTC time looks like in the target timezone
  const parts = formatter.formatToParts(new Date(referenceUtc));
  const localYear = Number(parts.find(p => p.type === 'year')?.value ?? 0);
  const localMonth = Number(parts.find(p => p.type === 'month')?.value ?? 0);
  const localDay = Number(parts.find(p => p.type === 'day')?.value ?? 0);
  const localHour = Number(parts.find(p => p.type === 'hour')?.value ?? 0);
  const localMinute = Number(parts.find(p => p.type === 'minute')?.value ?? 0);

  // Calculate the timezone offset
  const localTime = Date.UTC(localYear, localMonth - 1, localDay, localHour, localMinute, 0, 0);
  const offset = referenceUtc - localTime;

  // Apply the offset to convert from local time to UTC
  const localAsUtc = Date.UTC(year, month - 1, day, hour, minute, 0, 0);
  const correctedUtcDate = new Date(localAsUtc + offset);

  // Apply DST bug correction if needed (reverse of what we did on input)
  const final = opts?.fixESTUtcBug && isDSTInZone(correctedUtcDate, timeZone)
    ? new Date(correctedUtcDate.getTime() + 60 * 60 * 1000)
    : correctedUtcDate;

  return final.toISOString();
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