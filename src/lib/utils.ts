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