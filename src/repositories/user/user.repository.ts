import { Request } from 'express';
import { UpdateUserDto, UserDto } from '../../user/dto/user.dto';
import { UserRows } from '../../user/dto/userRows.dto';
import { User } from '@prisma/client';

export abstract class UserRepository {
  abstract listUsers(): Promise<UserRows>;
  abstract createUser(dto: UserDto, request: Request): Promise<User>;
  abstract updateUser(dto: UpdateUserDto, userId: string): Promise<UserDto>;
}
