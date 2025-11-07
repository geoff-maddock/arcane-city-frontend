import { render, screen, waitFor } from '../test-render';
import PopularTags from '../../components/PopularTags';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
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

describe('PopularTags', () => {
    const mockPopularTagsResponse = {
        data: [
            {
                id: 24,
                name: 'Electronic',
                slug: 'electronic',
                description: null,
                tag_type_id: 1,
                popularity_score: 16,
            },
            {
                id: 42,
                name: 'Punk',
                slug: 'punk',
                description: null,
                tag_type_id: 1,
                popularity_score: 10,
            },
            {
                id: 85,
                name: 'Indie',
                slug: 'indie',
                description: null,
                tag_type_id: 1,
                popularity_score: 6,
            },
        ],
        current_page: 1,
        last_page: 1,
        per_page: 5,
        total: 3,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        
        // Default mock for all API calls to return empty responses
        vi.mocked(api.get).mockImplementation((url: string) => {
            if (url.includes('/tags/popular')) {
                return Promise.resolve({ data: mockPopularTagsResponse });
            }
            // Mock responses for tag images and upcoming events
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
    });

    it('renders popular tags using EnhancedTagCard', async () => {
        render(<PopularTags />);

        // Wait for the tags to load
        await screen.findByText(/Electronic/);

        // Verify all tag names are displayed
        expect(screen.getByText('Popular Tags')).toBeInTheDocument();
        expect(screen.getByText(/Electronic/)).toBeInTheDocument();
        expect(screen.getByText(/Punk/)).toBeInTheDocument();
        expect(screen.getByText(/Indie/)).toBeInTheDocument();

        // Verify the links exist and have correct href
        const links = screen.getAllByRole('link');
        expect(links.length).toBeGreaterThanOrEqual(3);
        expect(links[0]).toHaveAttribute('href', '/tags/electronic');
        expect(links[1]).toHaveAttribute('href', '/tags/punk');
        expect(links[2]).toHaveAttribute('href', '/tags/indie');
    });

    it('renders links to tag detail pages', async () => {
        render(<PopularTags />);

        const electronicLink = await screen.findByRole('link', { name: /Electronic/ });
        expect(electronicLink).toHaveAttribute('href', '/tags/electronic');

        const punkLink = screen.getByRole('link', { name: /Punk/ });
        expect(punkLink).toHaveAttribute('href', '/tags/punk');

        const indieLink = screen.getByRole('link', { name: /Indie/ });
        expect(indieLink).toHaveAttribute('href', '/tags/indie');
    });

    it('shows loading state', () => {
        vi.mocked(api.get).mockImplementation(() => new Promise(() => { }));

        render(<PopularTags />);

        expect(screen.getByText('Popular Tags')).toBeInTheDocument();
    });

    it('shows error message on API failure', async () => {
        vi.mocked(api.get).mockRejectedValue(new Error('API Error'));

        render(<PopularTags />);

        expect(await screen.findByText('Failed to load popular tags. Please try again later.')).toBeInTheDocument();
    });

    it('renders nothing when no tags are returned', async () => {
        vi.mocked(api.get).mockResolvedValue({
            data: {
                data: [],
                current_page: 1,
                last_page: 1,
                per_page: 5,
                total: 0,
            },
        });

        const { container } = render(<PopularTags />);

        // Wait for the query to complete
        await waitFor(() => {
            expect(container.firstChild).toBeNull();
        });
    });

    it('uses custom parameters', async () => {
        render(<PopularTags days={30} limit={10} style="past" />);

        await screen.findByText('Popular Tags');

        // Find the popular tags API call
        const popularTagsCall = vi.mocked(api.get).mock.calls.find(call => 
            (call[0] as string).includes('/tags/popular')
        );
        
        expect(popularTagsCall).toBeDefined();
        const url = popularTagsCall![0] as string;
        const searchParams = new URLSearchParams(url.split('?')[1]);

        expect(searchParams.get('days')).toBe('30');
        expect(searchParams.get('limit')).toBe('10');
        expect(searchParams.get('style')).toBe('past');
    });

    it('renders tags with EnhancedTagCard grid layout', async () => {
        const mockDataWithVariedScores = {
            data: [
                { id: 1, name: 'HighScore', slug: 'high', popularity_score: 25 },
                { id: 2, name: 'MediumScore', slug: 'medium', popularity_score: 15 },
                { id: 3, name: 'LowScore', slug: 'low', popularity_score: 7 },
                { id: 4, name: 'VeryLowScore', slug: 'verylow', popularity_score: 3 },
            ],
            current_page: 1,
            last_page: 1,
            per_page: 5,
            total: 4,
        };

        vi.mocked(api.get).mockImplementation((url: string) => {
            if (url.includes('/tags/popular')) {
                return Promise.resolve({ data: mockDataWithVariedScores });
            }
            return Promise.resolve({
                data: { data: [], current_page: 1, last_page: 1, per_page: 1, total: 0 },
            });
        });

        const { container } = render(<PopularTags />);

        await screen.findByText(/HighScore/);

        // Verify tags are rendered as cards in a grid
        const grid = container.querySelector('.grid');
        expect(grid).toBeInTheDocument();
        
        // All tag names should be present
        expect(screen.getByText('HighScore')).toBeInTheDocument();
        expect(screen.getByText('MediumScore')).toBeInTheDocument();
        expect(screen.getByText('LowScore')).toBeInTheDocument();
        expect(screen.getByText('VeryLowScore')).toBeInTheDocument();
    });
});
