/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { BigIntSerializerInterceptor } from './big-int-serializer.interceptor';
import * as express from 'express';
import * as path from 'path';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Environment detection
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const environment = process.env.NODE_ENV || 'development';

  logger.log(`🌍 Environment: ${environment.toUpperCase()}`);
  logger.log(`📦 Starting EnglishReelNet Backend...`);

  // Create NestJS application
  const app = await NestFactory.create(AppModule, {
    logger: isDevelopment
      ? ['log', 'debug', 'error', 'verbose', 'warn']
      : ['error', 'warn', 'log'],
  });

  // Increase body parser limit for large exam content payloads
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));

  // Serve uploaded files (local storage dev mode)
  const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadDir, {
    maxAge: '1d',
    immutable: false,
  }));

  // Graceful shutdown
  const shutdown = async () => {
    logger.log('🛑 Shutdown signal received, closing application...');
    await app.close();
    process.exit(0);
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  // Global prefix
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // API Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // CORS Configuration
  app.enableCors({
    origin: isDevelopment
      ? [
          'http://localhost:3000',
          'http://localhost:4200',
          'http://localhost:5173',
          'http://localhost:5174',
          'http://localhost:3001',
          'http://127.0.0.1:4200',
          'http://127.0.0.1:5173',
        ]
      : process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(',').map((o: string) => o.trim())
        : [],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global BigInt serializer interceptor
  app.useGlobalInterceptors(new BigIntSerializerInterceptor());

  // Swagger (dev only)
  if (isDevelopment) {
    const config = new DocumentBuilder()
      .setTitle('Spark Nexus Ed API')
      .setDescription('API documentation for Spark Nexus Ed English learning platform')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          in: 'header',
        },
        'access-token',
      )
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    logger.log(`📚 Swagger docs available at /api/docs`);
  }

  // Start server
  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`🚀 Server running on http://localhost:${port}`);
  logger.log(`🌍 Environment: ${environment}`);
}

bootstrap();
