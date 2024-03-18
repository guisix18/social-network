import { IsJWT, IsString } from 'class-validator';

export class FilterNewPasswordDto {
  @IsString()
  @IsJWT()
  token: string;
}
