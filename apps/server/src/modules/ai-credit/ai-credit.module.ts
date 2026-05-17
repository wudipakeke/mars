import { Module } from '@nestjs/common';
import { AiCreditController } from './ai-credit.controller';
import { CreditAdminController } from './credit-admin.controller';
import { AiCreditService } from './ai-credit.service';
import { DeepseekService } from './deepseek.service';

@Module({
  controllers: [AiCreditController, CreditAdminController],
  providers: [AiCreditService, DeepseekService],
})
export class AiCreditModule {}
