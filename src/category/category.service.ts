/* eslint-disable @typescript-eslint/no-unsafe-assignment */
//типизапция
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CategoryDto, UpdateCategoryDto } from './dto/category.dto';
import slugify from '@sindresorhus/slugify';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CategoryDto) {
    const slug = slugify(dto.name);

    // Проверяем, существует ли уже категория с таким именем или slug
    const existingCategory = await this.prisma.category.findFirst({
      where: {
        OR: [{ name: dto.name }, { slug: slug }],
      },
    });

    if (existingCategory) {
      throw new ConflictException('Категория с таким именем уже существует');
    }

    return this.prisma.category.create({
      data: {
        name: dto.name,
        images: dto.images,
        slug,
      },
    });
  }

  async getById(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Категория не найдена');
    }

    return category;
  }

  async getAll() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.getById(id); // проверка наличия категории

    // Если обновляется имя, проверяем уникальность нового имени/slug
    if (dto.name && dto.name !== category.name) {
      const newSlug = slugify(dto.name);

      const existingCategory = await this.prisma.category.findFirst({
        where: {
          AND: [
            { id: { not: id } }, // исключаем текущую категорию
            {
              OR: [{ name: dto.name }, { slug: newSlug }],
            },
          ],
        },
      });

      if (existingCategory) {
        throw new ConflictException('Категория с таким именем уже существует');
      }

      return this.prisma.category.update({
        where: { id },
        data: {
          ...dto,
          slug: newSlug,
        },
      });
    }

    // Если имя не обновляется, просто обновляем другие поля
    return this.prisma.category.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string) {
    await this.getById(id); // проверка наличия

    return this.prisma.category.delete({
      where: { id },
    });
  }
}
