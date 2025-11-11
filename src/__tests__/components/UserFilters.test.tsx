import { render, screen, fireEvent } from '@testing-library/react';
import UserFilters from '../../components/UserFilters';
import { vi } from 'vitest';

describe('UserFilters', () => {
    const mockOnFilterChange = vi.fn();
    const defaultFilters = {
        name: '',
        email: '',
        status: '',
        is_verified: '',
    };

    beforeEach(() => {
        mockOnFilterChange.mockClear();
    });

    it('should render all filter fields', () => {
        render(<UserFilters filters={defaultFilters} onFilterChange={mockOnFilterChange} />);

        expect(screen.getByLabelText('User Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('User Status')).toBeInTheDocument();
        expect(screen.getByLabelText('Is Verified')).toBeInTheDocument();
    });

    it('should handle name filter change', () => {
        render(<UserFilters filters={defaultFilters} onFilterChange={mockOnFilterChange} />);

        const nameInput = screen.getByPlaceholderText('Search users...');
        fireEvent.change(nameInput, { target: { value: 'John' } });

        expect(mockOnFilterChange).toHaveBeenCalledWith({
            ...defaultFilters,
            name: 'John',
        });
    });

    it('should handle email filter change', () => {
        render(<UserFilters filters={defaultFilters} onFilterChange={mockOnFilterChange} />);

        const emailInput = screen.getByPlaceholderText('Search by email...');
        fireEvent.change(emailInput, { target: { value: 'john@example.com' } });

        expect(mockOnFilterChange).toHaveBeenCalledWith({
            ...defaultFilters,
            email: 'john@example.com',
        });
    });

    it('should display current filter values', () => {
        const filledFilters = {
            name: 'John Doe',
            email: 'john@example.com',
            status: 'active',
            is_verified: '1',
        };

        render(<UserFilters filters={filledFilters} onFilterChange={mockOnFilterChange} />);

        expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
        expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
    });

    it('should render status select with correct options', () => {
        render(<UserFilters filters={defaultFilters} onFilterChange={mockOnFilterChange} />);

        const statusSelect = screen.getByLabelText('Filter by user status');
        expect(statusSelect).toBeInTheDocument();
    });

    it('should render verification select with correct options', () => {
        render(<UserFilters filters={defaultFilters} onFilterChange={mockOnFilterChange} />);

        const verificationSelect = screen.getByLabelText('Filter by verification status');
        expect(verificationSelect).toBeInTheDocument();
    });

    it('should maintain filter state when props change', () => {
        const { rerender } = render(
            <UserFilters filters={defaultFilters} onFilterChange={mockOnFilterChange} />
        );

        const updatedFilters = {
            name: 'Jane',
            email: 'jane@example.com',
            status: 'active',
            is_verified: '1',
        };

        rerender(<UserFilters filters={updatedFilters} onFilterChange={mockOnFilterChange} />);

        expect(screen.getByDisplayValue('Jane')).toBeInTheDocument();
        expect(screen.getByDisplayValue('jane@example.com')).toBeInTheDocument();
    });
});
