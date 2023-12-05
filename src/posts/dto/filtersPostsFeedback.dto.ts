import { IsOptional, IsString } from 'class-validator';

export class FiltersPostFeedbacksDto {
  @IsString()
  postId: string;

  @IsOptional()
  @IsString()
  checked?: string;
}
