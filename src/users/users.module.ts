import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { App } from '../entities/app.entity';
import { OtpModule } from 'src/otp/otp.module';
import { MailModule } from 'src/mail/mail.module';
import { Session } from 'src/entities/session.entity';
import { userRepositoryProvider } from './user.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, App, Session]),
    MailModule,
    OtpModule,
  ],
  providers: [UsersService, userRepositoryProvider],
  controllers: [UsersController],
  exports: [UsersService, userRepositoryProvider],
})
export class UsersModule {}
