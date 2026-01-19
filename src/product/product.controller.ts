import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  Patch,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductDto, UpdateProductDto } from './dto/product.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // ===============================
  // CREATE
  // ===============================

  @Post()
  // async create(@Body() dto: ProductDto) {
  //   return this.productService.create(dto);
  // }

  // ===============================
  // PUBLIC
  // ===============================

  // @Get()
  // async getAll(
  //   @Query('categoryId') categoryId?: string,
  //   @Query('search') search?: string,
  //   @Query('minPrice') minPrice?: number,
  //   @Query('maxPrice') maxPrice?: number,
  //   @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
  //   @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  //   @Query('sortBy') sortBy?: 'name' | 'price' | 'createdAt',
  //   @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  // ) {
  //   return this.productService.getAll({
  //     categoryId,
  //     search,
  //     minPrice,
  //     maxPrice,
  //     page,
  //     limit,
  //     sortBy,
  //     sortOrder,
  //   });
  // }

  //ИСПОЛЬЗУЮ
  @Get('by-slug/:slug')
  async getProductsByCategorySlug(
    @Param('slug') slug: string,
    @Query('search') search?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: 'name' | 'price' | 'createdAt',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const options = {
      search,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      sortBy: sortBy || 'createdAt',
      sortOrder: sortOrder || 'desc',
    };

    // Сервис уже возвращает isActive и stock
    return this.productService.getProductsByCategorySlug(slug, options);
  }
  //ИСПОЛЬЗУЮ
  @Get('without-pagination')
  async getAllWithoutPagination(
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('sortBy') sortBy?: 'name' | 'price' | 'createdAt',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const options = {
      categoryId,
      search,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sortBy,
      sortOrder,
    };

    // Сервис уже возвращает isActive и stock
    return this.productService.getAllWithoutPagination(options);
  }
  // @Get('category-id/:categoryId')
  // async getByCategoryId(
  //   @Param('categoryId') categoryId: string,
  //   @Query('search') search?: string,
  //   @Query('minPrice') minPrice?: number,
  //   @Query('maxPrice') maxPrice?: number,
  //   @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
  //   @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  //   @Query('sortBy') sortBy?: 'name' | 'price' | 'createdAt',
  //   @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  // ) {
  //   return this.productService.getProductsByCategoryId(categoryId, {
  //     search,
  //     minPrice,
  //     maxPrice,
  //     page,
  //     limit,
  //     sortBy,
  //     sortOrder,
  //   });
  // }

  // @Get('category/:categorySlug')
  // async getByCategorySlug(
  //   @Param('categorySlug') categorySlug: string,
  //   @Query('search') search?: string,
  //   @Query('minPrice') minPrice?: number,
  //   @Query('maxPrice') maxPrice?: number,
  //   @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
  //   @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  //   @Query('sortBy') sortBy?: 'name' | 'price' | 'createdAt',
  //   @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  // ) {
  //   return this.productService.getProductsByCategorySlug(categorySlug, {
  //     search,
  //     minPrice,
  //     maxPrice,
  //     page,
  //     limit,
  //     sortBy,
  //     sortOrder,
  //   });
  // }

  // ===============================
  // ADMIN
  // ===============================

  // @Get('admin/all')
  // async getAllForAdmin(
  //   @Query('categoryId') categoryId?: string,
  //   @Query('search') search?: string,
  //   @Query('minPrice') minPrice?: number,
  //   @Query('maxPrice') maxPrice?: number,
  //   @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
  //   @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  //   @Query('sortBy') sortBy?: 'name' | 'price' | 'createdAt',
  //   @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  //   @Query('isActive') isActive?: boolean,
  // ) {
  //   return this.productService.getAllForAdmin({
  //     categoryId,
  //     search,
  //     minPrice,
  //     maxPrice,
  //     page,
  //     limit,
  //     sortBy,
  //     sortOrder,
  //     isActive,
  //   });
  // }

  // @Get('admin/:id')
  // async getByIdForAdmin(@Param('id') id: string) {
  //   return this.productService.getByIdForAdmin(id);
  // }

  // ===============================
  // ID — СТРОГО В КОНЦЕ
  // ===============================

  // @Get(':id')
  // async getById(@Param('id') id: string) {
  //   return this.productService.getById(id);
  // }

  // @Put(':id')
  // async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
  //   return this.productService.update(id, dto);
  // }

  // @Delete(':id')
  // async delete(@Param('id') id: string) {
  //   return this.productService.delete(id);
  // }

  // @Patch(':id/deactivate')
  // async deactivate(@Param('id') id: string) {
  //   return this.productService.deactivate(id);
  // }

  // @Patch(':id/activate')
  // async activate(@Param('id') id: string) {
  //   return this.productService.activate(id);
  // }
}
