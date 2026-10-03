<template>
  <div class="app-shell">
    <NuxtRouteAnnouncer />
    <AppNavigation v-if="route.path !== '/login'" />
    <div class="app-viewport">
      <NuxtPage />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from '~/composables/useTheme';

const route = useRoute();
// Initialize theme system
useTheme();
</script>
