import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AllTheProviders } from './test-utils';

// Custom render function that includes providers
export const customRender = (
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything from testing-library/react
export * from '@testing-library/react';

// Override render method
export { customRender as render };
