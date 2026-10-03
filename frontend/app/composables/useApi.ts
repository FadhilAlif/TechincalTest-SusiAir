import { useAuthStore } from '~/stores/auth';

export function useApi() {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();
  const apiBase = config.public.apiBase || 'http://localhost:3001';

  async function request<T>(endpoint: string, options: Parameters<typeof $fetch>[1] = {}): Promise<T> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (authStore.token) {
      headers['Authorization'] = `Bearer ${authStore.token}`;
    }

    try {
      const response = await $fetch<T>(`${apiBase}${endpoint}`, {
        ...options,
        headers,
      });
      return response;
    } catch (error: any) {
      if (error?.status === 401 || error?.statusCode === 401) {
        // If unauthorized and not on login page, logout
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          authStore.logout();
        }
      }
      throw error;
    }
  }

  return {
    apiBase,
    request,
    get: <T>(endpoint: string, options?: any) => request<T>(endpoint, { ...options, method: 'GET' }),
    post: <T>(endpoint: string, body?: any, options?: any) => request<T>(endpoint, { ...options, method: 'POST', body }),
  };
}
