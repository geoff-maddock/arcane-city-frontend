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
    onFilterChange: (filters: EventFiltersProps['filters']) => void;
}