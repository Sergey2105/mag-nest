import {
  IsArray,
  ValidateNested,
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  IsEmail,
  IsNotEmpty,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../../../generated/prisma/enums';

export class OrderItemDto {
  @IsString({ message: 'ProductId должен быть строкой' })
  productId: string;

  @IsInt({ message: 'Цена должна быть целым числом (в копейках)' })
  @Min(0)
  price: number;

  @IsInt({ message: 'Количество должно быть целым числом' })
  @Min(1)
  quantity: number;
}

export class OrderDto {
  @IsOptional()
  @IsEnum(OrderStatus, { message: 'Некорректный статус заказа' })
  status?: OrderStatus;

  @IsArray({ message: 'Items должен быть массивом' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  address: string;
}
