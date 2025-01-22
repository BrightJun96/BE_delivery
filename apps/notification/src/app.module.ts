import { ORDER_SERVICE } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import * as Joi from 'joi';

import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        HTTP_PORT: Joi.number().required(),
        DB_URL: Joi.string().required(),
        ORDER_HOST: Joi.string().required(),
        ORDER_TCP_PORT: Joi.number().required(),
      }),
    }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow('DB_URL'),
      }),
      inject: [ConfigService],
    }),
    ClientsModule.registerAsync({
      clients: [
        // ORDER_SERVICE
        {
          name: ORDER_SERVICE,
          useFactory: (configService: ConfigService) => ({
            transport: Transport.RMQ,
            options: {
              urls: ['amqp://rabbitmq:5672'],
              queue: 'order_queue',
              queueOptions: {
                durable: false,
              },
            },
          }),
          inject: [ConfigService],
        },
      ],
      isGlobal: true,
    }),

    NotificationModule,
  ],
})
export class AppModule {}
