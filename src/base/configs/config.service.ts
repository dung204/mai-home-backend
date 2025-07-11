import { Injectable } from '@nestjs/common';
import { config } from 'dotenv';
import { DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

config({
  path: ['.env.local', '.env'],
});

@Injectable()
export class ConfigService {
  NODE_ENV = process.env['NODE_ENV'];
  APP_PORT = parseInt(process.env['APP_PORT'] ?? '3000');
  USE_HTTPS = process.env['USE_HTTPS'] === 'true';

  ACCESS_SECRET_KEY = process.env['ACCESS_SECRET_KEY'];
  REFRESH_SECRET_KEY = process.env['REFRESH_SECRET_KEY'];

  OTP_SECRET_KEY = process.env['OTP_SECRET_KEY'] ?? '';

  POSTGRES = {
    type: 'postgres',
    host: process.env['DB_HOST'] ?? 'localhost',
    port: parseInt(process.env['DB_PORT'] ?? '5432', 10),
    username: process.env['DB_USERNAME'],
    password: process.env['DB_PASSWORD'],
    database: process.env['DB_DATABASE_NAME'],
    synchronize: false,
    entities: ['dist/**/*.entity.js'],
    migrations: ['dist/**/database/migrations/*.js'],
    migrationsRun: process.env['NODE_ENV'] === 'production',
    namingStrategy: new SnakeNamingStrategy(),
    logging: process.env['NODE_ENV'] === 'development',
  } satisfies DataSourceOptions;

  REDIS = {
    host: process.env['REDIS_HOST'] ?? 'localhost',
    port: parseInt(process.env['REDIS_PORT'] ?? '6379'),
    username: process.env['REDIS_USERNAME'] ?? '',
    password: process.env['REDIS_PASSWORD'] ?? '',
  };

  PAYOS = {
    clientId: process.env['PAYOS_CLIENT_ID'] ?? '',
    apiKey: process.env['PAYOS_API_KEY'] ?? '',
    checksumKey: process.env['PAYOS_CHECKSUM_KEY'] ?? '',
  };

  EMAIL = {
    secure: false,
    host: process.env['EMAIL_HOST'] ?? '',
    port: parseInt(process.env['EMAIL_PORT'] ?? ''),
    auth: {
      user: process.env['EMAIL_AUTH_USER'] ?? '',
      pass: process.env['EMAIL_AUTH_PASSWORD'] ?? '',
    },
  };

  GOOGLE = {
    client_id: process.env['GOOGLE_OAUTH_CLIENT_ID'] ?? '',
    client_secret: process.env['GOOGLE_OAUTH_CLIENT_SECRET'] ?? '',
    redirect_uri: process.env['GOOGLE_OAUTH_REDIRECT_URI'] ?? '',
    grant_type: 'authorization_code',
  };

  MINIO = {
    endPoint: process.env['MINIO_ENDPOINT'] || 'localhost',
    port: parseInt(process.env['MINIO_PORT'] || '9000'),
    useSSL: false,
    accessKey: process.env['MINIO_ACCESS_KEY'] || 'minioadmin',
    secretKey: process.env['MINIO_SECRET_KEY'] || 'minioadmin',
    bucket: process.env['MINIO_BUCKET'] || 'mely-blog',
    region: process.env['MINIO_REGION'] || 'us-east-1',
    publicEndpoint:
      process.env['MINIO_PUBLIC_ENDPOINT'] || process.env['MINIO_ENDPOINT'] || 'localhost:9000',
    expiryInSeconds: parseInt(process.env['MINIO_EXPIRY_SECONDS'] || (10 * 60).toString()), // Default 10 minutes
    fixedExpiryInSeconds: parseInt(
      process.env['MINIO_FIXED_EXPIRY_SECONDS'] || (24 * 60 * 60).toString(),
    ), // Default 24 hours
  };
}

export const configs = new ConfigService();
