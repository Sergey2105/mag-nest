import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';
import { RequestMethod, ValidationPipe } from '@nestjs/common';

import cookieParser = require('cookie-parser');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api', {
    exclude: [
      { path: 'auth/google', method: RequestMethod.GET },
      { path: 'auth/google/redirect', method: RequestMethod.GET },
      { path: 'auth/github', method: RequestMethod.GET },
      { path: 'auth/github/redirect', method: RequestMethod.GET },
      // { path: 'auth/twitch', method: RequestMethod.GET },
      // { path: 'auth/twitch/redirect', method: RequestMethod.GET },
      { path: 'auth/yandex', method: RequestMethod.GET },
      { path: 'auth/yandex/redirect', method: RequestMethod.GET },
      { path: 'auth/telegram/redirect', method: RequestMethod.GET },
      { path: 'verify-email', method: RequestMethod.GET },
    ],
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  app.use(cookieParser());
  app.enableCors({
    origin: [
      process.env.CLIENT_URL,
      'https://elenore-paleographical-thomasena.ngrok-free.dev',
    ],
    credentials: true,
    exposedHeaders: 'set-cookie',
  });

  // // Отдаём загруженные файлы как статику по пути /uploads
  // app.useStaticAssets(join(process.cwd(), 'uploads'), {
  //   prefix: '/uploads/',
  // });

  await app.listen(5000);
}
void bootstrap();
