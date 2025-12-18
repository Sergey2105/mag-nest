import { Auth } from '@/auth/decorators/auth.decorator';
import { CurrentUser } from '@/auth/decorators/user.decorator';
import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { AddToCartDto, RemoveFromCartDto } from './cart.dto';
import { CartService } from './cart.service';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @Auth()
  async addToCart(
    @CurrentUser('id') userId: string,
    @Body() addToCartDto: AddToCartDto,
  ) {
    return await this.cartService.addToCart(userId, addToCartDto);
  }

  @Get()
  @Auth()
  async getCart(@CurrentUser('id') userId: string) {
    return await this.cartService.getCart(userId);
  }

  @Delete()
  @Auth()
  async removeFromCart(
    @CurrentUser('id') userId: string,
    @Body() removeFromCartDto: RemoveFromCartDto,
  ) {
    return await this.cartService.removeFromCart(userId, removeFromCartDto);
  }
}
