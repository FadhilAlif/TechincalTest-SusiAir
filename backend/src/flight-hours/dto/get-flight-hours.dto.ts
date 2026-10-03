import { IsNotEmpty, IsISO8601 } from 'class-validator';

export class GetFlightHoursDto {
  @IsNotEmpty({ message: 'from date is required' })
  @IsISO8601({}, { message: 'from date must be in YYYY-MM-DD format' })
  from: string;

  @IsNotEmpty({ message: 'to date is required' })
  @IsISO8601({}, { message: 'to date must be in YYYY-MM-DD format' })
  to: string;
}
