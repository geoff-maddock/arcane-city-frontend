import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useSlug } from '@/hooks/useSlug';

describe('useSlug', () => {
    it('auto-syncs slug from name initially', () => {
        const { result } = renderHook(() => useSlug('', ''));
        act(() => result.current.setName('My Test Name'));
        expect(result.current.slug).toBe('my-test-name');
    });

    it('stops syncing after manual slug edit', () => {
        const { result } = renderHook(() => useSlug('', ''));
        act(() => result.current.setName('Another Name'));
        expect(result.current.slug).toBe('another-name');
        act(() => result.current.setSlug('custom-slug'));
        act(() => result.current.setName('Changed Again'));
        // slug should remain manual
        expect(result.current.slug).toBe('custom-slug');
    });

    it('reset re-enables syncing', () => {
        const { result } = renderHook(() => useSlug('', ''));
        act(() => result.current.setName('Original Name'));
        act(() => result.current.setSlug('manual'));
        act(() => result.current.reset());
        expect(result.current.slug).toBe('original-name');
    });
});
