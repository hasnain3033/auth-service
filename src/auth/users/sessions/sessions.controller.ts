import { Request } from 'express';
import {
  Controller,
  Get,
  Delete,
  Param,
  UseGuards,
  Req,
  Logger,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

interface RequestWithUser extends Request {
  user: { sub: string };
}

@Controller('users/sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(private readonly sessions: SessionsService) {}

  /** GET /users/sessions */
  @Get()
  list(@Req() req: RequestWithUser) {
    Logger.log(`→ JWT sub: ${req.user.sub}`);
    return this.sessions.listForUser(req.user.sub);
  }

  /** DELETE /users/sessions/:id */
  @Delete(':id')
  revokeOne(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.sessions.revokeOne(req.user.sub, id);
  }

  /** DELETE /users/sessions */
  @Delete()
  revokeAll(@Req() req: RequestWithUser) {
    return this.sessions.revokeAll(req.user.sub);
  }
}
