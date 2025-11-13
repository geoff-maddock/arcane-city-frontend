import { Location } from '../types/api';
import { updateLocationCoordinates } from '../services/location.service';

interface GeocodedLocation {
    lat: number;
    lng: number;
    address: string;
}

// Cache geocoded addresses to avoid repeated API calls
const geocodeCache = new Map<string, GeocodedLocation | null>();

/**
 * Constructs a search query from location data
 */
export function buildAddressQuery(location: Location): string | null {
    const parts: string[] = [];
    
    if (location.address_one) {
        parts.push(location.address_one);
    }
    
    if (location.city) {
        parts.push(location.city);
    }
    
    if (location.state) {
        parts.push(location.state);
    }
    
    if (location.postcode) {
        parts.push(location.postcode);
    }
    
    // If we don't have at least city or address, we can't geocode
    if (parts.length === 0) {
        return null;
    }
    
    return parts.join(', ');
}

/**
 * Geocode an address using Nominatim (OpenStreetMap's geocoding service)
 * Free to use with proper attribution and rate limiting
 * Saves geocoded coordinates to the database for future use
 */
export async function geocodeAddress(location: Location): Promise<GeocodedLocation | null> {
    // First check if we already have lat/lng
    if (location.latitude && location.longitude) {
        return {
            lat: location.latitude,
            lng: location.longitude,
            address: buildAddressQuery(location) || ''
        };
    }
    
    const addressQuery = buildAddressQuery(location);
    if (!addressQuery) {
        return null;
    }
    
    // Check cache first
    if (geocodeCache.has(addressQuery)) {
        return geocodeCache.get(addressQuery) || null;
    }
    
    try {
        // Use Nominatim API with proper user agent
        const params = new URLSearchParams({
            q: addressQuery,
            format: 'json',
            limit: '1',
            addressdetails: '1'
        });
        
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?${params.toString()}`,
            {
                headers: {
                    'User-Agent': 'Arcane-City-Events/1.0'
                }
            }
        );
        
        if (!response.ok) {
            console.error(`Geocoding failed for "${addressQuery}": ${response.status}`);
            geocodeCache.set(addressQuery, null);
            return null;
        }
        
        const data = await response.json();
        
        if (data.length === 0) {
            console.warn(`No geocoding results for "${addressQuery}"`);
            geocodeCache.set(addressQuery, null);
            return null;
        }
        
        const result: GeocodedLocation = {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
            address: addressQuery
        };
        
        geocodeCache.set(addressQuery, result);
        
        // Save coordinates to database for future use
        // This runs in the background and doesn't block the UI
        updateLocationCoordinates(location.id, result.lat, result.lng)
            .then((updated) => {
                if (updated) {
                    console.log(`Saved coordinates for location ${location.id} (${location.name})`);
                }
            })
            .catch((error) => {
                console.warn(`Could not save coordinates for location ${location.id}:`, error);
            });
        
        return result;
        
    } catch (error) {
        console.error(`Error geocoding address "${addressQuery}":`, error);
        geocodeCache.set(addressQuery, null);
        return null;
    }
}

/**
 * Batch geocode multiple locations with rate limiting
 * Nominatim requires 1 request per second max
 */
export async function geocodeBatch(locations: Location[]): Promise<Map<string, GeocodedLocation>> {
    const results = new Map<string, GeocodedLocation>();
    
    for (const location of locations) {
        const addressQuery = buildAddressQuery(location);
        if (!addressQuery) continue;
        
        // Skip if already cached
        if (geocodeCache.has(addressQuery)) {
            const cached = geocodeCache.get(addressQuery);
            if (cached) {
                results.set(addressQuery, cached);
            }
            continue;
        }
        
        const result = await geocodeAddress(location);
        if (result) {
            results.set(addressQuery, result);
        }
        
        // Rate limit: wait 1 second between requests (Nominatim requirement)
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return results;
}

/**
 * Clear the geocoding cache
 */
export function clearGeocodeCache() {
    geocodeCache.clear();
}
