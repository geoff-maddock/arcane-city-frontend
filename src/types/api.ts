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
    visibility?: VisibilityResponse;
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
    created_by?: number;
    updated_by?: number;
    series?: Series;
    created_at: string;
    updated_at: string;
    canceled_at?: string;
}

export interface VisibilityResponse {
    id: number;
    name: string;
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
        series?: string;
        description?: string;
        presale_price_min?: string;
        presale_price_max?: string;
        door_price_min?: string;
        door_price_max?: string;
        min_age?: string;
        is_benefit?: string;
        created_at?: {
            start?: string;
            end?: string;
        };
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
    facebook_username?: string;
    twitter_username?: string;
    instagram_username?: string;
    primary_location?: Location;
}

export interface Location {
    id: number;
    name: string;
    slug: string;
    address_one?: string;
    address_two?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    visibility_id?: number;
    location_type_id?: number;
    map_url?: string;
}

export interface LocationResponse {
    id: number;
    name: string;
    slug: string;
    address_one?: string;
    address_two?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    visibility_id?: number;
    location_type_id?: number;
    map_url?: string;
}

export interface Contact {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    other?: string;
    type: string;
    visibility_id: number;
}

export interface PhotoResponse {
    id: number;
    path: string;
    thumbnail_path: string;
    created_by?: number;
    is_primary?: boolean;
    direct?: boolean;
}


export interface Role {
    id: number;
    name: string;
    slug: string;
}

export interface TagType {
    id: number;
    name: string;
    slug?: string;
    created_at?: string;
    updated_at?: string;
}

export interface Tag {
    id: number;
    name: string;
    slug: string;
    description?: string;
    tag_type_id?: number;
    tag_type?: TagType;
    created_by?: number;
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
    created_by?: number;
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
    created_by: number;
    updated_by: number;
    created_at: string;
    updated_at: string;
    started_at: string;
    facebook_username?: string;
    twitter_username?: string;
    instagram_username?: string;
    links: Link[];
    tags: Tag[];
    roles: Role[];
    primary_photo?: string;
    primary_photo_thumbnail?: string;
    primary_location?: Location;
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
    created_by?: number;
    updated_by?: number;
    next_event?: Event;
    next_start_at?: string;
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

export interface Blog {
    id: number;
    name: string;
    slug: string;
    visibility_id?: number;
    content_type_id?: number;
    body?: string;
    menu_id?: number;
    sort_order?: number;
    created_at: string;
    updated_at: string;
}

export interface UseBlogsParams {
    page?: number;
    itemsPerPage?: number;
    filters?: {
        name?: string;
    };
    sort?: string;
    direction?: 'desc' | 'asc';
}