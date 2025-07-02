// src/services/auth.service.ts
import { api } from '../lib/api';
import { LoginCredentials, User } from '../types/auth';

export const authService = {
    async login(credentials: LoginCredentials) {
        const { username, password } = credentials;
        const { data } = await api.post<{ token: string }>(
            '/tokens/create',
            { token_name: 'arcane-city' },
            { auth: { username, password } }
        );
        localStorage.setItem('token', data.token);
        return data;
    },

    async logout() {
        localStorage.removeItem('token');
        // Optionally call logout endpoint
        // await api.post('/auth/logout');
    },

    async getCurrentUser() {
        const { data } = await api.get<User>('/auth/me');
        return data;
    },

    getToken() {
        return localStorage.getItem('token');
    },

    isAuthenticated() {
        return !!this.getToken();
    }
};