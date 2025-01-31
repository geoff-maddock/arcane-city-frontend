export interface EntityFilters {
    name: string;
    entity_type: string;
    role: string;
    status: string;
    tag: string;
    created_at?: DateRange;
}

export interface EventFilters {
    name: string;
    venue: string;
    promoter: string;
    entity: string;
    event_type: string;
    tag: string;
    start_at?: DateRange;
}

interface DateRange {
    start?: string;
    end?: string;
}

export interface EventFiltersProps {
    filters: {
        name: string;
        venue: string;
        promoter: string;
        event_type: string;
        entity: string;
        tag: string;
        start_at?: DateRange;
    };
    onFilterChange: (filters: SeriesFiltersProps['filters']) => void;
}

export interface SeriesFilters {
    name: string;
    venue: string;
    promoter: string;
    entity: string;
    event_type: string;
    tag: string;
    founded_at?: DateRange;
}

export interface SeriesFiltersProps {
    filters: {
        name: string;
        venue: string;
        promoter: string;
        event_type: string;
        entity: string;
        tag: string;
        founded_at?: DateRange;
    };
    onFilterChange: (filters: SeriesFiltersProps['filters']) => void;
}