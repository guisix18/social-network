import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class NewPasswordDto {
  @ApiProperty({
    example: '12345678',
    description:
      'É necessário uma senha de 8 caracteres quando está no processo de alterar a senha',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8, {
    message: 'Password has to be equal or greater then 8 characters',
  })
  password: string;
}
