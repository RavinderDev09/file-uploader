import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class VerifyOtpDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  otp: string;
}



export class SignupOtpDto {
  @IsEmail()
  email: string;
}
