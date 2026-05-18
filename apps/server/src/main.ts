import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';

// Prisma 返回 BigInt，JSON.stringify 无法序列化，转为 number
(BigInt.prototype as unknown as { toJSON: () => number }).toJSON = function () {
  return Number(this);
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  app.setGlobalPrefix('api');
  app.use(express.json({ limit: '50mb' }));
  await app.listen(process.env.PORT ?? 3008);
}
void bootstrap();
