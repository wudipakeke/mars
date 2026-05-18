import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

export interface SyncDataPayload {
  version: number;
  syncedAt: number;
  novels: any[];
  chapters: any[];
  characters: any[];
  outlines: any[];
  notes: any[];
  mapProjects: any[];
}

@Injectable()
export class SyncService {
  constructor(private prisma: PrismaService) {}

  async upload(openId: string, payload: SyncDataPayload) {
    const existing = await this.prisma.userDataSync.findUnique({
      where: { openId },
    });

    const data = {
      syncData: JSON.stringify(payload),
      syncedAt: new Date(),
    };

    if (existing) {
      return this.prisma.userDataSync.update({
        where: { openId },
        data,
      });
    }

    return this.prisma.userDataSync.create({
      data: { openId, ...data },
    });
  }

  async download(
    openId: string,
  ): Promise<{ syncedAt: Date; data: SyncDataPayload } | null> {
    const record = await this.prisma.userDataSync.findUnique({
      where: { openId },
    });
    if (!record) return null;
    return {
      syncedAt: record.syncedAt,
      data: JSON.parse(record.syncData) as SyncDataPayload,
    };
  }
}
