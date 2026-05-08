import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// Prisma 返回 BigInt，JSON.stringify 无法序列化，转为 number
(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
