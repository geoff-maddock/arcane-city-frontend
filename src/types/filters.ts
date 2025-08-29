export interface EntityFilters {
    name: string;
    entity_type: string;
    role: string;
    entity_status: string;
    tag: string;
    created_at?: DateRange;
    started_at?: DateRange;
}

export interface EventFilters {
    name: string;
    venue: string;
    promoter: string;
    entity: string;
    event_type: string;
    tag: string;
    start_at?: DateRange;
    presale_price_min?: string;
    presale_price_max?: string;
    door_price_min?: string;
    door_price_max?: string;
    min_age?: string;
    is_benefit?: string;
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
        presale_price_min?: string;
        presale_price_max?: string;
        door_price_min?: string;
        door_price_max?: string;
        min_age?: string;
        is_benefit?: string;
    };
    onFilterChange: (filters: EventFiltersProps['filters']) => void;
}

export interface SeriesFilters {
    name: string;
    venue: string;
    promoter: string;
    entity: string;
    event_type: string;
    tag: string;
    founded_at?: DateRange;
    occurrence_type: string;
    occurrence_week: string;
    occurrence_day: string;
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
        occurrence_type: string;
        occurrence_week: string;
        occurrence_day: string;
    };
    onFilterChange: (filters: SeriesFiltersProps['filters']) => void;
}

export interface TagFilters {
    name: string;
}
