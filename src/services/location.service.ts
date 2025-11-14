import { api } from '../lib/api';
import { Location } from '../types/api';

/**
 * Update location coordinates in the database
 */
export async function updateLocationCoordinates(
    locationId: number,
    latitude: number,
    longitude: number
): Promise<Location | null> {
    try {
        const response = await api.put(`/locations/${locationId}`, {
            latitude,
            longitude
        });
        
        return response.data;
    } catch (error) {
        console.error(`Failed to update location ${locationId} coordinates:`, error);
        return null;
    }
}
