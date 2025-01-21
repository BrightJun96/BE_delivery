import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MakePaymentDto } from './dto/make-payment.dto';
import { Payment, PaymentStatus } from './entities/payment.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async makePayment(makePaymentDto: MakePaymentDto) {
    let paymentId: string;
    try {
      const result = await this.paymentRepository.save(makePaymentDto);

      paymentId = result.id;
      await this.processPayment();

      await this.updatePaymentStatus(paymentId, PaymentStatus.approved);

      // 알림

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
}
