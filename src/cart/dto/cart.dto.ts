import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  Min,
} from 'class-validator';

export class AddToCartDto {
  @IsString()
  @IsNotEmpty()
  readonly productId: string;

  @IsInt()
  @Type(() => Number)
  readonly quantity: number;
}

export class UpdateCartItemDto {
  cartItemId: string;
}

export class RemoveFromCartDto {
  @IsString()
  @IsNotEmpty()
  readonly cartItemId: string;
}

export interface SyncCartDto {
  items: {
    product: {
      id: string;
    };
    quantity: number;
  }[];
}
export class NormalizeGuestCartItemDto {
  @IsInt()
  @Type(() => Number)
  productId: number;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity: number;
}

export class NormalizeGuestCartDto {
  @IsArray()
  items: NormalizeGuestCartItemDto[];
}
