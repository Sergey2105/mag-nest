import { CreateOrderDto } from '@/order/order.dto';
import { Body, Controller, Post } from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CurrentUser, TUser } from 'src/auth/decorators/user.decorator';
import { TransactionService } from './transaction.service';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('checkout')
  @Auth()
  async makePayment(@Body() dto: CreateOrderDto, @CurrentUser() user: TUser) {
    return this.transactionService.checkout(dto, user);
  }
}
