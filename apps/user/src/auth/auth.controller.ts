import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { Authorization } from './decorator/authorization.decorator';
import { ParseBearerToken } from './dto/parse-bearer-token.dto';
import { RegisterUserDto } from './dto/register-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async registerUser(
    @Authorization() token: string,
    @Body() registerUserDto: RegisterUserDto,
  ) {
    if (token === null) {
      throw new UnauthorizedException('토큰을 입력해주세요.');
    }

    return await this.authService.register(token, registerUserDto);
  }

  @Post('login')
  @UsePipes(ValidationPipe)
  async login(@Authorization() token: string) {
    if (token === null) {
      throw new UnauthorizedException('토큰을 입력해주세요.');
    }

    return await this.authService.login(token);
  }

  @MessagePattern({
    cmd: 'parse_bearer_token',
  })
  @UsePipes(ValidationPipe)
  parseBearerToken(@Payload() parseBearerToken: ParseBearerToken) {
    return this.authService.parseBearerToken(parseBearerToken.token, false);
  }
}
