import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: parseInt(process.env.TC_PORT) || 3001,
    },
  });

  await app.startAllMicroservices();
  // await app.listen(process.env.port ?? 3000);
}
bootstrap();
