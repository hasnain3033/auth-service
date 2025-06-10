// src/otp/cleanup.service.ts
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OtpService } from './otp.service';

@Injectable()
export class OtpCleanupService {
  constructor(private readonly otpService: OtpService) {}

  // Runs every hour
  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    await this.otpService.deleteExpiredOtps();
  }
}
