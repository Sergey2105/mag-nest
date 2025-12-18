import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PromoService {
  constructor(private prisma: PrismaService) {}

  async checkPromoCode(code: string) {
    const promo = await this.prisma.promoCode.findUnique({
      where: {
        code,
      },
    });

    if (!promo) {
      return null;
    }

    return promo.discount;
  }
}
