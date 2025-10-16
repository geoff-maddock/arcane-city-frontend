import { api } from '../lib/api';

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  'g-recaptcha-response'?: string;
  'frontend-url'?: string;
}

export interface PasswordResetRequest {
  email: string;
  password: string;
  token: string;
  secret: string;
}

export interface EmailVerificationRequest {
  userId: string;
  hash: string;
  expires: string;
  signature: string;
}

export const userService = {
  async createUser(payload: CreateUserRequest) {
    const { data } = await api.post('/register', payload);
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
  async verifyEmail(payload: EmailVerificationRequest) {
    const { userId, hash, expires, signature } = payload;
    const { data } = await api.get(`/email/verify/${userId}/${hash}?expires=${expires}&signature=${signature}`);
    return data;
  },
};
