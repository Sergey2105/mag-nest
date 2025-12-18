import { SocialMediaAuthController } from '@/auth/social-media/social-media-auth.controller';
import { SocialMediaAuthService } from '@/auth/social-media/social-media-auth.service';
import { GithubStrategy } from '@/auth/strategies/github.strategy';
import { GoogleStrategy } from '@/auth/strategies/google.strategy';
import { TwitchAuthStrategy } from '@/auth/strategies/twitch.strategy';
import { YandexAuthStrategy } from '@/auth/strategies/yandex.strategy';
import { EmailModule } from '@/email/email.module';
import { PrismaService } from '@/prisma/prisma.service';

import { SmsModule } from '@/sms/sms.module';
import { UserModule } from '@/user/user.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { getJwtConfig } from 'src/config/jwt.config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshTokenService } from './refresh-token.service';
import { SmsAuthController } from './sms/sms-auth.controller';
import { SmsAuthService } from './sms/sms-auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { CartService } from '@/cart/cart.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getJwtConfig,
    }),
    UserModule,
    EmailModule,
    SmsModule,
  ],
  controllers: [AuthController, SocialMediaAuthController, SmsAuthController],
  providers: [
    JwtStrategy,
    PrismaService,
    AuthService,
    RefreshTokenService,
    GoogleStrategy,
    GithubStrategy,
    // AppleAuthStrategy,
    // TwitchAuthStrategy,
    YandexAuthStrategy,
    SocialMediaAuthService,
    SmsAuthService,
    CartService,
  ],
})
export class AuthModule {}
