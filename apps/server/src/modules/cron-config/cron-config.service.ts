import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class CronConfigService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.cronConfig.findMany();
  }

  findOne(id: bigint) {
    return this.prisma.cronConfig.findUnique({ where: { id } });
  }

  create(data: { name: string; cronExpr: string; taskType: string; taskParams?: string }) {
    return this.prisma.cronConfig.create({ data });
  }

  update(id: bigint, data: { name?: string; cronExpr?: string; taskType?: string; taskParams?: string; status?: number }) {
    return this.prisma.cronConfig.update({ where: { id }, data });
  }

  remove(id: bigint) {
    return this.prisma.cronConfig.delete({ where: { id } });
  }

  findLogs(configId: bigint, env?: string) {
    const where: any = { configId };
    if (env) where.env = env;
    return this.prisma.cronExecutionLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async triggerExecute(configId: number) {
    const cronflowUrl = process.env.CRONFLOW_URL || 'http://localhost:4001';
    const res = await fetch(`${cronflowUrl}/trigger/${configId}`, { method: 'POST' });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`触发执行失败: ${res.status} ${text}`);
    }
    return res.json();
  }
}
