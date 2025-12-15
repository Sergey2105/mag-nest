import { ITelegramProfile } from '@/auth/social-media/social-media-auth.types';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export function validateTelegramAuth(query: ITelegramProfile): boolean {
  const configService = new ConfigService();
  const token = configService.get<string>('TELEGRAM_BOT_TOKEN');

  if (!token) {
    throw new Error('TELEGRAM_BOT_TOKEN is not defined');
  }

  const { hash, ...data } = query;

  const dataCheckString = Object.keys(data)
    .sort()
    .map((key) => `${key}=${data[key]}`)
    .join('\n');

  const secretKey = crypto.createHash('sha256').update(token).digest();

  const checkHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  return checkHash === hash;
}
