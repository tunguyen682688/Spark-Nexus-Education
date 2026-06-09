/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );
  logger.log('✅ Global validation pipe configured');

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
