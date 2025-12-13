import { AuthService } from '@/auth/auth.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as YandexStrategy } from 'passport-yandex';
import {
  IYandexProfile,
  TSocialCallback,
} from '../social-media/social-media-auth.types';

@Injectable()
export class YandexAuthStrategy extends PassportStrategy(
  YandexStrategy,
  'yandex',
) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get('YANDEX_CLIENT_ID'),
      clientSecret: configService.get('YANDEX_CLIENT_SECRET'),
      callbackURL: configService.get('YANDEX_CALLBACK_URL'),
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: IYandexProfile,
    done: TSocialCallback,
  ) {
    done(null, {
      email: profile.emails[0].value,
      name: profile.displayName,
      avatarPath: profile.photos[0].value,
    });
  }
}
