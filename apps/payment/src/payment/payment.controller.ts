import { PaymentMicroservice } from '@app/common';

import { Controller } from '@nestjs/common';
import { PaymentMethod } from './entities/payment.entity';
import { PaymentService } from './payment.service';

@Controller()
@PaymentMicroservice.PaymentServiceControllerMethods()
export class PaymentController
  implements PaymentMicroservice.PaymentServiceController
{
  constructor(private readonly paymentService: PaymentService) {}

  async makePayment(makePaymentDto: PaymentMicroservice.MakePaymentRequest) {
    return this.paymentService.makePayment({
      ...makePaymentDto,
      paymentMethod: makePaymentDto.paymentMethod as PaymentMethod,
    });
  }
}
