import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { UsersAuthController } from './users-auth.controller';
import { UsersAuthService } from './users-auth.service';
import { MailModule } from 'src/mail/mail.module';
import { OtpModule } from 'src/otp/otp.module';
import { SessionsModule } from './sessions/sessions.module';

@Module({
  imports: [
    UsersModule,
    SessionsModule,
    MailModule, // ← so that MailService can be injected
    OtpModule,
  ],
  controllers: [UsersAuthController],
  providers: [UsersAuthService],
})
export class UsersAuthModule {}
