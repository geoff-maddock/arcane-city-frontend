import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import SeriesDetail from '../../components/SeriesDetail';
import { useQuery } from '@tanstack/react-query';

jest.mock('@tanstack/react-query');

const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;

describe('SeriesDetail Component', () => {
    const renderComponent = (seriesSlug: string) => {
        return render(<SeriesDetail seriesSlug={seriesSlug} />);
    };

    beforeEach(() => {
        mockUseQuery.mockClear();
    });

    it('should render loading state initially', () => {
        mockUseQuery.mockReturnValue({
            data: null,
            isLoading: true,
            error: null
        });

        renderComponent('test-series');

        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should render error state', () => {
        mockUseQuery.mockReturnValue({
            data: null,
            isLoading: false,
            error: new Error('Failed to fetch series')
        });

        renderComponent('test-series');

        expect(screen.getByText('Error loading series. Please try again later.')).toBeInTheDocument();
    });

    it('should render series details', async () => {
        const mockData = {
            id: 1,
            name: 'Test Series',
            short: 'Short description',
            description: 'Detailed description',
            primary_photo: 'photo.jpg',
            series_type: { name: 'Type 1' },
            primary_location: {
                address_line_one: '123 Main St',
                city: 'Test City',
                state: 'TS'
            },
            series_status: { name: 'Active' },
            roles: [{ name: 'Role 1' }],
            links: [{ id: 1, url: 'http://example.com' }],
            tags: [{ id: 1, name: 'Tag 1' }]
        };

        mockUseQuery.mockReturnValue({
            data: mockData,
            isLoading: false,
            error: null
        });

        renderComponent('test-series');

        await waitFor(() => {
            expect(screen.getByText('Test Series')).toBeInTheDocument();
            expect(screen.getByText('Short description')).toBeInTheDocument();
            expect(screen.getByText('Detailed description')).toBeInTheDocument();
            expect(screen.getByText('Type 1')).toBeInTheDocument();
            expect(screen.getByText('123 Main St')).toBeInTheDocument();
            expect(screen.getByText('Test City, TS')).toBeInTheDocument();
            expect(screen.getByText('Active')).toBeInTheDocument();
            expect(screen.getByText('Role 1')).toBeInTheDocument();
            expect(screen.getByText('http://example.com')).toBeInTheDocument();
            expect(screen.getByText('Tag 1')).toBeInTheDocument();
        });
    });
});
