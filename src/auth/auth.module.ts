import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';

import { UsersModule } from './users/users.module';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { DevelopersModule } from '../developers/developers.module'; // <-- add this import
import { DevelopersAuthModule } from './developers/developers.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService): JwtModuleOptions => ({
        secret: cfg.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: cfg.get<string>('JWT_EXPIRATION'),
        },
      }),
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      // note: give this a distinct `module` name or alias in providers
      useFactory: (cfg: ConfigService): JwtModuleOptions => ({
        secret: cfg.get('JWT_REFRESH_SECRET'),
        signOptions: { expiresIn: cfg.get('JWT_REFRESH_EXPIRATION') },
      }),
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    UsersModule,
    DevelopersModule,
    DevelopersAuthModule,
  ],
  providers: [JwtStrategy, JwtRefreshStrategy],
  exports: [JwtModule, PassportModule, JwtStrategy, JwtRefreshStrategy],
})
export class AuthModule {}
