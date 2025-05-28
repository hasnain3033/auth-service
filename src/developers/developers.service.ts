import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Developer } from 'src/entities/developer.entity';
import { Repository } from 'typeorm';
import { CreateDeveloperDto, UpdateDeveloperDto } from './dto/developer.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class DevelopersService {
  constructor(
    @InjectRepository(Developer)
    private devRepo: Repository<Developer>,
  ) {}

  async create(dto: CreateDeveloperDto): Promise<Developer> {
    const hash = await bcrypt.hash(dto.password, 12);
    const dev = this.devRepo.create({ email: dto.email, passwordHash: hash });
    return this.devRepo.save(dev);
  }

  findAll(): Promise<Developer[]> {
    return this.devRepo.find({ relations: ['apps'] });
  }

  async findOne(id: string): Promise<Developer> {
    const dev = await this.devRepo.findOne({
      where: { id },
      relations: ['apps'],
    });
    if (!dev) {
      throw new NotFoundException(`Developer with id ${id} not found`);
    }
    return dev;
  }

  async update(id: string, dto: UpdateDeveloperDto): Promise<Developer> {
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 12);
      delete dto.password;
    }
    const dev = await this.devRepo.preload({
      id,
      ...dto,
    });
    if (!dev) {
      throw new NotFoundException(`Developer with id ${id} not found`);
    }
    return this.devRepo.save(dev);
  }

  async remove(id: string): Promise<void> {
    const result = await this.devRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Developer with id ${id} not found`);
    }
    // void return indicates 204 No Content
  }
}
