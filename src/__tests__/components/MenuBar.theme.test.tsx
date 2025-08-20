import { describe, it, expect, beforeEach } from 'vitest';
import { fireEvent } from '@testing-library/react';
import { render } from '../test-render';
import MenuBar from '../../components/MenuBar';
import { vi } from 'vitest';

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
  useNavigate: () => vi.fn(),
}));

describe('MenuBar theme persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('applies stored dark theme on mount', () => {
    localStorage.setItem('theme', JSON.stringify('dark'));
    render(<MenuBar />);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('toggles theme and persists to localStorage', () => {
    render(<MenuBar />);
  const btn = document.querySelector('[data-testid="theme-toggle"]');
  expect(btn).toBeTruthy();
    // initial should be light
    expect(localStorage.getItem('theme')).toBe(JSON.stringify('light'));
    fireEvent.click(btn!);
    expect(localStorage.getItem('theme')).toBe(JSON.stringify('dark'));
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
