import { RpcInterceptor } from '@app/common';
import {
  Controller,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { CreateOrderDto } from './dto/create-order.dto';
import { DeliveryStartedDto } from './dto/delivery-started.dto';
import { OrderStatus } from './entities/order.entity';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @MessagePattern({
    cmd: 'create_order_api',
  })
  @UsePipes(ValidationPipe)
  @UseInterceptors(RpcInterceptor)
  async createOrder(@Payload() createOrderDto: CreateOrderDto) {
    return await this.orderService.createOrder(createOrderDto);
  }

  @EventPattern({
    cmd: 'delivery_started',
  })
  @UsePipes(ValidationPipe)
  @UseInterceptors(RpcInterceptor)
  async deliveryStarted(@Payload() deliveryStartedDto: DeliveryStartedDto) {
    return await this.orderService.changeOrderStatus(
      deliveryStartedDto.id,
      OrderStatus.deliveryStarted,
    );
  }
}
