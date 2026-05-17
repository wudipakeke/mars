import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma.module';
import { BusinessModule } from './modules/business/business.module';
import { CronConfigModule } from './modules/cron-config/cron-config.module';
import { AuthModule } from './modules/auth/auth.module';
import { NovelModule } from './modules/novel/novel.module';
import { AiCreditModule } from './modules/ai-credit/ai-credit.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    PrismaModule,
    BusinessModule,
    CronConfigModule,
    AuthModule,
    NovelModule,
    AiCreditModule,
  ],
})
export class AppModule {}
