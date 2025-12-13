import { AuthService } from '@/auth/auth.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as TwitchStrategy } from 'passport-twitch-new';
import {
  ITwitchProfile,
  TSocialCallback,
} from '../social-media/social-media-auth.types';

@Injectable()
export class TwitchAuthStrategy extends PassportStrategy(
  TwitchStrategy,
  'twitch',
) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get('TWITCH_CLIENT_ID'),
      clientSecret: configService.get('TWITCH_CLIENT_SECRET'),
      callbackURL: configService.get('TWITCH_CALLBACK_URL'),
      scope: ['user:read:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: ITwitchProfile,
    done: TSocialCallback,
  ): Promise<any> {
    done(null, {
      avatarPath: profile.profile_image_url,
      email: profile.email,
      name: profile.display_name,
    });
  }
}
