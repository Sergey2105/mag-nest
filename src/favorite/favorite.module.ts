import { FavoritesController } from './favorite.controller';
import { Module } from '@nestjs/common';
import { FavoritesService } from './favorite.service';

@Module({
  controllers: [FavoritesController],
  providers: [FavoritesService],
  exports: [FavoritesService],
})
export class FavoritesModule {}
