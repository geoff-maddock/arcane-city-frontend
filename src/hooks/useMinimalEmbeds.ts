import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

interface UseMinimalEmbedsOptions {
    /**
     * The resource type - either 'events' or 'entities'
     */
    resourceType: 'events' | 'entities';
    /**
     * The slug of the resource to fetch embeds for
     */
    slug: string;
    /**
     * Whether embeds should be fetched. When false, no API call will be made.
     */
    enabled?: boolean;
}

interface UseMinimalEmbedsReturn {
    /**
     * Array of embed HTML strings
     */
    embeds: string[];
    /**
     * Whether the embeds are currently being loaded
     */
    loading: boolean;
    /**
     * Any error that occurred during loading
     */
    error: Error | null;
    /**
     * Function to manually refetch embeds
     */
    refetch: () => void;
}

/**
 * A reusable hook for fetching minimal embeds from the API.
 * Supports both events and entities, with optional enable/disable functionality.
 * 
 * @param options Configuration for the hook
 * @returns Object containing embeds data, loading state, and error state
 */
export function useMinimalEmbeds({ 
    resourceType, 
    slug, 
    enabled = true 
}: UseMinimalEmbedsOptions): UseMinimalEmbedsReturn {
    const [embeds, setEmbeds] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchEmbeds = useCallback(async () => {
        if (!enabled || !slug) {
            setEmbeds([]);
            return;
        }

        setLoading(true);
        setError(null);
        
        try {
            const endpoint = `/${resourceType}/${slug}/minimal-embeds`;
            const response = await api.get<{ data: string[] }>(endpoint);
            const embedsData = response.data.data || [];
            console.log(`Fetched ${resourceType} embeds for ${slug}:`, embedsData, 'Length:', embedsData.length);
            setEmbeds(embedsData);
        } catch (err) {
            console.error(`Error fetching ${resourceType} embeds for ${slug}:`, err);
            setError(err instanceof Error ? err : new Error(`Failed to load ${resourceType} embeds`));
            setEmbeds([]);
        } finally {
            setLoading(false);
        }
    }, [resourceType, slug, enabled]);

    // Fetch embeds when dependencies change
    useEffect(() => {
        fetchEmbeds();
    }, [fetchEmbeds]);

    return {
        embeds,
        loading,
        error,
        refetch: fetchEmbeds
    };
}