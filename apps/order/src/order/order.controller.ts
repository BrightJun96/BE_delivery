import { OrderMicroservice } from '@app/common';
import { Controller } from '@nestjs/common';
import { OrderStatus } from './entities/order.entity';
import { PaymentMethod } from './entities/payment.entity';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController
  implements OrderMicroservice.OrderServiceController
{
  constructor(private readonly orderService: OrderService) {}

  async createOrder(createOrderDto: OrderMicroservice.CreateOrderRequest) {
    return await this.orderService.createOrder({
      ...createOrderDto,
      payment: {
        ...createOrderDto.payment,
        paymentMethod: createOrderDto.payment.paymentMethod as PaymentMethod,
      },
    });
  }

  async deliveryStarted(
    deliveryStartedDto: OrderMicroservice.DeliveryStartedRequest,
  ) {
    return await this.orderService.changeOrderStatus(
      deliveryStartedDto.id,
      OrderStatus.deliveryStarted,
    );
  }
}
