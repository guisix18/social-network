import { IsNotEmpty, IsString, Min, MinLength } from 'class-validator';

export class NewPasswordDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(8, {
    message: 'Password has to be equal or greater then 8 characters',
  })
  password: string;
}
