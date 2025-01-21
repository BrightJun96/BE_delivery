import { PAYMENT_SERVICE, PRODUCT_SERVICE, USER_SERVICE } from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { lastValueFrom } from 'rxjs';
import { AddressDto } from './dto/address.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { PaymentDto } from './dto/payment.dto';
import { Customer } from './entities/customer.entity';
import { Order, OrderStatus } from './entities/order.entity';
import { Product } from './entities/product.entity';
import { PaymentCancelledException } from './exception/payment-cancelled.exception';
import { PaymentFailedException } from './exception/payment-failed.exception';

@Injectable()
export class OrderService {
  constructor(
    @Inject(USER_SERVICE)
    private readonly userService: ClientProxy,
    @Inject(PRODUCT_SERVICE)
    private readonly productService: ClientProxy,
    @Inject(PAYMENT_SERVICE)
    private readonly paymentService: ClientProxy,
    @InjectModel(Order.name)
    private readonly orderModel: Model<Order>,
  ) {}

  async createOrder(
    { productIds, payment, address }: CreateOrderDto,
    token: string,
  ) {
    // 1. 사용자 정보 가져오기

    const user = await this.getUserFromToken(token);

    // 2. 상품 정보 가져오기

    const products = await this.getProductsInfo(productIds);
    // 3. 총 금액 계산하기
    const totalAmount = this.calculateTotalAmount(products);

    // 4. 금액 검증 -프론트에서 보낸 값과 디비값 비교
    this.validatePaymentAmount(payment.amount, totalAmount);
    // 5. 주문 생성 - 주문 DB
    const customer = this.createCustomer(user);
    const order = await this.createNewOrder(
      customer,
      products,
      address,
      payment,
    );
    // 6. 결제 시도

    await this.processPayment(order._id.toString(), payment, user.email);

    // 7. 결과 반환
    return this.orderModel.findById(order._id);
  }

  async changeOrderStatus(orderId: string, status: OrderStatus) {
    return this.orderModel.findByIdAndUpdate(orderId, {
      status,
    });
  }

  private async processPayment(
    orderId: string,
    payment: PaymentDto,
    userEmail: string,
  ) {
    try {
      const paymentResponse = await lastValueFrom(
        this.paymentService.send(
          { cmd: 'make_payment' },
          { ...payment, userEmail, orderId },
        ),
      );

      console.log('paymentResponse:', paymentResponse);
      if (paymentResponse.status === 'error') {
        throw new PaymentFailedException(paymentResponse);
      }

      const isPaid = paymentResponse.data.paymentStatus === 'Approved';

      const orderStatus = isPaid
        ? OrderStatus.paymentProcessed
        : OrderStatus.paymentFailed;

      console.log('orderStatus:', orderStatus);
      if (orderStatus === OrderStatus.paymentFailed) {
        throw new PaymentFailedException(paymentResponse.error);
      }

      await this.orderModel.findByIdAndUpdate(orderId, {
        status: OrderStatus.paymentProcessed,
      });

      return paymentResponse;
    } catch (e) {
      if (e instanceof PaymentFailedException) {
        await this.orderModel.findByIdAndUpdate(orderId, {
          status: OrderStatus.paymentFailed,
        });
      }
      throw e;
    }
  }

  private validatePaymentAmount(clientAmount: number, serverAmount: number) {
    if (clientAmount !== serverAmount) {
      throw new PaymentCancelledException('결제금액이 일치하지 않습니다.');
    }
  }

  private calculateTotalAmount(products: Product[]) {
    return products.reduce((acc, next) => acc + next.price, 0);
  }

  // User SERVICE User entity => Order SERVICE Customer entity

  private async getProductsInfo(productIds: string[]): Promise<Product[]> {
    const productsResponse = await lastValueFrom(
      this.productService.send(
        {
          cmd: 'get_products_info',
        },
        {
          productIds,
        },
      ),
    );

    if (productsResponse === 'error') {
      throw new PaymentCancelledException(productsResponse);
    }

    // Product SERVICE Product entity => Order SERVICE Product entity
    return productsResponse.data.map((p) => ({
      productId: p.id,
      name: p.name,
      price: p.price,
    }));
  }

  private async getUserFromToken(token: string) {
    const tokenResponse = await lastValueFrom(
      this.userService.send({ cmd: 'parse_bearer_token' }, { token }),
    );

    if (tokenResponse.status === 'error') {
      throw new PaymentCancelledException(tokenResponse);
    }

    const userId = tokenResponse.data.sub;

    const userResponse = await lastValueFrom(
      this.userService.send({ cmd: 'get_user_info' }, { userId }),
    );

    if (userResponse === 'error') {
      throw new PaymentCancelledException(userResponse);
    }

    return userResponse.data;
  }

  private createCustomer({
    id,
    email,
    name,
  }: {
    id: string;
    email: string;
    name: string;
  }) {
    return {
      userId: id,
      email,
      name,
    };
  }

  private async createNewOrder(
    customer: Customer,
    products: Product[],
    deliveryAddress: AddressDto,
    payment: PaymentDto,
  ) {
    return await this.orderModel.create({
      customer,
      products,
      payment,
      deliveryAddress,
    });
  }
}
