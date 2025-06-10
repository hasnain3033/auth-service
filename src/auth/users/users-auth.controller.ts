import { Response, Request } from 'express';
import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { UsersAuthService } from './users-auth.service';
import { User } from 'src/entities/user.entity';
import { RequestOtpDto } from '../dto/request-otp.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SignupUserDto } from './dto/signup-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtRefreshGuard } from '../guards/jwt-refresh.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('Users Authentication')
@Controller('users')
export class UsersAuthController {
  constructor(private readonly authService: UsersAuthService) {}

  @Post('request-otp')
  async requestOtp(@Body() dto: RequestOtpDto): Promise<{ message: string }> {
    await this.authService.requestOtp(dto.email);
    return { message: 'OTP sent to your email' };
  }

  @Post('verify-otp')
  async verifyOtp(
    @Body() dto: VerifyOtpDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ access_token: string }> {
    const { accessToken, refreshToken } = await this.authService.verifyOtp(
      dto.email,
      dto.otp,
    );
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    return { access_token: accessToken };
  }

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully.',
    type: User,
  })
  async signup(
    @Body() dto: SignupUserDto,
  ): Promise<Omit<User, 'passwordHash'>> {
    return this.authService.signup(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'User login to receive JWT' })
  @ApiResponse({
    status: 200,
    description: 'JWT access token',
    schema: { example: { access_token: 'token' } },
  })
  async login(
    @Body() dto: LoginUserDto,
    @Res({ passthrough: true })
    res: Response,
  ): Promise<{ access_token: string }> {
    const { accessToken, refreshToken } = await this.authService.login(dto);
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7, // match your JWT_REFRESH_EXPIRATION
    });
    return { access_token: accessToken };
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  refresh(
    @Req() req: Request & { user: { id: string; email: string; role: string } },
  ) {
    // passport has validated & attached user
    const user = req.user as { id: string; email: string; role: string };
    const access_token = this.authService.generateAccessToken(user);
    return { access_token };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = req.user as { id: string };
    await this.authService.logout(user.id);
    res.clearCookie('refresh_token', { path: '/' });
    return { message: 'Logged out' };
  }
}
