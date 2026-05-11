import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { CronConfigService } from './cron-config.service';

@Controller('cron-config')
export class CronConfigController {
  constructor(private readonly service: CronConfigService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(
    @Body()
    body: {
      name: string;
      cronExpr: string;
      taskType: string;
      taskParams?: string;
    },
  ) {
    return this.service.create(body);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      name?: string;
      cronExpr?: string;
      taskType?: string;
      taskParams?: string;
      status?: number;
    },
  ) {
    return this.service.update(BigInt(id), body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(BigInt(id));
  }

  @Get(':id/logs')
  findLogs(@Param('id', ParseIntPipe) id: number, @Query('env') env?: string) {
    return this.service.findLogs(BigInt(id), env);
  }

  @Post(':id/execute')
  async execute(@Param('id', ParseIntPipe) id: number) {
    return this.service.triggerExecute(id);
  }
}
