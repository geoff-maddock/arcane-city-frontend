import { render, screen, fireEvent } from '@testing-library/react';
import { FilterContainer } from '../../components/FilterContainer';
import { vi } from 'vitest';

describe('FilterContainer', () => {
    const mockOnToggleFilters = vi.fn();
    const mockOnClearAllFilters = vi.fn();
    const mockOnResetFilters = vi.fn();

    beforeEach(() => {
        mockOnToggleFilters.mockClear();
        mockOnClearAllFilters.mockClear();
        mockOnResetFilters.mockClear();
    });

    it('should render filter toggle button', () => {
        render(
            <FilterContainer
                filtersVisible={false}
                onToggleFilters={mockOnToggleFilters}
                hasActiveFilters={false}
                onClearAllFilters={mockOnClearAllFilters}
            >
                <div>Filter content</div>
            </FilterContainer>
        );

        expect(screen.getByText('Show Filters')).toBeInTheDocument();
    });

    it('should render clear all button when filters are active', () => {
        render(
            <FilterContainer
                filtersVisible={false}
                onToggleFilters={mockOnToggleFilters}
                hasActiveFilters={true}
                onClearAllFilters={mockOnClearAllFilters}
            >
                <div>Filter content</div>
            </FilterContainer>
        );

        expect(screen.getByText('Clear All')).toBeInTheDocument();
    });

    it('should not render clear all button when no active filters', () => {
        render(
            <FilterContainer
                filtersVisible={false}
                onToggleFilters={mockOnToggleFilters}
                hasActiveFilters={false}
                onClearAllFilters={mockOnClearAllFilters}
            >
                <div>Filter content</div>
            </FilterContainer>
        );

        expect(screen.queryByText('Clear All')).not.toBeInTheDocument();
    });

    it('should render reset button when onResetFilters is provided', () => {
        render(
            <FilterContainer
                filtersVisible={false}
                onToggleFilters={mockOnToggleFilters}
                hasActiveFilters={false}
                onClearAllFilters={mockOnClearAllFilters}
                onResetFilters={mockOnResetFilters}
            >
                <div>Filter content</div>
            </FilterContainer>
        );

        expect(screen.getByText('Reset')).toBeInTheDocument();
    });

    it('should not render reset button when onResetFilters is not provided', () => {
        render(
            <FilterContainer
                filtersVisible={false}
                onToggleFilters={mockOnToggleFilters}
                hasActiveFilters={false}
                onClearAllFilters={mockOnClearAllFilters}
            >
                <div>Filter content</div>
            </FilterContainer>
        );

        expect(screen.queryByText('Reset')).not.toBeInTheDocument();
    });

    it('should call onResetFilters when reset button is clicked', () => {
        render(
            <FilterContainer
                filtersVisible={false}
                onToggleFilters={mockOnToggleFilters}
                hasActiveFilters={false}
                onClearAllFilters={mockOnClearAllFilters}
                onResetFilters={mockOnResetFilters}
            >
                <div>Filter content</div>
            </FilterContainer>
        );

        fireEvent.click(screen.getByText('Reset'));
        expect(mockOnResetFilters).toHaveBeenCalledTimes(1);
    });

    it('should call onClearAllFilters when clear all button is clicked', () => {
        render(
            <FilterContainer
                filtersVisible={false}
                onToggleFilters={mockOnToggleFilters}
                hasActiveFilters={true}
                onClearAllFilters={mockOnClearAllFilters}
            >
                <div>Filter content</div>
            </FilterContainer>
        );

        fireEvent.click(screen.getByText('Clear All'));
        expect(mockOnClearAllFilters).toHaveBeenCalledTimes(1);
    });

    it('should render children when filters are visible', () => {
        render(
            <FilterContainer
                filtersVisible={true}
                onToggleFilters={mockOnToggleFilters}
                hasActiveFilters={false}
                onClearAllFilters={mockOnClearAllFilters}
            >
                <div>Filter content</div>
            </FilterContainer>
        );

        expect(screen.getByText('Filter content')).toBeInTheDocument();
    });

    it('should not render children when filters are hidden', () => {
        render(
            <FilterContainer
                filtersVisible={false}
                onToggleFilters={mockOnToggleFilters}
                hasActiveFilters={false}
                onClearAllFilters={mockOnClearAllFilters}
            >
                <div>Filter content</div>
            </FilterContainer>
        );

        expect(screen.queryByText('Filter content')).not.toBeInTheDocument();
    });

    it('should render active filters component when provided and filters are hidden', () => {
        render(
            <FilterContainer
                filtersVisible={false}
                onToggleFilters={mockOnToggleFilters}
                hasActiveFilters={true}
                onClearAllFilters={mockOnClearAllFilters}
                activeFiltersComponent={<div>Active filters</div>}
            >
                <div>Filter content</div>
            </FilterContainer>
        );

        expect(screen.getByText('Active filters')).toBeInTheDocument();
    });

    it('should use custom clear all text when provided', () => {
        render(
            <FilterContainer
                filtersVisible={false}
                onToggleFilters={mockOnToggleFilters}
                hasActiveFilters={true}
                onClearAllFilters={mockOnClearAllFilters}
                clearAllText="Remove All"
            >
                <div>Filter content</div>
            </FilterContainer>
        );

        expect(screen.getByText('Remove All')).toBeInTheDocument();
    });

    it('should use custom reset text when provided', () => {
        render(
            <FilterContainer
                filtersVisible={false}
                onToggleFilters={mockOnToggleFilters}
                hasActiveFilters={false}
                onClearAllFilters={mockOnClearAllFilters}
                onResetFilters={mockOnResetFilters}
                resetText="Restore Defaults"
            >
                <div>Filter content</div>
            </FilterContainer>
        );

        expect(screen.getByText('Restore Defaults')).toBeInTheDocument();
    });

    it('should render both clear all and reset buttons when both are applicable', () => {
        render(
            <FilterContainer
                filtersVisible={false}
                onToggleFilters={mockOnToggleFilters}
                hasActiveFilters={true}
                onClearAllFilters={mockOnClearAllFilters}
                onResetFilters={mockOnResetFilters}
            >
                <div>Filter content</div>
            </FilterContainer>
        );

        expect(screen.getByText('Clear All')).toBeInTheDocument();
        expect(screen.getByText('Reset')).toBeInTheDocument();
    });
});
