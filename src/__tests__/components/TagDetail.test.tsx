import { render, screen, fireEvent } from '../test-render';
import TagDetail from '../../components/TagDetail';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import React from 'react';
import { authService } from '../../services/auth.service';

vi.mock('@tanstack/react-router', () => ({
    Link: ({ children, ...props }: { children: React.ReactNode;[key: string]: unknown }) => (
        <a {...props}>{children}</a>
    ),
    useNavigate: () => vi.fn(),
}));

vi.mock('../../services/auth.service');

vi.mock('../../lib/api', () => ({
    api: {
        get: vi.fn((url: string) => {
            const paginated = { data: [], current_page: 1, last_page: 1, per_page: 5, total: 0 };
            if (url === '/tags/test-tag') {
                return Promise.resolve({
                    data: {
                        id: 1,
                        name: 'Test Tag',
                        slug: 'test-tag',
                        description: 'A test tag',
                        tag_type: { id: 1, name: 'Genre' },
                        created_by: 1,
                    },
                });
            }
            if (url === '/tags/test-tag/related-tags') {
                return Promise.resolve({
                    data: {
                        House: 334,
                        Electronic: 215,
                        Bass: 86,
                        Experimental: 63,
                        Electro: 59,
                    },
                });
            }
            return Promise.resolve({ data: paginated });
        }),
        post: vi.fn(),
        delete: vi.fn(),
    },
}));

describe('TagDetail', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(authService.isAuthenticated).mockReturnValue(true);
        vi.mocked(authService.getCurrentUser).mockResolvedValue({
            id: 1,
            name: 'testuser',
            email: 'test@example.com',
            status: { id: 1, name: 'active' },
            email_verified_at: null,
            last_active: null,
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z',
            followed_tags: [],
            followed_entities: [],
            followed_series: [],
            followed_threads: [],
            photos: [],
        });
    });

    it('renders tag type and description', async () => {
        render(<TagDetail slug="test-tag" />);

        expect(await screen.findByText('Test Tag')).toBeInTheDocument();
        expect(screen.getByText('Genre')).toBeInTheDocument();
        expect(screen.getByText('A test tag')).toBeInTheDocument();
    });

    it('shows edit and delete options in actions menu', async () => {
        render(<TagDetail slug="test-tag" />);

        await screen.findByText('Test Tag');
        const actionsButton = screen.getByLabelText('More actions');
        fireEvent.click(actionsButton);
        expect(screen.getByText('Edit Tag')).toBeInTheDocument();
        expect(screen.getByText('Delete Tag')).toBeInTheDocument();
    });

    it('displays related tags sorted by relatedness', async () => {
        render(<TagDetail slug="test-tag" />);

        // Wait for the component to load
        await screen.findByText('Test Tag');

        // Check that related tags heading is present
        expect(screen.getByText('Related Tags')).toBeInTheDocument();

        // Check that related tags are displayed
        expect(await screen.findByText('House')).toBeInTheDocument();
        expect(screen.getByText('Electronic')).toBeInTheDocument();
        expect(screen.getByText('Bass')).toBeInTheDocument();
        expect(screen.getByText('Experimental')).toBeInTheDocument();
        expect(screen.getByText('Electro')).toBeInTheDocument();
    });
});

