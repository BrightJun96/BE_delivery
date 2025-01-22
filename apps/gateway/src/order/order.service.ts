import { ORDER_SERVICE, UserPayloadDto } from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @Inject(ORDER_SERVICE)
    private readonly orderMicroService: ClientProxy,
  ) {}

  createOrder(createOrderDto: CreateOrderDto, userPayloadDto: UserPayloadDto) {
    return lastValueFrom(
      this.orderMicroService.send(
        {
          cmd: 'create_order_api',
        },
        {
          ...createOrderDto,
          meta: {
            user: userPayloadDto,
          },
        },
      ),
    );
  }
}
