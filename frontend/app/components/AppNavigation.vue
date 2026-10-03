<template>
  <div>
    <!-- Desktop / Tablet Top Navigation Bar (Hidden on Mobile) -->
    <header class="desktop-navbar">
      <div class="nav-container">
        <!-- Brand Logo & Title (Left) -->
        <NuxtLink to="/" class="brand-link">
          <img src="/susiair-logo.png" alt="Susi Air Logo" class="nav-logo" />
          <div class="brand-text">
            <span class="brand-name">SUSI AIR</span>
            <span class="brand-badge">Pilot Portal</span>
          </div>
        </NuxtLink>

        <!-- Navigation Links (Centered) -->
        <nav class="nav-links">
          <NuxtLink to="/" class="desktop-nav-link" :class="{ active: route.path === '/' }">
            <Home :size="17" />
            <span>Home</span>
          </NuxtLink>

          <NuxtLink to="/schedule" class="desktop-nav-link" :class="{ active: route.path === '/schedule' }">
            <Calendar :size="17" />
            <span>Schedule</span>
          </NuxtLink>

          <button type="button" class="desktop-nav-link" @click="handlePlaceholder('Logbook')">
            <FileText :size="17" />
            <span>Logbook</span>
          </button>

          <NuxtLink to="/profile" class="desktop-nav-link" :class="{ active: route.path === '/profile' }">
            <User :size="17" />
            <span>Profile</span>
          </NuxtLink>
        </nav>

        <!-- Right Actions: Theme Toggle, Pilot Chip (Right) -->
        <div class="desktop-actions">
          <!-- Theme Toggle Shortcut -->
          <ThemeToggle />

          <!-- Pilot Chip linking to Profile for Settings & Logout -->
          <NuxtLink to="/profile" class="pilot-chip" v-if="authStore.user" title="View Pilot Profile & Settings">
            <div class="pilot-avatar-mini">
              <img
                :src="authStore.user.avatarUrl || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=128'"
                alt="Pilot Avatar"
                class="avatar-mini-img"
              />
            </div>
            <span class="pilot-name">{{ authStore.user.name }}</span>
          </NuxtLink>
        </div>
      </div>
    </header>

    <!-- Mobile Bottom Navigation Bar (Hidden on Tablet / Desktop) -->
    <nav class="mobile-bottom-nav">
      <NuxtLink to="/" class="nav-item" :class="{ active: route.path === '/' }">
        <Home :size="22" stroke-width="2" />
        <span>Home</span>
      </NuxtLink>

      <NuxtLink to="/schedule" class="nav-item" :class="{ active: route.path === '/schedule' }">
        <Calendar :size="22" stroke-width="2" />
        <span>Schedule</span>
      </NuxtLink>

      <button type="button" class="nav-item" @click="handlePlaceholder('Logbook')">
        <FileText :size="22" stroke-width="2" />
        <span>Logbook</span>
      </button>

      <NuxtLink to="/profile" class="nav-item" :class="{ active: route.path === '/profile' }">
        <User :size="22" stroke-width="2" />
        <span>Profile</span>
      </NuxtLink>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { Home, Calendar, FileText, User } from 'lucide-vue-next';
import { useAuthStore } from '~/stores/auth';
import ThemeToggle from '~/components/ThemeToggle.vue';

const route = useRoute();
const authStore = useAuthStore();

function handlePlaceholder(feature: string) {
  alert(`${feature} page coming soon!`);
}
</script>

<style scoped lang="scss">
// Desktop Top Navbar
.desktop-navbar {
  display: none; // Hidden on mobile view
  width: 100%;
  background-color: var(--color-card);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow-sm);
  transition: background-color 0.25s ease, border-color 0.25s ease;

  @media (min-width: $bp-tablet) {
    display: block;
  }

  // Centered Container for Tablet, Laptop, and Desktop
  .nav-container {
    width: 100%;
    max-width: 1280px;
    margin: 0 auto;
    padding: 10px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;

    @media (min-width: $bp-desktop) {
      padding: 12px 36px;
      gap: 20px;
    }
  }

  // Left Brand Link
  .brand-link {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    min-width: 0;

    .nav-logo {
      height: 34px;
      width: auto;
      object-fit: contain;

      @media (min-width: $bp-desktop) {
        height: 38px;
      }
    }

    .brand-text {
      display: none;
      flex-direction: column;

      @media (min-width: $bp-desktop) {
        display: flex;
      }

      .brand-name {
        font-size: 14px;
        font-weight: 800;
        color: var(--color-navy);
        letter-spacing: 0.5px;
        white-space: nowrap;

        @media (min-width: $bp-desktop) {
          font-size: 15px;
        }
      }

      .brand-badge {
        font-size: 9px;
        color: $color-red;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.8px;
        white-space: nowrap;

        @media (min-width: $bp-desktop) {
          font-size: 10px;
        }
      }
    }
  }

  // Center Navigation Links
  .nav-links {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2px;
    background-color: var(--color-surface-soft);
    padding: 3px;
    border-radius: $radius-pill;
    border: 1px solid var(--color-border);
    transition: background-color 0.25s ease;
    flex-shrink: 0;

    @media (min-width: $bp-desktop) {
      gap: 4px;
      padding: 4px;
    }

    .desktop-nav-link {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 6px 14px;
      border-radius: $radius-pill;
      border: none;
      background: transparent;
      text-decoration: none;
      font-size: 12px;
      font-weight: 600;
      color: var(--color-text-secondary);
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;

      @media (min-width: $bp-desktop) {
        padding: 7px 18px;
        font-size: 13px;
        gap: 6px;
      }

      &:hover {
        color: var(--color-navy);
      }

      &.active {
        background-color: var(--color-card);
        color: $color-red;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      }
    }
  }

  // Right Actions (Theme Toggle & Pilot Chip)
  .desktop-actions {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    min-width: 0;

    .pilot-chip {
      display: flex;
      align-items: center;
      gap: 7px;
      background-color: var(--color-surface-soft);
      padding: 4px 12px 4px 5px;
      border-radius: $radius-pill;
      border: 1px solid var(--color-border);
      text-decoration: none;
      transition: all 0.2s ease;
      max-width: 170px;

      &:hover {
        border-color: var(--color-red);
        background-color: var(--color-card-hover, var(--color-card));
      }

      .pilot-avatar-mini {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        overflow: hidden;
        background-color: var(--color-border);
        flex-shrink: 0;

        .avatar-mini-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .pilot-name {
        font-size: 12px;
        font-weight: 600;
        color: var(--color-text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
}

// Mobile Bottom Nav
.mobile-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: $bp-mobile;
  height: 68px;
  background-color: var(--color-card);
  border-top: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-around;
  z-index: 100;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.06);
  transition: background-color 0.25s ease, border-color 0.25s ease;

  @media (min-width: $bp-tablet) {
    display: none; // Hidden on tablet and desktop
  }

  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    background: none;
    border: none;
    text-decoration: none;
    color: var(--color-text-secondary);
    font-size: 11px;
    font-weight: 500;
    cursor: pointer;
    transition: color 0.2s ease, transform 0.15s ease;
    padding: 6px 14px;
    border-radius: 8px;

    &:hover {
      color: var(--color-navy);
    }

    &.active {
      color: $color-red;
      font-weight: 700;

      svg {
        stroke: $color-red;
      }
    }
  }
}
</style>
