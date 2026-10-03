import { Injectable } from '@nestjs/common';
import { DataService } from '../data/data.service';
import { BASE_TODAY } from '../common/constants';
import { RangeToggle } from './dto/get-flight-hours-summary.dto';

function formatDateUTC(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseDateUTC(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function addDays(dateStr: string, days: number): string {
  const d = parseDateUTC(dateStr);
  d.setUTCDate(d.getUTCDate() + days);
  return formatDateUTC(d);
}

@Injectable()
export class FlightHoursService {
  constructor(private readonly dataService: DataService) {}

  private getHoursMap(): Map<string, number> {
    const data = this.dataService.getFlightHoursData();
    const map = new Map<string, number>();
    if (data?.flightHours) {
      for (const entry of data.flightHours) {
        map.set(entry.date, entry.hours);
      }
    }
    return map;
  }

  getFlightHours(from: string, to: string) {
    const hoursMap = this.getHoursMap();
    const result: Array<{ date: string; hours: number }> = [];

    let current = from;
    while (current <= to) {
      result.push({
        date: current,
        hours: hoursMap.get(current) ?? 0,
      });
      current = addDays(current, 1);
    }

    return result;
  }

  private calculateWindowSum(hoursMap: Map<string, number>, endDate: string, windowDays: number): number {
    let sum = 0;
    const startDate = addDays(endDate, -(windowDays - 1));
    let curr = startDate;
    while (curr <= endDate) {
      sum += hoursMap.get(curr) ?? 0;
      curr = addDays(curr, 1);
    }
    return Math.round(sum * 10) / 10;
  }

  getLimitCards(hoursMap: Map<string, number>) {
    const dailyHours = hoursMap.get(BASE_TODAY) ?? 0;
    const weeklyHours = this.calculateWindowSum(hoursMap, BASE_TODAY, 7);
    const monthlyHours = this.calculateWindowSum(hoursMap, BASE_TODAY, 30);
    const annualHours = this.calculateWindowSum(hoursMap, BASE_TODAY, 365);

    return [
      {
        id: 'daily',
        label: 'Daily',
        limit: 8,
        currentHours: dailyHours,
        window: 'Today only',
        percentage: Math.min(100, Math.round((dailyHours / 8) * 100)),
        isOverLimit: dailyHours > 8,
      },
      {
        id: 'weekly',
        label: 'Weekly',
        limit: 40,
        currentHours: weeklyHours,
        window: 'Rolling 7 days',
        percentage: Math.min(100, Math.round((weeklyHours / 40) * 100)),
        isOverLimit: weeklyHours > 40,
      },
      {
        id: 'monthly',
        label: 'Monthly',
        limit: 100,
        currentHours: monthlyHours,
        window: 'Rolling 30 days',
        percentage: Math.min(100, Math.round((monthlyHours / 100) * 100)),
        isOverLimit: monthlyHours > 100,
      },
      {
        id: 'annual',
        label: 'Annual',
        limit: 1050,
        currentHours: annualHours,
        window: 'Rolling 365 days',
        percentage: Math.min(100, Math.round((annualHours / 1050) * 100)),
        isOverLimit: annualHours > 1050,
      },
    ];
  }

  // this is a rolling sum calculation :)
  rollingWindowBluffing(range: RangeToggle = '1w') {
    const hoursMap = this.getHoursMap();
    const configMap: Record<RangeToggle, { windowDays: number; limit: number; max: number }> = {
      '1w': { windowDays: 7, limit: 40, max: 45 },
      '1m': { windowDays: 30, limit: 100, max: 125 },
      '3m': { windowDays: 90, limit: 300, max: 325 },
      '6m': { windowDays: 180, limit: 600, max: 625 },
      '1y': { windowDays: 365, limit: 1050, max: 1200 },
    };

    const config = configMap[range] || configMap['1w'];
    const cards = this.getLimitCards(hoursMap);

    // X-axis: 7 days before today, today (centered), 7 days after today
    // 15 days total: from BASE_TODAY - 7 to BASE_TODAY + 7
    const startDate = addDays(BASE_TODAY, -7);
    const endDate = addDays(BASE_TODAY, 7);

    const series: Array<{
      date: string;
      rollingHours: number;
      dailyHours: number;
      isToday: boolean;
    }> = [];

    let curr = startDate;
    while (curr <= endDate) {
      const rollingHours = this.calculateWindowSum(hoursMap, curr, config.windowDays);
      const dailyHours = hoursMap.get(curr) ?? 0;

      series.push({
        date: curr,
        rollingHours,
        dailyHours,
        isToday: curr === BASE_TODAY,
      });

      curr = addDays(curr, 1);
    }

    return {
      today: BASE_TODAY,
      range,
      limit: config.limit,
      max: config.max,
      windowDays: config.windowDays,
      cards,
      series,
    };
  }
}
