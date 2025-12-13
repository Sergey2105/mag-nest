import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthDto } from './dto/auth.dto.js';
import type { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../generated/prisma/client.js';

interface OAuthUser {
  email: string;
  name: string;
  picture?: string;
  googleId?: string;
  yandexId?: string;
}

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() dto: AuthDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const result = await this.authService.login(dto);
    this.authService.addRefreshTokenToResponse(res, result.refreshToken);
    return result;
  }

  @Post('register')
  @HttpCode(200)
  async register(
    @Body() dto: AuthDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const result = await this.authService.register(dto);
    this.authService.addRefreshTokenToResponse(res, result.refreshToken);
    return result;
  }

  @Post('login/access-token')
  @HttpCode(200)
  async getNewTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const refreshTokenFromCookies = req.cookies[
      this.authService.REFRESH_TOKEN_NAME
    ] as string | undefined;

    if (!refreshTokenFromCookies) {
      this.authService.removeRefreshTokenFromResponse(res);
      throw new UnauthorizedException('Refresh token не передан');
    }

    const result = await this.authService.getNewTokens(refreshTokenFromCookies);
    this.authService.addRefreshTokenToResponse(res, result.refreshToken);

    return result;
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    this.authService.removeRefreshTokenFromResponse(res);
    return { message: 'Logout successful' };
  }

  // Google OAuth
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Guard перенаправит на Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.validateOAuthLogin(
      req.user as OAuthUser,
    );
    this.authService.addRefreshTokenToResponse(res, result.refreshToken);

    const userAgent = req.headers['user-agent'] || '';
    const isMobile = /android|iphone|ipad|ipod|mobile/i.test(userAgent);

    if (isMobile) {
      return res.redirect(
        `${process.env.CLIENT_URL}/profile?accessToken=${result.accessToken}`,
      );
    }

    // Перенаправление на фронтенд с токеном
    return res.redirect(
      `${process.env.SERVER_URL}/auth/popup-success?accessToken=${result.accessToken}`,
    );
  }

  // Yandex OAuth
  @Get('yandex')
  @UseGuards(AuthGuard('yandex'))
  async yandexAuth() {
    // Guard перенаправит на Yandex
  }

  @Get('yandex/callback')
  @UseGuards(AuthGuard('yandex'))
  async yandexAuthCallback(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.validateOAuthLogin(
      req.user as OAuthUser,
    );
    this.authService.addRefreshTokenToResponse(res, result.refreshToken);

    const userAgent = req.headers['user-agent'] || '';
    const isMobile = /android|iphone|ipad|ipod|mobile/i.test(userAgent);

    if (isMobile) {
      return res.redirect(
        `${process.env.CLIENT_URL}/profile?accessToken=${result.accessToken}`,
      );
    }

    // Перенаправление на фронтенд с токеном
    return res.redirect(
      `${process.env.SERVER_URL}/auth/popup-success?accessToken=${result.accessToken}`,
    );
  }

  @Get('popup-success')
  popupSuccess(@Query('token') token: string) {
    return `
    <html>
      <body>
        <script>
          if (window.opener) {
             window.opener.postMessage(
               { type: "oauth_token", token: "${token}" },
               "*"
             );
             window.close();
          } else {
             document.body.innerHTML = "<h3>Authentication completed. You may close this window.</h3>";
          }
        </script>
      </body>
    </html>
  `;
  }
}
