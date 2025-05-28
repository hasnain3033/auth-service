import { Module } from '@nestjs/common';
import { AppsService } from './apps.service';
import { AppsController } from './apps.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { App } from '../entities/app.entity';
import { Developer } from '../entities/developer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([App, Developer])],
  providers: [AppsService],
  controllers: [AppsController],
  exports: [AppsService],
})
export class AppsModule {}
