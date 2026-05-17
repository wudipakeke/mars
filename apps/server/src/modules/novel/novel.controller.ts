import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NovelService } from './novel.service';
import type { Request } from 'express';

interface JwtPayload {
  openId: string;
  name: string;
  avatar: string;
}

@Controller('novel')
@UseGuards(AuthGuard('jwt'))
export class NovelController {
  constructor(private readonly service: NovelService) {}

  @Get()
  findAll(@Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.service.findAll(user.openId);
  }

  @Post()
  create(
    @Req() req: Request,
    @Body() body: { title: string; genre?: string; description?: string },
  ) {
    const user = req.user as JwtPayload;
    return this.service.create(user.openId, body);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(BigInt(id));
  }

  @Put(':id')
  update(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      title?: string;
      genre?: string;
      description?: string;
      wordCount?: number;
      status?: number;
    },
  ) {
    const user = req.user as JwtPayload;
    return this.service.update(BigInt(id), user.openId, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(BigInt(id));
  }

  // Chapters
  @Get(':novelId/chapters')
  findChapters(@Param('novelId', ParseIntPipe) novelId: number) {
    return this.service.findChapters(BigInt(novelId));
  }

  @Post(':novelId/chapters')
  async createChapter(
    @Param('novelId', ParseIntPipe) novelId: number,
    @Body() body: { title: string; chapterOrder?: number },
  ) {
    // Auto-assign chapter order if not provided
    let order = body.chapterOrder ?? 0;
    if (!body.chapterOrder) {
      const chapters = await this.service.findChapters(BigInt(novelId));
      order = chapters.length + 1;
    }
    return this.service.createChapter(BigInt(novelId), {
      title: body.title,
      chapterOrder: order,
    });
  }

  @Put('chapters/:chapterId')
  updateChapter(
    @Param('chapterId', ParseIntPipe) chapterId: number,
    @Body() body: { title?: string; wordCount?: number; status?: number },
  ) {
    return this.service.updateChapter(BigInt(chapterId), body);
  }

  @Delete('chapters/:chapterId')
  removeChapter(@Param('chapterId', ParseIntPipe) chapterId: number) {
    return this.service.removeChapter(BigInt(chapterId));
  }
}
