import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateLocationCoordinates } from '../../services/location.service';
import { api } from '../../lib/api';

vi.mock('../../lib/api');

describe('location.service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('updateLocationCoordinates', () => {
        it('updates location coordinates successfully', async () => {
            const mockLocation = {
                id: 1,
                name: 'Test Location',
                slug: 'test-location',
                latitude: 40.4406,
                longitude: -79.9959
            };

            vi.mocked(api.put).mockResolvedValue({ data: mockLocation });

            const result = await updateLocationCoordinates(1, 40.4406, -79.9959);

            expect(api.put).toHaveBeenCalledWith('/locations/1', {
                latitude: 40.4406,
                longitude: -79.9959
            });
            expect(result).toEqual(mockLocation);
        });

        it('returns null on API error', async () => {
            vi.mocked(api.put).mockRejectedValue(new Error('Network error'));

            const result = await updateLocationCoordinates(1, 40.4406, -79.9959);

            expect(result).toBeNull();
        });

        it('handles 401 authentication errors', async () => {
            const error = new Error('Unauthorized');
            (error as unknown as { response: { status: number } }).response = { status: 401 };
            
            vi.mocked(api.put).mockRejectedValue(error);

            const result = await updateLocationCoordinates(1, 40.4406, -79.9959);

            expect(result).toBeNull();
        });
    });
});
