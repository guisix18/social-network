import { IsString } from 'class-validator';

export class FiltersCommentsDto {
  @IsString()
  commentId: string;

  @IsString()
  postId: string;
}
