import { renderHook, act } from '@testing-library/react';
import { useFilterToggle } from '../../hooks/useFilterToggle';

// Mock localStorage
const localStorageMock = (() => {
    let store: { [key: string]: string } = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value;
        },
        removeItem: (key: string) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        },
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

// Mock console.warn to suppress warnings during tests
const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });

describe('useFilterToggle', () => {
    beforeEach(() => {
        localStorageMock.clear();
        consoleSpy.mockClear();
    });

    afterAll(() => {
        consoleSpy.mockRestore();
    });

    it('should initialize with default visible state when no stored value exists', () => {
        const { result } = renderHook(() => useFilterToggle());

        expect(result.current.filtersVisible).toBe(true);
    });

    it('should initialize with custom default visible state', () => {
        const { result } = renderHook(() => useFilterToggle({ defaultVisible: false }));

        expect(result.current.filtersVisible).toBe(false);
    });

    it('should restore state from localStorage', () => {
        localStorageMock.setItem('filtersVisible', 'false');

        const { result } = renderHook(() => useFilterToggle());

        expect(result.current.filtersVisible).toBe(false);
    });

    it('should use custom storage key', () => {
        localStorageMock.setItem('customKey', 'false');

        const { result } = renderHook(() => useFilterToggle({ storageKey: 'customKey' }));

        expect(result.current.filtersVisible).toBe(false);
    });

    it('should toggle filter visibility', () => {
        const { result } = renderHook(() => useFilterToggle());

        expect(result.current.filtersVisible).toBe(true);

        act(() => {
            result.current.toggleFilters();
        });

        expect(result.current.filtersVisible).toBe(false);

        act(() => {
            result.current.toggleFilters();
        });

        expect(result.current.filtersVisible).toBe(true);
    });

    it('should persist state changes to localStorage', () => {
        const { result } = renderHook(() => useFilterToggle());

        act(() => {
            result.current.toggleFilters();
        });

        expect(localStorageMock.getItem('filtersVisible')).toBe('false');

        act(() => {
            result.current.toggleFilters();
        });

        expect(localStorageMock.getItem('filtersVisible')).toBe('true');
    });

    it('should handle localStorage parse errors gracefully', () => {
        localStorageMock.setItem('filtersVisible', 'invalid-json');

        const { result } = renderHook(() => useFilterToggle());

        expect(result.current.filtersVisible).toBe(true);
        expect(consoleSpy).toHaveBeenCalledWith(
            'Failed to parse filtersVisible from localStorage:',
            expect.any(Error)
        );
    });

    it('should handle localStorage write errors gracefully', () => {
        // Mock localStorage.setItem to throw an error
        const originalSetItem = localStorageMock.setItem;
        localStorageMock.setItem = jest.fn().mockImplementation(() => {
            throw new Error('Storage quota exceeded');
        });

        const { result } = renderHook(() => useFilterToggle());

        act(() => {
            result.current.toggleFilters();
        });

        expect(consoleSpy).toHaveBeenCalledWith(
            'Failed to save filtersVisible to localStorage:',
            expect.any(Error)
        );

        // Restore original setItem
        localStorageMock.setItem = originalSetItem;
    });

    it('should allow manual state setting', () => {
        const { result } = renderHook(() => useFilterToggle());

        expect(result.current.filtersVisible).toBe(true);

        act(() => {
            result.current.setFiltersVisible(false);
        });

        expect(result.current.filtersVisible).toBe(false);

        act(() => {
            result.current.setFiltersVisible(true);
        });

        expect(result.current.filtersVisible).toBe(true);
    });
});
