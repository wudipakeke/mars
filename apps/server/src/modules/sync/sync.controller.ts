import {
  Controller,
  Post,
  Get,
  Req,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SyncService } from './sync.service';
import type { Request } from 'express';

interface JwtPayload {
  openId: string;
  name: string;
  avatar: string;
}

@Controller('sync')
@UseGuards(AuthGuard('jwt'))
export class SyncController {
  constructor(private readonly service: SyncService) {}

  @Post('upload')
  async upload(@Req() req: Request, @Body() body: { data: any }) {
    const user = req.user as JwtPayload;
    await this.service.upload(user.openId, body.data);
    return { code: 0, data: null, message: 'ok' };
  }

  @Get('download')
  async download(@Req() req: Request) {
    const user = req.user as JwtPayload;
    const result = await this.service.download(user.openId);
    return { code: 0, data: result, message: 'ok' };
  }
}
