// src/lib/api.ts
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'https://dev.arcane.city';

// You'll want to store these in environment variables
const API_USERNAME = import.meta.env.VITE_API_USERNAME;
const API_PASSWORD = import.meta.env.VITE_API_PASSWORD;

// Create Base64 encoded credentials
const basicAuth = btoa(`${API_USERNAME}:${API_PASSWORD}`);

export const api = axios.create({
    baseURL: baseURL + '/api',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${basicAuth}`
    },
});

// Add interceptor for auth if needed
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});