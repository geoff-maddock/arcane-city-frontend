import { api } from '../lib/api';

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

export interface PasswordResetRequest {
  email: string;
  password: string;
  token: string;
  secret: string;
}

export const userService = {
  async createUser(payload: CreateUserRequest) {
    const { data } = await api.post('/users', payload);
    return data;
  },
  async sendPasswordResetEmail(email: string) {
    const { data } = await api.post('/user/send-password-reset-email', {
      email,
      secret: import.meta.env.VITE_API_KEY,
      'frontend-url': import.meta.env.VITE_FRONTEND_URL,
    });
    return data;
  },
  async resetPassword(payload: PasswordResetRequest) {
    const { data } = await api.post('/user/reset-password', payload);
    return data;
  },
};
