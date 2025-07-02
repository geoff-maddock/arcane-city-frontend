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

export interface User {
    id: number;
    name: string;
    email: string;
    status: UserStatus;
    // Add other user fields
}

export interface LoginCredentials {
    username: string;
    password: string;
}