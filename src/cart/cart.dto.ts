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

  @IsBoolean()
  @IsOptional()
  readonly asSecondItem?: boolean;
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
    asSecondItem?: boolean;
  }[];
}

export class ValidateCartItemDto {
  @IsInt()
  @Type(() => Number)
  productId: number;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity: number;
}

export class ValidateCartDto {
  @IsArray()
  items: ValidateCartItemDto[];
}
