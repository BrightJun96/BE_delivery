import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  _id: false,
})
export class Customer {
  @Prop({
    require: true,
  })
  userId: string;

  @Prop({
    require: true,
  })
  email: string;

  @Prop({
    require: true,
  })
  name: string;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
