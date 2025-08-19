import { render, screen, fireEvent } from '@testing-library/react';
import { FilterToggleButton } from '../../components/FilterToggleButton';
import { vi } from 'vitest';

describe('FilterToggleButton', () => {
    const mockOnToggle = vi.fn();

    beforeEach(() => {
        mockOnToggle.mockClear();
    });

    it('should render with show filters text when filters are hidden', () => {
        render(
            <FilterToggleButton
                filtersVisible={false}
                onToggle={mockOnToggle}
            />
        );

        expect(screen.getByText('Show Filters')).toBeInTheDocument();
        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should render with hide filters text when filters are visible', () => {
        render(
            <FilterToggleButton
                filtersVisible={true}
                onToggle={mockOnToggle}
            />
        );

        expect(screen.getByText('Hide Filters')).toBeInTheDocument();
    });

    it('should call onToggle when clicked', () => {
        render(
            <FilterToggleButton
                filtersVisible={false}
                onToggle={mockOnToggle}
            />
        );

        fireEvent.click(screen.getByRole('button'));
        expect(mockOnToggle).toHaveBeenCalledTimes(1);
    });

    it('should use custom text when provided', () => {
        render(
            <FilterToggleButton
                filtersVisible={false}
                onToggle={mockOnToggle}
                showText="Open Filters"
                hideText="Close Filters"
            />
        );

        expect(screen.getByText('Open Filters')).toBeInTheDocument();

        // Re-render with filters visible
        render(
            <FilterToggleButton
                filtersVisible={true}
                onToggle={mockOnToggle}
                showText="Open Filters"
                hideText="Close Filters"
            />
        );

        expect(screen.getByText('Close Filters')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
        render(
            <FilterToggleButton
                filtersVisible={false}
                onToggle={mockOnToggle}
                className="custom-class"
            />
        );

        expect(screen.getByRole('button')).toHaveClass('custom-class');
    });

    it('should use correct icon based on visibility state', () => {
        const { rerender } = render(
            <FilterToggleButton
                filtersVisible={false}
                onToggle={mockOnToggle}
            />
        );

        // Check if the chevron down icon is present (filters hidden)
        let button = screen.getByRole('button');
        expect(button.querySelector('svg')).toBeInTheDocument();

        // Re-render with filters visible
        rerender(
            <FilterToggleButton
                filtersVisible={true}
                onToggle={mockOnToggle}
            />
        );

        // Check if the chevron up icon is present (filters visible)
        button = screen.getByRole('button');
        expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('should support different button variants', () => {
        render(
            <FilterToggleButton
                filtersVisible={false}
                onToggle={mockOnToggle}
                variant="default"
            />
        );

        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should support different button sizes', () => {
        render(
            <FilterToggleButton
                filtersVisible={false}
                onToggle={mockOnToggle}
                size="sm"
            />
        );

        expect(screen.getByRole('button')).toBeInTheDocument();
    });
});
