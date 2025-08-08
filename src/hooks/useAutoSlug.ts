import { useEffect, useRef } from 'react';
import { toKebabCase } from '@/lib/utils';

// Keeps slug synced with source until user manually changes slug
export function useAutoSlug(source: string, slug: string, setSlug: (v: string) => void) {
    const manualRef = useRef(false);
    useEffect(() => {
        if (!manualRef.current) {
            setSlug(toKebabCase(source || ''));
        }
    }, [source, setSlug]);
    useEffect(() => {
        // If slug diverges from auto form (and source non-empty), mark manual
        if (source && slug && toKebabCase(source) !== slug) {
            manualRef.current = true;
        }
    }, [source, slug]);
    return { manual: manualRef.current, reset: () => { manualRef.current = false; } };
}
