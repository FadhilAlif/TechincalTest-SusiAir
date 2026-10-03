<template>
  <div class="login-page">
    <div class="login-header-action">
      <ThemeToggle />
    </div>

    <div class="brand-section">
      <img src="/susiair-logo.png" alt="Susi Air Logo" class="brand-logo" />
      <h1 class="brand-title">Pilot Portal</h1>
      <p class="brand-subtitle">Flight Operations & Duty Management</p>
    </div>

    <div class="card login-card">
      <h2 class="card-title">Sign In</h2>
      <p class="card-desc">Enter your pilot credentials to continue</p>

      <form @submit.prevent="handleLogin" class="login-form">
        <div v-if="errorMessage" class="error-banner">
          <AlertCircle :size="18" />
          <span>{{ errorMessage }}</span>
        </div>

        <div class="form-group">
          <label for="username">Username</label>
          <div class="input-wrapper">
            <User :size="18" class="input-icon" />
            <input
              id="username"
              v-model="username"
              type="text"
              placeholder="e.g. johndoe"
              autocomplete="username"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <div class="input-wrapper">
            <Lock :size="18" class="input-icon" />
            <input
              id="password"
              v-model="password"
              type="password"
              placeholder="••••••••"
              autocomplete="current-password"
              required
            />
          </div>
        </div>

        <button type="submit" class="btn-primary" :disabled="isLoading">
          <span v-if="!isLoading">Sign In</span>
          <span v-else>Signing In...</span>
        </button>
      </form>
    </div>

    <div class="login-footer">
      <p>© 2026 PT ASI Pudjiastuti Aviation</p>
      <p class="test-hint">Technical Test Demo: <code>johndoe</code> / <code>susiairtest</code></p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { User, Lock, AlertCircle } from 'lucide-vue-next';
import { useAuthStore } from '~/stores/auth';
import { useApi } from '~/composables/useApi';
import ThemeToggle from '~/components/ThemeToggle.vue';

const username = ref('johndoe');
const password = ref('susiairtest');
const errorMessage = ref('');
const isLoading = ref(false);

const authStore = useAuthStore();
const api = useApi();

async function handleLogin() {
  errorMessage.value = '';
  isLoading.value = true;

  try {
    const res: any = await api.post('/auth/login', {
      username: username.value,
      password: password.value,
    });

    if (res?.token) {
      authStore.setAuth(res.token, res.pilot);
      await navigateTo('/');
    } else {
      errorMessage.value = 'Login failed. Invalid response from server.';
    }
  } catch (error: any) {
    const serverMessage = error?.data?.message || error?.message;
    errorMessage.value = serverMessage || 'Invalid username or password. Please try again.';
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 32px 24px;
  background-color: var(--color-bg);
  max-width: 440px;
  margin: 0 auto;
  width: 100%;
  position: relative;
}

.login-header-action {
  position: absolute;
  top: 24px;
  right: 24px;
}

.brand-section {
  text-align: center;
  margin-bottom: 28px;

  .brand-logo {
    max-width: 220px;
    height: auto;
    margin-bottom: 12px;
  }

  .brand-title {
    font-size: 24px;
    font-weight: 800;
    color: var(--color-navy);
    margin-bottom: 4px;
  }

  .brand-subtitle {
    font-size: 13px;
    color: var(--color-text-secondary);
  }
}

.login-card {
  padding: 28px 24px;

  .card-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--color-navy);
    margin-bottom: 4px;
  }

  .card-desc {
    font-size: 13px;
    color: var(--color-text-secondary);
    margin-bottom: 20px;
  }
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: rgba(230, 55, 87, 0.08);
  border: 1px solid rgba(230, 55, 87, 0.3);
  color: $color-danger;
  padding: 10px 14px;
  border-radius: $radius-sm;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 16px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;

    label {
      font-size: 13px;
      font-weight: 600;
      color: var(--color-navy);
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;

      .input-icon {
        position: absolute;
        left: 14px;
        color: var(--color-text-muted);
      }

      input {
        width: 100%;
        padding: 12px 14px 12px 42px;
        border: 1px solid var(--color-border);
        border-radius: $radius-sm;
        font-family: inherit;
        font-size: 14px;
        color: var(--color-text-primary);
        background-color: var(--color-input-bg);
        transition: all 0.2s ease;

        &:focus {
          outline: none;
          border-color: $color-red;
          background-color: var(--color-card);
          box-shadow: 0 0 0 3px rgba(230, 55, 87, 0.15);
        }
      }
    }
  }

  button {
    margin-top: 8px;
  }
}

.login-footer {
  text-align: center;
  margin-top: 32px;
  font-size: 12px;
  color: var(--color-text-muted);

  .test-hint {
    margin-top: 6px;
    font-size: 11px;

    code {
      background: var(--color-surface-soft);
      padding: 2px 6px;
      border-radius: 4px;
      color: var(--color-navy);
      border: 1px solid var(--color-border);
    }
  }
}
</style>
