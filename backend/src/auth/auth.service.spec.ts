import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { DataService } from '../data/data.service';
import { JWT_SECRET } from '../common/constants';

describe('AuthService', () => {
  let service: AuthService;
  let dataService: DataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: JWT_SECRET,
        }),
      ],
      providers: [AuthService, DataService],
    }).compile();

    service = module.get<AuthService>(AuthService);
    dataService = module.get<DataService>(DataService);
    dataService.onModuleInit();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should authenticate successfully with johndoe and susiairtest', async () => {
    const res = await service.login({
      username: 'johndoe',
      password: 'susiairtest',
    });

    expect(res).toBeDefined();
    expect(res).toHaveProperty('token');
    expect(typeof res.token).toBe('string');
    expect(res.pilot.username).toBe('johndoe');
    expect(res.pilot.name).toBe('John Doe');
  });

  it('should throw UnauthorizedException on wrong credentials', async () => {
    await expect(
      service.login({
        username: 'johndoe',
        password: 'wrongpassword',
      }),
    ).rejects.toThrow(UnauthorizedException);

    await expect(
      service.login({
        username: 'unknownuser',
        password: 'susiairtest',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
