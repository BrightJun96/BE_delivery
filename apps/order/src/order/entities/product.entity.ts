import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  _id: false,
})
export class Product {
  @Prop({
    require: true,
  })
  productId: string;

  @Prop({
    require: true,
  })
  name: string;

  @Prop({
    require: true,
  })
  price: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
