import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { App } from 'src/entities/app.entity';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { OtpService } from 'src/otp/otp.service';
import { MailService } from 'src/mail/mail.service';
import { TenantAwareRepository } from 'src/common/tenant-aware.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepo: TenantAwareRepository<User>,

    private readonly appRepo: TenantAwareRepository<App>,

    // Inject OtpService and MailService so we can generate/email OTP
    private readonly otpService: OtpService,
    private readonly mailService: MailService,
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

    const saved = await this.userRepo.save(user);

    // 3) Generate & store an OTP for email verification
    const code = await this.otpService.generateOtp(
      saved.id,
      'appUser',
      'email_otp',
      saved.email,
    );

    // 4) Send OTP email
    await this.mailService.sendOtpEmail(user.email, code);

    return saved;
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

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true, // needed for login() comparisons
        isEmailVerified: true, // so we can check before allowing login
      },
    });
  }

  async markVerified(userId: string): Promise<void> {
    await this.userRepo.update(userId, { isEmailVerified: true });
  }
}
