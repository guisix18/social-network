import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class FiltersPostFeedbacksDto {
  @IsString()
  postId: string;

  @IsOptional()
  @IsBoolean()
  checked?: boolean;
}
