import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as process from 'node:process';
import { ConfigService } from '@nestjs/config';
import * as compression from 'compression';

async function bootstrap() {
  const configService = new ConfigService();

  process.env.TZ = configService.get('TIMEZONE');

  const app = await NestFactory.create(AppModule);

  app.use(
    compression.default({
      threshold: 2 * 1024 * 1024,
    }),
  );

  // app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      enableDebugMessages: true,
      validateCustomDecorators: true, // validate custom decorator
      // skipUndefinedProperties: true, // skip validation of undefined field
      skipNullProperties: true, // skip validate of null properties
      forbidNonWhitelisted: true, // throw error when encounter non-whitelisted field
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Saloon House API')
    .setVersion('0.0')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
