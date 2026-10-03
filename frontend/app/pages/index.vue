<template>
  <div class="main-content home-page">
    <!-- Header Section -->
    <header class="pilot-header">
      <div class="profile-info">
        <span class="greeting">Welcome back, Captain</span>
        <h1 class="pilot-name">{{ pilot?.name || 'Loading...' }}</h1>
        <div class="hours-badge">
          <Clock :size="14" />
          <span>{{ pilot?.totalFlightHours?.toLocaleString() || '---' }} Total Flight Hours</span>
        </div>
      </div>

      <div class="header-actions">
        <NuxtLink to="/profile" class="avatar-link" title="View Pilot Profile & Settings">
          <img
            :src="pilot?.avatarUrl || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=256'"
            alt="Pilot Avatar"
            class="avatar-img"
          />
        </NuxtLink>
      </div>
    </header>

    <!-- Responsive Dashboard Grid -->
    <div class="dashboard-layout">
      <!-- Main Column: Limit Cards & Chart -->
      <div class="dashboard-main">
        <!-- Hours to Limit Section -->
        <section class="limit-section">
          <div class="section-title-row">
            <h2 class="section-title">Hours to Limit</h2>
            <span class="base-date-tag">Ref: 15 May 2026</span>
          </div>

          <!-- 4 Limit Summary Cards -->
          <div class="cards-grid">
            <div
              v-for="card in summaryData?.cards || defaultCards"
              :key="card.id"
              class="limit-card"
              :class="{ 'card-over': card.isOverLimit }"
            >
              <div class="card-header-row">
                <span class="card-label">{{ card.label }}</span>
                <span class="window-tag">{{ card.window }}</span>
              </div>

              <div class="card-value-row">
                <span class="current-val font-number">{{ card.currentHours }}h</span>
                <span class="limit-val">/ {{ card.limit }}h</span>
              </div>

              <!-- Progress Bar -->
              <div class="progress-bar-bg">
                <div
                  class="progress-bar-fill"
                  :class="{
                    'fill-danger': card.isOverLimit,
                    'fill-warning': card.percentage > 85 && !card.isOverLimit,
                    'fill-safe': card.percentage <= 85
                  }"
                  :style="{ width: `${Math.min(100, card.percentage)}%` }"
                ></div>
              </div>
            </div>
          </div>

          <!-- Flight Hours Trend Chart -->
          <FlightHoursChart
            :series="summaryData?.series || []"
            :current-range="selectedRange"
            :limit-hours="summaryData?.limit || 40"
            :chart-max="summaryData?.max || 45"
            @update:range="handleRangeChange"
          />
        </section>
      </div>

      <!-- Side Column: My Documents Section -->
      <div class="dashboard-sidebar">
        <section class="documents-section">
          <div class="section-title-row">
            <h2 class="section-title">My Documents</h2>
            <span class="doc-count">{{ documents?.length || 0 }} items</span>
          </div>

          <div class="documents-list">
            <div
              v-for="doc in documents"
              :key="doc.id"
              class="doc-card"
            >
              <div class="doc-icon-wrapper" :style="{ backgroundColor: `${doc.badgeColor}15` }">
                <FileBadge :size="20" :style="{ color: doc.badgeColor }" />
              </div>

              <div class="doc-details">
                <h4 class="doc-name">{{ doc.label }}</h4>
                <div class="doc-meta">
                  <span class="doc-date">Expires: {{ doc.expiryDate }}</span>
                  <span class="doc-remaining">
                    <span v-if="doc.urgency === 'expired'" class="text-danger">
                      Expired {{ Math.abs(doc.daysRemaining) }} days ago
                    </span>
                    <span v-else-if="doc.urgency === 'soon'" class="text-warning">
                      {{ doc.daysRemaining }} days remaining
                    </span>
                    <span v-else class="text-success">
                      {{ doc.daysRemaining }} days remaining
                    </span>
                  </span>
                </div>
              </div>

              <!-- Expiry Urgency Badge from Server -->
              <div
                class="urgency-badge"
                :style="{
                  backgroundColor: `${doc.badgeColor}18`,
                  color: doc.badgeColor,
                  borderColor: `${doc.badgeColor}40`
                }"
              >
                {{ doc.urgency.toUpperCase() }}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Clock, FileBadge } from 'lucide-vue-next';
import { useAuthStore } from '~/stores/auth';
import { useApi } from '~/composables/useApi';

const authStore = useAuthStore();
const api = useApi();

const pilot = ref<any>(null);
const summaryData = ref<any>(null);
const documents = ref<any[]>([]);
const selectedRange = ref('1w');

const defaultCards = [
  { id: 'daily', label: 'Daily', limit: 8, currentHours: 0, window: 'Today only', percentage: 0, isOverLimit: false },
  { id: 'weekly', label: 'Weekly', limit: 40, currentHours: 0, window: 'Rolling 7 days', percentage: 0, isOverLimit: false },
  { id: 'monthly', label: 'Monthly', limit: 100, currentHours: 0, window: 'Rolling 30 days', percentage: 0, isOverLimit: false },
  { id: 'annual', label: 'Annual', limit: 1050, currentHours: 0, window: 'Rolling 365 days', percentage: 0, isOverLimit: false },
];

async function loadPilot() {
  try {
    pilot.value = await api.get('/pilot/me');
  } catch (e) {
    console.error('Failed to load pilot profile', e);
  }
}

async function loadSummary(range = selectedRange.value) {
  try {
    summaryData.value = await api.get(`/flight-hours/summary?range=${range}`);
  } catch (e) {
    console.error('Failed to load flight hours summary', e);
  }
}

async function loadDocuments() {
  try {
    const res: any = await api.get('/documents');
    documents.value = res?.documents || [];
  } catch (e) {
    console.error('Failed to load documents', e);
  }
}

function handleRangeChange(newRange: string) {
  selectedRange.value = newRange;
  loadSummary(newRange);
}

onMounted(() => {
  loadPilot();
  loadSummary();
  loadDocuments();
});
</script>

<style scoped lang="scss">
.home-page {
  gap: 20px;
}

// Header
.pilot-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0 4px;

  .greeting {
    font-size: 13px;
    font-weight: 500;
    color: $color-text-secondary;
  }

  .pilot-name {
    font-size: 22px;
    font-weight: 800;
    color: var(--color-navy);
    margin: 2px 0 6px;
  }

  .hours-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background-color: var(--color-surface-soft);
    color: var(--color-navy);
    font-size: 12px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: $radius-pill;
    border: 1px solid var(--color-border);
  }

  .header-actions {
    display: flex;
    align-items: center;

    .avatar-link {
      display: inline-block;
      border-radius: 50%;
      text-decoration: none;
      transition: transform 0.2s ease;

      &:hover {
        transform: scale(1.06);
      }
    }

    .avatar-img {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid var(--color-card);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      display: block;
    }
  }
}

// Responsive Dashboard Layout
.dashboard-layout {
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (min-width: $bp-desktop) {
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: 28px;
    align-items: start;
  }
}

.dashboard-main {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.dashboard-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

// Section Headers
.section-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  .section-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--color-navy);
  }

  .base-date-tag,
  .doc-count {
    font-size: 11px;
    color: var(--color-text-muted);
    background: var(--color-surface-tag);
    padding: 3px 10px;
    border-radius: $radius-pill;
    font-weight: 600;
    border: 1px solid var(--color-border);
  }
}

// 4 Cards Grid: 2x2 on mobile, 4 in a row on tablet & desktop
.cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;

  @media (min-width: $bp-tablet) {
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }

  .limit-card {
    min-width: 0;
    overflow: hidden;
    background-color: var(--color-card);
    border-radius: $radius-card;
    padding: 14px 12px;
    box-shadow: var(--shadow-card);
    border: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    gap: 8px;
    transition: transform 0.2s, box-shadow 0.2s, background-color 0.25s;

    @media (min-width: $bp-desktop) {
      padding: 16px;
      gap: 10px;
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
    }

    &.card-over {
      border-color: rgba(230, 55, 87, 0.4);
      background-color: rgba(230, 55, 87, 0.06);
    }

    .card-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .card-label {
        font-size: 13px;
        font-weight: 600;
        color: var(--color-navy);
      }

      .window-tag {
        font-size: 10px;
        color: var(--color-text-muted);
      }
    }

    .card-value-row {
      display: flex;
      align-items: baseline;
      gap: 4px;

      .current-val {
        font-size: 19px;
        color: var(--color-navy);

        @media (min-width: $bp-desktop) {
          font-size: 22px;
        }
      }

      .limit-val {
        font-size: 11px;
        color: var(--color-text-muted);

        @media (min-width: $bp-desktop) {
          font-size: 12px;
        }
      }
    }

    .progress-bar-bg {
      width: 100%;
      height: 6px;
      background-color: var(--color-surface-soft);
      border-radius: $radius-pill;
      overflow: hidden;

      .progress-bar-fill {
        height: 100%;
        border-radius: $radius-pill;
        transition: width 0.3s ease;

        &.fill-safe {
          background-color: $color-success;
        }

        &.fill-warning {
          background-color: $color-warning;
        }

        &.fill-danger {
          background-color: $color-danger;
        }
      }
    }
  }
}

// Documents Section
.documents-list {
  display: flex;
  flex-direction: column;
  gap: 10px;

  .doc-card {
    background-color: var(--color-card);
    border-radius: $radius-sm;
    padding: 14px 16px;
    box-shadow: var(--shadow-card);
    display: flex;
    align-items: center;
    gap: 12px;
    border: 1px solid var(--color-border);
    transition: transform 0.15s ease, background-color 0.25s ease;

    &:hover {
      transform: translateY(-1px);
    }

    .doc-icon-wrapper {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .doc-details {
      flex: 1;
      min-width: 0;

      .doc-name {
        font-size: 13px;
        font-weight: 700;
        color: $color-navy;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .doc-meta {
        display: flex;
        flex-direction: column;
        gap: 2px;
        margin-top: 2px;
        font-size: 11px;

        .doc-date {
          color: $color-text-muted;
        }

        .text-danger {
          color: $color-danger;
          font-weight: 600;
        }

        .text-warning {
          color: $color-warning;
          font-weight: 600;
        }

        .text-success {
          color: $color-success;
          font-weight: 500;
        }
      }
    }

    .urgency-badge {
      font-size: 10px;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: $radius-pill;
      border: 1px solid;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      flex-shrink: 0;
    }
  }
}
</style>
