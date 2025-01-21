import { Prop, Schema } from '@nestjs/mongoose';
import { Customer } from './customer.entity';
import { DeliveryAddress } from './delivery-address.entity';
import { Payment } from './payment.entity';
import { Product } from './product.entity';

export enum OrderStatus {
  pending = 'Pending',
  paymentCancelled = 'PaymentCancelled',
  paymentFailed = 'PaymentFailed',
  paymentProcessed = 'PaymentProcessed',
  paymentStarted = 'DeliveryStarted',
  paymentDone = 'PaymentDone',
}

@Schema()
export class Order extends Document {
  @Prop({
    required: true,
  })
  customer: Customer;

  @Prop({
    required: true,
  })
  products: Product[];

  @Prop({
    required: true,
  })
  deliveryAddress: DeliveryAddress;

  @Prop({
    enum: OrderStatus,
    default: OrderStatus.pending,
  })
  status: OrderStatus;

  @Prop({
    required: true,
  })
  payment: Payment;
}
