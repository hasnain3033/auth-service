import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignupDeveloperDto } from './dto/signup-developer.dto';
import { DevelopersService } from 'src/developers/developers.service';
import { LoginDeveloperDto } from './dto/login-developer.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { MailService } from 'src/mail/mail.service';
import { OtpService } from 'src/otp/otp.service';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';

@Injectable()
export class DevelopersAuthService {
  constructor(
    private readonly developersService: DevelopersService, // inject CRUD service
    private jwtService: JwtService, // access-token JWT
    private refreshJwtService: JwtService, // refresh-token JWT (injected via module alias)
    private readonly config: ConfigService,
    private readonly mailService: MailService,
    private readonly otpService: OtpService,
  ) {}

  /**
   * Request an email OTP for a developer.
   * Calls OtpService to generate and store a code, then emails it.
   */
  async requestOtp(email: string): Promise<void> {
    const dev = await this.developersService.findByEmail(email);
    if (!dev) {
      throw new NotFoundException('Developer not found');
    }

    const rawCode = await this.otpService.generateOtp(
      dev.id,
      'developer',
      'email_otp',
      email,
    );

    // Send the rawCode via email
    await this.mailService.sendOtpEmail(email, rawCode);
  }

  /**
   * Verify submitted OTP, issue JWTs if valid.
   */
  async verifyOtp(
    email: string,
    plainOtp: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const dev = await this.developersService.findByEmail(email);
    if (!dev) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await this.otpService.verifyOtp(
      dev.id,
      'developer',
      'email_otp',
      plainOtp,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    await this.developersService.markVerified(dev.id);

    // Issue access + refresh tokens as before
    const payload = {
      sub: dev.id,
      email: dev.email,
      role: 'developer' as const,
    };
    const accessToken = this.jwtService.sign(payload);

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRATION'),
    });

    await this.developersService.setCurrentHashedRefreshToken(
      dev.id,
      refreshToken,
    );

    return { accessToken, refreshToken };
  }

  async signup(dto: SignupDeveloperDto) {
    // Delegate to your existing create logic (which handles hashing, conflicts, etc.)
    const dev = await this.developersService.create(dto);

    // Return the created developer (or some subset)
    return dev;
  }

  async login(
    dto: LoginDeveloperDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const dev = await this.developersService.findByEmail(dto.email);
    if (!dev) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const valid = await bcrypt.compare(dto.password, dev.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = {
      sub: dev.id,
      email: dev.email,
      role: 'developer' as const,
    };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.refreshJwtService.sign(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRATION'),
    });

    // store a hashed copy of the   token on the developer record
    await this.developersService.setCurrentHashedRefreshToken(
      dev.id,
      refreshToken,
    );

    return { accessToken, refreshToken };
  }

  async logout(devId: string) {
    // clear the saved hash → revokes the token
    await this.developersService.setCurrentHashedRefreshToken(devId, null);
  }

  generateAccessToken(user: { id: string; email: string; role: string }) {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const dev = await this.developersService.findByEmail(dto.email);
    if (!dev) throw new NotFoundException('Developer not found');

    // 1) generate & save OTP (you may already have a generateOtp(email) method)
    const code = await this.otpService.generateOtp(
      dev.id,
      'developer',
      'email_otp',
      dto.email,
    );

    // 2) send OTP via email
    await this.mailService.sendOtpEmail(dto.email, code);

    return { message: 'OTP sent to your email address' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const dev = await this.developersService.findByEmail(dto.email);
    if (!dev) {
      throw new NotFoundException('Developer not found');
    }

    const isValid = await this.otpService.verifyOtp(
      dev.id,
      'developer',
      'email_otp',
      dto.code,
    );

    if (!isValid) {
      throw new BadRequestException('Invalid or expired code');
    }

    await this.developersService.update(dev.id, {
      password: dto.newPassword,
    });

    return { message: 'Password has been reset successfully' };
  }
}
