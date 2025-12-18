import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { PaymentStatusDto } from 'src/lib/yookassa/types/yookassa.types';

@Injectable()
export class WebhookService {
  constructor(private readonly prisma: PrismaService) {}

  async yookassa(dto: PaymentStatusDto) {
    const { object, event } = dto;

    const transaction = await this.prisma.transaction.findUnique({
      where: { paymentId: object.id },
      include: { order: true },
    });

    if (!transaction) {
      console.error('Transaction not found');
      return;
    }

    if (event === 'payment.succeeded') {
      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: object.status,
          paymentMethod: object.payment_method.type,
        },
      });

      if (transaction.order) {
        await this.prisma.order.update({
          where: { id: transaction.order.id },
          data: { status: 'completed' },
        });
      }
    }

    if (event === 'payment.canceled') {
      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: object.status,
          paymentMethod: object.payment_method.type,
        },
      });

      if (transaction.order) {
        await this.prisma.order.update({
          where: { id: transaction.order.id },
          data: { status: 'canceled' },
        });
      }
    }
  }
}
