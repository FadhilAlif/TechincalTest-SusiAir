import { Injectable } from '@nestjs/common';
import { DataService, ScheduleItem } from '../data/data.service';
import { BASE_TODAY } from '../common/constants';

@Injectable()
export class SchedulesService {
  constructor(private readonly dataService: DataService) {}

  getSchedules(year: string, month: string) {
    const data = this.dataService.getSchedulesData();
    const legend = data?.legend || [];
    const allSchedules = data?.schedules || [];

    const formattedMonth = month.padStart(2, '0');
    const monthPrefix = `${year}-${formattedMonth}`;

    const monthSchedules = allSchedules
      .filter((s) => s.duty_date.startsWith(monthPrefix))
      .map((s) => ({
        ...s,
        isCompleted: s.count_logbooks === s.count_schedules,
        remainingDuties: Math.max(0, s.count_schedules - s.count_logbooks),
        isToday: s.duty_date === BASE_TODAY,
      }));

    return {
      today: BASE_TODAY,
      year: parseInt(year, 10),
      month: parseInt(formattedMonth, 10),
      legend,
      schedules: monthSchedules,
    };
  }
}
