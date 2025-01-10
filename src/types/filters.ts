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