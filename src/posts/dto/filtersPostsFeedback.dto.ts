import { IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

export class FiltersPostFeedbacksDto {
  @IsString()
  @IsUUID()
  postId: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  likeId?: string;
}
