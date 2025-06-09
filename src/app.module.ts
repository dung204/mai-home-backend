import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR, DiscoveryModule } from '@nestjs/core';

import { ConfigModule } from './base/configs/config.module';
import { DatabaseModule } from './base/database/database.module';
import { ResponseTransformInterceptor } from './base/interceptors/response-transform.interceptor';
import { AuthModule } from './modules/auth/auth.module';
import { JwtGuard } from './modules/auth/guards/jwt.guard';
import { EmailModule } from './modules/email/email.module';
import { LocationModule } from './modules/location/location.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule,
    DiscoveryModule,
    AuthModule,
    DatabaseModule,
    UsersModule,
    PropertiesModule,
    LocationModule,
    ReviewsModule,
    TransactionsModule,
    EmailModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTransformInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
  ],
})
export class AppModule {}
