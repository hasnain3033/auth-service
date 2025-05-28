import { Module } from '@nestjs/common';
import { DevelopersService } from './developers.service';
import { DevelopersController } from './developers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Developer } from '../entities/developer.entity';
import { App } from '../entities/app.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Developer, App])], // Add entities here if needed
  providers: [DevelopersService],
  controllers: [DevelopersController],
  exports: [DevelopersService],
})
export class DevelopersModule {}
