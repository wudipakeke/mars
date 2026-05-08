import { Module } from '@nestjs/common';
import { CronConfigController } from './cron-config.controller';
import { CronConfigService } from './cron-config.service';

@Module({
  controllers: [CronConfigController],
  providers: [CronConfigService],
})
export class CronConfigModule {}
