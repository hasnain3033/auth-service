import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { DevelopersService } from './developers.service';
import { CreateDeveloperDto, UpdateDeveloperDto } from './dto/developer.dto';
import { Developer } from 'src/entities/developer.entity';

@Controller('developers')
export class DevelopersController {
  constructor(private readonly developersService: DevelopersService) {}

  @Post()
  create(@Body() createDto: CreateDeveloperDto): Promise<Developer> {
    return this.developersService.create(createDto);
  }

  @Get()
  findAll(): Promise<Developer[]> {
    return this.developersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<Developer> {
    return this.developersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateDto: UpdateDeveloperDto,
  ): Promise<Developer> {
    return this.developersService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.developersService.remove(id);
  }
}
