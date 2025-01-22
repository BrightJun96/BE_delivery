import { NotificationMicroservice } from '@app/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.connectMicroservice({
    transport: Transport.GRPC,
    options: {
      package: NotificationMicroservice.protobufPackage,
      protoPath: join(process.cwd(), 'proto/notification.proto'),
      url: configService.getOrThrow('GRPC_URL'),
    },
  });

  await app.startAllMicroservices();
  // await app.listen(process.env.port ?? 3000);
}
bootstrap();
