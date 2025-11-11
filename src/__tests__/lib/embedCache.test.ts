import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    getEmbedCache,
    setEmbedCache,
    clearEmbedCache,
    clearAllEmbedCaches,
    getDefaultTTL,
} from '../../lib/embedCache';

describe('embedCache', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
        vi.clearAllMocks();
    });

    describe('getDefaultTTL', () => {
        it('should return default TTL of 7 days in milliseconds', () => {
            const expectedTTL = 7 * 24 * 60 * 60 * 1000; // 7 days
            expect(getDefaultTTL()).toBe(expectedTTL);
        });
    });

    describe('setEmbedCache and getEmbedCache', () => {
        it('should store and retrieve embeds from cache', () => {
            const embeds = ['<iframe src="test1"></iframe>', '<iframe src="test2"></iframe>'];
            setEmbedCache('events', 'test-event', embeds, 'minimal-embeds');

            const retrieved = getEmbedCache('events', 'test-event', 'minimal-embeds');
            expect(retrieved).toEqual(embeds);
        });

        it('should return null for non-existent cache', () => {
            const retrieved = getEmbedCache('events', 'non-existent', 'minimal-embeds');
            expect(retrieved).toBeNull();
        });

        it('should store embeds for different resource types separately', () => {
            const eventEmbeds = ['<iframe src="event"></iframe>'];
            const entityEmbeds = ['<iframe src="entity"></iframe>'];

            setEmbedCache('events', 'test-slug', eventEmbeds, 'minimal-embeds');
            setEmbedCache('entities', 'test-slug', entityEmbeds, 'minimal-embeds');

            expect(getEmbedCache('events', 'test-slug', 'minimal-embeds')).toEqual(eventEmbeds);
            expect(getEmbedCache('entities', 'test-slug', 'minimal-embeds')).toEqual(entityEmbeds);
        });

        it('should store embeds for different endpoints separately', () => {
            const minimalEmbeds = ['<iframe src="minimal"></iframe>'];
            const fullEmbeds = ['<iframe src="full"></iframe>'];

            setEmbedCache('events', 'test-event', minimalEmbeds, 'minimal-embeds');
            setEmbedCache('events', 'test-event', fullEmbeds, 'embeds');

            expect(getEmbedCache('events', 'test-event', 'minimal-embeds')).toEqual(minimalEmbeds);
            expect(getEmbedCache('events', 'test-event', 'embeds')).toEqual(fullEmbeds);
        });

        it('should use default TTL when not specified', () => {
            const embeds = ['<iframe src="test"></iframe>'];
            setEmbedCache('events', 'test-event', embeds);

            const retrieved = getEmbedCache('events', 'test-event');
            expect(retrieved).toEqual(embeds);
        });

        it('should return null for expired cache', () => {
            const embeds = ['<iframe src="test"></iframe>'];
            const shortTTL = 100; // 100ms

            setEmbedCache('events', 'test-event', embeds, 'minimal-embeds', shortTTL);

            // Wait for cache to expire
            return new Promise<void>((resolve) => {
                setTimeout(() => {
                    const retrieved = getEmbedCache('events', 'test-event', 'minimal-embeds');
                    expect(retrieved).toBeNull();
                    resolve();
                }, 150);
            });
        });

        it('should return data for non-expired cache', () => {
            const embeds = ['<iframe src="test"></iframe>'];
            const longTTL = 10000; // 10 seconds

            setEmbedCache('events', 'test-event', embeds, 'minimal-embeds', longTTL);

            const retrieved = getEmbedCache('events', 'test-event', 'minimal-embeds');
            expect(retrieved).toEqual(embeds);
        });

        it('should handle errors gracefully when localStorage is unavailable', () => {
            // Mock localStorage to throw an error
            const originalSetItem = Storage.prototype.setItem;
            Storage.prototype.setItem = vi.fn(() => {
                throw new Error('localStorage unavailable');
            });

            const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

            setEmbedCache('events', 'test-event', ['test'], 'minimal-embeds');
            expect(consoleWarnSpy).toHaveBeenCalledWith('Error setting embed cache:', expect.any(Error));

            // Restore
            Storage.prototype.setItem = originalSetItem;
            consoleWarnSpy.mockRestore();
        });

        it('should handle errors gracefully when reading corrupted cache', () => {
            // Set corrupted data directly
            localStorage.setItem('embed_cache_events_test-event_minimal-embeds', 'corrupted{json');

            const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

            const retrieved = getEmbedCache('events', 'test-event', 'minimal-embeds');
            expect(retrieved).toBeNull();
            expect(consoleWarnSpy).toHaveBeenCalledWith('Error reading embed cache:', expect.any(Error));

            consoleWarnSpy.mockRestore();
        });
    });

    describe('clearEmbedCache', () => {
        it('should clear a specific cache entry', () => {
            const embeds = ['<iframe src="test"></iframe>'];
            setEmbedCache('events', 'test-event', embeds, 'minimal-embeds');

            expect(getEmbedCache('events', 'test-event', 'minimal-embeds')).toEqual(embeds);

            clearEmbedCache('events', 'test-event', 'minimal-embeds');

            expect(getEmbedCache('events', 'test-event', 'minimal-embeds')).toBeNull();
        });

        it('should not affect other cache entries', () => {
            const embeds1 = ['<iframe src="test1"></iframe>'];
            const embeds2 = ['<iframe src="test2"></iframe>'];

            setEmbedCache('events', 'event1', embeds1, 'minimal-embeds');
            setEmbedCache('events', 'event2', embeds2, 'minimal-embeds');

            clearEmbedCache('events', 'event1', 'minimal-embeds');

            expect(getEmbedCache('events', 'event1', 'minimal-embeds')).toBeNull();
            expect(getEmbedCache('events', 'event2', 'minimal-embeds')).toEqual(embeds2);
        });

        it('should handle errors gracefully', () => {
            const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

            // Mock localStorage.removeItem to throw
            const originalRemoveItem = Storage.prototype.removeItem;
            Storage.prototype.removeItem = vi.fn(() => {
                throw new Error('removeItem error');
            });

            clearEmbedCache('events', 'test-event', 'minimal-embeds');
            expect(consoleWarnSpy).toHaveBeenCalledWith('Error clearing embed cache:', expect.any(Error));

            // Restore
            Storage.prototype.removeItem = originalRemoveItem;
            consoleWarnSpy.mockRestore();
        });
    });

    describe('clearAllEmbedCaches', () => {
        it('should clear all embed caches', () => {
            const embeds1 = ['<iframe src="test1"></iframe>'];
            const embeds2 = ['<iframe src="test2"></iframe>'];
            const embeds3 = ['<iframe src="test3"></iframe>'];

            setEmbedCache('events', 'event1', embeds1, 'minimal-embeds');
            setEmbedCache('events', 'event2', embeds2, 'embeds');
            setEmbedCache('entities', 'entity1', embeds3, 'minimal-embeds');

            // Add a non-embed item to localStorage
            localStorage.setItem('other_key', 'other_value');

            clearAllEmbedCaches();

            expect(getEmbedCache('events', 'event1', 'minimal-embeds')).toBeNull();
            expect(getEmbedCache('events', 'event2', 'embeds')).toBeNull();
            expect(getEmbedCache('entities', 'entity1', 'minimal-embeds')).toBeNull();

            // Non-embed item should still exist
            expect(localStorage.getItem('other_key')).toBe('other_value');
        });

        it('should handle empty localStorage', () => {
            expect(() => clearAllEmbedCaches()).not.toThrow();
        });

        it('should handle errors gracefully', () => {
            const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

            // Try clearing non-existent keys - should not throw
            clearAllEmbedCaches();

            // No errors should have been logged for empty cache
            consoleWarnSpy.mockRestore();
        });
    });
});
