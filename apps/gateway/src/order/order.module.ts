import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { BearerTokenMiddleware } from '../auth/middleware/bearer-token.middleware';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(BearerTokenMiddleware).forRoutes('* ');
  }
}
