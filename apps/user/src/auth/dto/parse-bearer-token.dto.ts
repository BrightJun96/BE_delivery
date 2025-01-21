import { IsNotEmpty, IsString } from 'class-validator';

export class ParseBearerToken {
  @IsString()
  @IsNotEmpty()
  token: string;
}
