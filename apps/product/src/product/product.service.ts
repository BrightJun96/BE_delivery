import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async createSamples() {
    const data = [
      {
        name: '사과',
        price: 3000,
        description: '씨없는 사과',
        stock: 100,
      },
      {
        name: '오렌지',
        price: 2000,
        description: '신 맛나는 오렌지',
        stock: 500,
      },
      {
        name: '메론',
        price: 5000,
        description: '껍질 없는 메론',
        stock: 100,
      },
      {
        name: '브로콜리',
        price: 5000,
        description: '마없음',
        stock: 100,
      },
      {
        name: '바나나',
        price: 1000,
        description: '마없음',
        stock: 100,
      },
    ];

    return await this.productRepository.save(data);
  }
}
