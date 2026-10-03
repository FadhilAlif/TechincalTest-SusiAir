import { Test, TestingModule } from '@nestjs/testing';
import { SchedulesService } from './schedules.service';
import { DataService } from '../data/data.service';

describe('SchedulesService', () => {
  let service: SchedulesService;
  let dataService: DataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SchedulesService, DataService],
    }).compile();

    service = module.get<SchedulesService>(SchedulesService);
    dataService = module.get<DataService>(DataService);
    dataService.onModuleInit();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should filter schedules for May 2026', () => {
    const res = service.getSchedules('2026', '05');
    expect(res.year).toBe(2026);
    expect(res.month).toBe(5);
    expect(res.schedules.length).toBeGreaterThan(0);

    for (const schedule of res.schedules) {
      expect(schedule.duty_date.startsWith('2026-05')).toBe(true);
      expect(schedule).toHaveProperty('base_color');
      expect(schedule).toHaveProperty('isCompleted');
      expect(schedule).toHaveProperty('remainingDuties');
      expect(schedule.isCompleted).toBe(schedule.count_logbooks === schedule.count_schedules);
    }
  });

  it('should return duty legend with colors and labels', () => {
    const res = service.getSchedules('2026', '05');
    expect(res.legend).toBeDefined();
    expect(res.legend.length).toBeGreaterThan(0);
    expect(res.legend[0]).toHaveProperty('code');
    expect(res.legend[0]).toHaveProperty('label');
    expect(res.legend[0]).toHaveProperty('color');
  });
});
