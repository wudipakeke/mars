import { Controller, Get, Post, Param, Body, Req, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AiCreditService } from './ai-credit.service';
import type { Request } from 'express';

interface JwtPayload {
  openId: string;
  name: string;
  avatar: string;
}

@Controller('ai-credit')
@UseGuards(AuthGuard('jwt'))
export class AiCreditController {
  constructor(private readonly service: AiCreditService) {}

  @Get('packages')
  getPackages() {
    return this.service.getPackages();
  }

  @Get('balance')
  getBalance(@Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.service.getBalance(user.openId);
  }

  @Post('purchase')
  purchase(@Req() req: Request, @Body() body: { packageId: number }) {
    const user = req.user as JwtPayload;
    return this.service.purchase(user.openId, BigInt(body.packageId));
  }

  @Post('pay')
  pay(@Req() req: Request, @Body() body: { orderId: number }) {
    const user = req.user as JwtPayload;
    return this.service.pay(user.openId, BigInt(body.orderId));
  }

  @Get('history')
  getHistory(@Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.service.getHistory(user.openId);
  }

  @Post('completion')
  completion(
    @Req() req: Request,
    @Body() body: { prompt: string; modelKey: string; temperature?: number },
  ) {
    const user = req.user as JwtPayload;
    return this.service.completion(user.openId, body);
  }
}
