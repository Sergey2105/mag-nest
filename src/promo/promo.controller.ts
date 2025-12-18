import { Auth } from '@/auth/decorators/auth.decorator';
import { Controller, Get, Param } from '@nestjs/common';
import { PromoService } from './promo.service';

@Controller('promo')
export class PromoController {
  constructor(private readonly promoService: PromoService) {}

  @Get('/check/:code')
  @Auth()
  async checkPromoCode(@Param('code') code: string) {
    return this.promoService.checkPromoCode(code);
  }
}
