import { Injectable } from '@nestjs/common';
import {
  AddToCartDto,
  RemoveFromCartDto,
  SyncCartDto,
  ValidateCartDto,
} from './cart.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async addToCart(userId: string, addToCartDto: AddToCartDto) {
    const { productId, quantity, asSecondItem } = addToCartDto;

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
          asSecondItem,
        },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          asSecondItem,
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
            asSecondItem: item.asSecondItem,
          },
        });
      } else {
        await this.prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: item.product.id,
            quantity: item.quantity,
            asSecondItem: item.asSecondItem,
          },
        });
      }
    }

    return this.getCart(userId);
  }

  async validateCart(userId: string) {
    const cart = await this.prisma.cart.findFirst({
      where: { userId, status: 'ACTIVE' }, // фильтр по ACTIVE корзине
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                isActive: true,
                stock: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      return {
        cartId: null,
        valid: true,
        items: [],
      };
    }

    const items = cart.items.map((item) => {
      const product = item.product;

      if (!product) {
        return {
          cartItemId: item.id,
          productId: item.productId,
          exists: false,
          isActive: false,
          stock: 0,
          requestedQuantity: item.quantity,
          allowedQuantity: 0,
        };
      }

      const stock = product.stock ?? 0;
      const isActive = product.isActive && stock > 0;

      return {
        cartItemId: item.id,
        productId: item.productId,
        productName: product.name,
        exists: true,
        isActive,
        stock,
        requestedQuantity: item.quantity,
        allowedQuantity: isActive ? Math.min(item.quantity, stock) : 0,
      };
    });

    const valid = items.every(
      (i) =>
        i.exists && i.isActive && i.allowedQuantity === i.requestedQuantity,
    );

    return {
      cartId: cart.id,
      valid,
      items,
    };
  }

  async validateGuestCart(dto: ValidateCartDto) {
    const productIds = dto.items.map((i) => String(i.productId));

    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
      select: {
        id: true,
        isActive: true,
        stock: true,
      },
    });

    const productMap = new Map(products.map((p) => [Number(p.id), p]));

    const items = dto.items.map((item) => {
      const product = productMap.get(item.productId);

      // ❌ товар удалён
      if (!product) {
        return {
          productId: item.productId,
          exists: false,
          isActive: false,
          stock: 0,
          requestedQuantity: item.quantity,
          allowedQuantity: 0,
        };
      }

      const stock = product.stock ?? 0;
      const isActive = product.isActive && stock > 0;

      return {
        productId: item.productId,
        exists: true,
        isActive,
        stock,
        requestedQuantity: item.quantity,
        allowedQuantity: isActive ? Math.min(item.quantity, stock) : 0,
      };
    });

    const valid = items.every(
      (i) =>
        i.exists && i.isActive && i.allowedQuantity === i.requestedQuantity,
    );

    return {
      valid,
      items,
    };
  }
}
