class AmountPayment {
  value: number;
  currency: string;
}

class PaymentMethod {
  type: string;
  id: string;
  saved: boolean;
  title: string;
  card: {
    first6: string;
    last4: string;
    brand: string;
    level: string;
    country: string;
    issuer: string;
  };
}

class ObjectPayment {
  id: string;
  status: string;
  amount: AmountPayment;
  payment_method: PaymentMethod;
  createdAt: string;
  expiresAt: string;
  description: string;
}

export class PaymentStatusDto {
  event:
    | 'payment.succeeded'
    | 'payment.waiting_for_capture'
    | 'payment.canceled'
    | 'refund.succeeded';
  type: string;
  object: ObjectPayment;
}
