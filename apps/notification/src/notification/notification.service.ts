import { ORDER_SERVICE, OrderMicroservice } from '@app/common';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SendPaymentNotificationDto } from './dto/send-payment-notification.dto';
import {
  Notification,
  NotificationStatus,
} from './entities/notification.entity';

@Injectable()
export class NotificationService implements OnModuleInit {
  orderService: OrderMicroservice.OrderServiceClient;

  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,

    @Inject(ORDER_SERVICE)
    private readonly orderMicroservice: ClientGrpc,
  ) {}

  onModuleInit() {
    this.orderService =
      this.orderMicroservice.getService<OrderMicroservice.OrderServiceClient>(
        'OrderService',
      );
  }

  async sendPaymentNotification(
    sendPaymentNotificationDto: SendPaymentNotificationDto,
  ) {
    const notification = await this.createNotification(
      sendPaymentNotificationDto.to,
    );

    await this.sendEmail();

    await this.updateNotificationStatus(
      notification._id.toString(),
      NotificationStatus.sent,
    );

    this.sendDeliveryStartedMessage(sendPaymentNotificationDto.orderId);
    return this.notificationModel.findById(notification._id);
  }
  async updateNotificationStatus(
    id: string,
    notificationStatus: NotificationStatus,
  ) {
    return this.notificationModel.findByIdAndUpdate(id, {
      status: notificationStatus,
    });
  }

  sendDeliveryStartedMessage(id: string) {
    this.orderService.deliveryStarted({ id });
  }
  async sendEmail() {
    await new Promise((res) => setTimeout(res, 1000));
  }

  async createNotification(to: string) {
    return this.notificationModel.create({
      from: 'jc@codefactory.ai',
      to: to,
      subject: '배송이 시작됐습니다!',
      content: `${to}님! 주문하신 물건이 배송이 시작됐습니다!`,
    });
  }
}
