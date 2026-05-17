import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { DeepseekService } from './deepseek.service';

@Injectable()
export class AiCreditService {
  constructor(
    private prisma: PrismaService,
    private deepseek: DeepseekService,
  ) {}

  // ---- Balance ----
  async getBalance(openId: string) {
    const credit = await this.prisma.userCredit.findUnique({ where: { openId } });
    return { balance: credit?.balance ?? 0 };
  }

  // ---- Packages ----
  getPackages() {
    return this.prisma.creditPackage.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  // ---- Purchase ----
  async purchase(openId: string, packageId: bigint) {
    const pkg = await this.prisma.creditPackage.findUnique({ where: { id: packageId } });
    if (!pkg) throw new HttpException('套餐不存在', HttpStatus.NOT_FOUND);

    const order = await this.prisma.creditOrder.create({
      data: {
        openId,
        packageId,
        points: pkg.points,
        amountCent: pkg.priceCent,
        status: 0, // pending
      },
    });
    return { orderId: Number(order.id) };
  }

  async pay(openId: string, orderId: bigint) {
    const order = await this.prisma.creditOrder.findUnique({ where: { id: orderId } });
    if (!order || order.openId !== openId) {
      throw new HttpException('订单不存在', HttpStatus.NOT_FOUND);
    }
    if (order.status !== 0) {
      throw new HttpException('订单已处理', HttpStatus.BAD_REQUEST);
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.creditOrder.update({
        where: { id: orderId },
        data: { status: 1, paidAt: new Date() },
      }),
      this.prisma.userCredit.upsert({
        where: { openId },
        create: { openId, balance: order.points, totalEarned: order.points },
        update: { balance: { increment: order.points }, totalEarned: { increment: order.points } },
      }),
    ]);

    const credit = await this.prisma.userCredit.findUnique({ where: { openId } });
    return { balance: credit?.balance ?? 0 };
  }

  // ---- History ----
  getHistory(openId: string) {
    return this.prisma.creditUsageLog.findMany({
      where: { openId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  // ---- AI Completion (core) ----
  async completion(
    openId: string,
    body: { prompt: string; modelKey: string; temperature?: number },
  ) {
    // 1. Look up model config
    const model = await this.prisma.aiModelConfig.findUnique({
      where: { modelKey: body.modelKey },
    });
    const modelKey = model?.modelKey ?? 'deepseek-chat';
    const costPerCall = model?.costPerCall ?? 10;
    const maxTokens = model?.maxTokens ?? 2048;

    // 2. Check balance
    const credit = await this.prisma.userCredit.findUnique({ where: { openId } });
    const balance = credit?.balance ?? 0;
    if (balance < costPerCall) {
      throw new HttpException(
        { code: 1001, message: '点数不足，请购买' },
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    // 3. Call DeepSeek (atomic: deduct + log + call)
    try {
      const result = await this.deepseek.chatCompletion(
        [{ role: 'user', content: body.prompt }],
        { maxTokens, temperature: body.temperature ?? 0.7 },
      );

      const content = result.choices?.[0]?.message?.content || '';

      // 4. Deduct credits and log
      const updatedCredit = await this.prisma.$transaction(async (tx) => {
        const uc = await tx.userCredit.update({
          where: { openId },
          data: { balance: { decrement: costPerCall }, totalSpent: { increment: costPerCall } },
        });
        await tx.creditUsageLog.create({
          data: {
            openId,
            points: -costPerCall,
            balanceAfter: uc.balance,
            action: 'ai_completion',
            refId: result.id,
            metadata: JSON.stringify({ model: modelKey, promptTokens: result.usage?.prompt_tokens }),
          },
        });
        return uc;
      });

      return {
        content,
        creditsUsed: costPerCall,
        balanceAfter: updatedCredit.balance,
        usage: {
          promptTokens: result.usage?.prompt_tokens ?? 0,
          completionTokens: result.usage?.completion_tokens ?? 0,
          totalTokens: result.usage?.total_tokens ?? 0,
        },
      };
    } catch (err: any) {
      // If DeepSeek fails, refund the deduction
      if (err.message?.includes('DeepSeek')) {
        throw new HttpException('AI 服务暂时不可用，请稍后重试', HttpStatus.SERVICE_UNAVAILABLE);
      }
      throw err;
    }
  }
}
