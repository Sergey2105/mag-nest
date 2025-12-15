import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { OrderDto } from './dto/order.dto';
import { OrderStatus, Prisma } from '../../generated/prisma/client';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Создать заказ и сформировать ссылку на оплату YooMoney Quickpay.
   * YooMoney не требует предварительного запроса — формируем redirect URL.
   */
  async createPayment(dto: OrderDto, userId: string) {
    const receiver = process.env.YOOMONEY_RECEIVER;
    if (!receiver) {
      throw new BadRequestException('YOOMONEY_RECEIVER не задан в env');
    }

    if (!dto.items?.length) {
      throw new BadRequestException('Позиции заказа не заполнены');
    }

    // Проверяем, что товары существуют и активны
    const productIds = dto.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      select: { id: true },
    });
    const existingIds = new Set(products.map((p) => p.id));
    const missing = productIds.filter((id) => !existingIds.has(id));
    if (missing.length) {
      throw new NotFoundException(`Товары недоступны: ${missing.join(', ')}`);
    }

    const totalAmount = dto.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const order = await this.prisma.order.create({
      data: {
        userId: userId ?? null,
        token: '',
        totalAmount,
        status: dto.status ?? OrderStatus.PENDING,
        items: dto.items as unknown as Prisma.InputJsonValue,
        fullName: dto.fullName,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
      },
    });

    const params = new URLSearchParams({
      'quickpay-form': 'shop',
      receiver,
      sum: (totalAmount / 100).toFixed(2), // если price в копейках
      paymentType: 'AC', // банковская карта
      label: order.id,
      targets: `Order ${order.id}`,
      successURL:
        process.env.YOOMONEY_SUCCESS_URL ??
        'http://localhost:5000/payment/success',
      failURL:
        process.env.YOOMONEY_FAIL_URL ?? 'http://localhost:5000/payment/fail',
    });

    const paymentUrl = `https://yoomoney.ru/quickpay/confirm?${params.toString()}`;

    return {
      order,
      paymentUrl,
    };
  }
}
