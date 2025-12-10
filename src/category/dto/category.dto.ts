import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CategoryDto {
  @IsString({ message: 'Название должно быть строкой' })
  @IsNotEmpty({ message: 'Название обязательно' })
  @MinLength(2, { message: 'Название должно быть минимум 2 символа' })
  name: string;

  @IsString({ message: 'URL изображения должен быть строкой' })
  @IsNotEmpty({ message: 'Изображение обязательно' })
  images: string;
}

export class UpdateCategoryDto extends PartialType(CategoryDto) {}
