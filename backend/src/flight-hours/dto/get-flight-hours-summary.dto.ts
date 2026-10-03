import { IsOptional, IsIn } from 'class-validator';

export type RangeToggle = '1w' | '1m' | '3m' | '6m' | '1y';

export class GetFlightHoursSummaryDto {
  @IsOptional()
  @IsIn(['1w', '1m', '3m', '6m', '1y'], {
    message: 'range must be one of: 1w, 1m, 3m, 6m, 1y',
  })
  range?: RangeToggle = '1w';
}
