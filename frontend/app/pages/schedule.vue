<template>
  <div class="main-content schedule-page">
    <!-- Header -->
    <header class="schedule-header">
      <div>
        <h1 class="page-title">Duty Roster</h1>
        <p class="page-subtitle">Monthly Schedule & Operational Status</p>
      </div>

      <!-- Month Navigation Controls -->
      <div class="month-selector">
        <button type="button" class="nav-btn" @click="changeMonth(-1)" :disabled="isLoading">
          <ChevronLeft :size="18" />
        </button>

        <span class="current-month-display font-number">
          {{ monthNames[currentMonth - 1] }} {{ currentYear }}
        </span>

        <button type="button" class="nav-btn" @click="changeMonth(1)" :disabled="isLoading">
          <ChevronRight :size="18" />
        </button>
      </div>
    </header>

    <!-- Calendar Card Container -->
    <div class="card calendar-card">
      <!-- Weekday Headers -->
      <div class="weekday-grid">
        <span v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="day" class="weekday-header">
          {{ day }}
        </span>
      </div>

      <!-- Calendar Days Grid -->
      <div class="days-grid">
        <!-- Leading empty blanks for start of month -->
        <div
          v-for="blank in leadingBlanks"
          :key="`blank-${blank}`"
          class="day-cell day-empty"
        ></div>

        <!-- Actual Days in Month -->
        <div
          v-for="dayNum in daysInMonth"
          :key="`day-${dayNum}`"
          class="day-cell"
          :class="{
            'is-today': isDateToday(dayNum),
            'has-duty': !!getScheduleForDay(dayNum)
          }"
          :style="getDayCellStyle(dayNum)"
          @click="handleDayClick(dayNum)"
        >
          <!-- Top Row: Day Number & Status Indicator -->
          <div class="cell-top">
            <span class="day-number font-number">{{ dayNum }}</span>

            <!-- Duty Status Indicator per day -->
            <template v-if="getScheduleForDay(dayNum)">
              <!-- Show a tick when count_logbooks equals count_schedules -->
              <span
                v-if="getScheduleForDay(dayNum).count_logbooks === getScheduleForDay(dayNum).count_schedules"
                class="tick-indicator"
                title="Completed Duties"
              >
                <Check :size="12" stroke-width="3" />
              </span>

              <!-- Otherwise show the number of remaining duties -->
              <span
                v-else
                class="duty-count-badge"
                title="Remaining Duties"
              >
                {{ Math.max(0, getScheduleForDay(dayNum).count_schedules - getScheduleForDay(dayNum).count_logbooks) }}
              </span>
            </template>
          </div>

          <!-- Base Name / Duty Code under the day -->
          <div class="cell-bottom" v-if="getScheduleForDay(dayNum)">
            <span class="base-name-label">
              {{ getScheduleForDay(dayNum).base_name }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Legend Section -->
    <section class="legend-card card">
      <h3 class="legend-title">Duty Legend</h3>
      <div class="legend-grid">
        <div
          v-for="item in legendItems"
          :key="item.code"
          class="legend-item"
        >
          <span class="color-dot" :style="{ backgroundColor: item.color }"></span>
          <span class="legend-code font-number">{{ item.code }}</span>
          <span class="legend-label">{{ item.label }}</span>
        </div>
      </div>
    </section>

    <!-- Rich Operational Duty Detail Modal -->
    <div
      v-if="selectedDayDetail !== null"
      class="modal-backdrop"
      @click="selectedDayDetail = null"
    >
      <div class="modal-card duty-detail-modal" @click.stop>
        <!-- Modal Top Row: Date, Today Tag & Close Button -->
        <div class="modal-header-row">
          <div class="modal-date-group">
            <span class="modal-day-name">{{ formatModalDate(selectedDayDetail) }}</span>
            <div class="modal-badge-row">
              <span v-if="selectedDayDetail === '2026-05-15'" class="today-tag">
                TODAY (15 MAY 2026)
              </span>
              <span
                v-if="selectedSchedule"
                class="duty-type-pill"
                :style="{
                  backgroundColor: `${selectedSchedule.base_color}22`,
                  color: selectedSchedule.base_color,
                  borderColor: `${selectedSchedule.base_color}66`
                }"
              >
                {{ selectedLegendItem?.label || selectedSchedule.duty_type }}
              </span>
            </div>
          </div>

          <button
            type="button"
            class="btn-modal-close"
            @click="selectedDayDetail = null"
            title="Close"
          >
            <X :size="18" />
          </button>
        </div>

        <!-- Duty Information Body (If scheduled) -->
        <div v-if="selectedSchedule" class="duty-body">
          <!-- Duty Summary Box -->
          <div
            class="duty-hero-box"
            :style="{ borderColor: `${selectedSchedule.base_color}44` }"
          >
            <div class="hero-left">
              <div
                class="duty-icon-orb"
                :style="{
                  backgroundColor: `${selectedSchedule.base_color}22`,
                  color: selectedSchedule.base_color
                }"
              >
                <Plane v-if="selectedSchedule.duty_type === 'DTY'" :size="20" />
                <BookOpen v-else-if="selectedSchedule.duty_type === 'TRX' || selectedSchedule.duty_type === 'REC'" :size="20" />
                <Briefcase v-else-if="selectedSchedule.duty_type === 'ADM'" :size="20" />
                <Activity v-else-if="selectedSchedule.duty_type === 'MED'" :size="20" />
                <CalendarIcon v-else :size="20" />
              </div>

              <div class="hero-info">
                <div class="hero-title-row">
                  <h4 class="hero-title">{{ selectedSchedule.base_name }}</h4>
                  <span class="duty-code-badge font-number">{{ selectedSchedule.duty_type }}</span>
                </div>
                <p class="hero-airport">
                  {{ airportBaseNames[selectedSchedule.base_name] || 'Operating Base Station' }}
                </p>
              </div>
            </div>

            <!-- Verification Status Badge -->
            <div class="hero-status">
              <span
                v-if="selectedSchedule.count_logbooks === selectedSchedule.count_schedules"
                class="status-verified-badge"
              >
                <CheckCircle2 :size="13" />
                <span>Verified</span>
              </span>
              <span v-else class="status-pending-badge">
                <Clock :size="13" />
                <span>Pending</span>
              </span>
            </div>
          </div>

          <!-- Progress Bar & Leg Counters -->
          <div class="progress-section">
            <div class="progress-label-row">
              <span class="progress-title">Duty Checklist & Logbook Completion</span>
              <span class="progress-fraction font-number">
                {{ selectedSchedule.count_logbooks }} / {{ selectedSchedule.count_schedules }} Logged
              </span>
            </div>

            <div class="modal-progress-bg">
              <div
                class="modal-progress-fill"
                :class="{
                  'fill-completed': selectedSchedule.count_logbooks === selectedSchedule.count_schedules,
                  'fill-partial': selectedSchedule.count_logbooks < selectedSchedule.count_schedules
                }"
                :style="{
                  width: `${Math.min(100, Math.round((selectedSchedule.count_logbooks / (selectedSchedule.count_schedules || 1)) * 100))}%`
                }"
              ></div>
            </div>
          </div>

          <!-- 3 Mini Stats -->
          <div class="modal-stats-grid">
            <div class="stat-mini-card">
              <span class="stat-mini-label">Rostered Duties</span>
              <span class="stat-mini-val font-number">{{ selectedSchedule.count_schedules }}</span>
            </div>

            <div class="stat-mini-card">
              <span class="stat-mini-label">Logged Flights</span>
              <span class="stat-mini-val font-number text-success">{{ selectedSchedule.count_logbooks }}</span>
            </div>

            <div class="stat-mini-card">
              <span class="stat-mini-label">Remaining Duties</span>
              <span
                class="stat-mini-val font-number"
                :class="{ 'text-danger': selectedSchedule.count_schedules > selectedSchedule.count_logbooks }"
              >
                {{ Math.max(0, selectedSchedule.count_schedules - selectedSchedule.count_logbooks) }}
              </span>
            </div>
          </div>

          <!-- Operational Compliance Note -->
          <div class="compliance-box">
            <Info :size="15" class="compliance-icon" />
            <p class="compliance-text">
              <template v-if="selectedSchedule.count_logbooks === selectedSchedule.count_schedules">
                All scheduled duty legs for this date have been logged and verified against pilot duty time limits.
              </template>
              <template v-else>
                {{ selectedSchedule.count_schedules - selectedSchedule.count_logbooks }} flight duty item(s) pending completion. Submit flight log after landing.
              </template>
            </p>
          </div>
        </div>

        <!-- Off Duty / Rest Day Body -->
        <div v-else class="off-duty-body">
          <div class="off-duty-icon-circle">
            <Coffee :size="28" />
          </div>
          <h4 class="off-duty-title">Rest Day / Standby</h4>
          <p class="off-duty-desc">
            No flight duties or simulator training are rostered on this date. You are cleared for mandatory flight crew rest.
          </p>
          <div class="off-duty-badge">
            <ShieldCheck :size="14" />
            <span>Duty Clearance Active</span>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer-row">
          <button type="button" class="btn-primary btn-modal-done" @click="selectedDayDetail = null">
            Done
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Calendar as CalendarIcon,
  X,
  Plane,
  BookOpen,
  Briefcase,
  Activity,
  CheckCircle2,
  Clock,
  Info,
  Coffee,
  ShieldCheck,
  Sparkles
} from 'lucide-vue-next';
import { useApi } from '~/composables/useApi';

const api = useApi();

const currentYear = ref(2026);
const currentMonth = ref(5); // May
const isLoading = ref(false);
const schedules = ref<any[]>([]);
const legendItems = ref<any[]>([]);
const selectedDayDetail = ref<string | null>(null);

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Susi Air Airport Base Name Lookup
const airportBaseNames: Record<string, string> = {
  HLP: 'Halim Perdanakusuma (Jakarta HQ)',
  MKW: 'Rendani Airport (Manokwari)',
  PDG: 'Minangkabau Int. Airport (Padang)',
  DJJ: 'Sentani Airport (Jayapura)',
  TIM: 'Mozes Kilangin Airport (Timika)',
  WSR: 'Wasior Airport',
  BXM: 'Babih Airport (Bintuni)',
  KNG: 'Utarom Airport (Kaimana)',
  NBX: 'Douw Aturure Airport (Nabire)',
  GNS: 'Binaka Airport (Gunungsitoli)',
  TRX: 'Flight Training & Simulator Base',
  ADM: 'Flight Operations Administration HQ',
  MED: 'Aviation Medical Examination Center',
  FER: 'Aircraft Ferry & Maintenance Routing',
  REC: 'Recurrent Training Center'
};

// Calculate calendar grid metrics
const firstDayWeekday = computed(() => {
  return new Date(Date.UTC(currentYear.value, currentMonth.value - 1, 1)).getUTCDay();
});

const leadingBlanks = computed(() => {
  return Array.from({ length: firstDayWeekday.value }, (_, i) => i);
});

const daysInMonth = computed(() => {
  return new Date(Date.UTC(currentYear.value, currentMonth.value, 0)).getUTCDate();
});

// Format day helper YYYY-MM-DD
function getDateString(dayNum: number): string {
  const m = String(currentMonth.value).padStart(2, '0');
  const d = String(dayNum).padStart(2, '0');
  return `${currentYear.value}-${m}-${d}`;
}

function isDateToday(dayNum: number): boolean {
  return getDateString(dayNum) === '2026-05-15';
}

function getScheduleForDay(dayNum: number) {
  const dateStr = getDateString(dayNum);
  return schedules.value.find((s) => s.duty_date === dateStr);
}

const selectedSchedule = computed(() => {
  if (!selectedDayDetail.value) return null;
  return schedules.value.find((s) => s.duty_date === selectedDayDetail.value) || null;
});

const selectedLegendItem = computed(() => {
  if (!selectedSchedule.value) return null;
  return legendItems.value.find((l) => l.code === selectedSchedule.value.duty_type) || null;
});

function formatModalDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const dateObj = new Date(Date.UTC(year, month - 1, day));
  return dateObj.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  });
}

function getDayCellStyle(dayNum: number) {
  const s = getScheduleForDay(dayNum);
  if (!s) return {};

  return {
    backgroundColor: `${s.base_color}25`, // 25% tint for clean readable mobile background
    border: `1.5px solid ${s.base_color}`,
  };
}

function handleDayClick(dayNum: number) {
  selectedDayDetail.value = getDateString(dayNum);
}

async function loadSchedules() {
  isLoading.value = true;
  try {
    const formattedMonth = String(currentMonth.value).padStart(2, '0');
    const res: any = await api.get(`/schedules?year=${currentYear.value}&month=${formattedMonth}`);
    schedules.value = res?.schedules || [];
    if (res?.legend?.length) {
      legendItems.value = res.legend;
    }
  } catch (error) {
    console.error('Failed to load schedules', error);
  } finally {
    isLoading.value = false;
  }
}

function changeMonth(delta: number) {
  let newMonth = currentMonth.value + delta;
  let newYear = currentYear.value;

  if (newMonth < 1) {
    newMonth = 12;
    newYear -= 1;
  } else if (newMonth > 12) {
    newMonth = 1;
    newYear += 1;
  }

  currentMonth.value = newMonth;
  currentYear.value = newYear;
  loadSchedules();
}

onMounted(() => {
  loadSchedules();
});
</script>

<style scoped lang="scss">
.schedule-page {
  gap: 18px;
}

// Header
.schedule-header {
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
}

// Month Selector
.month-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: var(--color-card);
  padding: 4px 8px;
  border-radius: $radius-pill;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);

  .current-month-display {
    font-size: 13px;
    font-weight: 700;
    color: var(--color-navy);
    min-width: 90px;
    text-align: center;
  }

  .nav-btn {
    background: none;
    border: none;
    color: var(--color-navy);
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover:not(:disabled) {
      background-color: var(--color-surface-soft);
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }
}

// Calendar Card
.calendar-card {
  padding: 16px 12px;

  .weekday-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    text-align: center;
    margin-bottom: 8px;

    .weekday-header {
      font-size: 11px;
      font-weight: 700;
      color: var(--color-text-muted);
      text-transform: uppercase;
      padding-bottom: 6px;
    }
  }

  .days-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 6px;

    .day-cell {
      min-height: 52px;
      background-color: var(--color-surface-soft);
      border-radius: 8px;
      border: 1px solid var(--color-border);
      padding: 4px 6px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      cursor: pointer;
      transition: all 0.15s ease;
      position: relative;

      @media (min-width: $bp-tablet) {
        min-height: 82px;
        padding: 8px 10px;
        border-radius: 12px;
      }

      &:hover {
        transform: scale(1.03);
        z-index: 2;
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
      }

      &.is-today {
        box-shadow: 0 0 0 2px $color-red;

        .day-number {
          color: $color-red;
          font-weight: 800;
        }
      }

      &.day-empty {
        background: transparent;
        border: none;
        cursor: default;
        &:hover {
          transform: none;
        }
      }

      .cell-top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;

        .day-number {
          font-size: 11px;
          color: var(--color-navy);

          @media (min-width: $bp-tablet) {
            font-size: 13px;
            font-weight: 700;
          }
        }

        .tick-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background-color: #10B981;
          color: #ffffff;

          @media (min-width: $bp-tablet) {
            width: 20px;
            height: 20px;
          }
        }

        .duty-count-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 15px;
          height: 15px;
          padding: 0 3px;
          border-radius: 50%;
          background-color: var(--color-navy);
          color: var(--color-bg);
          font-size: 9px;
          font-weight: 700;

          @media (min-width: $bp-tablet) {
            min-width: 18px;
            height: 18px;
            font-size: 11px;
          }
        }
      }

      .cell-bottom {
        display: flex;
        justify-content: center;

        .base-name-label {
          font-size: 10px;
          font-weight: 700;
          color: var(--color-navy);
          letter-spacing: 0.3px;

          @media (min-width: $bp-tablet) {
            font-size: 13px;
            letter-spacing: 0.5px;
          }
        }
      }
    }
  }
}

// Legend
.legend-card {
  .legend-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--color-navy);
    margin-bottom: 12px;
  }

  .legend-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px 12px;

    @media (min-width: $bp-tablet) {
      grid-template-columns: repeat(4, 1fr);
      gap: 12px 18px;
    }

    @media (min-width: $bp-desktop) {
      grid-template-columns: repeat(5, 1fr);
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;

      .color-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .legend-code {
        font-weight: 700;
        color: var(--color-navy);
        min-width: 32px;
      }

      .legend-label {
        color: var(--color-text-secondary);
        font-size: 11px;
      }
    }
  }
}

// ─── Rich Duty Detail Modal ──────────────────────────────────────────────────
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 16px;
  animation: fadeIn 0.2s ease-out;

  .duty-detail-modal {
    background-color: var(--color-card);
    border-radius: 20px;
    padding: 22px 24px;
    width: 100%;
    max-width: 460px;
    max-height: 90vh;
    overflow-y: auto;
    text-align: left;
    box-shadow: var(--shadow-elevated);
    border: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    gap: 16px;
    animation: scaleIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

// Modal Header
.modal-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;

  .modal-date-group {
    display: flex;
    flex-direction: column;
    gap: 6px;

    .modal-day-name {
      font-size: 16px;
      font-weight: 800;
      color: var(--color-navy);
      letter-spacing: -0.2px;
    }

    .modal-badge-row {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;

      .today-tag {
        background-color: $color-red;
        color: #ffffff;
        font-size: 9px;
        font-weight: 800;
        padding: 2px 7px;
        border-radius: $radius-pill;
        letter-spacing: 0.5px;
      }

      .duty-type-pill {
        font-size: 11px;
        font-weight: 700;
        padding: 2px 9px;
        border-radius: $radius-pill;
        border: 1px solid;
      }
    }
  }

  .btn-modal-close {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: var(--color-surface-soft);
    border: 1px solid var(--color-border);
    color: var(--color-text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    transition: all 0.2s ease;

    &:hover {
      color: $color-red;
      border-color: $color-red;
      background-color: var(--color-card);
      transform: rotate(90deg);
    }
  }
}

// Duty Content Body
.duty-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

// Hero Box
.duty-hero-box {
  background-color: var(--color-surface-soft);
  border: 1.5px solid var(--color-border);
  border-radius: 14px;
  padding: 12px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;

  .hero-left {
    display: flex;
    align-items: center;
    gap: 12px;

    .duty-icon-orb {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .hero-info {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .hero-title-row {
        display: flex;
        align-items: center;
        gap: 6px;

        .hero-title {
          font-size: 16px;
          font-weight: 800;
          color: var(--color-navy);
        }

        .duty-code-badge {
          background-color: var(--color-card);
          color: var(--color-text-secondary);
          font-size: 10px;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 4px;
          border: 1px solid var(--color-border);
        }
      }

      .hero-airport {
        font-size: 11px;
        color: var(--color-text-secondary);
      }
    }
  }

  .hero-status {
    flex-shrink: 0;

    .status-verified-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background-color: rgba(31, 191, 143, 0.12);
      color: $color-success;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: $radius-pill;
    }

    .status-pending-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background-color: rgba(245, 158, 11, 0.12);
      color: $color-warning;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: $radius-pill;
    }
  }
}

// Progress Section
.progress-section {
  display: flex;
  flex-direction: column;
  gap: 6px;

  .progress-label-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11px;

    .progress-title {
      font-weight: 600;
      color: var(--color-text-secondary);
    }

    .progress-fraction {
      font-weight: 700;
      color: var(--color-navy);
    }
  }

  .modal-progress-bg {
    width: 100%;
    height: 8px;
    background-color: var(--color-surface-soft);
    border-radius: $radius-pill;
    border: 1px solid var(--color-border);
    overflow: hidden;

    .modal-progress-fill {
      height: 100%;
      border-radius: $radius-pill;
      transition: width 0.35s ease;

      &.fill-completed {
        background-color: $color-success;
      }

      &.fill-partial {
        background-color: $color-warning;
      }
    }
  }
}

// Mini Stats
.modal-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;

  .stat-mini-card {
    background-color: var(--color-surface-soft);
    border: 1px solid var(--color-border);
    border-radius: 10px;
    padding: 10px 6px;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 3px;

    .stat-mini-label {
      font-size: 10px;
      color: var(--color-text-muted);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .stat-mini-val {
      font-size: 16px;
      font-weight: 800;
      color: var(--color-navy);

      &.text-success {
        color: $color-success;
      }

      &.text-danger {
        color: $color-danger;
      }
    }
  }
}

// Compliance Box
.compliance-box {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background-color: rgba(34, 197, 232, 0.08);
  border: 1px solid rgba(34, 197, 232, 0.22);
  border-radius: 10px;
  padding: 10px 12px;

  .compliance-icon {
    color: $color-chart-accent;
    flex-shrink: 0;
    margin-top: 1px;
  }

  .compliance-text {
    font-size: 11px;
    color: var(--color-text-secondary);
    line-height: 1.45;
  }
}

// Off Duty Body
.off-duty-body {
  text-align: center;
  padding: 14px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;

  .off-duty-icon-circle {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background-color: var(--color-surface-soft);
    border: 1px solid var(--color-border);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #F59E0B;
  }

  .off-duty-title {
    font-size: 16px;
    font-weight: 800;
    color: var(--color-navy);
  }

  .off-duty-desc {
    font-size: 12px;
    color: var(--color-text-secondary);
    max-width: 320px;
    line-height: 1.45;
  }

  .off-duty-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background-color: rgba(31, 191, 143, 0.12);
    color: $color-success;
    font-size: 11px;
    font-weight: 700;
    padding: 4px 12px;
    border-radius: $radius-pill;
  }
}

// Footer Row
.modal-footer-row {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 4px;

  .btn-modal-done {
    width: 100%;
    padding: 12px 20px;
  }
}
</style>
