import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMediaPlayerToggle } from '../../hooks/useMediaPlayerToggle';

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => {
            store[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
            delete store[key];
        }),
        clear: vi.fn(() => {
            store = {};
        }),
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

describe('useMediaPlayerToggle', () => {
    beforeEach(() => {
        localStorageMock.clear();
        vi.clearAllMocks();
    });

    it('should default to true when no stored value exists', () => {
        localStorageMock.getItem.mockReturnValue(null);

        const { result } = renderHook(() => useMediaPlayerToggle());

        expect(result.current.mediaPlayersEnabled).toBe(true);
        expect(localStorageMock.getItem).toHaveBeenCalledWith('mediaPlayersEnabled');
    });

    it('should use custom default when provided', () => {
        localStorageMock.getItem.mockReturnValue(null);

        const { result } = renderHook(() => useMediaPlayerToggle({ defaultEnabled: false }));

        expect(result.current.mediaPlayersEnabled).toBe(false);
    });

    it('should restore saved state from localStorage', () => {
        localStorageMock.getItem.mockReturnValue('true');

        const { result } = renderHook(() => useMediaPlayerToggle());

        expect(result.current.mediaPlayersEnabled).toBe(true);
    });

    it('should toggle media players state', () => {
        localStorageMock.getItem.mockReturnValue(null); // Ensure starting state is clean

        const { result } = renderHook(() => useMediaPlayerToggle());

        expect(result.current.mediaPlayersEnabled).toBe(true);

        act(() => {
            result.current.toggleMediaPlayers();
        });

        expect(result.current.mediaPlayersEnabled).toBe(false);
        expect(localStorageMock.setItem).toHaveBeenCalledWith('mediaPlayersEnabled', 'false');
    });

    it('should use custom storage key when provided', () => {
        const { result } = renderHook(() => useMediaPlayerToggle({ storageKey: 'customKey' }));

        expect(localStorageMock.getItem).toHaveBeenCalledWith('customKey');

        act(() => {
            result.current.toggleMediaPlayers();
        });

        expect(localStorageMock.setItem).toHaveBeenCalledWith('customKey', 'true');
    });

    it('should handle localStorage errors gracefully', () => {
        localStorageMock.getItem.mockImplementation(() => {
            throw new Error('localStorage error');
        });

        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

        const { result } = renderHook(() => useMediaPlayerToggle());

        expect(result.current.mediaPlayersEnabled).toBe(true);
        expect(consoleSpy).toHaveBeenCalledWith(
            'Failed to parse mediaPlayersEnabled from localStorage:',
            expect.any(Error)
        );

        consoleSpy.mockRestore();
    });

    it('should set state directly', () => {
        const { result } = renderHook(() => useMediaPlayerToggle());

        act(() => {
            result.current.setMediaPlayersEnabled(true);
        });

        expect(result.current.mediaPlayersEnabled).toBe(true);
        expect(localStorageMock.setItem).toHaveBeenCalledWith('mediaPlayersEnabled', 'true');
    });
});