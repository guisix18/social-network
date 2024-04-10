import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgetPasswordDto {
  @ApiPropertyOptional({
    example: 'johndoe@mail.com',
    description:
      'É necessário fornecer um email para solicitar uma nova senha, será enviado um email ao remetente',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
