import { RpcInterceptor } from '@app/common';
import {
  Controller,
  Post,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { GetProductsInfo } from './dto/get-products-info.dto';
import { ProductService } from './product.service';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('sample')
  async createSamples() {
    return this.productService.createSamples();
  }

  @MessagePattern({
    cmd: 'get_products_info',
  })
  @UsePipes(ValidationPipe)
  @UseInterceptors(RpcInterceptor)
  async getProductsInfo(@Payload() getProductsInfo: GetProductsInfo) {
    return await this.productService.getProductsInfo(
      getProductsInfo.productIds,
    );
  }
}
