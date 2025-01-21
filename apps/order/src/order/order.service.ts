import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  async createOrder(createOrderDto: CreateOrderDto, token: string) {}
}
