import { IsString, MaxLength } from 'class-validator';

export class ReporterDto {
  @IsString()
  @MaxLength(255)
  reason: string;

  @IsString()
  blockedUserId: string;

  @IsString()
  reporterId: string;

  createdAt: Date;
}
