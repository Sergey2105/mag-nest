import { AuthService } from '@/auth/auth.service';
import { RefreshTokenService } from '@/auth/refresh-token.service';
import { SocialMediaAuthService } from '@/auth/social-media/social-media-auth.service';

import { validateTelegramAuth } from '@/utils/validate-telegram-auth.util';
import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { ITelegramProfile, TUserSocial } from './social-media-auth.types';

@Controller('auth')
export class SocialMediaAuthController {
  constructor(
    private readonly socialMediaAuthService: SocialMediaAuthService,
    private readonly authService: AuthService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  private _CLIENT_BASE_URL = 'http://localhost:3000/social-auth?accessToken=';

  // Google
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(
    @Req() req: { user: TUserSocial },
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.socialMediaAuthService.login(req);
    const { accessToken, refreshToken } =
      await this.authService.buildResponseObject(user);
    this.refreshTokenService.addRefreshTokenToResponse(res, refreshToken);
    return res.redirect(`${this._CLIENT_BASE_URL}${accessToken}`);
  }

  // GitHub
  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubAuth() {}

  @Get('github/redirect')
  @UseGuards(AuthGuard('github'))
  async githubAuthRedirect(
    @Req() req: { user: TUserSocial },
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.socialMediaAuthService.login(req);
    const { accessToken, refreshToken } =
      await this.authService.buildResponseObject(user);
    this.refreshTokenService.addRefreshTokenToResponse(res, refreshToken);
    return res.redirect(`${this._CLIENT_BASE_URL}${accessToken}`);
  }

  // Apple
  @Get('apple')
  @UseGuards(AuthGuard('apple'))
  async appleAuth() {}

  @Get('apple/redirect')
  @UseGuards(AuthGuard('apple'))
  async appleAuthRedirect(
    @Req() req: { user: TUserSocial },
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.socialMediaAuthService.login(req);
    const { accessToken, refreshToken } =
      await this.authService.buildResponseObject(user);
    this.refreshTokenService.addRefreshTokenToResponse(res, refreshToken);
    return res.redirect(`${this._CLIENT_BASE_URL}${accessToken}`);
  }

  // Twitch
  @Get('twitch')
  @UseGuards(AuthGuard('twitch'))
  async twitchAuth() {}

  @Get('twitch/redirect')
  @UseGuards(AuthGuard('twitch'))
  async twitchAuthRedirect(
    @Req() req: { user: TUserSocial },
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.socialMediaAuthService.login(req);
    const { accessToken, refreshToken } =
      await this.authService.buildResponseObject(user);
    this.refreshTokenService.addRefreshTokenToResponse(res, refreshToken);
    return res.redirect(`${this._CLIENT_BASE_URL}${accessToken}`);
  }

  // Yandex
  @Get('yandex')
  @UseGuards(AuthGuard('yandex'))
  async yandexAuth() {}

  @Get('yandex/redirect')
  @UseGuards(AuthGuard('yandex'))
  async yandexAuthRedirect(
    @Req() req: { user: TUserSocial },
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.socialMediaAuthService.login(req);
    const { accessToken, refreshToken } =
      await this.authService.buildResponseObject(user);
    this.refreshTokenService.addRefreshTokenToResponse(res, refreshToken);
    return res.redirect(`${this._CLIENT_BASE_URL}${accessToken}`);
  }

  @Get('telegram/redirect')
  async telegramAuthRedirect(
    @Query() query: ITelegramProfile,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Проверяем подпись (hash), чтобы убедиться, что данные пришли от Telegram
    if (!validateTelegramAuth(query)) {
      throw new Error('Invalid Telegram authentication data');
    }

    const user = await this.socialMediaAuthService.login({
      user: {
        telegramId: query.telegramId,
        name: query.username || `${query.firstName} ${query.lastName}`,
        avatarPath: query.photoUrl || '',
      },
    });

    const { accessToken, refreshToken } =
      await this.authService.buildResponseObject(user);
    this.refreshTokenService.addRefreshTokenToResponse(res, refreshToken);

    const redirectUrl = `${this._CLIENT_BASE_URL}${accessToken}${
      !user.email ? '&needEmail=true' : ''
    }`;

    return res.redirect(redirectUrl);
  }
}
