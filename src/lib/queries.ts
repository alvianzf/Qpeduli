import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api, { apiErrorMessage } from './api';
import { adaptCategory, adaptFjbItem, adaptModalUsaha, adaptThread, adaptUserProfile } from './adapters';

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const { data } = await api.get('/stats');
      return {
        totalUsers: data.totalUsers as number,
        totalThreads: data.totalThreads as number,
        activeCampaigns: data.activeCampaigns as number,
        totalDisbursed: Number(data.totalDisbursed) || 0,
        citiesReached: data.citiesReached as number,
      };
    },
    staleTime: 60 * 1000,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories');
      return data.map(adaptCategory);
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useThreads(params: { category?: string; filter?: 'aksi' | 'diskusi' } = {}) {
  return useQuery({
    queryKey: ['threads', params],
    queryFn: async () => {
      const { data } = await api.get('/threads', { params });
      return data.map(adaptThread);
    },
  });
}

export function useThread(id?: string) {
  return useQuery({
    queryKey: ['thread', id],
    queryFn: async () => {
      const { data } = await api.get(`/threads/${id}`);
      return adaptThread(data);
    },
    enabled: !!id,
  });
}

export function useFjbItems() {
  return useQuery({
    queryKey: ['fjb'],
    queryFn: async () => {
      const { data } = await api.get('/fjb');
      return data.map(adaptFjbItem);
    },
  });
}

export function useUserProfile(username?: string) {
  return useQuery({
    queryKey: ['user', username],
    queryFn: async () => {
      const { data } = await api.get(`/users/${username}`);
      return adaptUserProfile(data);
    },
    enabled: !!username,
  });
}

export function useCreateThread() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      categoryId: string;
      title: string;
      content: string;
      isAksiSosial: boolean;
      campaign?: { target: number; deadline: string; milestones: { label: string; amount: number }[] };
    }) => {
      const { data } = await api.post('/threads', payload);
      return adaptThread(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['threads'] });
    },
  });
}

export function useAddComment(threadId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => {
      const { data } = await api.post(`/threads/${threadId}/comments`, { content });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['thread', threadId] });
    },
  });
}

export function useDonate(campaignId: string) {
  return useMutation({
    mutationFn: async (payload: { amount: number; anonymous: boolean }) => {
      const { data } = await api.post(`/campaigns/${campaignId}/donate`, payload);
      return data;
    },
  });
}

export function useCreateFjbItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      title: string;
      price: number;
      condition: 'BARU' | 'SEPERTI_BARU' | 'BEKAS_LAYAK_PAKAI';
      category: string;
      emoji?: string;
      campaignId?: string;
      description?: string;
    }) => {
      const { data } = await api.post('/fjb', payload);
      return adaptFjbItem(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fjb'] });
    },
  });
}

export { apiErrorMessage };

export function useModalUsahaList() {
  return useQuery({
    queryKey: ['modal-usaha'],
    queryFn: async () => {
      const { data } = await api.get('/modal-usaha');
      return data.map(adaptModalUsaha);
    },
  });
}

export function useMyModalUsaha(enabled: boolean) {
  return useQuery({
    queryKey: ['modal-usaha', 'mine'],
    queryFn: async () => {
      const { data } = await api.get('/modal-usaha/mine');
      return data.map(adaptModalUsaha);
    },
    enabled,
  });
}

export function useModalUsaha(id?: string) {
  return useQuery({
    queryKey: ['modal-usaha', id],
    queryFn: async () => {
      const { data } = await api.get(`/modal-usaha/${id}`);
      return adaptModalUsaha(data);
    },
    enabled: !!id,
  });
}

export function useCreateModalUsaha() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      title: string;
      story: string;
      businessType?: string;
      city?: string;
      emoji?: string;
      target: number;
      deadline: string;
      rewards: { title: string; description?: string; minAmount: number; stock?: number }[];
    }) => {
      const { data } = await api.post('/modal-usaha', payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['modal-usaha'] });
    },
  });
}

export function useDonateToProject(campaignId: string) {
  return useMutation({
    mutationFn: async (payload: { amount: number; anonymous: boolean; rewardId?: string }) => {
      const { data } = await api.post(`/campaigns/${campaignId}/donate`, payload);
      return data;
    },
  });
}

// ---- Admin ----
export function useAdminOverview() {
  return useQuery({
    queryKey: ['admin', 'overview'],
    queryFn: async () => (await api.get('/admin/overview')).data,
  });
}

export function useAdminList<T = any>(kind: 'campaigns' | 'donations' | 'users', params: Record<string, string> = {}) {
  return useQuery<T[]>({
    queryKey: ['admin', kind, params],
    queryFn: async () => (await api.get(`/admin/${kind}`, { params })).data,
  });
}

export function useAdminAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (req: { method: 'post' | 'patch'; url: string; data?: unknown }) =>
      (await api.request({ method: req.method, url: req.url, data: req.data })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin'] });
      qc.invalidateQueries({ queryKey: ['modal-usaha'] });
      qc.invalidateQueries({ queryKey: ['threads'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function usePostProjectUpdate(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { title: string; content: string }) =>
      (await api.post(`/modal-usaha/${projectId}/updates`, payload)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['modal-usaha', projectId] });
    },
  });
}
