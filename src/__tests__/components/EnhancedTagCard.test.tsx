import { render, screen, waitFor } from '../test-render';
import EnhancedTagCard from '../../components/EnhancedTagCard';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { api } from '../../lib/api';

vi.mock('@tanstack/react-router', () => ({
    useNavigate: () => vi.fn(),
}));

vi.mock('../../lib/api', () => ({
    api: {
        get: vi.fn(),
        post: vi.fn(),
    },
}));

vi.mock('../../services/auth.service', () => ({
    authService: {
        getCurrentUser: vi.fn(),
        isAuthenticated: () => false,
    },
}));

describe('EnhancedTagCard', () => {
    const mockTag = {
        id: 1,
        name: 'Electronic',
        slug: 'electronic',
        description: 'Electronic music events',
        popularity_score: 15,
    };

    const mockEvents = [
        {
            id: 1,
            name: 'Event 1',
            slug: 'event-1',
            start_at: '2025-12-01T20:00:00Z',
            primary_photo: 'photo1.jpg',
            primary_photo_thumbnail: 'photo1-thumb.jpg',
            event_type: { id: 1, name: 'Concert', slug: 'concert', created_at: '2024-01-01', updated_at: '2024-01-01', short: '' },
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
            attending: 0,
            like: 0,
        },
        {
            id: 2,
            name: 'Event 2',
            slug: 'event-2',
            start_at: '2025-12-02T20:00:00Z',
            primary_photo: 'photo2.jpg',
            primary_photo_thumbnail: 'photo2-thumb.jpg',
            event_type: { id: 2, name: 'Festival', slug: 'festival', created_at: '2024-01-01', updated_at: '2024-01-01', short: '' },
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
            attending: 0,
            like: 0,
        },
        {
            id: 3,
            name: 'Event 3',
            slug: 'event-3',
            start_at: '2025-12-03T20:00:00Z',
            primary_photo: 'photo3.jpg',
            primary_photo_thumbnail: 'photo3-thumb.jpg',
            event_type: { id: 3, name: 'Party', slug: 'party', created_at: '2024-01-01', updated_at: '2024-01-01', short: '' },
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
            attending: 0,
            like: 0,
        },
        {
            id: 4,
            name: 'Event 4',
            slug: 'event-4',
            start_at: '2025-12-04T20:00:00Z',
            primary_photo: 'photo4.jpg',
            primary_photo_thumbnail: 'photo4-thumb.jpg',
            event_type: { id: 4, name: 'Show', slug: 'show', created_at: '2024-01-01', updated_at: '2024-01-01', short: '' },
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
            attending: 0,
            like: 0,
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        
        // Mock responses for tag image (latest event/entity)
        vi.mocked(api.get).mockImplementation((url: string) => {
            if (url.includes('/events?') && url.includes('filters[tag]')) {
                // For upcoming events
                if (url.includes('filters[start_at][start]')) {
                    return Promise.resolve({
                        data: {
                            data: mockEvents,
                            current_page: 1,
                            last_page: 1,
                            per_page: 4,
                            total: 4,
                        },
                    });
                }
                // For tag image
                return Promise.resolve({
                    data: {
                        data: [mockEvents[0]],
                        current_page: 1,
                        last_page: 1,
                        per_page: 1,
                        total: 1,
                    },
                });
            }
            if (url.includes('/entities?')) {
                return Promise.resolve({
                    data: {
                        data: [],
                        current_page: 1,
                        last_page: 1,
                        per_page: 1,
                        total: 0,
                    },
                });
            }
            return Promise.reject(new Error('Unexpected URL'));
        });
    });

    it('renders tag name and image', async () => {
        const { container } = render(<EnhancedTagCard tag={mockTag} />);

        // Check tag name is displayed
        expect(screen.getByText('Electronic')).toBeInTheDocument();

        // Check that at least the tag image is rendered (it has alt="" and src)
        await waitFor(() => {
            const images = container.querySelectorAll('img');
            expect(images.length).toBeGreaterThan(0);
            expect(images[0]).toHaveAttribute('src');
        }, { timeout: 3000 });
    });

    it.skip('displays upcoming event images in a grid', async () => {
        vi.clearAllMocks();
        
        // Set up fresh mock
        vi.mocked(api.get).mockImplementation((url: string) => {
            if (url.includes('/events?') && url.includes('filters[tag]')) {
                // For upcoming events
                if (url.includes('filters[start_at][start]')) {
                    return Promise.resolve({
                        data: {
                            data: mockEvents,
                            current_page: 1,
                            last_page: 1,
                            per_page: 4,
                            total: 4,
                        },
                    });
                }
                // For tag image
                return Promise.resolve({
                    data: {
                        data: [mockEvents[0]],
                        current_page: 1,
                        last_page: 1,
                        per_page: 1,
                        total: 1,
                    },
                });
            }
            return Promise.resolve({
                data: {
                    data: [],
                    current_page: 1,
                    last_page: 1,
                    per_page: 1,
                    total: 0,
                },
            });
        });

        const { container } = render(<EnhancedTagCard tag={mockTag} />);

        // Wait for upcoming events to load and verify we have event images
        await waitFor(() => {
            const allImages = container.querySelectorAll('img');
            const eventImages = Array.from(allImages).filter(img => img.alt !== '');
            expect(eventImages.length).toBeGreaterThanOrEqual(1);
        }, { timeout: 3000 });

        // Verify at least one event image is displayed
        const allImages = container.querySelectorAll('img');
        const eventImages = Array.from(allImages).filter(img => img.alt !== '');
        
        // Should have at least one event image
        expect(eventImages.length).toBeGreaterThan(0);
        expect(eventImages[0]).toHaveAttribute('alt');
    });

    it.skip('shows event type and name on hover overlay', async () => {
        vi.clearAllMocks();
        
        // Set up fresh mock  
        vi.mocked(api.get).mockImplementation((url: string) => {
            if (url.includes('/events?') && url.includes('filters[tag]')) {
                // For upcoming events
                if (url.includes('filters[start_at][start]')) {
                    return Promise.resolve({
                        data: {
                            data: mockEvents,
                            current_page: 1,
                            last_page: 1,
                            per_page: 4,
                            total: 4,
                        },
                    });
                }
                // For tag image
                return Promise.resolve({
                    data: {
                        data: [mockEvents[0]],
                        current_page: 1,
                        last_page: 1,
                        per_page: 1,
                        total: 1,
                    },
                });
            }
            return Promise.resolve({
                data: {
                    data: [],
                    current_page: 1,
                    last_page: 1,
                    per_page: 1,
                    total: 0,
                },
            });
        });

        const { container } = render(<EnhancedTagCard tag={mockTag} />);

        // Wait for events to load
        await waitFor(() => {
            const allImages = container.querySelectorAll('img');
            const eventImages = Array.from(allImages).filter(img => img.alt !== '');
            expect(eventImages.length).toBeGreaterThan(0);
        }, { timeout: 3000 });

        // Verify at least one event type is in the DOM (in the hover overlay)
        const eventTypes = container.querySelectorAll('.text-gray-300');
        expect(eventTypes.length).toBeGreaterThan(0);
    });

    it('limits display to 4 events maximum', async () => {
        const manyEvents = [...mockEvents, ...mockEvents]; // 8 events total
        
        vi.mocked(api.get).mockImplementation((url: string) => {
            if (url.includes('/events?') && url.includes('filters[start_at][start]')) {
                return Promise.resolve({
                    data: {
                        data: manyEvents,
                        current_page: 1,
                        last_page: 1,
                        per_page: 4,
                        total: 8,
                    },
                });
            }
            return Promise.resolve({
                data: { data: [], current_page: 1, last_page: 1, per_page: 1, total: 0 },
            });
        });

        const { container } = render(<EnhancedTagCard tag={mockTag} />);

        await waitFor(() => {
            const images = container.querySelectorAll('img');
            // Tag image + max 4 event images = 5 total
            expect(images.length).toBeLessThanOrEqual(5);
        }, { timeout: 3000 });
    });

    it('renders without upcoming events', async () => {
        vi.mocked(api.get).mockImplementation(() => {
            return Promise.resolve({
                data: {
                    data: [],
                    current_page: 1,
                    last_page: 1,
                    per_page: 4,
                    total: 0,
                },
            });
        });

        render(<EnhancedTagCard tag={mockTag} />);

        // Tag name should still be visible
        expect(screen.getByText('Electronic')).toBeInTheDocument();

        // No event names should be present
        await waitFor(() => {
            expect(screen.queryByText('Event 1')).not.toBeInTheDocument();
        });
    });

    it('has clickable link to tag detail page', () => {
        render(<EnhancedTagCard tag={mockTag} />);

        const link = screen.getByRole('link', { name: 'Electronic' });
        expect(link).toHaveAttribute('href', '/tags/electronic');
    });
});
