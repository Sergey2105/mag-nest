import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma, OrderStatus } from '../../generated/prisma/client';
import slugify from '@sindresorhus/slugify';
import { ProductDto, UpdateProductDto } from './dto/product.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  // async create(dto: ProductDto) {
  //   // Проверяем существование категории
  //   const categoryExists = await this.prisma.category.findUnique({
  //     where: { id: dto.categoryID },
  //   });

  //   if (!categoryExists) {
  //     throw new NotFoundException('Категория не найдена');
  //   }

  //   // Генерируем slug
  //   const slug = slugify(dto.name);

  //   // Проверяем, существует ли уже продукт с таким именем или slug
  //   const existingProduct = await this.prisma.product.findFirst({
  //     where: {
  //       OR: [{ name: dto.name }, { slug: slug }],
  //     },
  //   });

  //   if (existingProduct) {
  //     throw new ConflictException('Продукт с таким названием уже существует');
  //   }

  //   // Валидация изображений
  //   this.validateImages(dto.images);

  //   return this.prisma.product.create({
  //     data: {
  //       name: dto.name,
  //       images: dto.images,
  //       price: dto.price,
  //       discountPrice: dto.discountPrice ?? dto.price, // Устанавливаем discountPrice
  //       description: dto.description,
  //       categoryID: dto.categoryID,
  //       isActive: dto.isActive ?? true,
  //       // isHasSecondDiscount: dto.isHasSecondDiscount ?? false,
  //       slug,
  //     },
  //     include: {
  //       category: {
  //         select: {
  //           id: true,
  //           name: true,
  //           slug: true,
  //         },
  //       },
  //     },
  //   });
  // }

  // Для публичного доступа - только активные продукты
  // async getById(id: string) {
  //   const product = await this.prisma.product.findUnique({
  //     where: { id },
  //     include: {
  //       category: {
  //         select: {
  //           id: true,
  //           name: true,
  //           slug: true,
  //           images: true,
  //         },
  //       },
  //     },
  //   });

  //   if (!product || !product.isActive) {
  //     throw new NotFoundException('Продукт не найден или недоступен');
  //   }

  //   return product;
  // }

  // Для админки - продукт в любом статусе
  // async getByIdForAdmin(id: string) {
  //   const product = await this.prisma.product.findUnique({
  //     where: { id },
  //     include: {
  //       category: {
  //         select: {
  //           id: true,
  //           name: true,
  //           slug: true,
  //           images: true,
  //         },
  //       },
  //     },
  //   });

  //   if (!product) {
  //     throw new NotFoundException('Продукт не найден');
  //   }

  //   return product;
  // }

  // async getBySlug(slug: string) {
  //   const product = await this.prisma.product.findFirst({
  //     where: {
  //       slug,
  //       isActive: true,
  //     },
  //     include: {
  //       category: {
  //         select: {
  //           id: true,
  //           name: true,
  //           slug: true,
  //           images: true,
  //         },
  //       },
  //     },
  //   });

  //   if (!product) {
  //     throw new NotFoundException('Продукт не найден или недоступен');
  //   }

  //   return product;
  // }

  // Публичный метод - только активные продукты
  // async getAll(options?: {
  //   categoryId?: string;
  //   search?: string;
  //   minPrice?: number;
  //   maxPrice?: number;
  //   page?: number;
  //   limit?: number;
  //   sortBy?: 'name' | 'price' | 'createdAt';
  //   sortOrder?: 'asc' | 'desc';
  //   includeInactive?: boolean;
  // }) {
  //   const {
  //     categoryId,
  //     search,
  //     minPrice,
  //     maxPrice,
  //     page = 1,
  //     limit = 20,
  //     sortBy = 'createdAt',
  //     sortOrder = 'desc',
  //     includeInactive = false,
  //   } = options || {};

  //   const where: Prisma.ProductWhereInput = {};

  //   if (!includeInactive) {
  //     where.isActive = true;
  //   }

  //   if (categoryId) {
  //     where.categoryID = categoryId;
  //   }

  //   if (search) {
  //     where.OR = [
  //       { name: { contains: search, mode: 'insensitive' } },
  //       { description: { contains: search, mode: 'insensitive' } },
  //     ];
  //   }

  //   if (minPrice !== undefined || maxPrice !== undefined) {
  //     const priceFilter: Prisma.FloatFilter = {}; // Изменено на FloatFilter
  //     if (minPrice !== undefined) {
  //       priceFilter.gte = minPrice;
  //     }
  //     if (maxPrice !== undefined) {
  //       priceFilter.lte = maxPrice;
  //     }
  //     where.price = priceFilter;
  //   }

  //   const skip = (page - 1) * limit;

  //   const [products, total] = await Promise.all([
  //     this.prisma.product.findMany({
  //       where,
  //       skip,
  //       take: limit,
  //       orderBy: { [sortBy]: sortOrder },
  //       include: {
  //         category: {
  //           select: {
  //             id: true,
  //             name: true,
  //             slug: true,
  //           },
  //         },
  //       },
  //     }),
  //     this.prisma.product.count({ where }),
  //   ]);

  //   return {
  //     products,
  //     pagination: {
  //       total,
  //       page,
  //       limit,
  //       totalPages: Math.ceil(total / limit),
  //     },
  //   };
  // }

  //ИСПОЛЬЗУЮ
  async getAllWithoutPagination(options?: {
    categoryId?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'name' | 'price' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
    includeInactive?: boolean;
  }) {
    const {
      categoryId,
      search,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      includeInactive = false,
    } = options || {};

    const where: Prisma.ProductWhereInput = {};

    if (!includeInactive) {
      where.isActive = true;
    }

    if (categoryId) {
      where.categoryID = categoryId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceFilter: Prisma.FloatFilter = {};

      if (minPrice !== undefined) {
        priceFilter.gte = minPrice;
      }

      if (maxPrice !== undefined) {
        priceFilter.lte = maxPrice;
      }

      where.price = priceFilter;
    }

    const products = await this.prisma.product.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // --------------------------
    // Добавляем stock и актуальный isActive для фронта
    // --------------------------
    const productsWithStock = products.map((p) => ({
      ...p,
      // isActive = true только если товар активен и есть на складе
      isActive: p.isActive && (p.stock ?? 0) > 0,
      stock: p.stock ?? 0,
    }));

    return productsWithStock;
  }

  // Метод для админки - все продукты
  // async getAllForAdmin(options?: {
  //   categoryId?: string;
  //   search?: string;
  //   minPrice?: number;
  //   maxPrice?: number;
  //   page?: number;
  //   limit?: number;
  //   sortBy?: 'name' | 'price' | 'createdAt';
  //   sortOrder?: 'asc' | 'desc';
  //   isActive?: boolean;
  // }) {
  //   const {
  //     categoryId,
  //     search,
  //     minPrice,
  //     maxPrice,
  //     page = 1,
  //     limit = 20,
  //     sortBy = 'createdAt',
  //     sortOrder = 'desc',
  //     isActive,
  //   } = options || {};

  //   const where: Prisma.ProductWhereInput = {};

  //   if (isActive !== undefined) {
  //     where.isActive = isActive;
  //   }

  //   if (categoryId) {
  //     where.categoryID = categoryId;
  //   }

  //   if (search) {
  //     where.OR = [
  //       { name: { contains: search, mode: 'insensitive' } },
  //       { description: { contains: search, mode: 'insensitive' } },
  //     ];
  //   }

  //   if (minPrice !== undefined || maxPrice !== undefined) {
  //     const priceFilter: Prisma.FloatFilter = {}; // Изменено на FloatFilter
  //     if (minPrice !== undefined) {
  //       priceFilter.gte = minPrice;
  //     }
  //     if (maxPrice !== undefined) {
  //       priceFilter.lte = maxPrice;
  //     }
  //     where.price = priceFilter;
  //   }

  //   const skip = (page - 1) * limit;

  //   const [products, total] = await Promise.all([
  //     this.prisma.product.findMany({
  //       where,
  //       skip,
  //       take: limit,
  //       orderBy: { [sortBy]: sortOrder },
  //       include: {
  //         category: {
  //           select: {
  //             id: true,
  //             name: true,
  //             slug: true,
  //           },
  //         },
  //       },
  //     }),
  //     this.prisma.product.count({ where }),
  //   ]);

  //   return {
  //     products,
  //     pagination: {
  //       total,
  //       page,
  //       limit,
  //       totalPages: Math.ceil(total / limit),
  //     },
  //   };
  // }

  // async update(id: string, dto: UpdateProductDto) {
  //   const product = await this.getByIdForAdmin(id);

  //   // Если обновляется категория, проверяем её существование
  //   if (dto.categoryID && dto.categoryID !== product.categoryID) {
  //     const categoryExists = await this.prisma.category.findUnique({
  //       where: { id: dto.categoryID },
  //     });

  //     if (!categoryExists) {
  //       throw new NotFoundException('Категория не найдена');
  //     }
  //   }

  //   // Если обновляется имя, проверяем уникальность
  //   if (dto.name && dto.name !== product.name) {
  //     const newSlug = slugify(dto.name);

  //     const existingProduct = await this.prisma.product.findFirst({
  //       where: {
  //         AND: [
  //           { id: { not: id } },
  //           {
  //             OR: [{ name: dto.name }, { slug: newSlug }],
  //           },
  //         ],
  //       },
  //     });

  //     if (existingProduct) {
  //       throw new ConflictException('Продукт с таким названием уже существует');
  //     }

  //     // Валидация изображений если они обновляются
  //     if (dto.images) {
  //       this.validateImages(dto.images);
  //     }

  //     return this.prisma.product.update({
  //       where: { id },
  //       data: {
  //         ...dto,
  //         slug: newSlug,
  //       },
  //       include: {
  //         category: {
  //           select: {
  //             id: true,
  //             name: true,
  //             slug: true,
  //           },
  //         },
  //       },
  //     });
  //   }

  //   // Валидация изображений если они обновляются
  //   if (dto.images) {
  //     this.validateImages(dto.images);
  //   }

  //   // Обновляем без изменения slug
  //   return this.prisma.product.update({
  //     where: { id },
  //     data: dto,
  //     include: {
  //       category: {
  //         select: {
  //           id: true,
  //           name: true,
  //           slug: true,
  //         },
  //       },
  //     },
  //   });
  // }

  // async delete(id: string) {
  //   const product = await this.getByIdForAdmin(id);

  //   // Проверяем, есть ли продукт в корзинах с оплаченными заказами
  //   const inActiveCarts = await this.prisma.cartItem.findFirst({
  //     where: {
  //       productId: id,
  //       cart: {
  //         order: {
  //           status: {
  //             notIn: [OrderStatus.canceled, OrderStatus.completed],
  //           },
  //         },
  //       },
  //     },
  //   });

  //   if (inActiveCarts) {
  //     // Вместо удаления деактивируем продукт
  //     return this.prisma.product.update({
  //       where: { id },
  //       data: {
  //         isActive: false,
  //         name: `${product.name} [НЕТ В НАЛИЧИИ]`,
  //       },
  //       include: {
  //         category: {
  //           select: {
  //             id: true,
  //             name: true,
  //             slug: true,
  //           },
  //         },
  //       },
  //     });
  //   }

  //   // Если нет активных заказов, можно удалить
  //   return this.prisma.product.delete({
  //     where: { id },
  //   });
  // }

  // Деактивация продукта (мягкое удаление)
  // async deactivate(id: string) {
  //   const product = await this.getByIdForAdmin(id);

  //   return this.prisma.product.update({
  //     where: { id },
  //     data: {
  //       isActive: false,
  //       name: `${product.name} [НЕТ В НАЛИЧИИ]`,
  //     },
  //     include: {
  //       category: {
  //         select: {
  //           id: true,
  //           name: true,
  //           slug: true,
  //         },
  //       },
  //     },
  //   });
  // }

  // Активация продукта
  // async activate(id: string) {
  //   const product = await this.getByIdForAdmin(id);

  //   // Убираем пометку о недоступности из имени
  //   const cleanedName = product.name.replace(' [НЕТ В НАЛИЧИИ]', '');

  //   return this.prisma.product.update({
  //     where: { id },
  //     data: {
  //       isActive: true,
  //       name: cleanedName,
  //     },
  //     include: {
  //       category: {
  //         select: {
  //           id: true,
  //           name: true,
  //           slug: true,
  //         },
  //       },
  //     },
  //   });
  // }

  /**
   * Получить продукты по ID категории (только активные)
   */
  // async getProductsByCategoryId(
  //   categoryId: string,
  //   options?: {
  //     search?: string;
  //     minPrice?: number;
  //     maxPrice?: number;
  //     page?: number;
  //     limit?: number;
  //     sortBy?: 'name' | 'price' | 'createdAt';
  //     sortOrder?: 'asc' | 'desc';
  //     includeInactive?: boolean;
  //   },
  // ) {
  //   const {
  //     search,
  //     minPrice,
  //     maxPrice,
  //     page = 1,
  //     limit = 20,
  //     sortBy = 'createdAt',
  //     sortOrder = 'desc',
  //     includeInactive = false,
  //   } = options || {};

  //   // Проверяем существование категории
  //   const category = await this.prisma.category.findUnique({
  //     where: { id: categoryId },
  //   });

  //   if (!category) {
  //     throw new NotFoundException('Категория не найдена');
  //   }

  //   const where: Prisma.ProductWhereInput = {
  //     categoryID: categoryId,
  //   };

  //   if (!includeInactive) {
  //     where.isActive = true;
  //   }

  //   if (search) {
  //     where.OR = [
  //       { name: { contains: search, mode: 'insensitive' } },
  //       { description: { contains: search, mode: 'insensitive' } },
  //     ];
  //   }

  //   if (minPrice !== undefined || maxPrice !== undefined) {
  //     const priceFilter: Prisma.FloatFilter = {};
  //     if (minPrice !== undefined) {
  //       priceFilter.gte = minPrice;
  //     }
  //     if (maxPrice !== undefined) {
  //       priceFilter.lte = maxPrice;
  //     }
  //     where.price = priceFilter;
  //   }

  //   const skip = (page - 1) * limit;

  //   const [products, total] = await Promise.all([
  //     this.prisma.product.findMany({
  //       where,
  //       skip,
  //       take: limit,
  //       orderBy: { [sortBy]: sortOrder },
  //       include: {
  //         category: {
  //           select: {
  //             id: true,
  //             name: true,
  //             slug: true,
  //             images: true,
  //           },
  //         },
  //       },
  //     }),
  //     this.prisma.product.count({ where }),
  //   ]);

  //   return {
  //     category: {
  //       id: category.id,
  //       name: category.name,
  //       slug: category.slug,
  //       images: category.images,
  //     },
  //     products,
  //     pagination: {
  //       total,
  //       page,
  //       limit,
  //       totalPages: Math.ceil(total / limit),
  //     },
  //   };
  // }

  //ИСПОЛЬЗУЮ
  /**
   * Получить продукты по slug категории (только активные)
   */
  async getProductsByCategorySlug(
    categorySlug: string,
    options?: {
      search?: string;
      minPrice?: number;
      maxPrice?: number;
      page?: number;
      limit?: number;
      sortBy?: 'name' | 'price' | 'createdAt';
      sortOrder?: 'asc' | 'desc';
      includeInactive?: boolean;
    },
  ) {
    const {
      search,
      minPrice,
      maxPrice,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      includeInactive = false,
    } = options || {};

    // --------------------------
    // Находим категорию по slug
    // --------------------------
    const category = await this.prisma.category.findUnique({
      where: { slug: categorySlug },
    });

    if (!category) {
      throw new NotFoundException('Категория не найдена');
    }

    // --------------------------
    // Формируем фильтр продуктов
    // --------------------------
    const where: Prisma.ProductWhereInput = {
      categoryID: category.id,
    };

    if (!includeInactive) {
      where.isActive = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    const skip = (page - 1) * limit;

    const orderBy: Prisma.ProductOrderByWithRelationInput[] = [
      { [sortBy]: sortOrder },
      { id: 'asc' },
    ];

    // --------------------------
    // Получаем продукты + общее количество
    // --------------------------
    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: true,
            },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    // --------------------------
    // Добавляем stock и актуальный isActive для фронта
    // --------------------------
    const productsWithStock = products.map((p) => ({
      ...p,
      // Считаем доступность: товар активен и есть на складе
      isActive: p.isActive && (p.stock ?? 0) > 0,
      stock: p.stock ?? 0,
    }));

    // --------------------------
    // Возвращаем объект с категорией, продуктами и пагинацией
    // --------------------------
    return {
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        images: category.images,
      },
      products: productsWithStock,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // private validateImages(images: string[]): void {
  //   if (!Array.isArray(images) || images.length === 0) {
  //     throw new BadRequestException(
  //       'Изображения должны быть непустым массивом',
  //     );
  //   }

  //   images.forEach((image, index) => {
  //     try {
  //       new URL(image);
  //     } catch {
  //       throw new BadRequestException(
  //         `Изображение #${index + 1} содержит некорректный URL`,
  //       );
  //     }
  //   });
  // }
}
