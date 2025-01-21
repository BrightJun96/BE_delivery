import { IsNotEmpty, IsString } from 'class-validator';

export class GetUserInfo {
  @IsString()
  @IsNotEmpty()
  userId: string;
}
