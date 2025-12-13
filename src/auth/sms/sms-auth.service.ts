import { PrismaService } from '@/prisma.service';
import { SmsService } from '@/sms/sms.service';

import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class SmsAuthService {
  constructor(
    private readonly smsService: SmsService,
    private readonly prisma: PrismaService,
  ) {}

  async sendCode(
    phone: string,
    channel: 'sms' | 'whatsapp' = 'sms',
  ): Promise<{ message: string }> {
    const code = this.generateCode(); // 4х значный код
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 минут

    let user = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (user) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { otpCode: code, otpExpiresAt: expiresAt },
      });
    } else {
      user = await this.prisma.user.create({
        data: {
          phone,
          otpCode: code,
          otpExpiresAt: expiresAt,
          password: '',
        },
      });
    }

    const messageText = `OTP code: ${code}`;

    if (channel === 'sms') {
      await this.smsService.sendSms(phone, messageText);
    } else {
      await this.smsService.sendWhatsApp(phone, messageText);
    }

    return { message: 'Код успешно отправлен!' };
  }

  async verifyCode(phone: string, code: string) {
    const user = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (!user || !user.otpCode || !user.otpExpiresAt) {
      throw new BadRequestException('No OTP found for this phone');
    }

    if (user.otpExpiresAt < new Date() || user.otpCode !== code) {
      throw new BadRequestException('Invalid or expired code');
    }

    // После успешной проверки очищаем OTP-поля
    await this.prisma.user.update({
      where: { id: user.id },
      data: { otpCode: null, otpExpiresAt: null },
    });

    return { message: 'Code verified successfully', user };
  }

  private generateCode(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }
}
