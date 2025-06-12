import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload {
  sub: string; // your user/developer ID
  email: string; // optionally include email
  role: 'developer' | 'appUser';
  appId?: string; // only for end-users
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly config: ConfigService) {
    const secret = config.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }
    super({
      // 1. extract the token from the Bearer header
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 2. don’t let expired tokens through
      ignoreExpiration: false,
      // 3. validate against your secret
      secretOrKey: secret,
    });
  }

  validate(payload: JwtPayload) {
    // At this point payload = the decoded JWT body.
    // You can do further checks here, e.g. fetch the record from DB to ensure it still exists,
    // or verify that `payload.appId` really belongs to this user, etc.
    if (!payload.sub || !payload.role) {
      throw new UnauthorizedException('Invalid JWT payload');
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      appId: payload.appId, // only for end-users
    };
  }
}
