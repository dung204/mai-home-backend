import { HttpModule } from '@nestjs/axios';
import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EmailModule } from '../email/email.module';
import { MediaModule } from '../media';
import { UsersModule } from '../users/users.module';
import { AuthController } from './controllers/auth.controller';
import { Account } from './entities/account.entity';
import { JwtGuard } from './guards/jwt.guard';
import { AccountRepository } from './repository/account.repository';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
    forwardRef(() => UsersModule),
    EmailModule,
    HttpModule,
    MediaModule,
  ],
  controllers: [AuthController],
  providers: [AccountRepository, AuthService, JwtStrategy, JwtGuard],
  exports: [AuthService],
})
export class AuthModule {}
