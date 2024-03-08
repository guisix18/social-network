import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto, UserDto } from './dto/user.dto';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { select } from 'src/utils/user/select.user';
import { UserRows } from './dto/userRows.dto';
import { Request } from 'express';
import { UserPayload } from 'src/auth/models/UserPayload';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { Content } from 'mailgen';
import { ForgetPasswordDto } from './dto/send-reset-password.dto';
import { NewPasswordDto } from './dto/new-password.dto';
import { FilterNewPasswordDto } from './dto/filter-new-password.dto';
import { USER_NOT_FOUND } from 'src/utils/user/exceptions.user';

const Mailgen = require('mailgen'); //Impressionante, mesmo pesquisando não consegui utilizar esse carinha de outra forma... TODO

@Injectable()
export class UserServices {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly mailer: MailerService,
  ) {}

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

  async listUsers(): Promise<UserRows> {
    const users = await this.prisma.user.findMany({
      select,
    });

    return {
      rows: users,
    };
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

    return userActivated.id;
  }

  private urlGen(request: Request): string {
    const protocol = request.protocol;
    const host = request.get('Host');
    const originalUrl = request.originalUrl;
    const fullUrl = `${protocol}://${host}${originalUrl}`;

    return fullUrl;
  }

  private createEmailBody(user: UserDto, request: Request) {
    const mailgen = new Mailgen({
      theme: 'default',
      product: {
        name: 'Reset Password Social Project',
        link: request.protocol + request.get('Host'),
      },
    });

    const link = this.urlGen(request).replace(
      'send-reset-password',
      'new-password',
    );

    const emailBody: Content = {
      body: {
        name: user.name,
        intro: 'Reset your password',
        action: {
          instructions:
            'Clique no botão agora para seguir o fluxo do reset de senha.',
          button: {
            color: '#0099FF',
            text: 'Esqueci minha senha',
            link: `${link}?token=${user.resetToken}`,
          },
        },
        outro: 'Need help? Please, send me a email',
      },
    };

    const email = mailgen.generate(emailBody);

    return email;
  }

  private async sendEmail(user: UserDto, request: Request): Promise<void> {
    const htmlToBeSented = this.createEmailBody(user, request);

    await this.mailer.sendMail({
      to: user.email,
      from: 'guisix16@gmail.com',
      subject: 'Reset your password',
      html: htmlToBeSented,
    });

    return;
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

    const payload: UserPayload = {
      id: user.id,
      sub: user.id,
      name: user.name,
      email: user.email,
      active: user.active,
    };

    const token = await this.jwt.signAsync(payload);

    const userWithToken = await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        resetToken: token,
      },
    });

    return await this.sendEmail(userWithToken, request);
  }

  async newPassword(
    dto: NewPasswordDto,
    filters: FilterNewPasswordDto,
  ): Promise<void> {
    let decodedToken: UserPayload | undefined = undefined;

    try {
      const verify = this.jwt.verify(filters.token);
      decodedToken = verify as UserPayload; //Fiz o uso do "as" pro verify atribuido ao decoded tenha o tipo que eu quero(podia usar o plainToInstance mas seria necessário ser uma classe)
    } catch (error) {
      throw new BadRequestException('Token invalid!');
    }

    return await this.prisma.$transaction(
      async (prismaTx: Prisma.TransactionClient) => {
        const user = await prismaTx.user.findUnique({
          where: {
            id: decodedToken.id,
            resetToken: filters.token,
          },
        });

        if (!user) throw new HttpException(USER_NOT_FOUND, 404);

        await prismaTx.user.update({
          where: {
            id: user.id,
          },
          data: {
            resetToken: null,
            password: bcrypt.hashSync(dto.password, 10),
          },
        });
      },
    );
  }
}
