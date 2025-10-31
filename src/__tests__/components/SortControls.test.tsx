import { render, screen } from '@testing-library/react';
import SortControls from '../../components/SortControls';
import { vi } from 'vitest';

describe('SortControls', () => {
    const mockSetSort = vi.fn();
    const mockSetDirection = vi.fn();

    const defaultProps = {
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
        mockSetSort.mockClear();
        mockSetDirection.mockClear();
    });

    it('should render sort dropdown with accessible name', () => {
        render(<SortControls {...defaultProps} />);

        // Check that the SelectTrigger has an aria-label
        const sortButton = screen.getByRole('combobox', { name: /sort by/i });
        expect(sortButton).toBeInTheDocument();
    });

    it('should render direction toggle button with accessible name', () => {
        render(<SortControls {...defaultProps} />);

        // Check that the direction toggle button has an accessible name
        const directionButton = screen.getByRole('button', { name: /sort ascending/i });
        expect(directionButton).toBeInTheDocument();
    });

    it('should update accessible name when direction changes', () => {
        const { rerender } = render(<SortControls {...defaultProps} direction="asc" />);
        
        let directionButton = screen.getByRole('button', { name: /sort ascending/i });
        expect(directionButton).toBeInTheDocument();

        // Re-render with descending direction
        rerender(<SortControls {...defaultProps} direction="desc" />);
        
        directionButton = screen.getByRole('button', { name: /sort descending/i });
        expect(directionButton).toBeInTheDocument();
    });
});
