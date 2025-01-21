import { Prop, Schema } from '@nestjs/mongoose';

export enum PaymentMethod {
  creditCard = 'CreditCard',
  kakao = 'Kakao',
}

@Schema({
  _id: false,
})
export class Payment extends Document {
  @Prop()
  paymentId: string;

  @Prop({
    enum: PaymentMethod,
    default: PaymentMethod.creditCard,
  })
  paymentMethod: PaymentMethod;

  @Prop({
    require: true,
  })
  // 결제 수단 이름 (--법인카드)
  paymentName: string;

  @Prop({
    require: true,
  })
  amount: number;
}
