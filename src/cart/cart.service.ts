import { Injectable } from '@nestjs/common';
import { AddToCartDto, RemoveFromCartDto, SyncCartDto } from './dto/cart.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async addToCart(userId: string, addToCartDto: AddToCartDto) {
    const { productId, quantity } = addToCartDto;

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: {
        isActive: true,
        stock: true,
      },
    });

    if (!product || !product.isActive || (product.stock ?? 0) <= 0) {
      throw new Error('Товар недоступен');
    }

    let cart = await this.prisma.cart.findFirst({
      where: { userId, status: 'ACTIVE' },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId, status: 'ACTIVE' },
      });
    }

    const existingCartItem = await this.prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    const maxAllowed = product.stock ?? 0;

    if (existingCartItem) {
      await this.prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: Math.min(existingCartItem.quantity + quantity, maxAllowed),
        },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity: Math.min(quantity, maxAllowed),
        },
      });
    }

    return this.getCart(userId);
  }

  async getCart(userId: string) {
    const cart = await this.prisma.cart.findFirst({
      where: { userId, status: 'ACTIVE' },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      return { items: [] };
    }

    const updates = cart.items
      .filter(
        (item) =>
          !item.product ||
          !item.product.isActive ||
          item.quantity > (item.product.stock ?? 0),
      )
      .map((item) =>
        this.prisma.cartItem.update({
          where: { id: item.id },
          data: {
            quantity: Math.min(item.quantity, item.product?.stock ?? 0),
          },
        }),
      );

    if (updates.length) {
      await this.prisma.$transaction(updates);
    }

    return {
      cartId: cart.id,
      items: cart.items.map((item) => {
        const stock = item.product?.stock ?? 0;
        const isAvailable = item.product?.isActive && stock > 0;

        return {
          id: item.id,
          quantity: item.quantity,
          product: {
            ...item.product,
            stock,
            isAvailable,
          },
        };
      }),
    };
  }
  async incrementItem(userId: string, cartItemId: string) {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true, product: true },
    });

    if (!cartItem || cartItem.cart.userId !== userId) {
      throw new Error('Cart item not found');
    }

    if (
      !cartItem.product.isActive ||
      cartItem.quantity >= (cartItem.product.stock ?? 0)
    ) {
      return this.getCart(userId);
    }

    await this.prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity: cartItem.quantity + 1 },
    });

    return this.getCart(userId);
  }

  async decrementItem(userId: string, cartItemId: string) {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    });

    if (!cartItem || cartItem.cart.userId !== userId) {
      throw new Error('Cart item not found or does not belong to user');
    }

    if (cartItem.quantity === 1) {
      await this.prisma.cartItem.delete({
        where: { id: cartItemId },
      });

      return this.getCart(userId);
    }

    await this.prisma.cartItem.update({
      where: { id: cartItemId },
      data: {
        quantity: cartItem.quantity - 1,
      },
    });

    return this.getCart(userId);
  }

  async removeFromCart(userId: string, removeFromCartDto: RemoveFromCartDto) {
    const { cartItemId } = removeFromCartDto;

    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    });

    if (!cartItem || cartItem.cart.userId !== userId) {
      throw new Error('Cart item not found or does not belong to user');
    }

    await this.prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    return this.getCart(userId);
  }

  async syncCart(userId: string, syncDto: SyncCartDto) {
    let cart = await this.prisma.cart.findFirst({
      where: { userId, status: 'ACTIVE' },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId, status: 'ACTIVE' },
      });
    }

    for (const item of syncDto.items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.product.id },
        select: {
          isActive: true,
          stock: true,
        },
      });

      if (!product || !product.isActive || (product.stock ?? 0) <= 0) {
        continue;
      }

      const existing = await this.prisma.cartItem.findFirst({
        where: { cartId: cart.id, productId: item.product.id },
      });

      const quantity = Math.min(item.quantity, product.stock ?? 0);

      if (existing) {
        await this.prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity },
        });
      } else {
        await this.prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: item.product.id,
            quantity,
          },
        });
      }
    }

    return this.getCart(userId);
  }

  async normalizeGuestCart(dto: {
    items: { productId: string; quantity: number }[];
  }) {
    const productIds = dto.items.map((i) => i.productId);

    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    const items = dto.items.map((item) => {
      const product = productMap.get(item.productId);

      if (!product) {
        return {
          quantity: 0,
          product: {
            id: item.productId,
            isAvailable: false,
            stock: 0,
          },
        };
      }

      const stock = product.stock ?? 0;
      const isAvailable = product.isActive && stock > 0;

      return {
        quantity: Math.min(item.quantity, stock),
        product: {
          ...product,
          stock,
          isAvailable,
        },
      };
    });

    return { items };
  }
}
