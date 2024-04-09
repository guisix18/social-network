import { Comments } from '@prisma/client';
import {
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class PostsDto {
  @IsString()
  @MaxLength(3000)
  @MinLength(1)
  content: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}
