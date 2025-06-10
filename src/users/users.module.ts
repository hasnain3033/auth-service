import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { App } from '../entities/app.entity';
import { OtpModule } from 'src/otp/otp.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, App]), MailModule, OtpModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
