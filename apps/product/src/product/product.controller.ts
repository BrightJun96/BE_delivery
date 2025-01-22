import { ProductMicroservice } from '@app/common';
import { Controller } from '@nestjs/common';
import { ProductService } from './product.service';

@Controller('product')
export class ProductController
  implements ProductMicroservice.ProductServiceController
{
  constructor(private readonly productService: ProductService) {}

  async createSamples() {
    const resp = await this.productService.createSamples();

    return {
      success: resp,
    };
  }

  async getProductsInfo(
    getProductsInfo: ProductMicroservice.GetProductsInfoRequest,
  ) {
    const resp = await this.productService.getProductsInfo(
      getProductsInfo.productIds,
    );

    return {
      products: resp,
    };
  }
}
