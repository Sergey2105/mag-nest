import { Auth } from '@/auth/decorators/auth.decorator';
import { Controller, Get } from '@nestjs/common';
import { OrderService } from './order.service';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // @Post('create')
  // @Auth()
  // async createOrder(@Body() dto: CreateOrderDto, @CurrentUser() user: TUser) {
  // 	return this.orderService.createOrder(user.cart.id, user.id, dto.promoCode)
  // }

  @Get()
  @Auth()
  async getAll() {
    return this.orderService.getAll();
  }
}
