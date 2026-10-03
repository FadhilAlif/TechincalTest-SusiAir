<template>
  <div class="chart-container">
    <div class="chart-header">
      <div class="chart-title-group">
        <h3 class="chart-title">Flight Hours Trend</h3>
        <span class="chart-subtitle">Centered on Today (15 May 2026)</span>
      </div>

      <!-- Range Toggles -->
      <div class="toggle-group">
        <button
          v-for="opt in rangeOptions"
          :key="opt"
          type="button"
          class="toggle-btn"
          :class="{ active: currentRange === opt }"
          @click="$emit('update:range', opt)"
        >
          {{ opt }}
        </button>
      </div>
    </div>

    <!-- Active Tooltip Card -->
    <div v-if="activePoint" class="chart-tooltip-bar">
      <div class="tooltip-left">
        <span class="tooltip-date font-number">{{ formatFullDate(activePoint.date) }}</span>
        <span v-if="activePoint.isToday" class="tooltip-today-badge">TODAY</span>
      </div>

      <div class="tooltip-metrics">
        <div class="metric-item">
          <span class="metric-label">Rolling Sum:</span>
          <span
            class="metric-val font-number"
            :class="{ 'text-danger': activePoint.val > limitHours }"
          >
            {{ activePoint.val }}h
          </span>
        </div>

        <div class="metric-divider"></div>

        <div class="metric-item">
          <span class="metric-label">Daily Log:</span>
          <span class="metric-val font-number">{{ activePoint.dailyHours }}h</span>
        </div>

        <span v-if="activePoint.val > limitHours" class="tooltip-over-limit">
          Exceeds Limit (+{{ Math.round((activePoint.val - limitHours) * 10) / 10 }}h)
        </span>
      </div>
    </div>

    <!-- SVG Chart Area -->
    <div class="svg-wrapper" ref="wrapperRef">
      <svg
        :viewBox="`0 0 ${width} ${height}`"
        class="chart-svg"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#22C5E8" stop-opacity="0.35" />
            <stop offset="100%" stop-color="#22C5E8" stop-opacity="0.0" />
          </linearGradient>
        </defs>

        <!-- Y-Axis Grid Lines & Labels -->
        <g class="grid-lines">
          <!-- Max line -->
          <line
            :x1="paddingLeft"
            :y1="paddingTop"
            :x2="width - paddingRight"
            :y2="paddingTop"
            stroke="var(--chart-grid)"
            stroke-dasharray="3 3"
          />
          <text
            :x="paddingLeft - 6"
            :y="paddingTop + 4"
            class="axis-label"
            text-anchor="end"
          >
            {{ chartMax }}h
          </text>

          <!-- Middle line -->
          <line
            :x1="paddingLeft"
            :y1="midY"
            :x2="width - paddingRight"
            :y2="midY"
            stroke="var(--chart-grid)"
            stroke-dasharray="3 3"
          />
          <text
            :x="paddingLeft - 6"
            :y="midY + 4"
            class="axis-label"
            text-anchor="end"
          >
            {{ Math.round(chartMax / 2) }}h
          </text>

          <!-- Baseline 0 -->
          <line
            :x1="paddingLeft"
            :y1="baseY"
            :x2="width - paddingRight"
            :y2="baseY"
            stroke="var(--chart-grid)"
          />
          <text
            :x="paddingLeft - 6"
            :y="baseY + 4"
            class="axis-label"
            text-anchor="end"
          >
            0
          </text>
        </g>

        <!-- Red Limit Line (Required in Brief) -->
        <g class="limit-line-group" v-if="limitY !== null">
          <line
            :x1="paddingLeft"
            :y1="limitY"
            :x2="width - paddingRight"
            :y2="limitY"
            stroke="#E63757"
            stroke-width="1.8"
            stroke-dasharray="4 3"
          />
          <text
            :x="width - paddingRight"
            :y="limitY - 5"
            fill="#E63757"
            font-size="10"
            font-weight="700"
            text-anchor="end"
          >
            Limit: {{ limitHours }}h
          </text>
        </g>

        <!-- Active Point Guideline -->
        <line
          v-if="activePoint"
          :x1="activePoint.x"
          :y1="paddingTop"
          :x2="activePoint.x"
          :y2="baseY"
          stroke="#0E2138"
          stroke-dasharray="3 2"
          stroke-width="1.2"
          opacity="0.35"
        />

        <!-- Area Fill -->
        <path v-if="areaPath" :d="areaPath" fill="url(#areaGradient)" />

        <!-- Line Path -->
        <path
          v-if="linePath"
          :d="linePath"
          fill="none"
          stroke="#0E2138"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <!-- Data Points & Interactive Touch/Click Targets -->
        <g v-for="(p, i) in points" :key="i">
          <!-- Pulse halo for selected active point -->
          <circle
            v-if="activePointIndex === i"
            :cx="p.x"
            :cy="p.y"
            r="9"
            :fill="p.isToday ? '#E63757' : '#0E2138'"
            fill-opacity="0.25"
          />

          <!-- Today outer ring -->
          <circle
            v-else-if="p.isToday"
            :cx="p.x"
            :cy="p.y"
            r="7"
            fill="#E63757"
            fill-opacity="0.2"
          />

          <!-- Actual Point Circle -->
          <circle
            :cx="p.x"
            :cy="p.y"
            :r="activePointIndex === i ? 5 : (p.isToday ? 4.5 : 3)"
            :fill="p.isToday ? '#E63757' : (p.val > limitHours ? '#E63757' : '#22C5E8')"
            stroke="#FFFFFF"
            :stroke-width="activePointIndex === i ? 2 : 1.5"
          />

          <!-- Invisible large tap target for touch devices -->
          <circle
            :cx="p.x"
            :cy="p.y"
            r="16"
            fill="transparent"
            style="cursor: pointer;"
            @mouseenter="activePointIndex = i"
            @click="activePointIndex = i"
          />
        </g>
      </svg>

      <!-- X-Axis Date Labels -->
      <div class="x-axis-labels" :style="{ paddingLeft: `${paddingLeft}px`, paddingRight: `${paddingRight}px` }">
        <div
          v-for="(p, i) in points"
          :key="i"
          class="x-label"
          :class="{
            'label-today': p.isToday,
            'label-active': activePointIndex === i
          }"
          @click="activePointIndex = i"
          style="cursor: pointer;"
        >
          <span class="x-date">{{ p.label }}</span>
          <span v-if="p.isToday" class="badge-today">Today</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface ChartSeriesItem {
  date: string;
  rollingHours: number;
  dailyHours: number;
  isToday: boolean;
}

const props = defineProps<{
  series: ChartSeriesItem[];
  currentRange: string;
  limitHours: number;
  chartMax: number;
}>();

defineEmits<{
  (e: 'update:range', val: string): void;
}>();

const rangeOptions = ['1w', '1m', '3m', '6m', '1y'];

// Default active point to center (index 7: 15 May 2026)
const activePointIndex = ref<number | null>(7);

const width = 560;
const height = 200;
const paddingTop = 24;
const paddingBottom = 28;
const paddingLeft = 36;
const paddingRight = 16;

const plotWidth = width - paddingLeft - paddingRight;
const plotHeight = height - paddingTop - paddingBottom;
const baseY = height - paddingBottom;
const midY = paddingTop + plotHeight / 2;

// Compute Limit Y position
const limitY = computed(() => {
  if (!props.chartMax || !props.limitHours) return null;
  const ratio = Math.min(1, Math.max(0, props.limitHours / props.chartMax));
  return baseY - ratio * plotHeight;
});

// Compute coordinate points for each series entry
const points = computed(() => {
  if (!props.series || props.series.length === 0) return [];
  const n = props.series.length;
  const step = n > 1 ? plotWidth / (n - 1) : plotWidth;

  return props.series.map((item, index) => {
    const x = paddingLeft + index * step;
    const ratio = Math.min(1.05, Math.max(0, item.rollingHours / (props.chartMax || 1)));
    const y = baseY - ratio * plotHeight;

    const parts = item.date.split('-');
    const day = parts[2] || '';
    const month = parts[1] === '05' ? 'May' : parts[1] || '';

    return {
      x,
      y,
      val: item.rollingHours,
      dailyHours: item.dailyHours,
      date: item.date,
      label: `${day} ${index % 3 === 0 || item.isToday ? month : ''}`.trim(),
      isToday: item.isToday,
    };
  });
});

const activePoint = computed(() => {
  if (activePointIndex.value === null || !points.value.length) return null;
  return points.value[activePointIndex.value] || null;
});

// Format date nicely: "15 May 2026"
function formatFullDate(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthName = months[parseInt(m, 10) - 1] || m;
  return `${parseInt(d, 10)} ${monthName} ${y}`;
}

// Generate SVG Line Path
const linePath = computed(() => {
  const pts = points.value;
  if (pts.length === 0) return '';
  return pts.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x},${pt.y}`, '');
});

// Generate SVG Area Path
const areaPath = computed(() => {
  const pts = points.value;
  if (pts.length === 0) return '';
  const first = pts[0];
  const last = pts[pts.length - 1];
  return `${linePath.value} L ${last.x},${baseY} L ${first.x},${baseY} Z`;
});
</script>

<style scoped lang="scss">
.chart-container {
  background-color: $color-card;
  border-radius: $radius-card;
  box-shadow: $shadow-card;
  padding: 18px 16px 14px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 12px;

  .chart-title {
    font-size: 15px;
    font-weight: 700;
    color: $color-navy;
    margin-bottom: 2px;
  }

  .chart-subtitle {
    font-size: 11px;
    color: $color-text-secondary;
  }
}

.toggle-group {
  display: flex;
  background-color: var(--color-surface-soft);
  padding: 3px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  gap: 2px;

  .toggle-btn {
    border: none;
    background: transparent;
    padding: 5px 8px;
    font-size: 11px;
    font-weight: 600;
    color: var(--color-text-secondary);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      color: var(--color-navy);
    }

    &.active {
      background-color: var(--color-card);
      color: $color-red;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
  }
}

// Tooltip Bar Above Chart
.chart-tooltip-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  background-color: var(--chart-tooltip-bg);
  border: 1px solid var(--chart-tooltip-border);
  border-radius: $radius-sm;
  padding: 8px 12px;
  margin-bottom: 12px;

  .tooltip-left {
    display: flex;
    align-items: center;
    gap: 6px;

    .tooltip-date {
      font-size: 12px;
      font-weight: 700;
      color: $color-navy;
    }

    .tooltip-today-badge {
      background-color: $color-red;
      color: #ffffff;
      font-size: 9px;
      font-weight: 700;
      padding: 1px 5px;
      border-radius: 4px;
      letter-spacing: 0.3px;
    }
  }

  .tooltip-metrics {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 12px;

    .metric-item {
      display: flex;
      align-items: center;
      gap: 4px;

      .metric-label {
        color: $color-text-secondary;
        font-size: 11px;
      }

      .metric-val {
        color: $color-navy;
        font-weight: 700;

        &.text-danger {
          color: $color-danger;
        }
      }
    }

    .metric-divider {
      width: 1px;
      height: 12px;
      background-color: var(--color-border);
    }

    .tooltip-over-limit {
      font-size: 10px;
      font-weight: 700;
      color: $color-danger;
      background-color: rgba(230, 55, 87, 0.1);
      padding: 2px 6px;
      border-radius: 4px;
    }
  }
}

.svg-wrapper {
  position: relative;
  width: 100%;

  .chart-svg {
    width: 100%;
    height: 190px;
    overflow: visible;

    @media (min-width: $bp-tablet) {
      height: 230px;
    }
  }

  .axis-label {
    font-size: 10px;
    fill: var(--chart-axis);
    font-family: $font-family-base;
    font-weight: 500;
  }
}

.x-axis-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;

  .x-label {
    font-size: 9px;
    color: $color-text-muted;
    text-align: center;
    min-width: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2px;
    border-radius: 4px;
    transition: all 0.15s ease;

    &:hover,
    &.label-active {
      color: var(--color-navy);
      font-weight: 700;
      background-color: var(--color-surface-soft);
    }

    &.label-today {
      color: $color-red;
      font-weight: 800;
    }

    .badge-today {
      font-size: 8px;
      background-color: $color-red;
      color: #ffffff;
      padding: 1px 4px;
      border-radius: 4px;
      margin-top: 1px;
    }
  }
}
</style>
