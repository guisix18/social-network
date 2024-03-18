import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto, UserDto } from './dto/user.dto';
import { Prisma, PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { select } from 'src/utils/user/select.user';
import { UserRows } from './dto/userRows.dto';
import { Request } from 'express';
import { UserPayload } from 'src/auth/models/UserPayload';
import { JwtService } from '@nestjs/jwt';
import { ForgetPasswordDto } from './dto/send-reset-password.dto';
import { NewPasswordDto } from './dto/new-password.dto';
import { FilterNewPasswordDto } from './dto/filter-new-password.dto';
import { USER_NOT_FOUND } from '../utils/user/exceptions.user';
import { MailerServices } from '../mailer/mailer.service';
import { NO_USER_DATA_TO_VALIDATE } from '../utils/user/messages.user';

@Injectable()
export class UserServices {
  private readonly logger = new Logger(UserServices.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly mailerServices: MailerServices,
  ) {}

  async createUser(dto: UserDto, request: Request): Promise<UserDto> {
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

    this.logger.log('User created');

    const verification = await this.prisma.verifyAccount.create({
      data: {
        userVerified: {
          connect: { id: user.id },
        },
      },
    });

    await this.mailerServices.sendVerifyAccount(user, request, verification.id);

    this.logger.log('Email to verify account has been sent');

    return user;
  }

  async listUsers(): Promise<UserRows> {
    const users = await this.prisma.user.findMany({
      select,
    });

    this.logger.log('List all users');

    return {
      rows: users,
    };
  }

  async findByEmail(email: string): Promise<UserDto> {
    this.logger.log('Find by email');

    return await this.prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        verifyAccount: true,
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

    this.logger.log('User updated');

    return userUpdated;
  }

  async deactivateUser(
    userId: string,
    block: boolean = false,
  ): Promise<string> {
    const userDeactivated = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        updatedAt: new Date(),
        active: false,
        blockedAt: block && new Date(),
      },
    });

    this.logger.log('User deactivated');

    return userDeactivated.id;
  }

  async activateUser(userId: string): Promise<string> {
    const userActivated = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        blockedAt: null,
        active: true,
        updatedAt: new Date(),
      },
    });

    this.logger.log('User activated');

    return userActivated.id;
  }

  async forgetPassword(
    request: Request,
    dto: ForgetPasswordDto,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) throw new HttpException(USER_NOT_FOUND, HttpStatus.NOT_FOUND);

    const payload: UserPayload = {
      id: user.id,
      sub: user.id,
      name: user.name,
      email: user.email,
      active: user.active,
    };

    const token = await this.jwt.signAsync(payload);

    this.logger.log('Token signed');

    const userWithToken = await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        resetToken: token,
      },
    });

    this.logger.log('Sending email');
    return await this.mailerServices.sendForgetPassword(userWithToken, request);
  }

  async newPassword(
    dto: NewPasswordDto,
    filters: FilterNewPasswordDto,
  ): Promise<void> {
    let decodedToken: UserPayload | undefined = undefined;

    try {
      const verify = this.jwt.verify(filters.token);
      decodedToken = verify as UserPayload; //Fiz o uso do "as" pro verify atribuido ao decoded tenha o tipo que eu quero(podia usar o plainToInstance mas seria necessário ser uma classe, bom, isso resolve também)
    } catch (error) {
      throw new BadRequestException(error);
    }

    this.logger.log('Starting transaction to update user password');

    return await this.prisma.$transaction(
      async (prismaTx: Prisma.TransactionClient) => {
        const user = await prismaTx.user.findUnique({
          where: {
            id: decodedToken.id,
            resetToken: filters.token,
          },
        });

        if (!user) {
          throw new HttpException(USER_NOT_FOUND, HttpStatus.NOT_FOUND);
        }

        this.logger.log('Uptade user password');
        await prismaTx.user.update({
          where: {
            id: user.id,
          },
          data: {
            updatedAt: new Date(),
            resetToken: null,
            password: bcrypt.hashSync(dto.password, 10),
          },
        });
      },
    );
  }

  async verifyUserAccount(verificationId: string) {
    return await this.prisma.$transaction(
      async (prismaTsx: Prisma.TransactionClient) => {
        const verifyData = await prismaTsx.verifyAccount.findUnique({
          where: {
            id: verificationId,
          },
        });

        if (!verifyData) {
          throw new HttpException(
            NO_USER_DATA_TO_VALIDATE,
            HttpStatus.NOT_FOUND,
          );
        }

        const userToBeVerified = await prismaTsx.user.findUnique({
          where: {
            id: verifyData.userVerifiedId,
          },
        });

        if (!userToBeVerified) {
          throw new HttpException(USER_NOT_FOUND, HttpStatus.NOT_FOUND);
        }

        this.logger.log('Verifying user account');

        await prismaTsx.verifyAccount.update({
          where: {
            id: verifyData.id,
            userVerifiedId: userToBeVerified.id,
          },
          data: {
            verifiedAt: new Date(),
            verified: true,
          },
        });
      },
    );
  }
}
