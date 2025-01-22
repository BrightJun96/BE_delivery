import { UserPayloadDto } from '@app/common';
import {
  Body,
  Controller,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserPayload } from '../auth/decorator/user-payload.decorator';
import { TokenGuard } from '../auth/guard/token.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UsePipes(ValidationPipe)
  @UseGuards(TokenGuard)
  async createOrder(
    @UserPayload() userPayloadDto: UserPayloadDto,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.orderService.createOrder(createOrderDto, userPayloadDto);
  }
}
