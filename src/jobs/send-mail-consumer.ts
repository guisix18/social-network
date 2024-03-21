import { MailerService } from '@nestjs-modules/mailer';
import { Processor, Process } from '@nestjs/bull';
import { Inject } from '@nestjs/common';
import { Job } from 'bull';
import { UserDto } from '../user/dto/user.dto';

interface IJobBody {
  user: UserDto;
  htmlToBeSented: string;
}

@Processor('send-email-queue')
export class SendMailConsumer {
  constructor(@Inject(MailerService) private readonly mailer: MailerService) {}

  @Process('send-forget-email-job')
  async sendEmailJob(job: Job<IJobBody>) {
    const { data } = job;

    await this.mailer.sendMail({
      to: data.user.email,
      from: 'guisix16@gmail.com',
      subject: 'Reset your password - Social Project',
      html: data.htmlToBeSented,
    });

    return;
  }

  @Process('send-verify-email-job')
  async sendEmailVerifyJob(job: Job<IJobBody>) {
    const { data } = job;

    await this.mailer.sendMail({
      to: data.user.email,
      from: 'guisix16@gmail.com',
      subject: 'Account Verification - Social Project',
      html: data.htmlToBeSented,
    });

    return;
  }
}
