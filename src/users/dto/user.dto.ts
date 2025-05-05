import { IsEmail, IsNumber, IsOptional, IsString } from "class-validator";


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


export class SignupCompleteDto {
  @IsEmail()
  email: string;
  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: 'Name is required' })
  name: string;
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
  @IsNumber()
  @IsNotEmpty()
  mobileNumber:number
  @IsNumber()
  @IsNotEmpty()
  age:number
}


// // dto/create-profile.dto.ts
export class CreateProfileDto {
  name: string;
  email: string;
}


export class UpdateUserDto{
  id:string
  @IsString()
  name:string 
  @IsEmail()
  email:string
  @IsString()
  bio:string
  @IsNumber()
  mobileNumber:number
  @IsString()
  age:number
}