import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async createOrder(userId: string, promoCode?: string) {
    let cart = await this.prisma.cart.findFirst({
      where: { userId, status: 'ACTIVE' },
      include: { items: { include: { product: true } } },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId, status: 'ACTIVE' },
        include: { items: { include: { product: true } } },
      });
    }

    if (!cart.items.length) {
      throw new NotFoundException('Cart is empty');
    }

    let totalPrice = cart.items.reduce((sum, item) => {
      const price = item.product.price;
      return sum + item.quantity * price;
    }, 0);

    let promoCodeData = null;
    if (promoCode) {
      promoCodeData = await this.prisma.promoCode.findUnique({
        where: { code: promoCode },
      });
      if (promoCodeData) {
        totalPrice -= totalPrice * (promoCodeData.discount / 100);
      }
    }

    const newOrder = await this.prisma.order.create({
      data: {
        userId,
        cartId: cart.id,
        status: 'pending',
        promoCodeId: promoCodeData ? promoCodeData.id : null,
        total: totalPrice,
      },
    });

    await this.prisma.cart.update({
      where: { id: cart.id },
      data: { status: 'PAID' },
    });

    return newOrder;
  }

  async getAll() {
    const orders = await this.prisma.order.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: { cart: { include: { items: { include: { product: true } } } } },
    });
    return orders;
  }
}
