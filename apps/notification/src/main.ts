import { NestFactory } from '@nestjs/core';
import { NotificationModule } from './notification/notification.module';

async function bootstrap() {
  const app = await NestFactory.create(NotificationModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
