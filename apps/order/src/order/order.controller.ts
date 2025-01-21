import { Body, Controller, Post } from '@nestjs/common';
import { Authorization } from '../../../user/src/auth/decorator/authorization.decorator';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(
    @Authorization() token: string,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return await this.orderService.createOrder(createOrderDto, token);
  }
}
