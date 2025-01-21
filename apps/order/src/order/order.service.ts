import { USER_SERVICE } from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @Inject(USER_SERVICE)
    private readonly userService: ClientProxy,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto, token: string) {
    // 1. 사용자 정보 가져오기

    await this.getUserFromToken(token);
    // 2. 상품 정보 가져오기
    // 3. 총 금액 계산하기
    // 4. 금액 검증 -프론트에서  보낸 값과 비교
    // 5. 주문 생성 - 주문 DB
    // 6. 결제 시도
    // 7. 주문 상태 업데이트
    // 8. 결과 반환
  }

  async getUserFromToken(token: string) {
    try {
      const response = await lastValueFrom(
        this.userService.send({ cmd: 'parse_bearer_token' }, { token }),
      );

      console.log('----------------------- ');
      console.log('response : ', response);
    } catch (e) {
      console.error(e);
    }
  }
}
