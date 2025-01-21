import { NOTIFICATION_SERVICE } from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { MakePaymentDto } from './dto/make-payment.dto';
import { Payment, PaymentStatus } from './entities/payment.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @Inject(NOTIFICATION_SERVICE)
    private readonly notificationService: ClientProxy,
  ) {}

  async makePayment(makePaymentDto: MakePaymentDto) {
    let paymentId: string;
    try {
      const result = await this.paymentRepository.save(makePaymentDto);

      paymentId = result.id;
      await this.processPayment();

      await this.updatePaymentStatus(paymentId, PaymentStatus.approved);

      // 결제 성공 알림
      this.sendNotification(makePaymentDto.orderId, makePaymentDto.userEmail);

      return this.paymentRepository.findOneBy({ id: paymentId });
    } catch (e) {
      if (paymentId)
        await this.updatePaymentStatus(paymentId, PaymentStatus.rejected);
    }
  }

  async processPayment() {
    new Promise((res) => setTimeout(res, 1000));
  }

  async updatePaymentStatus(id: string, status: PaymentStatus) {
    await this.paymentRepository.update(id, {
      paymentStatus: status,
    });
  }

  async sendNotification(orderId: string, to: string) {
    const response = await lastValueFrom(
      this.notificationService.send(
        {
          cmd: 'send_payment_notification',
        },
        {
          to,
          orderId,
        },
      ),
    );
  }
}
