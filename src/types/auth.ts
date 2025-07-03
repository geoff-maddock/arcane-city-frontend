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

export interface User {
    id: number;
    name: string;
    email: string;
    status: UserStatus;
    email_verified_at: string | null;
    last_active: string | null;
    created_at: string;
    updated_at: string;
    profile?: Profile;
    followed_tags: MinimalResource[];
    followed_entities: MinimalResource[];
    followed_series: MinimalResource[];
    followed_threads: MinimalResource[];
    photos: Photo[];
}

export interface LoginCredentials {
    username: string;
    password: string;
}