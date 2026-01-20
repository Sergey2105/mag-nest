import { Injectable } from '@nestjs/common';
import { AddToCartDto, RemoveFromCartDto, SyncCartDto } from './cart.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async addToCart(userId: string, addToCartDto: AddToCartDto) {
    const { productId, quantity } = addToCartDto;

    let cart = await this.prisma.cart.findFirst({
      where: { userId, status: 'ACTIVE' },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: {
          userId,
          status: 'ACTIVE',
        },
      });
    }

    const existingCartItem = await this.prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    if (existingCartItem) {
      await this.prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: existingCartItem.quantity + quantity,
        },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
    }

    return this.getCart(userId);
  }

  async getCart(userId: string) {
    return this.prisma.cart.findFirst({
      where: { userId, status: 'ACTIVE' },
      include: {
        items: { include: { product: true } },
      },
    });
  }

  async incrementItem(userId: string, cartItemId: string) {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    });

    if (!cartItem || cartItem.cart.userId !== userId) {
      throw new Error('Cart item not found or does not belong to user');
    }

    await this.prisma.cartItem.update({
      where: { id: cartItemId },
      data: {
        quantity: cartItem.quantity + 1,
      },
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
    const { items } = syncDto;

    let cart = await this.prisma.cart.findFirst({
      where: { userId, status: 'ACTIVE' },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId, status: 'ACTIVE' },
      });
    }

    for (const item of items) {
      const productExists = await this.prisma.product.findUnique({
        where: { id: item.product.id },
      });

      if (!productExists) {
        console.warn(
          `Product with ID ${item.product.id} not found, skipping...`,
        );
        continue;
      }

      const existingCartItem = await this.prisma.cartItem.findFirst({
        where: { cartId: cart.id, productId: item.product.id },
      });

      if (existingCartItem) {
        await this.prisma.cartItem.update({
          where: { id: existingCartItem.id },
          data: {
            quantity: existingCartItem.quantity + item.quantity,
          },
        });
      } else {
        await this.prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: item.product.id,
            quantity: item.quantity,
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
      select: {
        id: true,
        name: true,
        price: true,
        discountPrice: true,
        images: true,
        isActive: true,
        stock: true,
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    const items = dto.items.map((item) => {
      const product = productMap.get(item.productId);

      // if (!product) {
      //   return {
      //     productId: item.productId,
      //     // exists: false,
      //     quantity: item.quantity,
      //   };
      // }

      return {
        // productId: product.id,
        // exists: true,
        quantity: item.quantity,
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          discountPrice: product.discountPrice,
          images: product.images,
          stock: product.stock ?? 0,
          isActive: product.isActive,
        },
      };
    });

    return { items };
  }
}
