import { UserRows } from 'src/user/dto/userRows.dto';
import { UserRepository } from '../user/user.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { select } from '../../utils/user/select.user';
import { Injectable } from '@nestjs/common';
import { UpdateUserDto, UserDto } from 'src/user/dto/user.dto';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { RedisUserRepository } from '../cache/redis-user-cache.repository';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisUserRepository,
  ) {}
  async listUsers(): Promise<UserRows> {
    const cachedUsers = await this.redis.get('users');

    if (cachedUsers) return JSON.parse(cachedUsers);

    const users = await this.prisma.user.findMany({
      select,
    });

    await this.redis.set('users', JSON.stringify(users), 'EX', 20);

    return {
      rows: users,
    };
  }

  async createUser(dto: UserDto) {
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
}
