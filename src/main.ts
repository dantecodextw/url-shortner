import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import QueryFailedExceptionHandler from './error-handler/query-failed-exception.filter';
import { ResponseInterceptor } from './interceptors/response.interceptors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix(process.env.GLOBAL_API_PREFIX)

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }))

  app.useGlobalInterceptors(new ResponseInterceptor())
  app.useGlobalFilters(new QueryFailedExceptionHandler())
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
