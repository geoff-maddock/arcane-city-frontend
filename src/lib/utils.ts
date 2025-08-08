// src/lib/utils.ts
import axios from 'axios';
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const toKebabCase = (str: string): string => {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
};

// Lightweight, stable stringify for objects used in react-query keys
export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return String(value);
  if (Array.isArray(value)) return `[${value.map(v => stableStringify(v)).join(',')}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => a.localeCompare(b));
  return `{${entries.map(([k, v]) => `${k}:${stableStringify(v)}`).join(',')}}`;
}

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

// Build an array of lightbox images (shared pattern across components)
export function buildImageList<T extends { primary_photo?: string; primary_photo_thumbnail?: string; name: string }>(items?: T[]) {
  if (!items) return [] as { src: string; alt: string; thumbnail: string }[];
  return items
    .filter(i => i.primary_photo && i.primary_photo_thumbnail)
    .map(i => ({
      src: i.primary_photo as string,
      alt: i.name,
      thumbnail: i.primary_photo_thumbnail as string,
    }));
}

export function formatPaginationRange(page: number, perPage: number, total: number) {
  if (total === 0) return 'Showing 0 results';
  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);
  return `Showing ${start} to ${end} of ${total} results`;
}