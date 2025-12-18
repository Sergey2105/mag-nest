import { TUser } from '@/auth/decorators/user.decorator';
import { CreateOrderDto } from '@/order/order.dto';
import { OrderService } from '@/order/order.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { YookassaService } from 'src/lib/yookassa/yookassa.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { YookassaPaymentResponse } from './response/payment-response';
import { PrismaService } from '@/prisma/prisma.service';
import { User } from 'generated/prisma/client';

@Injectable()
export class TransactionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly yookassa: YookassaService,
    private readonly orderService: OrderService,
  ) {}

  async checkout(
    dto: CreateOrderDto,
    user: TUser,
  ): Promise<YookassaPaymentResponse> {
    const order = await this.orderService.createOrder(user.id, dto.promoCode);

    if (!order) {
      throw new NotFoundException('Order Not created!');
    }

    const payment = await this.makeYooKassaPayment(user, order.total, order.id);

    if (payment) {
      await this.create({
        payment,
        userId: user.id,
        orderId: order.id,
      });

      await this.prisma.order.update({
        where: { id: order.id },
        data: { status: 'processing' },
      });
    }

    return {
      confirmationToken: payment.confirmation.confirmation_token,
    };
  }

  async makeYooKassaPayment(user: User, price: number, orderId: string) {
    try {
      const paymentResponse = await this.yookassa.createPayment({
        currency: 'RUB',
        customerEmail: user.email,
        items: [
          {
            description: `Оплата заказа ${orderId}`,
            quantity: '1.00',
            amount: {
              value: price.toString(),
              currency: 'RUB',
            },
            vat_code: '1',
          },
        ],
        total: price.toString(),
      });

      return paymentResponse;
    } catch (error) {
      console.error('Ошибка создания платежа', error);
      throw new BadRequestException('Ошибка при создании платежа');
    }
  }

  async create({ userId, orderId, payment }: CreateTransactionDto) {
    const transaction = await this.prisma.transaction.create({
      data: {
        amount: payment.amount.value,
        paymentId: payment.id,
        status: payment.status,
        user: { connect: { id: userId } },
        order: { connect: { id: orderId } },
      },
    });

    await this.prisma.order.update({
      where: { id: orderId },
      data: { transactionId: transaction.id },
    });

    return transaction;
  }
}
