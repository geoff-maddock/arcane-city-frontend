import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { geocodeAddress, buildAddressQuery, clearGeocodeCache } from '../../lib/geocoding';
import { Location } from '../../types/api';

// Mock fetch globally
global.fetch = vi.fn();

describe('geocoding', () => {
    beforeEach(() => {
        clearGeocodeCache();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('buildAddressQuery', () => {
        it('builds query from full address', () => {
            const location: Location = {
                id: 1,
                name: 'Test Location',
                slug: 'test-location',
                address_one: '123 Main St',
                city: 'Pittsburgh',
                state: 'PA',
                postcode: '15213'
            };

            const query = buildAddressQuery(location);
            expect(query).toBe('123 Main St, Pittsburgh, PA, 15213');
        });

        it('builds query from partial address', () => {
            const location: Location = {
                id: 1,
                name: 'Test Location',
                slug: 'test-location',
                city: 'Pittsburgh',
                state: 'PA'
            };

            const query = buildAddressQuery(location);
            expect(query).toBe('Pittsburgh, PA');
        });

        it('returns null for empty location', () => {
            const location: Location = {
                id: 1,
                name: 'Test Location',
                slug: 'test-location'
            };

            const query = buildAddressQuery(location);
            expect(query).toBeNull();
        });
    });

    describe('geocodeAddress', () => {
        it('returns existing lat/lng if available', async () => {
            const location: Location = {
                id: 1,
                name: 'Test Location',
                slug: 'test-location',
                latitude: 40.4406,
                longitude: -79.9959,
                address_one: '123 Main St',
                city: 'Pittsburgh'
            };

            const result = await geocodeAddress(location);
            
            expect(result).toEqual({
                lat: 40.4406,
                lng: -79.9959,
                address: '123 Main St, Pittsburgh'
            });
            expect(fetch).not.toHaveBeenCalled();
        });

        it('geocodes address using Nominatim', async () => {
            const location: Location = {
                id: 1,
                name: 'Test Location',
                slug: 'test-location',
                address_one: '123 Main St',
                city: 'Pittsburgh',
                state: 'PA'
            };

            const mockResponse = [
                {
                    lat: '40.4406',
                    lon: '-79.9959',
                    display_name: '123 Main St, Pittsburgh, PA'
                }
            ];

            (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            const result = await geocodeAddress(location);
            
            expect(result).toEqual({
                lat: 40.4406,
                lng: -79.9959,
                address: '123 Main St, Pittsburgh, PA'
            });
            expect(fetch).toHaveBeenCalledTimes(1);
        });

        it('returns null for empty geocoding results', async () => {
            const location: Location = {
                id: 1,
                name: 'Test Location',
                slug: 'test-location',
                city: 'Nonexistent City'
            };

            (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
                ok: true,
                json: async () => []
            });

            const result = await geocodeAddress(location);
            
            expect(result).toBeNull();
        });

        it('handles fetch errors gracefully', async () => {
            const location: Location = {
                id: 1,
                name: 'Test Location',
                slug: 'test-location',
                city: 'Pittsburgh'
            };

            (fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
                new Error('Network error')
            );

            const result = await geocodeAddress(location);
            
            expect(result).toBeNull();
        });

        it('caches geocoding results', async () => {
            const location: Location = {
                id: 1,
                name: 'Test Location',
                slug: 'test-location',
                city: 'Pittsburgh'
            };

            const mockResponse = [
                {
                    lat: '40.4406',
                    lon: '-79.9959',
                    display_name: 'Pittsburgh, PA'
                }
            ];

            (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
                ok: true,
                json: async () => mockResponse
            });

            // First call
            const result1 = await geocodeAddress(location);
            expect(fetch).toHaveBeenCalledTimes(1);

            // Second call should use cache
            const result2 = await geocodeAddress(location);
            expect(fetch).toHaveBeenCalledTimes(1); // Still 1, not 2
            expect(result2).toEqual(result1);
        });
    });
});
