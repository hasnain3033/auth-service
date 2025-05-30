import { Request as ExpressRequest } from 'express';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt, StrategyOptionsWithRequest } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './jwt.strategy';
import { DevelopersService } from 'src/developers/developers.service';
import * as bcrypt from 'bcrypt';

interface RequestWithCookies extends ExpressRequest {
  // we know cookie-parser has populated this
  cookies: Record<string, string | undefined>;
}

function cookieExtractor(req: unknown): string | null {
  const maybe = req as { cookies?: unknown };
  if (maybe.cookies && typeof maybe.cookies === 'object') {
    const cookies = maybe.cookies as Record<string, unknown>;
    const token = cookies['refresh_token'];
    return typeof token === 'string' ? token : null;
  }
  return null;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    config: ConfigService,
    private readonly devService: DevelopersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      secretOrKey: config.get<string>('JWT_REFRESH_SECRET')!,
      passReqToCallback: true,
    } as StrategyOptionsWithRequest);
  }

  // annotate return type so it isn’t seen as `any`
  async validate(
    req: RequestWithCookies & { cookies: Record<string, string> },
    payload: JwtPayload,
  ): Promise<{ id: string; email: string; role: string }> {
    // ← pull from the cast cookies
    const refreshToken = req.cookies['refresh_token'];
    if (!payload.sub || !refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const dev = await this.devService.findOne(payload.sub);
    if (!dev.currentHashedRefreshToken) {
      throw new UnauthorizedException('Refresh token revoked');
    }

    // bcrypt.compare expects (string|Buffer, string)
    const isValid = await bcrypt.compare(
      refreshToken,
      dev.currentHashedRefreshToken,
    );
    if (!isValid) {
      throw new UnauthorizedException('Refresh token revoked');
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
