import { CurrentUser } from '@/auth/decorators/user.decorator';
import { FavoritesService } from './favorite.service';
import { Controller, Get, Param, Post } from '@nestjs/common';
import { Auth } from '@/auth/decorators/auth.decorator';

@Controller('favorites')
@Auth()
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post(':productId/toggle')
  async toggle(
    @CurrentUser('id') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.favoritesService.toggleFavorite(userId, productId);
  }

  @Get()
  async getFavorites(@CurrentUser('id') userId: string) {
    return this.favoritesService.getFavorites(userId);
  }
}
