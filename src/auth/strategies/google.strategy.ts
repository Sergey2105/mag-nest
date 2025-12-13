import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, StrategyOptions, Profile } from 'passport-google-oauth20';

export interface GoogleUser {
  email: string;
  name: string;
  googleId: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');
    const serverUrl = configService.get<string>('SERVER_URL');

    if (!clientID || !clientSecret || !serverUrl) {
      throw new Error('Google OAuth environment variables are not set');
    }

    super({
      clientID,
      clientSecret,
      callbackURL: `${serverUrl}/auth/google/callback`,
      scope: ['email', 'profile'],
      accessType: 'offline',
      prompt: 'select_account consent',
    } as StrategyOptions);
  }

  async validate(
    accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): Promise<GoogleUser> {
    if (profile?.emails?.[0]?.value && profile?.id) {
      return {
        email: profile.emails[0].value,
        name: profile.displayName || profile.emails[0].value.split('@')[0],
        googleId: profile.id,
      };
    }

    return this.fetchUserInfoFromToken(accessToken);
  }

  private async fetchUserInfoFromToken(
    accessToken: string,
  ): Promise<GoogleUser> {
    try {
      const response = await fetch(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new UnauthorizedException(
          'Failed to fetch user info from Google',
        );
      }

      const userInfo = (await response.json()) as GoogleUserInfo;

      if (!userInfo.email || !userInfo.id) {
        throw new UnauthorizedException('Invalid user info from Google');
      }

      return {
        email: userInfo.email,
        name: userInfo.name || userInfo.email.split('@')[0],
        googleId: userInfo.id,
      };
    } catch (error) {
      console.error('Google OAuth error:', error);
      throw new UnauthorizedException('Failed to authenticate with Google');
    }
  }
}
