<template>
  <button
    type="button"
    class="theme-toggle-btn"
    :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
    :aria-label="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
    @click="toggleTheme($event)"
  >
    <div class="icon-container" :class="{ 'is-dark': isDark }">
      <Sun v-if="isDark" class="theme-icon sun-icon" :size="18" />
      <Moon v-else class="theme-icon moon-icon" :size="18" />
    </div>
  </button>
</template>

<script setup lang="ts">
import { Sun, Moon } from 'lucide-vue-next';
import { useTheme } from '~/composables/useTheme';

const { isDark, toggleTheme } = useTheme();
</script>

<style scoped lang="scss">
.theme-toggle-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background-color: var(--color-surface-soft);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    background-color: var(--color-card-hover, var(--color-card));
    border-color: var(--color-red);
    color: var(--color-red);
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  &:active {
    transform: scale(0.96);
  }

  .icon-container {
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

    &.is-dark {
      transform: rotate(180deg);
    }
  }

  .theme-icon {
    transition: transform 0.25s ease, opacity 0.25s ease;
  }

  .sun-icon {
    color: #F59E0B;
  }

  .moon-icon {
    color: var(--color-text-primary);
  }
}
</style>
