// src/lib/api.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '';
const API_USERNAME = import.meta.env.VITE_API_USERNAME;
const API_PASSWORD = import.meta.env.VITE_API_PASSWORD;

// Create Base64 encoded credentials
const basicAuth = btoa(`${API_USERNAME}:${API_PASSWORD}`);

export const api = axios.create({
    baseURL: baseURL + '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to handle auth
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');

    // If user token exists, use Bearer auth
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    // Otherwise use basic auth
    else {
        config.headers.Authorization = `Basic ${basicAuth}`;
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