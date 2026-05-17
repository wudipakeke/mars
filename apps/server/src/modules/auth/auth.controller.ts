import { Controller, Get, Post, Body, Req, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import type { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** 获取飞书 OAuth 授权地址 */
  @Get('url')
  getAuthUrl(@Query('app') app?: string) {
    return {
      code: 0,
      data: { url: this.authService.getFeishuAuthUrl(app) },
      message: 'ok',
    };
  }

  /** 飞书登录回调：用 code 换 JWT */
  @Post('login')
  async login(@Body() body: { code: string; app?: string }) {
    const result = await this.authService.feishuLogin(body.code, body.app);
    return { code: 0, data: result, message: 'ok' };
  }

  /** 获取当前登录用户信息（需携带 JWT） */
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Req() req: Request) {
    return { code: 0, data: req.user, message: 'ok' };
  }
}
