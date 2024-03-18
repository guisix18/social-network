import { Comments } from '@prisma/client';
import {
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CommentsDto {
  @IsString()
  @MinLength(1)
  @MaxLength(3000)
  text: string;

  @IsOptional()
  @IsArray()
  children?: Comments[];
}
