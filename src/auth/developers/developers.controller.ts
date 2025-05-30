import { Response, Request } from 'express';
import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DevelopersAuthService } from './developers.service';
import { Developer } from 'src/entities/developer.entity';
import { SignupDeveloperDto } from './dto/signup-developer.dto';
import { LoginDeveloperDto } from './dto/login-developer.dto';
import { JwtRefreshGuard } from '../guards/jwt-refresh.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('Developers Authentication')
@Controller('developers')
export class DevelopersAuthController {
  constructor(private readonly authService: DevelopersAuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new developer' })
  @ApiResponse({
    status: 201,
    description: 'Developer registered successfully.',
    type: Developer,
  })
  async signup(
    @Body() dto: SignupDeveloperDto,
  ): Promise<Omit<Developer, 'passwordHash'>> {
    return this.authService.signup(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Developer login to receive JWT' })
  @ApiResponse({
    status: 200,
    description: 'JWT access token',
    schema: { example: { access_token: 'token' } },
  })
  async login(
    @Body() dto: LoginDeveloperDto,
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
