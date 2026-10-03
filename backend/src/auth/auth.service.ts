import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { DataService } from '../data/data.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private dataService: DataService,
  ) {}

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    // Hardcoded pilot credentials requirement: johndoe / susiairtest
    if (username !== 'johndoe' || password !== 'susiairtest') {
      throw new UnauthorizedException('Invalid username or password');
    }

    const flightHoursData = this.dataService.getFlightHoursData();
    const pilotName = flightHoursData?.pilot?.name || 'John Doe';

    const payload = {
      sub: 'pilot-001',
      username: 'johndoe',
      name: pilotName,
    };

    const token = this.jwtService.sign(payload);

    return {
      token,
      pilot: {
        username: 'johndoe',
        name: pilotName,
      },
    };
  }
}
