import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-yandex';

export interface YandexUser {
  email: string;
  name: string;
  yandexId: string;
  // picture?: string;
}

@Injectable()
export class YandexStrategy extends PassportStrategy(Strategy, 'yandex') {
  constructor(private readonly configService: ConfigService) {
    const clientID = configService.get<string>('YANDEX_CLIENT_ID');
    const clientSecret = configService.get<string>('YANDEX_CLIENT_SECRET');
    const serverUrl = configService.get<string>('SERVER_URL');

    if (!clientID || !clientSecret || !serverUrl) {
      throw new Error('Yandex OAuth environment variables are not set');
    }

    super({
      clientID,
      clientSecret,
      callbackURL: `${serverUrl}/auth/yandex/callback`,
    });
  }
  authorizationParams(): Record<string, string> {
    return {
      force_confirm: 'yes',
    };
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): Promise<YandexUser> {
    const { id, username, emails } = profile;

    if (!emails || !emails.length || !emails[0].value) {
      throw new Error('No email found in Yandex profile');
    }

    if (!id) {
      throw new Error('No ID found in Yandex profile');
    }

    return {
      email: emails[0].value,
      name: username || 'Yandex User',
      yandexId: id,
      // picture: profile.photos?.[0]?.value,
    };
  }
}
