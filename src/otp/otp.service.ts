import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThan } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { Otp, OtpPurpose, UserType } from 'src/entities/otp.entity';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(Otp)
    private readonly otpRepo: Repository<Otp>,
    private readonly config: ConfigService,
  ) {}

  /**
   * Generate a random 6-digit OTP, hash it, save a new Otp record, return raw code.
   *
   * @param userId    the ID of the user (developer or appUser)
   * @param userType  either 'developer' or 'appUser'
   * @param purpose   a string describing why this OTP is generated
   * @param sentTo    email or phone number where OTP will be sent
   */
  async generateOtp(
    userId: string,
    userType: UserType,
    purpose: OtpPurpose,
    sentTo?: string,
  ): Promise<string> {
    // 1. Remove any expired or used OTPs for the same user/purpose, if you wish
    await this.otpRepo.delete({
      userId,
      userType,
      purpose,
      isUsed: true,
      expiresAt: LessThanOrEqual(new Date()),
    });

    // 2. Generate random 6-digit numeric code
    const rawCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Hash the code
    const saltRounds = 10;
    const codeHash = await bcrypt.hash(rawCode, saltRounds);

    // 4. Determine expiration (e.g. 10 minutes)
    const validityMinutes = this.config.get<number>('OTP_EXPIRY_MINUTES') || 10;
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + validityMinutes);

    // 5. Create new OTP record
    const otpEntity = this.otpRepo.create({
      userId,
      userType,
      purpose,
      codeHash,
      expiresAt,
      sentTo: sentTo ?? null,
    });

    await this.otpRepo.save(otpEntity);
    return rawCode;
  }

  /**
   * Verify a submitted OTP. If valid, mark that Otp record as used and return true.
   *
   * @param userId      the user’s ID
   * @param userType    'developer' or 'appUser'
   * @param purpose     'email_otp', etc.
   * @param submittedCode  the plain OTP the user submitted
   */
  async verifyOtp(
    userId: string,
    userType: UserType,
    purpose: OtpPurpose,
    submittedCode: string,
  ): Promise<boolean> {
    // 1. Find the latest unexpired, unused OTP matching userId/userType/purpose
    const now = new Date();
    const otpRecord = await this.otpRepo.findOne({
      where: {
        userId,
        userType,
        purpose,
        isUsed: false,
        expiresAt: MoreThan(now), // only those still valid
      },
      order: { createdAt: 'DESC' },
    });

    if (!otpRecord) {
      return false;
    }

    // 2. Compare the hash
    const isMatch = await bcrypt.compare(submittedCode, otpRecord.codeHash);
    if (!isMatch) {
      return false;
    }

    // 3. Mark as used (so it cannot be reused)
    otpRecord.isUsed = true;
    await this.otpRepo.save(otpRecord);
    return true;
  }

  /**
   * Optional: clean up expired OTP records periodically
   */
  async deleteExpiredOtps(): Promise<void> {
    const now = new Date();
    await this.otpRepo.delete({ expiresAt: LessThanOrEqual(now) });
  }
}
