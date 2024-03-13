import { Module } from '@nestjs/common';
import { MailerServices } from './mailer.service';

@Module({
  controllers: [],
  providers: [MailerServices],
  exports: [MailerServices],
})
export class MailerServicesModule {}
