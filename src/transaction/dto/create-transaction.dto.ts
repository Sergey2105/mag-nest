import { IsString } from 'class-validator';
import { ObjectPayment } from 'src/lib/yookassa/types/yookassa.types';

export class CreateTransactionDto {
  @IsString()
  orderId: string;

  @IsString()
  userId: string;

  payment: ObjectPayment;
}
