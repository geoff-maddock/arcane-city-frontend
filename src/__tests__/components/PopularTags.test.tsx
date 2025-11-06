import { render, screen, waitFor } from '../test-render';
import PopularTags from '../../components/PopularTags';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { api } from '../../lib/api';

vi.mock('@tanstack/react-router', () => ({
    Link: ({ children, to, params, ...props }: { children: React.ReactNode; to: string; params?: { slug: string };[key: string]: unknown }) => (
        <a href={params ? `/tags/${params.slug}` : to} {...props}>{children}</a>
    ),
}));

vi.mock('../../lib/api', () => ({
    api: {
        get: vi.fn(),
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
    });

    it('renders popular tags with popularity scores', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: mockPopularTagsResponse });

        render(<PopularTags />);

        // Wait for the tags to load - check for tag with score in brackets
        expect(await screen.findByText(/Electronic \[16\]/)).toBeInTheDocument();
        expect(screen.getByText('Popular Tags')).toBeInTheDocument();
        expect(screen.getByText(/Punk \[10\]/)).toBeInTheDocument();
        expect(screen.getByText(/Indie \[6\]/)).toBeInTheDocument();
    });

    it('renders links to tag detail pages', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: mockPopularTagsResponse });

        render(<PopularTags />);

        const electronicLink = await screen.findByRole('link', { name: /Electronic \[16\]/ });
        expect(electronicLink).toHaveAttribute('href', '/tags/electronic');

        const punkLink = screen.getByRole('link', { name: /Punk \[10\]/ });
        expect(punkLink).toHaveAttribute('href', '/tags/punk');

        const indieLink = screen.getByRole('link', { name: /Indie \[6\]/ });
        expect(indieLink).toHaveAttribute('href', '/tags/indie');
    });

    it('shows loading state', () => {
        vi.mocked(api.get).mockImplementation(() => new Promise(() => {}));

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
        vi.mocked(api.get).mockResolvedValue({ data: mockPopularTagsResponse });

        render(<PopularTags days={30} limit={10} style="past" />);

        await screen.findByText('Popular Tags');

        const apiCall = vi.mocked(api.get).mock.calls[0];
        const url = apiCall[0] as string;
        const searchParams = new URLSearchParams(url.split('?')[1]);

        expect(searchParams.get('days')).toBe('30');
        expect(searchParams.get('limit')).toBe('10');
        expect(searchParams.get('style')).toBe('past');
    });

    it('applies correct color classes based on popularity score', async () => {
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

        vi.mocked(api.get).mockResolvedValue({ data: mockDataWithVariedScores });

        const { container } = render(<PopularTags />);

        await screen.findByText(/HighScore \[25\]/);

        const links = container.querySelectorAll('a');
        expect(links[0]).toHaveClass('text-red-600'); // 25 >= 21
        expect(links[1]).toHaveClass('text-orange-600'); // 15 >= 10
        expect(links[2]).toHaveClass('text-yellow-600'); // 7 >= 5
        expect(links[3]).toHaveClass('text-primary'); // 3 < 5
    });
});
