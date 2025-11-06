import { IsEmail, IsString } from 'class-validator';

export class SignupUserDto {
  @IsString()
  username: string;
  @IsEmail()
  email: string;
}
