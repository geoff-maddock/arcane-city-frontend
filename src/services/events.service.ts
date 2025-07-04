import { api } from '../lib/api';

export const eventsService = {
  async attend(id: number) {
    await api.post(`/events/${id}/attend`);
  },
  async unattend(id: number) {
    await api.delete(`/events/${id}/attend`);
  }
};
