import { useState, useEffect, useRef, useCallback } from 'react';
import { toKebabCase } from '@/lib/utils';

/**
 * useSlug synchronizes a name field to a slug until the slug is manually changed.
 * - If the user edits the slug input directly, syncing stops.
 * - Leading/trailing whitespace in name is ignored for slug generation.
 */
export function useSlug(initialName = '', initialSlug = '') {
    const [name, setName] = useState(initialName);
    const [slug, setSlug] = useState(initialSlug);
    const manualOverride = useRef(false);

    useEffect(() => {
        if (!manualOverride.current) {
            setSlug(toKebabCase(name.trim()));
        }
    }, [name]);

    const onNameChange = useCallback((value: string) => {
        setName(value);
    }, []);

    const onSlugChange = useCallback((value: string) => {
        manualOverride.current = true;
        setSlug(value);
    }, []);

    const reset = useCallback(() => {
        manualOverride.current = false;
        setSlug(toKebabCase(name.trim()));
    }, [name]);

    /**
     * initialize sets both name and slug WITHOUT marking the slug as manually overridden.
     * Useful for populating edit forms with server data while preserving auto-sync on subsequent name edits.
     */
    const initialize = useCallback((initialNameVal: string, initialSlugVal?: string) => {
        manualOverride.current = false;
        setName(initialNameVal);
        setSlug(initialSlugVal ?? toKebabCase(initialNameVal.trim()));
    }, []);

    return { name, slug, setName: onNameChange, setSlug: onSlugChange, reset, initialize, manuallyOverridden: manualOverride.current } as const;
}
