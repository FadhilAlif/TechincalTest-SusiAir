import { Test, TestingModule } from '@nestjs/testing';
import { FlightHoursService } from './flight-hours.service';
import { DataService } from '../data/data.service';

describe('FlightHoursService', () => {
  let service: FlightHoursService;
  let dataService: DataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FlightHoursService, DataService],
    }).compile();

    service = module.get<FlightHoursService>(FlightHoursService);
    dataService = module.get<DataService>(DataService);
    dataService.onModuleInit();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('rollingWindowBluffing', () => {
    it('should have the exact method name rollingWindowBluffing', () => {
      expect(typeof service.rollingWindowBluffing).toBe('function');
    });

    it('should return 4 regulatory limit summary cards with correct limits', () => {
      const result = service.rollingWindowBluffing('1w');
      expect(result.cards).toHaveLength(4);

      const [daily, weekly, monthly, annual] = result.cards;
      expect(daily).toMatchObject({ id: 'daily', limit: 8, window: 'Today only' });
      expect(weekly).toMatchObject({ id: 'weekly', limit: 40, window: 'Rolling 7 days' });
      expect(monthly).toMatchObject({ id: 'monthly', limit: 100, window: 'Rolling 30 days' });
      expect(annual).toMatchObject({ id: 'annual', limit: 1050, window: 'Rolling 365 days' });

      expect(typeof daily.currentHours).toBe('number');
      expect(typeof weekly.currentHours).toBe('number');
      expect(typeof monthly.currentHours).toBe('number');
      expect(typeof annual.currentHours).toBe('number');
    });

    it('should return a 15-day series centered on 15 May 2026', () => {
      const result = service.rollingWindowBluffing('1w');
      expect(result.series).toHaveLength(15);

      // 7 days before today: 2026-05-08
      expect(result.series[0].date).toBe('2026-05-08');
      expect(result.series[0].isToday).toBe(false);

      // Today in center (index 7): 2026-05-15
      expect(result.series[7].date).toBe('2026-05-15');
      expect(result.series[7].isToday).toBe(true);

      // 7 days after today (index 14): 2026-05-22
      expect(result.series[14].date).toBe('2026-05-22');
      expect(result.series[14].isToday).toBe(false);
    });

    it('should configure correct limit and max bounds for each toggle range', () => {
      const expectedConfigs = {
        '1w': { limit: 40, max: 45, windowDays: 7 },
        '1m': { limit: 100, max: 125, windowDays: 30 },
        '3m': { limit: 300, max: 325, windowDays: 90 },
        '6m': { limit: 600, max: 625, windowDays: 180 },
        '1y': { limit: 1050, max: 1200, windowDays: 365 },
      };

      for (const [range, cfg] of Object.entries(expectedConfigs)) {
        const result = service.rollingWindowBluffing(range as any);
        expect(result.range).toBe(range);
        expect(result.limit).toBe(cfg.limit);
        expect(result.max).toBe(cfg.max);
        expect(result.windowDays).toBe(cfg.windowDays);
      }
    });

    it('should handle zero flight hour days without skipping dates', () => {
      const result = service.rollingWindowBluffing('1w');
      for (const entry of result.series) {
        expect(entry).toHaveProperty('date');
        expect(entry).toHaveProperty('rollingHours');
        expect(entry).toHaveProperty('dailyHours');
        expect(typeof entry.rollingHours).toBe('number');
        expect(typeof entry.dailyHours).toBe('number');
      }
    });
  });

  describe('getFlightHours', () => {
    it('should return continuous daily flight hours between from and to', () => {
      const hours = service.getFlightHours('2026-05-10', '2026-05-15');
      expect(hours).toHaveLength(6);
      expect(hours[0].date).toBe('2026-05-10');
      expect(hours[5].date).toBe('2026-05-15');
    });
  });
});
