import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class NovelService {
  constructor(private prisma: PrismaService) {}

  findAll(openId: string) {
    return this.prisma.novel.findMany({
      where: { openId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  findOne(id: bigint) {
    return this.prisma.novel.findUnique({
      where: { id },
      include: { chapters: { orderBy: { chapterOrder: 'asc' } } },
    });
  }

  create(openId: string, data: { title: string; genre?: string; description?: string }) {
    return this.prisma.novel.create({
      data: { openId, ...data },
    });
  }

  update(id: bigint, openId: string, data: { title?: string; genre?: string; description?: string; wordCount?: number; status?: number }) {
    return this.prisma.novel.update({
      where: { id },
      data,
    });
  }

  remove(id: bigint) {
    return this.prisma.novel.delete({ where: { id } });
  }

  // Chapters
  findChapters(novelId: bigint) {
    return this.prisma.novelChapter.findMany({
      where: { novelId },
      orderBy: { chapterOrder: 'asc' },
    });
  }

  createChapter(novelId: bigint, data: { title: string; chapterOrder: number }) {
    return this.prisma.novelChapter.create({
      data: { novelId, ...data },
    });
  }

  updateChapter(id: bigint, data: { title?: string; wordCount?: number; status?: number }) {
    return this.prisma.novelChapter.update({ where: { id }, data });
  }

  removeChapter(id: bigint) {
    return this.prisma.novelChapter.delete({ where: { id } });
  }
}
