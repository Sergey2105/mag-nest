import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from '../auth.service';
import { RefreshTokenService } from '../refresh-token.service';
import { SmsAuthService } from './sms-auth.service';

@Controller('auth/sms')
export class SmsAuthController {
  constructor(
    private readonly smsAuthService: SmsAuthService,
    private readonly authService: AuthService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  @Post('send-code')
  async sendCode(
    @Body('phone') phone: string,
    @Body('channel') channel: 'sms' | 'whatsapp',
  ) {
    return this.smsAuthService.sendCode(phone, channel);
  }

  @Post('verify-code')
  async verifyCode(
    @Body() dto: { phone: string; code: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, message } = await this.smsAuthService.verifyCode(
      dto.phone,
      dto.code,
    );

    const { accessToken, refreshToken } =
      await this.authService.buildResponseObject(user);
    this.refreshTokenService.addRefreshTokenToResponse(res, refreshToken);

    return { accessToken, message };
  }
}
