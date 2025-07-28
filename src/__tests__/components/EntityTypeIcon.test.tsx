import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { EntityTypeIcon } from '../../components/EntityTypeIcon';

describe('EntityTypeIcon', () => {
    it('renders Warehouse icon for Space entity type', () => {
        render(<EntityTypeIcon entityTypeName="Space" />);

        // The icon should be rendered and have the warehouse class
        const icon = document.querySelector('svg');
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveClass('lucide-warehouse');
    });

    it('renders Users icon for non-Space entity types', () => {
        render(<EntityTypeIcon entityTypeName="Artist" />);

        // The icon should be rendered and have the users class
        const icon = document.querySelector('svg');
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveClass('lucide-users');
    });

    it('applies custom className', () => {
        render(<EntityTypeIcon entityTypeName="Space" className="text-blue-600" />);

        const icon = document.querySelector('svg');
        expect(icon).toHaveClass('text-blue-600');
    });

    it('applies correct size classes', () => {
        render(<EntityTypeIcon entityTypeName="Space" size="sm" />);

        const icon = document.querySelector('svg');
        expect(icon).toHaveClass('h-4', 'w-4');
    });

    it('applies default medium size when no size specified', () => {
        render(<EntityTypeIcon entityTypeName="Space" />);

        const icon = document.querySelector('svg');
        expect(icon).toHaveClass('h-5', 'w-5');
    });

    it('applies flex-shrink-0 class', () => {
        render(<EntityTypeIcon entityTypeName="Space" />);

        const icon = document.querySelector('svg');
        expect(icon).toHaveClass('flex-shrink-0');
    });
});
