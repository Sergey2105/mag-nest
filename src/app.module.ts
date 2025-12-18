import { Module } from '@nestjs/common';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoryModule } from './category/category.module';
import { OrderModule } from './order/order.module';
import { ProductModule } from './product/product.module';
import { FileModule } from './file/file.module';
import { GoogleRecaptchaModule } from '@nestlab/google-recaptcha';
import { getGoogleRecaptchaConfig } from './config/google-recaptcha.config';
import { path } from 'app-root-path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { PrismaModule } from './prisma/prisma.module';
import { CartModule } from './cart/cart.module';
import { PromoModule } from './promo/promo.module';
import { TransactionModule } from './transaction/transaction.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UserModule,
    CategoryModule,
    OrderModule,
    CartModule,
    PromoModule,
    TransactionModule,
    ProductModule,
    FileModule,
    PrismaModule,
    GoogleRecaptchaModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getGoogleRecaptchaConfig,
      inject: [ConfigService],
    }),
    ServeStaticModule.forRoot({
      rootPath: `${path}/uploads`,
      serveRoot: '/uploads',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
