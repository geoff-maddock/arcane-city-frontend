import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Series from '../../components/Series';
import { useSeries } from '../../hooks/useSeries';
import { SeriesFilterContext } from '../../context/SeriesFilterContext';

jest.mock('../../hooks/useSeries');

const mockUseSeries = useSeries as jest.MockedFunction<typeof useSeries>;

describe('Series Component', () => {
    const mockFilters = {
        name: '',
        series_type: '',
        tag: '',
        created_at: {
            start: undefined,
            end: undefined
        }
    };

    const mockSetFilters = jest.fn();

    const renderComponent = () => {
        return render(
            <SeriesFilterContext.Provider value={{ filters: mockFilters, setFilters: mockSetFilters }}>
                <Series />
            </SeriesFilterContext.Provider>
        );
    };

    beforeEach(() => {
        mockUseSeries.mockClear();
    });

    it('should render loading state initially', () => {
        mockUseSeries.mockReturnValue({
            data: null,
            isLoading: true,
            error: null
        });

        renderComponent();

        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should render error state', () => {
        mockUseSeries.mockReturnValue({
            data: null,
            isLoading: false,
            error: new Error('Failed to fetch series')
        });

        renderComponent();

        expect(screen.getByText('There was an error loading series. Please try again later.')).toBeInTheDocument();
    });

    it('should render series list', async () => {
        const mockData = {
            data: [
                {
                    id: 1,
                    name: 'Series 1',
                    primary_photo: 'photo1.jpg',
                    primary_photo_thumbnail: 'thumbnail1.jpg'
                },
                {
                    id: 2,
                    name: 'Series 2',
                    primary_photo: 'photo2.jpg',
                    primary_photo_thumbnail: 'thumbnail2.jpg'
                }
            ],
            last_page: 1,
            total: 2
        };

        mockUseSeries.mockReturnValue({
            data: mockData,
            isLoading: false,
            error: null
        });

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Series 1')).toBeInTheDocument();
            expect(screen.getByText('Series 2')).toBeInTheDocument();
        });
    });

    it('should handle filter visibility toggle', () => {
        mockUseSeries.mockReturnValue({
            data: null,
            isLoading: false,
            error: null
        });

        renderComponent();

        const toggleButton = screen.getByText('Hide Filters');
        fireEvent.click(toggleButton);

        expect(screen.getByText('Show Filters')).toBeInTheDocument();
    });

    it('should handle filter changes', () => {
        mockUseSeries.mockReturnValue({
            data: null,
            isLoading: false,
            error: null
        });

        renderComponent();

        const nameInput = screen.getByPlaceholderText('Search series...');
        fireEvent.change(nameInput, { target: { value: 'New Series' } });

        expect(mockSetFilters).toHaveBeenCalledWith({
            ...mockFilters,
            name: 'New Series'
        });
    });

    it('should handle pagination', async () => {
        const mockData = {
            data: [
                {
                    id: 1,
                    name: 'Series 1',
                    primary_photo: 'photo1.jpg',
                    primary_photo_thumbnail: 'thumbnail1.jpg'
                }
            ],
            last_page: 2,
            total: 2
        };

        mockUseSeries.mockReturnValue({
            data: mockData,
            isLoading: false,
            error: null
        });

        renderComponent();

        const nextPageButton = screen.getByText('Next');
        fireEvent.click(nextPageButton);

        await waitFor(() => {
            expect(mockUseSeries).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }));
        });
    });
});
