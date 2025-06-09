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

  MOMO = {
    partnerCode: process.env['MOMO_PARTNER_CODE'] ?? '',
    accessKey: process.env['MOMO_ACCESS_KEY'] ?? '',
    secretKey: process.env['MOMO_SECRET_KEY'] ?? '',
    ipnUrl: process.env['MOMO_IPN_URL'] ?? '',
    orderExpireTime: process.env['MOMO_EXPIRE_TIME_MINUTES'] ?? '',
    requestType: 'captureWallet',
    lang: 'en',
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

  CLOUDINARY = {
    cloud_name: process.env['CLOUDINARY_CLOUD_NAME'] ?? '',
    api_key: process.env['CLOUDINARY_API_KEY'] ?? '',
    api_secret: process.env['CLOUDINARY_API_SECRET'] ?? '',
  };
}

export const configs = new ConfigService();
