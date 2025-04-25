import { IsEmail, IsString } from "class-validator";


export class CreateUserDto{
    @IsString()
    name:string
    @IsString()
    confirmPassword:string
    @IsString()
    password:string
    @IsEmail()
    email:string
}


// dto/login-user.dto.ts
import {  IsNotEmpty, MinLength } from 'class-validator';

export class LoginUserDto {
  @IsEmail()
   email: string;
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
