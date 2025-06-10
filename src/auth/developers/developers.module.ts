import { Module } from '@nestjs/common';
import { DevelopersModule } from 'src/developers/developers.module'; // <-- existing CRUD module
import { DevelopersAuthController } from './developers.controller';
import { DevelopersAuthService } from './developers.service';
import { MailModule } from 'src/mail/mail.module';
import { OtpModule } from 'src/otp/otp.module';

@Module({
  imports: [
    DevelopersModule,
    MailModule, // ← so that MailService can be injected
    OtpModule,
  ],
  providers: [DevelopersAuthService],
  controllers: [DevelopersAuthController],
  exports: [DevelopersAuthService],
})
export class DevelopersAuthModule {}
