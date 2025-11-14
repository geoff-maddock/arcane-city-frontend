import { render, screen } from '../test-render';
import LocationCardCondensed from '../../components/LocationCardCondensed';
import { describe, it, expect, vi } from 'vitest';

// Mock Link component from react-router to avoid needing RouterProvider
vi.mock('@tanstack/react-router', () => ({
    Link: ({ children, to, params }: { children: React.ReactNode; to: string; params: Record<string, string> }) => (
        <a href={`${to}/${params?.entitySlug || ''}`}>{children}</a>
    ),
}));

describe('LocationCardCondensed', () => {
    const mockLocation = {
        id: 1,
        name: 'The Rex Theater',
        slug: 'the-rex-theater',
        address_one: '1602 E Carson St',
        neighborhood: 'South Side',
        city: 'Pittsburgh',
        state: 'PA',
        postcode: '15203',
        country: 'USA',
        map_url: 'https://maps.google.com/?q=The+Rex+Theater',
        entity: {
            id: 1,
            name: 'The Rex Theater',
            slug: 'the-rex-theater',
        },
    };

    it('renders location name', () => {
        render(<LocationCardCondensed location={mockLocation} />);
        expect(screen.getByRole('heading', { name: 'The Rex Theater' })).toBeInTheDocument();
    });

    it('displays address information', () => {
        render(<LocationCardCondensed location={mockLocation} />);
        expect(screen.getByText('1602 E Carson St')).toBeInTheDocument();
        expect(screen.getByText(/Pittsburgh/)).toBeInTheDocument();
        expect(screen.getByText(/PA/)).toBeInTheDocument();
        expect(screen.getByText(/15203/)).toBeInTheDocument();
    });

    it('displays neighborhood if present', () => {
        render(<LocationCardCondensed location={mockLocation} />);
        expect(screen.getByText('South Side')).toBeInTheDocument();
    });

    it('renders without optional fields', () => {
        const minimalLocation = {
            id: 2,
            name: 'Minimal Venue',
            slug: 'minimal-venue',
            entity: {
                id: 2,
                name: 'Minimal Venue',
                slug: 'minimal-venue',
            },
        };
        render(<LocationCardCondensed location={minimalLocation} />);
        expect(screen.getByRole('heading', { name: 'Minimal Venue' })).toBeInTheDocument();
    });

    it('displays map link when map_url is present', () => {
        render(<LocationCardCondensed location={mockLocation} />);
        const mapLink = screen.getByText('View on map');
        expect(mapLink).toBeInTheDocument();
        expect(mapLink).toHaveAttribute('href', mockLocation.map_url);
        expect(mapLink).toHaveAttribute('target', '_blank');
        expect(mapLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('does not display map link when map_url is absent', () => {
        const locationWithoutMap = {
            ...mockLocation,
            map_url: undefined,
        };
        render(<LocationCardCondensed location={locationWithoutMap} />);
        expect(screen.queryByText('View on map')).not.toBeInTheDocument();
    });

    it('displays address_two when present', () => {
        const locationWithAddress2 = {
            ...mockLocation,
            address_two: 'Suite 200',
        };
        render(<LocationCardCondensed location={locationWithAddress2} />);
        expect(screen.getByText('Suite 200')).toBeInTheDocument();
    });
});
