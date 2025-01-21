import { USER_SERVICE } from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_SERVICE)
    private readonly userMicroService: ClientProxy,
  ) {}

  register(token: string, registerUserDto: RegisterUserDto) {
    return lastValueFrom(
      this.userMicroService.send(
        {
          cmd: 'register',
        },
        {
          ...registerUserDto,
          token,
        },
      ),
    );
  }

  login(token: string) {
    return lastValueFrom(
      this.userMicroService.send(
        {
          cmd: 'login',
        },
        {
          token,
        },
      ),
    );
  }
}
