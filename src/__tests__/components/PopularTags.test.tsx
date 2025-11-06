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

        // Wait for the tags to load
        expect(await screen.findByText('Electronic')).toBeInTheDocument();
        expect(screen.getByText('Popular Tags')).toBeInTheDocument();
        expect(screen.getByText('Punk')).toBeInTheDocument();
        expect(screen.getByText('Indie')).toBeInTheDocument();
        expect(screen.getByText('16')).toBeInTheDocument();
        expect(screen.getByText('10')).toBeInTheDocument();
        expect(screen.getByText('6')).toBeInTheDocument();
    });

    it('renders links to tag detail pages', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: mockPopularTagsResponse });

        render(<PopularTags />);

        const electronicLink = await screen.findByRole('link', { name: 'Electronic' });
        expect(electronicLink).toHaveAttribute('href', '/tags/electronic');

        const punkLink = screen.getByRole('link', { name: 'Punk' });
        expect(punkLink).toHaveAttribute('href', '/tags/punk');

        const indieLink = screen.getByRole('link', { name: 'Indie' });
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
});
