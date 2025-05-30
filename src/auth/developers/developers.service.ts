import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignupDeveloperDto } from './dto/signup-developer.dto';
import { DevelopersService } from 'src/developers/developers.service';
import { LoginDeveloperDto } from './dto/login-developer.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DevelopersAuthService {
  constructor(
    private readonly developersService: DevelopersService, // inject CRUD service
    private jwtService: JwtService, // access-token JWT
    private refreshJwtService: JwtService, // refresh-token JWT (injected via module alias)
    private readonly config: ConfigService,
  ) {}

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
}
