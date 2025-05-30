import { Module } from '@nestjs/common';
import { DevelopersModule } from 'src/developers/developers.module'; // <-- existing CRUD module
import { DevelopersAuthController } from './developers.controller';
import { DevelopersAuthService } from './developers.service';

@Module({
  imports: [DevelopersModule],
  providers: [DevelopersAuthService],
  controllers: [DevelopersAuthController],
  exports: [DevelopersAuthService],
})
export class DevelopersAuthModule {}
