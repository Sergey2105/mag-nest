import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { YookassaService } from 'src/lib/yookassa/yookassa.service';

import { OrderService } from '@/order/order.service';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { WebhookController } from './webhook/webhook.controller';
import { WebhookService } from './webhook/webhook.service';
import { PrismaService } from '@/prisma/prisma.service';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [TransactionController, WebhookController],
  providers: [
    PrismaService,
    YookassaService,
    TransactionService,
    WebhookService,
    OrderService,
  ],
})
export class TransactionModule {}
