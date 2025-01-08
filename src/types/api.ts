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
    ticket_link?: string;
    primary_photo?: string;
    primary_photo_thumbnail?: string;
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
}

export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}
