import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NavigationLoadingIndicator } from '../../components/NavigationLoadingIndicator';

// Mock the router hook
vi.mock('@tanstack/react-router', () => ({
    useRouterState: vi.fn(),
}));

import { useRouterState } from '@tanstack/react-router';

describe('NavigationLoadingIndicator', () => {
    it('should not render when router status is not pending', () => {
        (useRouterState as ReturnType<typeof vi.fn>).mockReturnValue(false);
        
        const { container } = render(<NavigationLoadingIndicator />);
        
        expect(container.firstChild).toBeNull();
    });

    it('should render loading indicator when router status is pending', () => {
        (useRouterState as ReturnType<typeof vi.fn>).mockReturnValue(true);
        
        render(<NavigationLoadingIndicator />);
        
        // Check for loading text
        expect(screen.getByText('Loading page...')).toBeInTheDocument();
        
        // Check for the Loader2 icon (it should have the animate-spin class)
        const spinner = document.querySelector('.animate-spin');
        expect(spinner).toBeInTheDocument();
        
        // Check for aria attributes
        const container = screen.getByRole('status');
        expect(container).toHaveAttribute('aria-live', 'polite');
        expect(container).toHaveAttribute('aria-label', 'Loading page');
    });

    it('should have correct styling classes', () => {
        (useRouterState as ReturnType<typeof vi.fn>).mockReturnValue(true);
        
        const { container } = render(<NavigationLoadingIndicator />);
        
        // Check for fixed positioning
        const fixedDiv = container.querySelector('.fixed');
        expect(fixedDiv).toBeInTheDocument();
        expect(fixedDiv).toHaveClass('top-0', 'left-0', 'right-0', 'z-50');
    });

    it('should display progress bar', () => {
        (useRouterState as ReturnType<typeof vi.fn>).mockReturnValue(true);
        
        const { container } = render(<NavigationLoadingIndicator />);
        
        // Check for the progress bar with the gradient and animation
        const progressBar = container.querySelector('.h-1.animate-pulse');
        expect(progressBar).toBeInTheDocument();
        expect(progressBar).toHaveClass('bg-gradient-to-r');
    });
});
