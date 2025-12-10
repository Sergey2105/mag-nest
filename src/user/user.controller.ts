import { Controller, Param, Get, Patch } from '@nestjs/common';
import { UserService } from './user.service.js';
import { CurrentUser } from './decorator/user.decorator.js';
import { Auth } from '../auth/decorators/auth.decorator.js';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Auth()
  @Get('profile')
  async getProfile(@CurrentUser('id') id: string) {
    return this.userService.getById(id);
  }

  @Auth()
  @Patch('profile/favorites/:productId')
  async toggleFavorite(
    @CurrentUser('id') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.userService.toggleFavorites(productId, userId);
  }
}
