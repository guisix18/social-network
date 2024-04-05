import { ApiProperty } from '@nestjs/swagger';
import { IsJWT, IsString } from 'class-validator';

export class FilterNewPasswordDto {
  @ApiProperty({
    example: 'ey...TOKEN',
    description:
      'É necessário o token enviado por email para conseguir prosseguir para criação de nova senha',
  })
  @IsString()
  @IsJWT()
  token: string;
}
