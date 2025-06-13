import { Request } from 'express';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignupUserDto } from './dto/signup-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UsersService } from '../../users/users.service';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { MailService } from 'src/mail/mail.service';
import { OtpService } from 'src/otp/otp.service';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { SessionsService } from './sessions/sessions.service';
import { JwtPayload } from 'jsonwebtoken';

@Injectable()
export class UsersAuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService, // access-token JWT
    private refreshJwtService: JwtService, // refresh-token JWT (injected via module alias)
    private readonly sessionsService: SessionsService,
    private readonly config: ConfigService,
    private readonly mailService: MailService,
    private readonly otpService: OtpService,
  ) {}

  /**
   * Request an email OTP for a developer.
   * Calls OtpService to generate and store a code, then emails it.
   */
  async requestOtp(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('Developer not found');
    }

    const rawCode = await this.otpService.generateOtp(
      user.id,
      'appUser',
      'email_otp',
      email,
    );

    // Send the rawCode via email
    await this.mailService.sendOtpEmail(email, rawCode);
  }

  async verifyOtp(
    email: string,
    plainOtp: string,
    req: Request,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // 1) Check that user exists
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 2) Verify OTP
    const isValid = await this.otpService.verifyOtp(
      user.id,
      'appUser',
      'email_otp',
      plainOtp,
    );
    if (!isValid) {
      throw new UnauthorizedException('Invalid or expired code');
    }

    // 3) Mark user as “verified” in DB
    await this.usersService.markVerified(user.id);

    // Issue access + refresh tokens as before
    const payload = {
      sub: user.id,
      email: user.email,
      role: 'appUser' as const,
    };
    const accessToken = this.jwtService.sign(payload);

    const refreshToken = this.refreshJwtService.sign(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRATION'),
    });

    const { exp } = this.refreshJwtService.decode<JwtPayload & { exp: number }>(
      refreshToken,
    );
    const expiresAt = new Date(exp * 1000);

    const userAgent = req.get('user-agent') || 'unknown';
    const ipAddr = req.ip || '0.0.0.0';

    // create a new session row
    await this.sessionsService.createSession(
      user.id,
      refreshToken,
      userAgent,
      ipAddr,
      expiresAt,
    );

    return { accessToken, refreshToken };
  }

  async signup(signupDto: SignupUserDto) {
    // Delegate to your existing create logic (which handles hashing, conflicts, etc.)
    const user = await this.usersService.create(signupDto);

    // Return the created developer (or some subset)
    return user;
  }

  async login(
    dto: LoginUserDto,
    req: Request, // make sure your controller passes this in
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = {
      sub: user.id,
      email: user.email,
      role: 'appUser' as const,
    };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.refreshJwtService.sign(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRATION'),
    });

    const { exp } = this.refreshJwtService.decode<JwtPayload & { exp: number }>(
      refreshToken,
    );
    const expiresAt = new Date(exp * 1000);

    const userAgent = req.get('user-agent') || 'unknown';
    const ipAddr = req.ip || '0.0.0.0';

    await this.sessionsService.createSession(
      user.id,
      refreshToken,
      userAgent,
      ipAddr,
      expiresAt,
    );

    return { accessToken, refreshToken };
  }

  async logout(userId: string, sessionId: string) {
    return this.sessionsService.revokeOne(userId, sessionId);
  }

  generateAccessToken(user: { id: string; email: string; role: string }) {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const dev = await this.usersService.findByEmail(dto.email);
    if (!dev) throw new NotFoundException('User not found');

    // 1) generate & save OTP (you may already have a generateOtp(email) method)
    const code = await this.otpService.generateOtp(
      dev.id,
      'appUser',
      'email_otp',
      dto.email,
    );

    // 2) send OTP via email
    await this.mailService.sendOtpEmail(dto.email, code);

    return { message: 'OTP sent to your email address' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const dev = await this.usersService.findByEmail(dto.email);
    if (!dev) {
      throw new NotFoundException('User not found');
    }

    const isValid = await this.otpService.verifyOtp(
      dev.id,
      'appUser',
      'email_otp',
      dto.code,
    );

    if (!isValid) {
      throw new BadRequestException('Invalid or expired code');
    }

    await this.usersService.update(dev.id, {
      password: dto.newPassword,
    });

    return { message: 'Password has been reset successfully' };
  }
}
