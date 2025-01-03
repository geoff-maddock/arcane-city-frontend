// src/types/auth.ts
export interface AuthState {
    isAuthenticated: boolean;
    token: string | null;
    user: User | null;
}

export interface User {
    id: number;
    username: string;
    email: string;
    // Add other user fields
}

export interface LoginCredentials {
    username: string;
    password: string;
}