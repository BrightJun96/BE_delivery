import { NotificationMicroservice } from '@app/common';
import { Controller } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller()
@NotificationMicroservice.NotificationServiceControllerMethods()
export class NotificationController
  implements NotificationMicroservice.NotificationServiceController
{
  constructor(private readonly notificationService: NotificationService) {}

  async sendPaymentNotification(
    sendPaymentNotificationDto: NotificationMicroservice.SendPaymentNotificationRequest,
  ) {
    return await this.notificationService.sendPaymentNotification(
      sendPaymentNotificationDto,
    );
  }
}
