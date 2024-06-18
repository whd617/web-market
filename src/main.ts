import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200, // 구형 브라우저 지원을 위해
  };
  app.enableCors(corsOptions);
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(4000);
}
bootstrap();
