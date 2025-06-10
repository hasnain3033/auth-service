import { Module } from '@nestjs/common';
import { DevelopersService } from './developers.service';
import { DevelopersController } from './developers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Developer } from '../entities/developer.entity';
import { App } from '../entities/app.entity';
import { MailModule } from 'src/mail/mail.module';
import { OtpModule } from 'src/otp/otp.module';

@Module({
  imports: [TypeOrmModule.forFeature([Developer, App]), MailModule, OtpModule], // Add entities here if needed
  providers: [DevelopersService],
  controllers: [DevelopersController],
  exports: [DevelopersService],
})
export class DevelopersModule {}
