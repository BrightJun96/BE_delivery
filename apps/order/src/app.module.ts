import { PAYMENT_SERVICE, PRODUCT_SERVICE, USER_SERVICE } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import * as Joi from 'joi';
import { OrderModule } from './order/order.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        HTTP_PORT: Joi.number().required(),
        USER_HOST: Joi.string().required(),
        USER_TCP_PORT: Joi.number().required(),
        PRODUCT_HOST: Joi.string().required(),
        PRODUCT_TCP_PORT: Joi.number().required(),
        PAYMENT_HOST: Joi.string().required(),
        PAYMENT_TCP_PORT: Joi.number().required(),
        DB_URL: Joi.string().required(),
      }),
    }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow('DB_URL'),
      }),
      inject: [ConfigService],
    }),
    ClientsModule.registerAsync({
      // USER SERVICE
      clients: [
        {
          name: USER_SERVICE,
          useFactory: (configService: ConfigService) => ({
            transport: Transport.REDIS,
            options: {
              host: 'redis',
              port: 6379,
            },
          }),
          inject: [ConfigService],
        },
        // PRODUCT SERVICE
        {
          name: PRODUCT_SERVICE,
          useFactory: (configService: ConfigService) => ({
            transport: Transport.REDIS,
            options: {
              host: 'redis',
              port: 6379,
            },
          }),
          inject: [ConfigService],
        },
        // PAYMENT SERVICE
        {
          name: PAYMENT_SERVICE,
          useFactory: (configService: ConfigService) => ({
            transport: Transport.REDIS,
            options: {
              host: 'redis',
              port: 6379,
            },
          }),
          inject: [ConfigService],
        },
      ],
      isGlobal: true,
    }),
    OrderModule,
  ],
})
export class AppModule {}
