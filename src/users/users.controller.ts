import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, LoginUserDto, SignupCompleteDto } from './dto/user.dto';
import { User } from './schema/user.schema';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { RequestHandler } from '@nestjs/common/interfaces';
import { RequestWithUser } from './comman/comman';
import { SignupOtpDto, VerifyOtpDto } from './dto/auth.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService,
    private readonly jwtService:JwtService
  ) {}

  // @Post('create')
  async create(@Body() createUserDto: CreateUserDto) {
    const result = await this.usersService.create(createUserDto);
    //@ts-ignore
    const accessToken = this.jwtService.sign({ userId: result._id });

   return {//@ts-ignore
      userId: result._id,
      email: result.email,
      name: result.name,
      accessToken,
    };
    
  }

  @Post('signup-otp')
  signup(@Body() signupDto: SignupOtpDto) {
    return this.usersService.signupOtp(signupDto);
  }
  
  @Post('verify-otp')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.usersService.verifyOtp(dto);
  }

  @Post('signup-complete')
  async signupComplete(@Body() signupCompleteDto: SignupCompleteDto) {
    return this.usersService.signupComplete(signupCompleteDto);
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    try {
      const result =  await this.usersService.login(loginUserDto);
      return result
      
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  
@Get('profile')
@UseGuards(AuthGuard('jwt'))
async getProfile(@Req() req : RequestWithUser) {
  const userId = req.user.userId
  const result = await this.usersService.findUserById(userId);
  if (!result) {
    throw new NotFoundException('User not found');
  }
  return {
    success: true,
    result,
  };
}


@Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    console.log('forgotpassworkReq');
    const message = await this.usersService.forgotPassword(email);
    return { message };
  }

  @Post('reset-password')
async resetPassword(
  @Body('token') token: string,
  @Query('newPassword') newPassword: string,
){
  const result =  await this.usersService.resetPassword(token, newPassword)
 return { success: true, result }

}
  
}
