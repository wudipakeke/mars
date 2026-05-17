import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Controller('credit-admin')
export class CreditAdminController {
  constructor(private prisma: PrismaService) {}

  // ---- Packages ----
  @Get('packages')
  listPackages() {
    return this.prisma.creditPackage.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  @Post('packages')
  createPackage(
    @Body()
    body: {
      name: string;
      points: number;
      priceCent: number;
      description?: string;
    },
  ) {
    return this.prisma.creditPackage.create({ data: body });
  }

  @Put('packages/:id')
  updatePackage(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      name?: string;
      points?: number;
      priceCent?: number;
      description?: string;
      isActive?: boolean;
      sortOrder?: number;
    },
  ) {
    return this.prisma.creditPackage.update({
      where: { id: BigInt(id) },
      data: body,
    });
  }

  @Delete('packages/:id')
  deletePackage(@Param('id', ParseIntPipe) id: number) {
    return this.prisma.creditPackage.delete({ where: { id: BigInt(id) } });
  }

  // ---- Orders ----
  @Get('orders')
  listOrders() {
    return this.prisma.creditOrder.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  @Post('orders/:id/confirm')
  async confirmOrder(@Param('id', ParseIntPipe) id: number) {
    const order = await this.prisma.creditOrder.findUnique({
      where: { id: BigInt(id) },
    });
    if (!order) throw new Error('订单不存在');

    await this.prisma.$transaction([
      this.prisma.creditOrder.update({
        where: { id: BigInt(id) },
        data: { status: 1, paidAt: new Date() },
      }),
      this.prisma.userCredit.upsert({
        where: { openId: order.openId },
        create: {
          openId: order.openId,
          balance: order.points,
          totalEarned: order.points,
        },
        update: {
          balance: { increment: order.points },
          totalEarned: { increment: order.points },
        },
      }),
    ]);
    return { success: true };
  }

  @Post('orders/:id/refund')
  async refundOrder(@Param('id', ParseIntPipe) id: number) {
    const order = await this.prisma.creditOrder.findUnique({
      where: { id: BigInt(id) },
    });
    if (!order || order.status !== 1) throw new Error('订单不存在或未支付');

    await this.prisma.$transaction([
      this.prisma.creditOrder.update({
        where: { id: BigInt(id) },
        data: { status: 3 },
      }),
      this.prisma.userCredit.update({
        where: { openId: order.openId },
        data: {
          balance: { decrement: order.points },
          totalEarned: { decrement: order.points },
        },
      }),
    ]);
    return { success: true };
  }

  // ---- Logs ----
  @Get('logs')
  listLogs() {
    return this.prisma.creditUsageLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
  }
}
