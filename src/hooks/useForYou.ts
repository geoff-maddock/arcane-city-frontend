import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Event } from '../types/api';
import { authService } from '../services/auth.service';

export interface ForYouResponse {
  attending_events: Event[];
  tag_events: Event[];
  entity_events: Event[];
}

export const useForYou = () => {
  return useQuery<ForYouResponse>({
    queryKey: ['forYou'],
    queryFn: async () => {
      const { data } = await api.get<ForYouResponse>('/for-you');
      return data;
    },
    enabled: authService.isAuthenticated(),
  });
};
