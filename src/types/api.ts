export interface Event {
    id: number;
    name: string;
    slug: string;
    short?: string;
    description?: string;
    start_at: string;
    end_at?: string;
    venue?: EntityResponse;
    promoter?: EntityResponse;
    event_type?: EventType;
    presale_price?: number;
    door_price?: number;
    min_age?: number;
    tags?: Tag[];
    entities?: EntityResponse[];
    ticket_link?: string;
    primary_photo?: string;
    primary_photo_thumbnail?: string;
    is_benefit?: boolean;
    attending: number;
    like: number;
    photos?: PhotoResponse[];
    attendees?: UserMinimalResponse[];
    created_by?: User;
}

export interface UseEventsParams {
    page?: number;
    itemsPerPage?: number;
    filters?: {
        name?: string;
        venue?: string;
        promoter?: string;
        event_type?: string;
        entity?: string;
        tag?: string;
        start_at?: {
            start?: string;
            end?: string;
        };
    };
    sort?: string;
    direction?: 'desc' | 'asc';

}

export interface UserMinimalResponse {
    id: number;
    username: string;
}

export interface EntityResponse {
    id: number;
    name: string;
    slug: string;
    short?: string;
    description?: string;
    entity_type?: EntityType;
    entity_status?: EntityStatus;
    primary_photo?: string;
    primary_photo_thumbnail?: string;
}

export interface LocationResponse {
    id: number;
    name: string;
    slug: string;
    address_line_one?: string;
    address_line_two?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    map_url?: string;
}

export interface Location {
    id: number;
    name: string;
    slug: string;
    address_line_one?: string;
    address_line_two?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    map_url?: string;
}

export interface PhotoResponse {
    id: number;
    path: string;
    thumbnail_path: string;
}


export interface Role {
    id: number;
    name: string;
    slug: string;
}

export interface Tag {
    id: number;
    name: string;
    slug: string;
}

export interface EntityType {
    id: number;
    name: string;
    slug: string;
    short?: string;
    created_at: string;
    updated_at: string;
}

export interface EventType {
    id: number;
    name: string;
    slug: string;
    short?: string;
    created_at: string;
    updated_at: string;
}

export interface EntityStatus {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface Link {
    id: number;
    title: string;
    text: string;
    url: string;
    is_primary: boolean;
    created_at: string;
    updated_at: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
}

export interface Entity {
    id: number;
    name: string;
    slug: string;
    short?: string;
    description?: string;
    entity_type: EntityType;
    entity_status: EntityStatus;
    created_by: User;
    updated_by: User;
    created_at: string;
    updated_at: string;
    started_at: string;
    facebook_username?: string;
    twitter_username?: string;
    links: Link[];
    tags: Tag[];
    roles: Role[];
    primary_photo?: string;
    primary_photo_thumbnail?: string;
    primary_location?: LocationResponse;
}

export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface Series {
    id: number;
    name: string;
    slug: string;
    short?: string;
    description?: string;
    start_at: string;
    end_at?: string;
    venue?: EntityResponse;
    promoter?: EntityResponse;
    event_type?: EventType;
    presale_price?: number;
    door_price?: number;
    min_age?: number;
    tags?: Tag[];
    entities?: EntityResponse[];
    ticket_link?: string;
    primary_photo?: string;
    primary_photo_thumbnail?: string;
    occurrence_type?: OccurrenceType;
    occurrence_week?: OccurrenceWeek;
    occurrence_day?: OccurrenceDay;
    occurrence_repeat?: string;
    is_benefit?: boolean;
    attending: number;
    like: number;
    founded_at: string;
    canceled_at?: string;
}

export interface OccurrenceType {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface OccurrenceWeek {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface OccurrenceDay {
    id: number;
    name: string;
}