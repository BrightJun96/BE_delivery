import { UserPayloadDto } from '@app/common';
import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

export const UserPayload = createParamDecorator<UserPayloadDto>(
  (data, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    const { user } = request;

    if (!user) {
      throw new InternalServerErrorException('TokenGuard를 붙혀주세요.');
    }
    return user;
  },
);
