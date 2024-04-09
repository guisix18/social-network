import { IsOptional, IsString, IsUUID } from 'class-validator';

export class FiltersPostDto {
  @IsString()
  @IsUUID()
  postId: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  likeId?: string;
}
