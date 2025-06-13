// src/otp/otp.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OtpService } from './otp.service';
import { Otp } from 'src/entities/otp.entity';
import { otpRepositoryProvider } from './otp.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Otp])],
  providers: [OtpService, otpRepositoryProvider],
  exports: [OtpService, otpRepositoryProvider],
})
export class OtpModule {}
