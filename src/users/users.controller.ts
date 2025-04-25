import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Post, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, LoginUserDto } from './dto/user.dto';
import { User } from './schema/user.schema';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { RequestHandler } from '@nestjs/common/interfaces';
import { RequestWithUser } from './comman/comman';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService,
    private readonly jwtService:JwtService
  ) {}

  @Post('create')
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
  

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    try {
      const result =  await this.usersService.login(loginUserDto);
      return result
      
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // user.controller.ts

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

  
}
