import { Transform, TransformFnParams } from 'class-transformer';
import { IsBIC, IsBoolean, IsOptional, IsString } from 'class-validator';

export class FiltersPostFeedbacksDto {
  @IsString()
  postId: string;

  @IsOptional()
  @IsBoolean()
  @Transform((params: TransformFnParams) =>
    params.value === 'true' ? true : false,
  )
  checked?: boolean;
}
