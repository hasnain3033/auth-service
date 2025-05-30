import { Module } from '@nestjs/common';
import { DevelopersModule } from 'src/developers/developers.module'; // <-- existing CRUD module
import { DevelopersAuthController } from './developers.controller';
import { DevelopersAuthService } from './developers.service';
import { AuthModule } from '../auth.module';

@Module({
  imports: [AuthModule, DevelopersModule],
  providers: [DevelopersAuthService],
  controllers: [DevelopersAuthController],
  exports: [DevelopersAuthService],
})
export class DevelopersAuthModule {}
