<template>
  <div class="main-content profile-page">
    <!-- Page Header -->
    <header class="profile-header">
      <div>
        <h1 class="page-title">Pilot Profile</h1>
        <p class="page-subtitle">Flight Operations & System Preferences</p>
      </div>

      <NuxtLink to="/" class="btn-back">
        <ArrowLeft :size="16" />
        <span>Dashboard</span>
      </NuxtLink>
    </header>

    <!-- Profile Grid Layout -->
    <div class="profile-layout">
      <!-- Left Column: Pilot Identity & Credentials Card -->
      <section class="card pilot-card">
        <div class="pilot-identity-hero">
          <div class="avatar-container">
            <img
              :src="pilot?.avatarUrl || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=256'"
              alt="Pilot Avatar"
              class="pilot-avatar"
            />
            <span class="status-indicator" title="Active Duty Pilot"></span>
          </div>

          <div class="pilot-hero-text">
            <div class="name-row">
              <h2 class="pilot-name">{{ pilot?.name || 'Capt. John Doe' }}</h2>
              <span class="role-badge">Captain / PIC</span>
            </div>
            <p class="pilot-airline">PT ASI Pudjiastuti Aviation (Susi Air)</p>
          </div>
        </div>

        <!-- Pilot Highlight Stats -->
        <div class="stats-row">
          <div class="stat-box">
            <span class="stat-label">Total Flight Hours</span>
            <div class="stat-value-group">
              <Clock :size="16" class="stat-icon" />
              <span class="stat-value font-number">{{ pilot?.totalFlightHours?.toLocaleString() || '---' }}h</span>
            </div>
          </div>

          <div class="stat-box">
            <span class="stat-label">Duty Status</span>
            <div class="stat-value-group text-success">
              <CheckCircle2 :size="16" class="stat-icon" />
              <span class="stat-value">Fit to Fly</span>
            </div>
          </div>
        </div>

        <!-- Pilot Qualifications & Aircraft Fleet -->
        <div class="pilot-qualifications-section">
          <div class="qualifications-header">
            <span class="qualifications-title">Operational Qualifications</span>
          </div>

          <div class="credentials-cards-list">
            <!-- 1. License Card -->
            <div class="qualification-card">
              <div class="qual-icon-orb qual-icon-license">
                <Award :size="18" />
              </div>
              <div class="qual-details">
                <div class="qual-top">
                  <span class="qual-label">Aviation License</span>
                  <span class="qual-badge font-number">#SA-99420-ID</span>
                </div>
                <div class="qual-value">ATPL (Airline Transport Pilot)</div>
              </div>
            </div>

            <!-- 2. Operating Base Card -->
            <div class="qualification-card">
              <div class="qual-icon-orb qual-icon-base">
                <MapPin :size="18" />
              </div>
              <div class="qual-details">
                <div class="qual-top">
                  <span class="qual-label">Primary Operating Base</span>
                  <span class="qual-badge base-code font-number">JOG</span>
                </div>
                <div class="qual-value">Adisucipto International Airport</div>
              </div>
            </div>

            <!-- 3. Authorized Fleet / Type Ratings Card -->
            <div class="qualification-card fleet-card">
              <div class="qual-icon-orb qual-icon-fleet">
                <Plane :size="18" />
              </div>
              <div class="qual-details">
                <div class="qual-top">
                  <span class="qual-label">Authorized Aircraft Fleet</span>
                  <span class="qual-badge fleet-count">3 Ratings</span>
                </div>

                <!-- Fleet Aircraft Chips Grid -->
                <div class="fleet-chips-grid">
                  <div
                    v-for="aircraft in authorizedFleet"
                    :key="aircraft.code"
                    class="aircraft-chip"
                  >
                    <div class="chip-main">
                      <span class="chip-dot"></span>
                      <span class="aircraft-name">{{ aircraft.name }}</span>
                    </div>
                    <span class="aircraft-code font-number">{{ aircraft.code }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Right Column: Preferences & Session Settings -->
      <div class="settings-column">
        <!-- Appearance & Theme Card -->
        <section class="card appearance-card">
          <div class="section-heading">
            <div class="icon-circle">
              <Palette :size="18" />
            </div>
            <div>
              <h3 class="section-title">Theme & Appearance</h3>
              <p class="section-desc">Select your preferred interface mode for day or night operations</p>
            </div>
          </div>

          <!-- Theme Selection Cards -->
          <div class="theme-options-grid">
            <!-- Light Mode Option -->
            <button
              type="button"
              class="theme-option-card"
              :class="{ active: !isDark }"
              @click="!isDark ? null : toggleTheme($event)"
            >
              <div class="option-preview light-preview">
                <div class="preview-header"></div>
                <div class="preview-body">
                  <div class="preview-line line-1"></div>
                  <div class="preview-line line-2"></div>
                </div>
              </div>

              <div class="option-info">
                <div class="option-title-row">
                  <Sun :size="16" class="sun-icon" />
                  <span class="option-name">Light Mode</span>
                </div>
                <span class="option-desc">Default high-visibility day mode</span>
              </div>

              <div class="radio-indicator" :class="{ selected: !isDark }">
                <span class="radio-dot" v-if="!isDark"></span>
              </div>
            </button>

            <!-- Dark Mode Option -->
            <button
              type="button"
              class="theme-option-card"
              :class="{ active: isDark }"
              @click="isDark ? null : toggleTheme($event)"
            >
              <div class="option-preview dark-preview">
                <div class="preview-header"></div>
                <div class="preview-body">
                  <div class="preview-line line-1"></div>
                  <div class="preview-line line-2"></div>
                </div>
              </div>

              <div class="option-info">
                <div class="option-title-row">
                  <Moon :size="16" class="moon-icon" />
                  <span class="option-name">Dark Mode</span>
                </div>
                <span class="option-desc">Aviation cockpit night mode</span>
              </div>

              <div class="radio-indicator" :class="{ selected: isDark }">
                <span class="radio-dot" v-if="isDark"></span>
              </div>
            </button>
          </div>
        </section>

        <!-- Session & Logout Card -->
        <section class="card session-card">
          <div class="section-heading">
            <div class="icon-circle icon-shield">
              <Shield :size="18" />
            </div>
            <div>
              <h3 class="section-title">Session & Security</h3>
              <p class="section-desc">Manage your active authentication session</p>
            </div>
          </div>

          <div class="session-info-row">
            <div class="session-user">
              <span class="user-label">Logged In As</span>
              <span class="user-val font-number">{{ authStore.user?.username || 'johndoe' }}</span>
            </div>
            <span class="session-status">Token Active</span>
          </div>

          <button type="button" class="btn-logout-full" @click="authStore.logout">
            <LogOut :size="18" />
            <span>Sign Out from Susi Air Portal</span>
          </button>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  Palette,
  Sun,
  Moon,
  Sparkles,
  Shield,
  LogOut,
  Award,
  Plane,
  MapPin
} from 'lucide-vue-next';
import { useAuthStore } from '~/stores/auth';
import { useApi } from '~/composables/useApi';
import { useTheme } from '~/composables/useTheme';

const authStore = useAuthStore();
const api = useApi();
const { isDark, toggleTheme } = useTheme();

const pilot = ref<any>(authStore.user);

const authorizedFleet = [
  { name: 'Cessna 208B Grand Caravan', code: 'C208B' },
  { name: 'Pilatus PC-6 Porter', code: 'PC-6' },
  { name: 'Piaggio P-180 Avanti II', code: 'P180' },
];

onMounted(async () => {
  try {
    const res = await api.get<any>('/pilot/me');
    if (res) {
      pilot.value = res;
      authStore.setUser(res);
    }
  } catch (e) {
    console.error('Failed to refresh pilot profile', e);
  }
});
</script>

<style scoped lang="scss">
.profile-page {
  gap: 20px;

  @media (min-width: $bp-tablet) {
    gap: 24px;
  }
}

// Header
.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .page-title {
    font-size: 20px;
    font-weight: 800;
    color: var(--color-navy);
    letter-spacing: -0.3px;

    @media (min-width: $bp-tablet) {
      font-size: 24px;
    }
  }

  .page-subtitle {
    font-size: 13px;
    color: var(--color-text-secondary);
    margin-top: 2px;
  }

  .btn-back {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: $radius-pill;
    background-color: var(--color-surface-soft);
    border: 1px solid var(--color-border);
    color: var(--color-text-primary);
    text-decoration: none;
    font-size: 12px;
    font-weight: 600;
    transition: all 0.2s ease;

    &:hover {
      background-color: var(--color-card);
      border-color: var(--color-red);
      color: $color-red;
      transform: translateX(-2px);
    }
  }
}

// Layout Grid
.profile-layout {
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (min-width: $bp-desktop) {
    display: grid;
    grid-template-columns: 420px 1fr;
    gap: 24px;
    align-items: start;
  }
}

// Pilot Identity Card
.pilot-card {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;

  .pilot-identity-hero {
    display: flex;
    align-items: center;
    gap: 16px;

    .avatar-container {
      position: relative;
      width: 72px;
      height: 72px;
      flex-shrink: 0;

      .pilot-avatar {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
        border: 3px solid var(--color-card);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
      }

      .status-indicator {
        position: absolute;
        bottom: 2px;
        right: 2px;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background-color: $color-success;
        border: 2px solid var(--color-card);
      }
    }

    .pilot-hero-text {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .name-row {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;

        .pilot-name {
          font-size: 18px;
          font-weight: 800;
          color: var(--color-navy);
        }

        .role-badge {
          background-color: rgba(230, 55, 87, 0.1);
          color: $color-red;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: $radius-pill;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      }

      .pilot-airline {
        font-size: 12px;
        color: var(--color-text-secondary);
      }
    }
  }

  .stats-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;

    .stat-box {
      background-color: var(--color-surface-soft);
      border: 1px solid var(--color-border);
      border-radius: $radius-sm;
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 6px;

      .stat-label {
        font-size: 11px;
        color: var(--color-text-muted);
        font-weight: 600;
      }

      .stat-value-group {
        display: flex;
        align-items: center;
        gap: 6px;

        .stat-icon {
          color: var(--color-text-secondary);
        }

        .stat-value {
          font-size: 16px;
          font-weight: 800;
          color: var(--color-navy);
        }

        &.text-success {
          .stat-icon,
          .stat-value {
            color: $color-success;
          }
        }
      }
    }
  }

  .pilot-qualifications-section {
    border-top: 1px solid var(--color-border);
    padding-top: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;

    .qualifications-header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .qualifications-title {
        font-size: 11.5px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--color-text-muted);
      }
    }

    .credentials-cards-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .qualification-card {
      background-color: var(--color-surface-soft);
      border: 1px solid var(--color-border);
      border-radius: $radius-sm;
      padding: 12px 14px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      transition: all 0.2s ease;

      @media (max-width: 380px) {
        padding: 10px 10px;
        gap: 10px;
      }

      &:hover {
        border-color: rgba($color-navy, 0.2);
        box-shadow: var(--shadow-sm);
      }

      .qual-icon-orb {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        margin-top: 2px;

        &.qual-icon-license {
          background-color: rgba(245, 158, 11, 0.12);
          color: #d97706;
        }

        &.qual-icon-base {
          background-color: rgba(59, 130, 246, 0.12);
          color: #2563eb;
        }

        &.qual-icon-fleet {
          background-color: rgba(230, 55, 87, 0.12);
          color: $color-red;
        }
      }

      .qual-details {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 3px;
      }

      .qual-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        flex-wrap: wrap;

        .qual-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .qual-badge {
          font-size: 10px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: $radius-pill;
          background-color: var(--color-card);
          color: var(--color-navy);
          border: 1px solid var(--color-border);
          letter-spacing: 0.3px;

          &.base-code {
            background-color: rgba(59, 130, 246, 0.1);
            color: #2563eb;
            border-color: rgba(59, 130, 246, 0.25);
          }

          &.fleet-count {
            background-color: rgba(230, 55, 87, 0.1);
            color: $color-red;
            border-color: rgba(230, 55, 87, 0.25);
          }
        }
      }

      .qual-value {
        font-size: 13px;
        font-weight: 700;
        color: var(--color-navy);
        line-height: 1.3;
      }

      &.fleet-card {
        .qual-details {
          gap: 6px;
        }
      }

      .fleet-chips-grid {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-top: 4px;

        .aircraft-chip {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 10px;
          border-radius: 6px;
          background-color: var(--color-card);
          border: 1px solid var(--color-border);
          gap: 8px;
          transition: background-color 0.15s ease;

          &:hover {
            border-color: rgba($color-red, 0.3);
          }

          .chip-main {
            display: flex;
            align-items: center;
            gap: 7px;
            min-width: 0;

            .chip-dot {
              width: 6px;
              height: 6px;
              border-radius: 50%;
              background-color: $color-red;
              flex-shrink: 0;
            }

            .aircraft-name {
              font-size: 12px;
              font-weight: 600;
              color: var(--color-navy);
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
          }

          .aircraft-code {
            font-size: 10px;
            font-weight: 700;
            color: var(--color-text-secondary);
            background-color: var(--color-surface-soft);
            padding: 2px 6px;
            border-radius: 4px;
            flex-shrink: 0;
          }
        }
      }
    }
  }
}

// Settings Column
.settings-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

// Card Headers
.section-heading {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;

  .icon-circle {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background-color: rgba(34, 197, 232, 0.12);
    color: $color-chart-accent;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    &.icon-shield {
      background-color: rgba(230, 55, 87, 0.12);
      color: $color-red;
    }
  }

  .section-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--color-navy);
  }

  .section-desc {
    font-size: 12px;
    color: var(--color-text-secondary);
    margin-top: 1px;
  }
}

// Appearance Card & Theme Options
.theme-options-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;

  @media (min-width: $bp-tablet) {
    grid-template-columns: 1fr 1fr;
  }

  .theme-option-card {
    background-color: var(--color-surface-soft);
    border: 2px solid var(--color-border);
    border-radius: 12px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    cursor: pointer;
    text-align: left;
    transition: all 0.2s ease;
    position: relative;

    &:hover {
      border-color: rgba(230, 55, 87, 0.4);
      background-color: var(--color-card-hover, var(--color-card));
    }

    &.active {
      border-color: $color-red;
      background-color: var(--color-card);
      box-shadow: 0 4px 14px rgba(230, 55, 87, 0.12);
    }

    .option-preview {
      width: 100%;
      height: 80px;
      border-radius: 8px;
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      border: 1px solid rgba(0, 0, 0, 0.08);

      &.light-preview {
        background-color: #F8FAFC;

        .preview-header {
          height: 10px;
          background-color: #0E2138;
          border-radius: 4px;
          width: 45%;
        }

        .preview-line {
          height: 6px;
          border-radius: 3px;
          background-color: #E2E8F0;

          &.line-1 { width: 85%; }
          &.line-2 { width: 60%; }
        }
      }

      &.dark-preview {
        background-color: #0B1320;
        border-color: rgba(255, 255, 255, 0.1);

        .preview-header {
          height: 10px;
          background-color: #E63757;
          border-radius: 4px;
          width: 45%;
        }

        .preview-line {
          height: 6px;
          border-radius: 3px;
          background-color: #1E2D44;

          &.line-1 { width: 85%; }
          &.line-2 { width: 60%; }
        }
      }
    }

    .option-info {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .option-title-row {
        display: flex;
        align-items: center;
        gap: 6px;

        .sun-icon {
          color: #F59E0B;
        }

        .moon-icon {
          color: #818CF8;
        }

        .option-name {
          font-size: 13px;
          font-weight: 700;
          color: var(--color-navy);
        }
      }

      .option-desc {
        font-size: 11px;
        color: var(--color-text-secondary);
      }
    }

    .radio-indicator {
      position: absolute;
      top: 20px;
      right: 20px;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 2px solid var(--color-border);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;

      &.selected {
        border-color: $color-red;

        .radio-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: $color-red;
        }
      }
    }
  }
}

// Session Card
.session-card {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .session-info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--color-surface-soft);
    padding: 12px 14px;
    border-radius: $radius-sm;
    border: 1px solid var(--color-border);

    .session-user {
      display: flex;
      flex-direction: column;

      .user-label {
        font-size: 10px;
        color: var(--color-text-muted);
        text-transform: uppercase;
        font-weight: 700;
        letter-spacing: 0.5px;
      }

      .user-val {
        font-size: 14px;
        font-weight: 700;
        color: var(--color-navy);
      }
    }

    .session-status {
      font-size: 11px;
      font-weight: 700;
      color: $color-success;
      background-color: rgba(31, 191, 143, 0.1);
      padding: 3px 8px;
      border-radius: $radius-pill;
    }
  }

  .btn-logout-full {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 12px 20px;
    border-radius: $radius-pill;
    background-color: rgba(230, 55, 87, 0.08);
    border: 1.5px solid rgba(230, 55, 87, 0.3);
    color: $color-red;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background-color: $color-red;
      color: #ffffff;
      box-shadow: 0 4px 14px rgba(230, 55, 87, 0.25);
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
    }
  }
}
</style>
