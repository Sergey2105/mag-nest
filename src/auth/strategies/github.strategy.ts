import { AuthService } from '@/auth/auth.service';
import {
  IGithubProfile,
  TSocialCallback,
} from '@/auth/social-media/social-media-auth.types';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get('GITHUB_CLIENT_ID'),
      clientSecret: configService.get('GITHUB_CLIENT_SECRET'),
      callbackURL: configService.get('GITHUB_CALLBACK_URL'),
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: IGithubProfile,
    done: TSocialCallback,
  ) {
    console.log(profile);
    done(null, {
      avatarPath: profile.photos?.[0]?.value,
      email: profile.emails[0].value,
      name: profile.displayName,
    });
  }
}
