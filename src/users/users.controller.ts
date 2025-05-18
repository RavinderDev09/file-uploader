import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Post, Put, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, LoginUserDto, SignupCompleteDto, UpdateUserDto } from './dto/user.dto';
import { User } from './schema/user.schema';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { RequestWithUser } from './comman/comman';
import { SignupOtpDto, VerifyOtpDto } from './dto/auth.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { ObjectId, Types } from 'mongoose';
import { Response } from 'express';
import { GridFsService } from 'src/gridFS/gridFs.service';
import { log } from 'util';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService,
    private readonly jwtService:JwtService,
        private readonly gridFsService: GridFsService,
      ) {}

  // @Post('create')
  async create(@Body() createUserDto: CreateUserDto):Promise<User> {
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

  @Post('signup-complete')
  async signupComplete(@Body() signupCompleteDto: SignupCompleteDto) {
    return this.usersService.signupComplete(signupCompleteDto);
  }

  @Post('signup-otp')
  signup(@Body() signupDto: SignupOtpDto) {
    return this.usersService.signupOtp(signupDto);
  }
  
  @Post('verify-otp')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.usersService.verifyOtp(dto);
  }



@Put('update/:id')
async updateUser(@Body() data:UpdateUserDto):Promise<User>{
  console.log('dataa', data);
  const result =  await this.usersService.updateUser(data)  
  console.log('result ', result)
  return result;
  
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
  console.log('toke', token, newPassword);
  
  const result =  await this.usersService.resetPassword(token, newPassword)
 return { success: true, result }

}


@Get('profile')
 @UseGuards(AuthGuard('jwt')) 
// @UseGuards(JwtAuthGuard)
 async getProfile(@Req() req : RequestWithUser) {
    //@ts-ignore
   const userId = req.user.sub   
   const result = await this.usersService.userFind(userId);
      if (!result) {
     throw new NotFoundException('User not found');
   }
   return {
     success: true,
     result,
   };
 }


 @Get(':id')
async findOne(@Param() params):Promise<User>{ 
  const result = await this.usersService.userFind(params.id)
  return result
}



// profile -cn
@Post('profile-create')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('profilePicture'))
  async createProfile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: RequestWithUser
  ) {
    console.log('dto', file);
    console.log('req', req.user);
    const user = req.user
    
    if (!file) {
      throw new Error('No profile picture uploaded');
    }

    const { fileId } = await this.gridFsService.uploadFile(file);
    console.log('fielId',fileId);
  
    return this.usersService.createProfile(fileId,user);
  }

   @Get('picture-show/:id')
    async getProfilePicture(@Param('id') id: string, @Res() res: Response) {
      try {
        const objectId = new Types.ObjectId(id);
        const file = await this.gridFsService.findFileById(objectId);
        
        if (!file) {
          throw new NotFoundException('Profile picture not found');
        }
  
        const stream = this.gridFsService.getFileStream(objectId);
        res.setHeader('Content-Type', file.contentType);
        return stream.pipe(res);
      } catch (error) {
        throw new NotFoundException('Invalid or missing image');
      }
    }
    

 @Get('profile-image/:userId')
async getProfileImageByUser(@Param('userId') userId: string, @Res() res: Response) {
    const user = await this.usersService.userFind(userId);

  if (!user || !user.profilePictureId) {
    throw new NotFoundException('Profile image not found for this user');
  }

  const profileId = new Types.ObjectId(user.profilePictureId)
  const file = await this.gridFsService.findFileById(profileId);

  if (!file) {
    throw new NotFoundException('Image file not found in GridFS');
  }

  const stream = this.gridFsService.getFileStream(profileId);
  res.setHeader('Content-Type', file.contentType);
  return stream.pipe(res);
}
  
}
