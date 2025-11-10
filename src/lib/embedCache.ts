// src/lib/embedCache.ts
/**
 * Caching utility for event and entity embeds with TTL support.
 * Stores embed data in localStorage with timestamps to manage expiration.
 */

const CACHE_KEY_PREFIX = 'embed_cache_';
const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

interface CachedEmbed {
    data: string[];
    timestamp: number;
    ttl: number;
}

/**
 * Generate a cache key for a specific resource
 */
function getCacheKey(resourceType: 'events' | 'entities', slug: string, endpoint: 'embeds' | 'minimal-embeds'): string {
    return `${CACHE_KEY_PREFIX}${resourceType}_${slug}_${endpoint}`;
}

/**
 * Check if cached data is still valid based on TTL
 */
function isValid(cachedItem: CachedEmbed): boolean {
    const now = Date.now();
    const age = now - cachedItem.timestamp;
    return age < cachedItem.ttl;
}

/**
 * Get embeds from cache if available and not expired
 */
export function getEmbedCache(
    resourceType: 'events' | 'entities',
    slug: string,
    endpoint: 'embeds' | 'minimal-embeds' = 'minimal-embeds'
): string[] | null {
    try {
        const key = getCacheKey(resourceType, slug, endpoint);
        const cached = localStorage.getItem(key);
        
        if (!cached) {
            return null;
        }

        const cachedItem: CachedEmbed = JSON.parse(cached);
        
        if (isValid(cachedItem)) {
            return cachedItem.data;
        }

        // Cache expired, remove it
        localStorage.removeItem(key);
        return null;
    } catch (error) {
        console.warn('Error reading embed cache:', error);
        return null;
    }
}

/**
 * Store embeds in cache with TTL
 */
export function setEmbedCache(
    resourceType: 'events' | 'entities',
    slug: string,
    data: string[],
    endpoint: 'embeds' | 'minimal-embeds' = 'minimal-embeds',
    ttlMs: number = DEFAULT_TTL_MS
): void {
    try {
        const key = getCacheKey(resourceType, slug, endpoint);
        const cachedItem: CachedEmbed = {
            data,
            timestamp: Date.now(),
            ttl: ttlMs
        };
        
        localStorage.setItem(key, JSON.stringify(cachedItem));
    } catch (error) {
        console.warn('Error setting embed cache:', error);
    }
}

/**
 * Clear a specific embed cache entry
 */
export function clearEmbedCache(
    resourceType: 'events' | 'entities',
    slug: string,
    endpoint: 'embeds' | 'minimal-embeds' = 'minimal-embeds'
): void {
    try {
        const key = getCacheKey(resourceType, slug, endpoint);
        localStorage.removeItem(key);
    } catch (error) {
        console.warn('Error clearing embed cache:', error);
    }
}

/**
 * Clear all embed caches
 */
export function clearAllEmbedCaches(): void {
    try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(CACHE_KEY_PREFIX)) {
                localStorage.removeItem(key);
            }
        });
    } catch (error) {
        console.warn('Error clearing all embed caches:', error);
    }
}

/**
 * Get the default TTL in milliseconds
 */
export function getDefaultTTL(): number {
    return DEFAULT_TTL_MS;
}
