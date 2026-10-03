import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore();

  // If navigating to login and already logged in, redirect to home
  if (to.path === '/login') {
    if (authStore.isAuthenticated) {
      return navigateTo('/');
    }
    return;
  }

  // If navigating to protected route and not logged in, redirect to login
  if (!authStore.isAuthenticated) {
    return navigateTo('/login');
  }
});
