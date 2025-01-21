import { RpcInterceptor } from '@app/common';
import {
  Body,
  Controller,
  Post,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { Authorization } from '../../../user/src/auth/decorator/authorization.decorator';
import { CreateOrderDto } from './dto/create-order.dto';
import { DeliveryStartedDto } from './dto/delivery-started.dto';
import { OrderStatus } from './entities/order.entity';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UsePipes(ValidationPipe)
  async createOrder(
    @Authorization() token: string,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return await this.orderService.createOrder(createOrderDto, token);
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
