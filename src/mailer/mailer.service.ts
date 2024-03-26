import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { Queue } from 'bull';
import { Request } from 'express';
import { Content } from 'mailgen';
import { UserDto } from 'src/user/dto/user.dto';

const Mailgen = require('mailgen'); //Impressionante, mesmo pesquisando não consegui utilizar esse carinha de outra forma... TODO/Ou se não tiver o que fazer, assim serve

//TODO: Devo dar um jeito de fazer o email automáticamente utilizando o mesmo método sempre que for necessário
//Até porque da maneira que está agora vou sempre precisar reimplementar o mesmo método.
//Ver a necessidade ao longo do tempo.
//Não sei até onde é viável enviar "email pra tudo", tô pensando em notificar o usuário toda vez que alguém responder seu POST(ou seu COMMENT)
//O bom é que o método de urlGen vai funcionar pra N casos, ao menos a responsabilidade única eu consegui adicionar nesse em questão, devo melhorar esse service ao longo tempo.
@Injectable()
export class MailerServices {
  constructor(@InjectQueue('send-email-queue') private queue: Queue) {}

  private urlGen(request: Request): string {
    const protocol = request.protocol;
    const host = request.get('Host');
    const originalUrl = request.originalUrl;
    const fullUrl = `${protocol}://${host}${originalUrl}`;

    return fullUrl;
  }

  private createForgetEmail(user: UserDto, request: Request) {
    const mailgen = new Mailgen({
      theme: 'default',
      product: {
        name: 'Reset Password - Social Project',
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

  async sendForgetPassword(user: UserDto, request: Request): Promise<void> {
    const htmlToBeSented = this.createForgetEmail(user, request);

    await this.queue.add('send-forget-email-job', { user, htmlToBeSented });

    return;
  }

  private createVerifyAccountEmail(
    user: UserDto,
    request: Request,
    verificationId: string,
  ) {
    const mailgen = new Mailgen({
      theme: 'default',
      product: {
        name: 'Verify Account - Social Project',
        link: request.protocol + request.get('Host'),
      },
    });

    const link = this.urlGen(request) + '/verify-user';

    const emailBody: Content = {
      body: {
        name: user.name,
        intro: 'Verify your account',
        action: {
          instructions:
            'Clique no botão agora para validarmos a sua conta no nosso sistema!',
          button: {
            color: '#0099FF',
            text: 'Verificar conta',
            link: `${link}?verificationId=${verificationId}`,
          },
        },
        outro: 'Need help? Please, send me a email',
      },
    };

    const email = mailgen.generate(emailBody);

    return email;
  }

  async sendVerifyAccount(
    user: User,
    request: Request,
    verificationId: string,
  ): Promise<void> {
    const htmlToBeSented = this.createVerifyAccountEmail(
      user,
      request,
      verificationId,
    );

    await this.queue.add('send-verify-email-job', { user, htmlToBeSented });

    return;
  }
}
