import { USER_SERVICE, UserMicroservice } from '@app/common';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  authService: UserMicroservice.AuthServiceClient;

  constructor(
    @Inject(USER_SERVICE)
    private readonly userMicroService: ClientGrpc,
  ) {}

  onModuleInit() {
    this.authService =
      this.userMicroService.getService<UserMicroservice.AuthServiceClient>(
        'AuthService',
      );
  }
  register(token: string, registerUserDto: RegisterUserDto) {
    return lastValueFrom(
      this.authService.registerUser({
        ...registerUserDto,
        token,
      }),
    );
  }

  login(token: string) {
    return lastValueFrom(
      this.authService.loginUser({
        token,
      }),
    );
  }
}
