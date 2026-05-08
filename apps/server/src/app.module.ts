import { Module } from '@nestjs/common';
import { PrismaModule } from './common/prisma.module';
import { BusinessModule } from './modules/business/business.module';
import { CronConfigModule } from './modules/cron-config/cron-config.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [PrismaModule, BusinessModule, CronConfigModule, AuthModule],
})
export class AppModule {}
