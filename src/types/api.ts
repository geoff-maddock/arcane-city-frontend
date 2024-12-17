// src/types/api.ts
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
}

export interface Tag {
    id: number;
    name: string;
    slug: string;
}

export interface EntityType {
    id: number;
    name: string;
}

export interface EntityStatus {
    id: number;
    name: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}
