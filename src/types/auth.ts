// src/types/auth.ts
export interface AuthState {
    isAuthenticated: boolean;
    token: string | null;
    user: User | null;
}

export interface UserStatus {
    id: number;
    name: string;
}

export interface MinimalResource {
    id: number;
    name: string;
}

export interface MinimalSlugResource {
    id: number;
    name: string;
    slug: string;
}


export interface Photo {
    id: number;
    path: string;
    thumbnail_path: string;
}

export interface Profile {
    id: number;
    user_id: number;
    bio: string | null;
    alias: string | null;
    location: string | null;
    visibility_id: number | null;
    facebook_username: string | null;
    twitter_username: string | null;
    instagram_username: string | null;
    first_name: string | null;
    last_name: string | null;
    default_theme: string | null;
    setting_weekly_update: number | null;
    setting_daily_update: number | null;
    setting_instant_update: number | null;
    setting_forum_update: number | null;
    setting_public_profile: number | null;
    created_at: string;
    updated_at: string;
}

export interface Activity {
    id: number;
    user_id: number;
    object_table: string;
    object_name: string;
    object_id: number;
    child_object_table: string | null;
    child_object_name: string | null;
    child_object_id: number | null;
    message: string;
    changes: string | null;
    action_id: number;
    created_at: string;
    updated_at: string;
    ip_address: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    status: UserStatus;
    email_verified_at: string | null;
    last_active: Activity | null;
    created_at: string;
    updated_at: string;
    profile?: Profile;
    followed_tags: MinimalSlugResource[];
    followed_entities: MinimalSlugResource[];
    followed_series: MinimalSlugResource[];
    followed_threads: MinimalSlugResource[];
    photos: Photo[];
}

export interface LoginCredentials {
    username: string;
    password: string;
}