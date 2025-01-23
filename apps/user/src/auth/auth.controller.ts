import { UserMicroservice } from '@app/common';
import { Controller, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
@UserMicroservice.AuthServiceControllerMethods()
export class AuthController implements UserMicroservice.AuthServiceController {
  constructor(private readonly authService: AuthService) {}

  parseBearerToken(parseBearerToken: UserMicroservice.ParseBearerTokenRequest) {
    return this.authService.parseBearerToken(parseBearerToken.token, false);
  }

  async registerUser(registerUserDto: UserMicroservice.RegisterUserRequest) {
    if (registerUserDto.token === null) {
      throw new UnauthorizedException('토큰을 입력해주세요.');
    }

    return await this.authService.register(
      registerUserDto.token,
      registerUserDto,
    );
  }

  async loginUser({ token }: UserMicroservice.LoginUserRequest) {
    if (token === null) {
      throw new UnauthorizedException('토큰을 입력해주세요.');
    }

    return await this.authService.login(token);
  }
}
