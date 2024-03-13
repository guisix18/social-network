import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Content } from 'mailgen';
import { UserDto } from 'src/user/dto/user.dto';

const Mailgen = require('mailgen'); //Impressionante, mesmo pesquisando não consegui utilizar esse carinha de outra forma... TODO/Ou se não tiver o que fazer, assim serve

@Injectable()
export class MailerServices {
  constructor(private readonly mailer: MailerService) {}

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

  async sendEmail(user: UserDto, request: Request): Promise<void> {
    const htmlToBeSented = this.createEmailBody(user, request);

    await this.mailer.sendMail({
      to: user.email,
      from: 'guisix16@gmail.com',
      subject: 'Reset your password',
      html: htmlToBeSented,
    });

    return;
  }
}
