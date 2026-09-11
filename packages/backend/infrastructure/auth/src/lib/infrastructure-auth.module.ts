import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { InfrastructureDatabaseModule } from '@spark-nest-ed/infrastructure-database';
import { InfrastructureCacheModule } from '@spark-nest-ed/infrastructure-cache';
import { AuthService } from './services';
import { JwtStrategy } from './strategies';

@Module({
  imports: [
    // Import other modules related to authentication here
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    InfrastructureDatabaseModule,
    InfrastructureCacheModule,
  ],
  controllers: [
    // Add controllers related to authentication here
  ],
  providers: [JwtStrategy, AuthService],
  exports: [PassportModule, AuthService],
})
export class InfrastructureAuthModule {}
