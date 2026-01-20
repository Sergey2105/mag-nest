import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsArray,
  IsNumber,
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

  @IsNumber({}, { message: 'Цена должна быть числом' })
  @IsPositive({ message: 'Цена должна быть положительной' })
  @Min(0.01, { message: 'Цена должна быть минимум 0.01' })
  price: number;

  @IsOptional()
  @IsNumber({}, { message: 'Цена со скидкой должна быть числом' })
  @IsPositive({ message: 'Цена со скидкой должна быть положительной' })
  @Min(0.01, { message: 'Цена со скидкой должна быть минимум 0.01' })
  discountPrice?: number;

  @IsString({ message: 'Описание должно быть строкой' })
  @IsNotEmpty({ message: 'Описание обязательно' })
  @MinLength(10, { message: 'Описание должно быть минимум 10 символов' })
  description: string;

  @IsString({ message: 'ID категории должен быть строкой' })
  @IsNotEmpty({ message: 'ID категории обязателен' })
  categoryID: string;

  @IsOptional()
  @IsBoolean({ message: 'Флаг активности должен быть boolean' })
  isActive?: boolean;


  @IsNumber({}, { message: 'Количество на складе должно быть числом' })
  @Min(0, { message: 'Количество на складе не может быть меньше 0' })
  stock: number;
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
  @IsNumber({}, { message: 'Цена должна быть числом' })
  @IsPositive({ message: 'Цена должна быть положительной' })
  @Min(0.01, { message: 'Цена должна быть минимум 0.01' })
  price?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Цена со скидкой должна быть числом' })
  @IsPositive({ message: 'Цена со скидкой должна быть положительной' })
  @Min(0.01, { message: 'Цена со скидкой должна быть минимум 0.01' })
  discountPrice?: number;

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

  @IsOptional()
  @IsNumber({}, { message: 'Количество на складе должно быть числом' })
  @Min(0, { message: 'Количество на складе не может быть меньше 0' })
  stock?: number;
}
