import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Session } from 'src/entities/session.entity';
import { User } from 'src/entities/user.entity';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionsRepo: Repository<Session>,
  ) {}

  /** Create a new session (called on login / OTP‐verify) */
  async createSession(
    userId: string,
    refreshToken: string,
    userAgent: string,
    ip: string,
    expiresAt: Date,
  ): Promise<Session> {
    const hash = await bcrypt.hash(refreshToken, 10);
    const user = new User();
    user.id = userId;

    const session = this.sessionsRepo.create({
      user,
      refreshTokenHash: hash,
      userAgent,
      ip,
      expiresAt,
      revoked: false,
    });
    return this.sessionsRepo.save(session);
  }

  /** List all active (≠ revoked) sessions for a user */
  async listForUser(userId: string): Promise<Partial<Session>[]> {
    return this.sessionsRepo.find({
      where: { user: { id: userId }, revoked: false },
      select: ['id', 'userAgent', 'ip', 'createdAt', 'expiresAt', 'updatedAt'],
    });
  }

  /** Revoke one session by id */
  async revokeOne(userId: string, sessionId: string) {
    const s = await this.sessionsRepo.findOne({
      where: { id: sessionId },
      relations: ['user'],
    });
    if (!s) throw new NotFoundException('Session not found');
    if (s.user.id !== userId) throw new ForbiddenException();
    s.revoked = true;
    await this.sessionsRepo.save(s);
    return { success: true };
  }

  /** Revoke (logout) all sessions for a user */
  async revokeAll(userId: string) {
    await this.sessionsRepo.update({ user: { id: userId } }, { revoked: true });
    return { success: true };
  }

  /** Verify a presented refreshToken against the stored hash & not revoked */
  async validateRefresh(
    userId: string,
    sessionId: string,
    refreshToken: string,
  ) {
    const s = await this.sessionsRepo.findOne({
      where: { id: sessionId, user: { id: userId }, revoked: false },
    });
    if (!s) return false;
    const matches = await bcrypt.compare(refreshToken, s.refreshTokenHash);
    if (!matches) return false;
    if (s.expiresAt && s.expiresAt < new Date()) return false;
    return s;
  }
}
