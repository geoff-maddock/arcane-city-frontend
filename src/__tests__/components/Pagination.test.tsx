import { render, screen } from '@testing-library/react';
import { Pagination } from '../../components/Pagination';
import { vi } from 'vitest';

describe('Pagination', () => {
    const mockOnPageChange = vi.fn();
    const mockOnItemsPerPageChange = vi.fn();
    const mockSetSort = vi.fn();
    const mockSetDirection = vi.fn();

    const defaultProps = {
        currentPage: 1,
        totalPages: 5,
        onPageChange: mockOnPageChange,
        itemCount: 25,
        totalItems: 100,
        itemsPerPage: 25,
        onItemsPerPageChange: mockOnItemsPerPageChange,
        sort: 'name',
        setSort: mockSetSort,
        direction: 'asc' as const,
        setDirection: mockSetDirection,
        sortOptions: [
            { value: 'name', label: 'Name' },
            { value: 'created_at', label: 'Created' },
        ],
    };

    beforeEach(() => {
        mockOnPageChange.mockClear();
        mockOnItemsPerPageChange.mockClear();
        mockSetSort.mockClear();
        mockSetDirection.mockClear();
    });

    it('should render items per page dropdown with accessible name', () => {
        render(<Pagination {...defaultProps} />);

        // Check that the items per page SelectTrigger has an aria-label
        const itemsPerPageButton = screen.getByRole('combobox', { name: /items per page/i });
        expect(itemsPerPageButton).toBeInTheDocument();
    });

    it('should render pagination controls', () => {
        render(<Pagination {...defaultProps} />);

        // Check for Previous and Next buttons
        expect(screen.getByText('Previous')).toBeInTheDocument();
        expect(screen.getByText('Next')).toBeInTheDocument();
    });
});
