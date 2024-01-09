import { IsString, MaxLength } from 'class-validator';

export class ReporterDto {
  @IsString()
  @MaxLength(255)
  reason: string;
}

export class ReportResDto {
  @IsString()
  id: string;

  @IsString()
  blockedUserId: string;

  @IsString()
  reporterId: string;

  createdAt: Date;
}
