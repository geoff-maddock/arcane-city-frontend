import { useState, useEffect, useRef, useCallback } from 'react';

// Local slug generator to satisfy stricter requirements without impacting other toKebabCase usages.
// Rules:
// 1. Replace spaces with dashes
// 2. Remove all characters that are non-alphanumeric or dashes
// 3. Lowercase all letters
// 4. Collapse multiple dashes
// 5. Trim leading/trailing dashes
// Also strips diacritics (é -> e) for broader compatibility.
const generateSlug = (value: string): string => {
    return value
        .trim()
        .normalize('NFKD') // split accented chars
        .replace(/[\u0300-\u036f]/g, '') // remove diacritic marks
        .replace(/\s+/g, '-') // spaces -> dashes
        .replace(/[^a-zA-Z0-9-]/g, '') // drop non alphanumeric / dash
        .toLowerCase()
        .replace(/-{2,}/g, '-') // collapse dashes
        .replace(/^-+|-+$/g, ''); // trim stray dashes
};

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
            setSlug(generateSlug(name));
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
        setSlug(generateSlug(name));
    }, [name]);

    /**
     * initialize sets both name and slug WITHOUT marking the slug as manually overridden.
     * Useful for populating edit forms with server data while preserving auto-sync on subsequent name edits.
     */
    const initialize = useCallback((initialNameVal: string, initialSlugVal?: string) => {
        manualOverride.current = false;
        setName(initialNameVal);
        setSlug(initialSlugVal ?? generateSlug(initialNameVal));
    }, []);

    return { name, slug, setName: onNameChange, setSlug: onSlugChange, reset, initialize, manuallyOverridden: manualOverride.current } as const;
}
