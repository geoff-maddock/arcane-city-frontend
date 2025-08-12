// src/lib/api.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '';
const API_USERNAME = import.meta.env.VITE_API_USERNAME;
const API_PASSWORD = import.meta.env.VITE_API_PASSWORD;

// Use Basic only when both creds are present
const BASIC_AUTH_TOKEN = API_USERNAME && API_PASSWORD ? btoa(`${API_USERNAME}:${API_PASSWORD}`) : undefined;

export const api = axios.create({
    baseURL: baseURL + '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Helper to determine if the request is read-only
const isReadMethod = (m?: string) => {
    const method = (m || 'get').toLowerCase();
    return method === 'get' || method === 'head' || method === 'options';
};

// Request interceptor to handle auth
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');

    // Prefer Bearer token if present
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        return config;
    }

    // No Bearer token: only attach Basic for read methods
    if (isReadMethod(config.method) && BASIC_AUTH_TOKEN) {
        config.headers.Authorization = `Basic ${BASIC_AUTH_TOKEN}`;
    } else {
        // Ensure we do NOT send any Authorization header for non-read requests
        if (config.headers && (config.headers as any).Authorization) {
            delete (config.headers as any).Authorization;
        }
        if (import.meta.env.DEV) {
            console.warn(`[api] Write request without auth: ${config.method?.toUpperCase()} ${config.url}`);
        }
    }

    return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Clear token if it's invalid
            localStorage.removeItem('token');
            // Optionally redirect to login
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);