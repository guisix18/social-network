import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Comments, Post, VerifyAccount } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UserDto {
  @ApiProperty({
    example: 'Famoso John Doe',
    description:
      'Nome do usuário, o banco atualmente aceita completo ou apenas o primeiro nome.',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  @MinLength(1)
  name: string;

  @ApiProperty({
    example: 'johndoe@mail.com',
    description:
      "Email precisa ser considerado válido, formatos 'inesperados' não irá funcionar",
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '12345678',
    description:
      'A senha precisa ter pelo menos 8 caracteres sendo da sua escolha o que você preferir digitar(ideal seria validação no front)',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  resetToken?: string;

  @IsOptional()
  @IsBoolean()
  @Transform((a) => (a.value === 'true' ? true : false))
  active?: boolean;

  posts?: Post[] | null;

  comments?: Comments[] | null;

  blockedAt?: Date;

  verifyAccount?: VerifyAccount | null;
}

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'John doe',
    description:
      'Se caso queira atualizar o nome, deve ser fornecido para prosseguir',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  @MinLength(1)
  name: string;

  @ApiPropertyOptional({
    example: 'johndoe@mail.com',
    description:
      'Se caso queira atualizar o email, deve ser fornecido para prosseguir',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    example: '12345678',
    description:
      'Se caso queira atualizar a senha, deve ser fornecido para prosseguir',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  password: string;
}
