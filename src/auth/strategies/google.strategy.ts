// import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { PassportStrategy } from '@nestjs/passport';
// import { Profile, Strategy } from 'passport-google-oauth20';

// export interface GoogleUser {
//   email: string;
//   name: string;
//   googleId: string;
//   // picture?: string;
// }

// @Injectable()
// export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
//   constructor(private readonly configService: ConfigService) {
//     const clientID = configService.get<string>('GOOGLE_CLIENT_ID');
//     const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');
//     const serverUrl = configService.get<string>('SERVER_URL');

//     if (!clientID || !clientSecret || !serverUrl) {
//       throw new Error('Google OAuth environment variables are not set');
//     }

//     super({
//       clientID,
//       clientSecret,
//       callbackURL: `${serverUrl}/auth/google/callback`,
//       scope: ['email', 'profile'],
//     });
//   }

//   // eslint-disable-next-line @typescript-eslint/require-await
//   async validate(
//     _accessToken: string,
//     _refreshToken: string,
//     profile: Profile,
//   ): Promise<GoogleUser> {
//     const { id, displayName, emails } = profile;

//     if (!emails || !emails.length || !emails[0].value) {
//       throw new Error('No email found in Google profile');
//     }

//     if (!id) {
//       throw new Error('No ID found in Google profile');
//     }

//     return {
//       email: emails[0].value,
//       name: displayName || 'Google User',
//       googleId: id,
//       // picture: photos?.[0]?.value,
//     };
//   }
// }

// не мое но рбоатет
// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { PassportStrategy } from '@nestjs/passport';
// import { Profile, Strategy, StrategyOptions } from 'passport-google-oauth20';
// import * as https from 'https';

// export interface GoogleUser {
//   email: string;
//   name: string;
//   googleId: string;
// }

// @Injectable()
// export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
//   constructor(private readonly configService: ConfigService) {
//     const clientID = configService.get<string>('GOOGLE_CLIENT_ID');
//     const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');
//     const serverUrl = configService.get<string>('SERVER_URL');

//     if (!clientID || !clientSecret || !serverUrl) {
//       throw new Error('Google OAuth environment variables are not set');
//     }

//     const strategyOptions: StrategyOptions = {
//       clientID,
//       clientSecret,
//       callbackURL: `${serverUrl}/auth/google/callback`,
//       scope: ['email', 'profile'],
//     };

//     super(strategyOptions);
//   }

//   async validate(
//     accessToken: string,
//     _refreshToken: string,
//     profile: Profile | null,
//   ): Promise<GoogleUser> {
//     try {
//       // Если профиль не получен из-за ошибки соединения,
//       // пытаемся получить данные напрямую через API
//       if (!profile || !profile.id) {
//         return await this.fetchUserInfoFromToken(accessToken);
//       }

//       const { id, displayName, name, emails } = profile;

//       if (!emails || !emails.length || !emails[0].value) {
//         throw new UnauthorizedException('No email found in Google profile');
//       }

//       if (!id) {
//         throw new UnauthorizedException('No ID found in Google profile');
//       }

//       const userName =
//         displayName ||
//         (name?.givenName && name?.familyName
//           ? `${name.givenName} ${name.familyName}`
//           : name?.givenName ||
//             name?.familyName ||
//             emails[0].value.split('@')[0] ||
//             'Google User');

//       return {
//         email: emails[0].value,
//         name: userName,
//         googleId: id,
//       };
//     } catch (error) {
//       console.error('Google OAuth validation error:', error);
//       throw new UnauthorizedException('Failed to validate Google profile');
//     }
//   }

//   private async fetchUserInfoFromToken(
//     accessToken: string,
//   ): Promise<GoogleUser> {
//     return new Promise((resolve, reject) => {
//       const options = {
//         hostname: 'www.googleapis.com',
//         path: '/oauth2/v2/userinfo',
//         method: 'GET',
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//         // Увеличиваем таймаут и добавляем настройки для Windows
//         timeout: 10000,
//         agent: new https.Agent({
//           keepAlive: true,
//           keepAliveMsecs: 1000,
//           maxSockets: 5,
//         }),
//       };

//       const req = https.request(options, (res) => {
//         let data = '';

//         res.on('data', (chunk) => {
//           data += chunk;
//         });

//         res.on('end', () => {
//           try {
//             const userInfo = JSON.parse(data);

//             if (userInfo.error) {
//               reject(
//                 new UnauthorizedException(
//                   userInfo.error.message || 'Failed to fetch user info',
//                 ),
//               );
//               return;
//             }

//             resolve({
//               email: userInfo.email,
//               name:
//                 userInfo.name ||
//                 userInfo.given_name + ' ' + userInfo.family_name ||
//                 userInfo.email.split('@')[0],
//               googleId: userInfo.id,
//             });
//           } catch (error) {
//             reject(new UnauthorizedException('Failed to parse user info'));
//           }
//         });
//       });

//       req.on('error', (error) => {
//         console.error('HTTPS request error:', error);
//         reject(
//           new UnauthorizedException('Failed to fetch user info from Google'),
//         );
//       });

//       req.on('timeout', () => {
//         req.destroy();
//         reject(new UnauthorizedException('Request timeout'));
//       });

//       req.end();
//     });
//   }
// }

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
