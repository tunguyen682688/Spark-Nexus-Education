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

  // Graceful shutdown
  const shutdown = async () => {
    logger.log('🛑 Shutdown signal received, closing application...');
    await app.close();
    process.exit(0);
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  // Bull Board dashboard (dev only)
  if (isDevelopment) {
    try {
      const { Board } = await import('@bull-board/api');
      const { BullMQAdapter } = await import('@bull-board/api/bullMQAdapter');
      const { ExpressAdapter } = await import('@bull-board/express');
      const { Queue } = await import('bullmq');

      const serverAdapter = new ExpressAdapter();
      serverAdapter.setBasePath('/api/admin/queues');

      const redisHost = process.env.REDIS_HOST || 'localhost';
      const redisPort = parseInt(process.env.REDIS_PORT ?? '6379', 10);
      const redisPassword = process.env.REDIS_PASSWORD;

      const connection = {
        host: redisHost,
        port: redisPort,
        ...(redisPassword && redisPassword.trim() !== '' ? { password: redisPassword } : {}),
      };

      const queues = [
        'certification-init',
        'certification-scoring',
        'certification-analytics',
        'certification-publishing',
      ];

      const board = new Board({
        queues: queues.map((name) => new BullMQAdapter(new Queue(name, { connection }))),
      });
      board.setAdapter(serverAdapter);

      app.use('/api/admin/queues', serverAdapter.getRouter());
      logger.log(`📊 Bull Board dashboard available at /api/admin/queues`);
    } catch (error) {
      logger.warn(`⚠️ Bull Board not available: ${(error as Error).message}`);
    }
  }

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
        ]
      : process.env.CORS_ORIGIN?.split(',') || [],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });
  logger.log('✅ CORS enabled');

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );
  logger.log('✅ Global validation pipe configured');

  // Global BigInt serializer — converts all BigInt values to Number before JSON serialization
  app.useGlobalInterceptors(new BigIntSerializerInterceptor());
  logger.log('✅ Global BigInt serializer interceptor configured');

  // Swagger Documentation (Development only)
  if (isDevelopment) {
    const config = new DocumentBuilder()
      .setTitle('EnglishReelNet API')
      .setDescription(
        'API documentation for EnglishReelNet - English learning platform'
      )
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description:
            'Enter JWT token from Auth0. Token will be automatically prefixed with "Bearer ".',
        },
        'JWT' // Security scheme name/key - must match @ApiBearerAuth('JWT')
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      customSiteTitle: 'EnglishReelNet API Docs',
      customfavIcon: '📚',
      customCss: '.swagger-ui .topbar { display: none }',
      swaggerOptions: {
        persistAuthorization: true, // Persist auth token across page refreshes
        displayRequestDuration: true,
        filter: true,
        showExtensions: true,
        showCommonExtensions: true,
        docExpansion: 'none', // Collapse all endpoints by default
        defaultModelsExpandDepth: 1,
        defaultModelExpandDepth: 1,
      },
    });
    logger.log('📚 Swagger documentation available at /api/docs');
  }

  // Start server
  const port = process.env.PORT || 3000;
  const host = process.env.HOST || 'localhost';

  await app.listen(port, host);

  // Display startup information
  logger.log('');
  logger.log('═══════════════════════════════════════════');
  logger.log(`🚀 Application successfully started!`);
  logger.log('═══════════════════════════════════════════');
  logger.log(`📍 Server URL: http://${host}:${port}/${globalPrefix}`);

  if (isDevelopment) {
    logger.log(`📖 API Documentation: http://${host}:${port}/api/docs`);
    logger.log(
      `🔍 Health Check: http://${host}:${port}/${globalPrefix}/health`
    );
  }

  logger.log(`🌍 Environment: ${environment}`);
  logger.log(
    `🔌 CORS: ${
      isDevelopment ? 'Development (permissive)' : 'Production (restricted)'
    }`
  );
  logger.log(`✨ API Version: v1`);
  logger.log('═══════════════════════════════════════════');
  logger.log('');
}

bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap');
  logger.error('❌ Failed to start application:', error);
  process.exit(1);
});
