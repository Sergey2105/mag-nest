import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsArray,
  IsInt,
  Min,
  IsPositive,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class ProductDto {
  @IsString({ message: 'Название должно быть строкой' })
  @IsNotEmpty({ message: 'Название обязательно' })
  @MinLength(2, { message: 'Название должно быть минимум 2 символа' })
  name: string;

  @IsArray({ message: 'Изображения должны быть массивом' })
  @IsString({ each: true, message: 'Каждое изображение должно быть строкой' })
  @IsNotEmpty({ message: 'Изображения обязательны' })
  images: string[];

  @IsInt({ message: 'Цена должна быть целым числом' })
  @IsPositive({ message: 'Цена должна быть положительной' })
  @Min(1, { message: 'Цена должна быть минимум 1' })
  price: number;

  @IsString({ message: 'Описание должно быть строкой' })
  @IsNotEmpty({ message: 'Описание обязательно' })
  @MinLength(10, { message: 'Описание должно быть минимум 10 символов' })
  description: string;

  @IsString({ message: 'ID категории должен быть строкой' })
  @IsNotEmpty({ message: 'ID категории обязателен' })
  categoryID: string;

  @IsOptional()
  @IsBoolean({ message: 'Флаг активности должен быть boolean' })
  isActive?: boolean; // По умолчанию true в базе
}

export class UpdateProductDto {
  @IsOptional()
  @IsString({ message: 'Название должно быть строкой' })
  @MinLength(2, { message: 'Название должно быть минимум 2 символа' })
  name?: string;

  @IsOptional()
  @IsArray({ message: 'Изображения должны быть массивом' })
  @IsString({ each: true, message: 'Каждое изображение должно быть строкой' })
  images?: string[];

  @IsOptional()
  @IsInt({ message: 'Цена должна быть целым числом' })
  @IsPositive({ message: 'Цена должна быть положительной' })
  @Min(1, { message: 'Цена должна быть минимум 1' })
  price?: number;

  @IsOptional()
  @IsString({ message: 'Описание должно быть строкой' })
  @MinLength(10, { message: 'Описание должно быть минимум 10 символов' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'ID категории должен быть строкой' })
  categoryID?: string;

  @IsOptional()
  @IsBoolean({ message: 'Флаг активности должен быть boolean' })
  isActive?: boolean;
}
