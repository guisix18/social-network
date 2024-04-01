import { IsBoolean, IsDate } from 'class-validator';

export class PostsLikedsDto {
  @IsDate()
  eventAt: Date;

  @IsBoolean()
  liked: boolean;
}
