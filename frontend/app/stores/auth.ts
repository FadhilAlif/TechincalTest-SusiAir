import { defineStore } from 'pinia';

interface PilotUser {
  username: string;
  name: string;
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null);
  const user = ref<PilotUser | null>(null);

  // Initialize from localStorage on client side
  if (import.meta.client) {
    const savedToken = localStorage.getItem('susi_token');
    const savedUser = localStorage.getItem('susi_user');
    if (savedToken) {
      token.value = savedToken;
    }
    if (savedUser) {
      try {
        user.value = JSON.parse(savedUser);
      } catch {
        user.value = null;
      }
    }
  }

  const isAuthenticated = computed(() => !!token.value);

  function setAuth(newToken: string, pilotData?: PilotUser) {
    token.value = newToken;
    if (import.meta.client) {
      localStorage.setItem('susi_token', newToken);
    }

    if (pilotData) {
      user.value = pilotData;
      if (import.meta.client) {
        localStorage.setItem('susi_user', JSON.stringify(pilotData));
      }
    }
  }

  function logout() {
    token.value = null;
    user.value = null;
    if (import.meta.client) {
      localStorage.removeItem('susi_token');
      localStorage.removeItem('susi_user');
    }
    navigateTo('/login');
  }

  return {
    token,
    user,
    isAuthenticated,
    setAuth,
    logout,
  };
});
