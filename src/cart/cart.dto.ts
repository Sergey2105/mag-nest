import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
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
