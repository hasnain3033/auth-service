import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { v4 as uuidv4 } from 'uuid';
import { randomBytes } from 'crypto';
import { App } from '../entities/app.entity';
import { Developer } from '../entities/developer.entity';
import { CreateAppDto, UpdateAppDto } from './dto/app.dto';
import { TenantAwareRepository } from 'src/common/tenant-aware.repository';

@Injectable()
export class AppsService {
  constructor(
    private readonly appRepo: TenantAwareRepository<App>,

    @InjectRepository(Developer)
    private readonly devRepo: TenantAwareRepository<Developer>,
  ) {}

  async create(dto: CreateAppDto): Promise<App> {
    const developer = await this.devRepo.findOne({
      where: { id: dto.developerId },
    });
    if (!developer) {
      throw new NotFoundException(
        `Developer with id ${dto.developerId} not found`,
      );
    }
    const clientId = uuidv4();
    const clientSecret = randomBytes(32).toString('hex'); // 64-char secret
    const app = this.appRepo.create({
      name: dto.name,
      clientId,
      clientSecret,
      redirectUris: dto.redirectUris,
      developer,
    });
    return this.appRepo.save(app);
  }

  findAll(): Promise<App[]> {
    return this.appRepo.find({ relations: ['developer', 'users'] });
  }

  async findOne(id: string): Promise<App> {
    const app = await this.appRepo.findOne({
      where: { id },
      relations: ['developer', 'users'],
    });
    if (!app) {
      throw new NotFoundException(`App with id ${id} not found`);
    }
    return app;
  }

  async update(id: string, dto: UpdateAppDto): Promise<App> {
    // Destructure out developerId so we can handle it separately
    const { developerId, ...rest } = dto;

    // If a new developerId was provided, validate it
    let developer: Developer | undefined;
    if (developerId) {
      const devEntity = await this.devRepo.findOne({
        where: { id: developerId },
      });
      if (!devEntity) {
        throw new NotFoundException(
          `Developer with id ${developerId} not found`,
        );
      }
      developer = devEntity;
    }

    // Build a fresh preload object (no in-place dto mutation)
    const preloadData: Partial<App> = { id, ...rest };
    if (developer) {
      preloadData.developer = developer;
    }

    const app = await this.appRepo.preload(preloadData);
    if (!app) {
      throw new NotFoundException(`App with id ${id} not found`);
    }
    return this.appRepo.save(app);
  }

  async remove(id: string): Promise<void> {
    const result = await this.appRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`App with id ${id} not found`);
    }
    // void return indicates 204 No Content
  }
}
