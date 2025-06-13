import { Module } from '@nestjs/common';
import { AppsService } from './apps.service';
import { AppsController } from './apps.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { App } from '../entities/app.entity';
import { Developer } from '../entities/developer.entity';
import { appRepositoryProvider } from './app.repository';

@Module({
  imports: [TypeOrmModule.forFeature([App, Developer])],
  providers: [AppsService, appRepositoryProvider],
  controllers: [AppsController],
  exports: [AppsService, appRepositoryProvider],
})
export class AppsModule {}
