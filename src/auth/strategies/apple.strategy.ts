import { AuthService } from '@/auth/auth.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as AppleStrategy } from 'passport-apple';
import {
  IAppleProfile,
  TSocialCallback,
} from '../social-media/social-media-auth.types';

@Injectable()
export class AppleAuthStrategy extends PassportStrategy(
  AppleStrategy,
  'apple',
) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get('APPLE_CLIENT_ID'),
      teamID: configService.get('APPLE_TEAM_ID'),
      keyID: configService.get('APPLE_KEY_ID'),
      callbackURL: configService.get('APPLE_CALLBACK_URL'),
      privateKeyString: configService.get('APPLE_PRIVATE_KEY'),
      scope: ['name', 'email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: IAppleProfile,
    done: TSocialCallback,
  ) {
    done(null, {
      email: profile.email,
      name: profile.firstName + ' ' + profile.lastName,
    });
  }
}
