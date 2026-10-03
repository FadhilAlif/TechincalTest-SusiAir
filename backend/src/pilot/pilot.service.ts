import { Injectable } from '@nestjs/common';
import { DataService } from '../data/data.service';

@Injectable()
export class PilotService {
  constructor(private readonly dataService: DataService) {}

  getProfile() {
    const flightHoursData = this.dataService.getFlightHoursData();
    const pilot = flightHoursData?.pilot || { name: 'John Doe', totalFlightHours: 1444.5 };

    return {
      name: pilot.name,
      totalFlightHours: pilot.totalFlightHours,
      avatarUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=256',
    };
  }
}
