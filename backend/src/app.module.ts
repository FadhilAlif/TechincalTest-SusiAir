import { Module } from '@nestjs/common';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { DataModule } from './data/data.module';
import { AuthModule } from './auth/auth.module';
import { PilotModule } from './pilot/pilot.module';
import { FlightHoursModule } from './flight-hours/flight-hours.module';
import { DocumentsModule } from './documents/documents.module';
import { SchedulesModule } from './schedules/schedules.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';

@Module({
  imports: [
    DataModule,
    AuthModule,
    PilotModule,
    FlightHoursModule,
    DocumentsModule,
    SchedulesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
