import { IsString, MaxLength } from 'class-validator';

export class ReporterDto {
  @IsString()
  @MaxLength(255)
  reason: string;
}

export class ReportResDto {
  id: string;
  blockedUserId: string;
  reporterId: string;
  createdAt: Date;
}
