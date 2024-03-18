import { IsOptional, IsString } from 'class-validator';

export class FiltersCommentsDto {
  @IsString()
  commentId: string;

  @IsString()
  postId: string;

  @IsOptional()
  @IsString()
  parentId?: string;
}
