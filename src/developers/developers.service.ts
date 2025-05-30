import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    const exists = await this.devRepo.findOne({ where: { email: dto.email } });
    if (exists) {
      throw new ConflictException('Developer with this email already exists');
    }
    const hash = await bcrypt.hash(dto.password, 12);
    const dev = this.devRepo.create({
      email: dto.email,
      passwordHash: hash,
    });
    const saved = await this.devRepo.save(dev);
    return saved;
  }

  findAll(): Promise<Developer[]> {
    return this.devRepo.find({ relations: ['apps'] });
  }

  async findByEmail(email: string): Promise<Developer | null> {
    return this.devRepo.findOne({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true, // ← make sure the hash is loaded
      },
    });
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

  async setCurrentHashedRefreshToken(
    developerId: string,
    token: string | null,
  ): Promise<void> {
    console.log(
      `Setting refresh token for developer ${developerId}: ${token ? 'present' : 'null'}`,
    );
    if (!token) {
      // logout: clear out the stored hash
      await this.devRepo.update(developerId, {
        currentHashedRefreshToken: null,
      });
    } else {
      // login: hash & store
      const hash = await bcrypt.hash(token, 10);
      await this.devRepo.update(developerId, {
        currentHashedRefreshToken: hash,
      });
    }
  }
}
