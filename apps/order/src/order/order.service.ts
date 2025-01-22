import {
  PAYMENT_SERVICE,
  PaymentMicroservice,
  PRODUCT_SERVICE,
  ProductMicroservice,
  USER_SERVICE,
  UserMicroservice,
} from '@app/common';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
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
export class OrderService implements OnModuleInit {
  userService: UserMicroservice.UserServiceClient;
  productService: ProductMicroservice.ProductServiceClient;
  paymentService: PaymentMicroservice.PaymentServiceClient;
  constructor(
    @Inject(USER_SERVICE)
    private readonly userMicroservice: ClientGrpc,
    @Inject(PRODUCT_SERVICE)
    private readonly productMicroservice: ClientGrpc,
    @Inject(PAYMENT_SERVICE)
    private readonly paymentMicroservice: ClientGrpc,
    @InjectModel(Order.name)
    private readonly orderModel: Model<Order>,
  ) {}

  onModuleInit() {
    this.userService =
      this.userMicroservice.getService<UserMicroservice.UserServiceClient>(
        'UserService',
      );

    this.productService =
      this.productMicroservice.getService<ProductMicroservice.ProductServiceClient>(
        'ProductService',
      );

    this.paymentService =
      this.paymentMicroservice.getService<PaymentMicroservice.PaymentServiceClient>(
        'PaymentService',
      );
  }
  async createOrder({ productIds, payment, address, meta }: CreateOrderDto) {
    // 1. 사용자 정보 가져오기

    const user = await this.getUserFromToken(meta.user.sub);

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
        this.paymentService.makePayment({ ...payment, userEmail, orderId }),
      );

      const isPaid = paymentResponse.paymentStatus === 'Approved';

      const orderStatus = isPaid
        ? OrderStatus.paymentProcessed
        : OrderStatus.paymentFailed;

      if (orderStatus === OrderStatus.paymentFailed) {
        throw new PaymentFailedException(paymentResponse);
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
      this.productService.getProductsInfo({
        productIds,
      }),
    );

    // Product SERVICE Product entity => Order SERVICE Product entity
    return productsResponse.products.map((p) => ({
      productId: p.id,
      name: p.name,
      price: p.price,
    }));
  }

  private async getUserFromToken(userId: string) {
    const userResponse = await lastValueFrom(
      this.userService.getUserInfo({ userId }),
    );

    return userResponse;
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
