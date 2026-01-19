import { Auth } from '@/auth/decorators/auth.decorator';
import { CurrentUser } from '@/auth/decorators/user.decorator';
import { Body, Controller, Delete, Get, Post, Patch } from '@nestjs/common';
import {
  AddToCartDto,
  RemoveFromCartDto,
  SyncCartDto,
  UpdateCartItemDto,
  ValidateCartDto,
} from './cart.dto';
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

  @Patch('increment')
  @Auth()
  async incrementItem(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return await this.cartService.incrementItem(userId, dto.cartItemId);
  }

  @Patch('decrement')
  @Auth()
  async decrementItem(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return await this.cartService.decrementItem(userId, dto.cartItemId);
  }

  @Delete()
  @Auth()
  async removeFromCart(
    @CurrentUser('id') userId: string,
    @Body() removeFromCartDto: RemoveFromCartDto,
  ) {
    return await this.cartService.removeFromCart(userId, removeFromCartDto);
  }

  @Post('sync')
  @Auth()
  async syncCart(@CurrentUser('id') userId: string, @Body() dto: SyncCartDto) {
    return this.cartService.syncCart(userId, dto);
  }
  @Post('validate')
  @Auth()
  async validateCart(@CurrentUser('id') userId: string) {
    return this.cartService.validateCart(userId);
  }

  @Post('validate-guest')
  validateGuestCart(@Body() dto: ValidateCartDto) {
    return this.cartService.validateGuestCart(dto);
  }
}
