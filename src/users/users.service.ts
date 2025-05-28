// src/users/users.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { App } from 'src/entities/app.entity';
import { Repository } from 'typeorm';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(App)
    private readonly appRepo: Repository<App>,
  ) {}

  /**
   * Create a new User linked to an existing App.
   */
  async create(dto: CreateUserDto): Promise<User> {
    const app = await this.appRepo.findOne({ where: { id: dto.appId } });
    if (!app) {
      throw new NotFoundException(`App with id ${dto.appId} not found`);
    }

    const hash = await bcrypt.hash(dto.password, 12);
    const user = this.userRepo.create({
      email: dto.email,
      phone: dto.phone,
      passwordHash: hash,
      app,
    });
    return this.userRepo.save(user);
  }

  /**
   * Retrieve all users (with their App relation).
   */
  findAll(): Promise<User[]> {
    return this.userRepo.find({ relations: ['app'] });
  }

  /**
   * Retrieve a single user by ID.
   */
  async findOne(id: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['app'],
    });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  /**
   * Update a user. Can reassign to a different App and/or change password.
   */
  async update(id: string, dto: UpdateUserDto): Promise<User> {
    // If appId is provided, load that App entity
    if (dto.appId) {
      const app = await this.appRepo.findOne({ where: { id: dto.appId } });
      if (!app) {
        throw new NotFoundException(`App with id ${dto.appId} not found`);
      }
      Object.assign(dto, { app });
      delete dto.appId;
    }

    // If a new password is provided, hash it
    if (dto.password) {
      const hash = await bcrypt.hash(dto.password, 12);
      Object.assign(dto, { passwordHash: hash });
      delete dto.password;
    }

    const user = await this.userRepo.preload({ id, ...dto });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return this.userRepo.save(user);
  }

  /**
   * Remove a user by ID.
   */
  async remove(id: string): Promise<void> {
    const result = await this.userRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    // returns void => 204 No Content
  }
}
