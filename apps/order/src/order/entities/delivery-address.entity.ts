import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  _id: false,
})
export class DeliveryAddress {
  @Prop({
    require: true,
  })
  name: string;
  @Prop({
    require: true,
  })
  street: string;
  @Prop({
    require: true,
  })
  city: string;
  @Prop({
    require: true,
  })
  postalCode: string;
  @Prop({
    require: true,
  })
  country: string;
}

export const DeliveryAddressSchema =
  SchemaFactory.createForClass(DeliveryAddress);
