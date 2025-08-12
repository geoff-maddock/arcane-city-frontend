import { api } from '../lib/api';

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

export const userService = {
  async createUser(payload: CreateUserRequest) {
    const { data } = await api.post('/users', payload);
    return data;
  },
  async sendPasswordResetEmail(email: string) {
    const { data } = await api.post('/user/send-password-reset-email', { email });
    return data;
  },
};
