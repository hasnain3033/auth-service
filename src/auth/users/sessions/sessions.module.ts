import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from 'src/entities/session.entity';
import { User } from 'src/entities/user.entity';
import { SessionsService } from './sessions.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { SessionsController } from './sessions.controller';
import { sessionRepositoryProvider } from './sessions.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Session, User])],
  providers: [SessionsService, JwtAuthGuard, sessionRepositoryProvider],
  controllers: [SessionsController],
  exports: [SessionsService, sessionRepositoryProvider],
})
export class SessionsModule {}
