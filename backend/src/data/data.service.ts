import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface PilotProfile {
  name: string;
  totalFlightHours: number;
}

export interface FlightHoursLimits {
  daily: number;
  weekly: number;
  monthly: number;
  annual: number;
}

export interface ChartBoundConfig {
  limit: number;
  max: number;
  windowDays: number;
  displayRangeDays: number;
}

export interface FlightHourEntry {
  date: string;
  hours: number;
}

export interface FlightHoursFile {
  pilot: PilotProfile;
  limits: FlightHoursLimits;
  chartBounds: Record<string, ChartBoundConfig>;
  flightHours: FlightHourEntry[];
}

export interface DocumentThresholds {
  warningDays: number;
  comment?: string;
}

export interface PilotDocument {
  id: string;
  label: string;
  expiryDate: string;
}

export interface DocumentsFile {
  today: string;
  thresholds: DocumentThresholds;
  documents: PilotDocument[];
}

export interface LegendItem {
  code: string;
  label: string;
  color: string;
}

export interface ScheduleItem {
  id: string;
  duty_date: string;
  status: number;
  base_name: string;
  base_color: string;
  duty_type: string;
  count_schedules: number;
  count_logbooks: number;
}

export interface SchedulesFile {
  today: string;
  fieldGuide?: Record<string, string>;
  legend: LegendItem[];
  schedules: ScheduleItem[];
}

@Injectable()
export class DataService implements OnModuleInit {
  private readonly logger = new Logger(DataService.name);

  private flightHoursData: FlightHoursFile;
  private documentsData: DocumentsFile;
  private schedulesData: SchedulesFile;

  onModuleInit() {
    this.loadData();
  }

  private loadData() {
    try {
      // Look for data files in src/data or dist/src/data or data folder
      const candidatePaths = [
        path.join(__dirname, 'data'),
        path.join(__dirname, '..', 'data'),
        path.join(process.cwd(), 'src', 'data'),
        path.join(process.cwd(), 'data'),
      ];

      const findFile = (filename: string): string => {
        for (const dir of candidatePaths) {
          const fullPath = path.join(dir, filename);
          if (fs.existsSync(fullPath)) {
            return fullPath;
          }
        }
        throw new Error(`Data file ${filename} not found in any candidate path.`);
      };

      const flightHoursPath = findFile('mock-flight-hours.json');
      const documentsPath = findFile('mock-documents.json');
      const schedulesPath = findFile('mock-schedules.json');

      this.flightHoursData = JSON.parse(fs.readFileSync(flightHoursPath, 'utf8'));
      this.documentsData = JSON.parse(fs.readFileSync(documentsPath, 'utf8'));
      this.schedulesData = JSON.parse(fs.readFileSync(schedulesPath, 'utf8'));

      this.logger.log(`Mock data loaded successfully. Flight entries: ${this.flightHoursData.flightHours.length}, Documents: ${this.documentsData.documents.length}, Schedules: ${this.schedulesData.schedules.length}`);
    } catch (error) {
      this.logger.error(`Failed to load mock data: ${error.message}`, error.stack);
      throw error;
    }
  }

  getFlightHoursData(): FlightHoursFile {
    return this.flightHoursData;
  }

  getDocumentsData(): DocumentsFile {
    return this.documentsData;
  }

  getSchedulesData(): SchedulesFile {
    return this.schedulesData;
  }
}
