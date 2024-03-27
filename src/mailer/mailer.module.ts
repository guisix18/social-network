import { Module } from '@nestjs/common';
import { MailerServices } from './mailer.service';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'send-email-queue',
    }),
  ],
  controllers: [],
  providers: [MailerServices],
  exports: [MailerServices, BullModule],
})
export class MailerServicesModule {}
