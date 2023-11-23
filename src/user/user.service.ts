import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto, UserDto } from './dto/user.dto';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { select } from 'src/utils/user/select.user';

@Injectable()
export class UserServices {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(dto: UserDto): Promise<UserDto> {
    const data: Prisma.UserCreateInput = {
      id: randomUUID(),
      name: dto.name,
      email: dto.email,
      password: bcrypt.hashSync(dto.password, 8),
      createdAt: new Date(),
    };

    const user = await this.prisma.user.create({
      data,
      select,
    });

    return user;
  }

  async listUsers(): Promise<UserDto[]> {
    const users = await this.prisma.user.findMany({
      select,
    });

    return users;
  }

  async findByEmail(email: string): Promise<UserDto> {
    return await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async updateUser(data: UpdateUserDto, userId: string): Promise<UserDto> {
    const userUpdated = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...data,
        password: data.password && bcrypt.hashSync(data.password, 8),
        updatedAt: new Date(),
      },
      select,
    });

    return userUpdated;
  }

  //FAZER DESATIVAÇÃO E REATIVAÇÃO DO USUÁRIO
}
