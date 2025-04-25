import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { User, UserDocument } from './schema/user.schema';
import { CreateUserDto, LoginUserDto } from './dto/user.dto';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { resourceLimits } from 'worker_threads';
import { EmailService } from 'src/email-service/email-service.service';


@Injectable()
export class UsersService {

    constructor(  @InjectModel(User.name)
    private readonly userModel: Model<User>,
// private readonly userModel: PaginateModel<User> &
//   SoftDeleteModel<UserDocument>,
  private readonly jwtService: JwtService,
  private readonly mailService:EmailService,
) {}

    async create(data: CreateUserDto): Promise<User> {
        const userEmailOrPhone = await this.userModel.findOne({
          email:data.email,
        });
        if (userEmailOrPhone) {
          throw new InternalServerErrorException('Email already taken.');
        }
        const userExists = await this.userModel.findOne({
          name: data.name,
        });
        if (userExists) {
          throw new InternalServerErrorException('Username already taken.');
        }
        const { password, confirmPassword } = data;
        if (password !== confirmPassword) {
          throw new InternalServerErrorException('Passwords do not match');
        }
    
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await this.userModel.create({
          ...data,
          password: hashedPassword,
          confirmPassword: hashedPassword,
          role:'user',
          createdBy: new Types.ObjectId(),
          updatedBy: new Types.ObjectId(),
        //   status: BaseStatus.active,
        //   role: 'user',
        });
        if (!result) {
          throw new InternalServerErrorException("user not created");
        }
        return result;
      }


//login method
      async login(loginUserDto: LoginUserDto) {
        const { email, password } = loginUserDto;
    
        // 1. Check if user exists
        const user = await this.userModel.findOne({ email });
        if (!user) {
          throw new Error('Invalid email or password');
        }
    
        // 2. Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          throw new Error('Invalid email or password');
        }
    
        // 3. Generate JWT payload
        const payload = { username: user.name, sub: user._id, role: user.role };
        const accessToken = this.jwtService.sign(payload);
        // 4. Return token and user info (excluding password)
        const { password: _, ...userWithoutPassword } = user.toObject();       
        return {
          accessToken,
          user: userWithoutPassword,
        };
      }



      //forgot and reset password methods
      async forgotPassword(email: string): Promise<string> {
        const user = await this.userModel.findOne({ email });
        if (!user) throw new NotFoundException('User not found');
    
        const token = crypto.randomBytes(32).toString('hex');
        const expiry = new Date(Date.now() + 3600000); // 1 hour
    
        user.resetToken = token;
        user.resetTokenExpiry = expiry;
        await user.save();
    
        const resetLink = `http://localhost:3002/reset-password.html?token=${token}`;
        await this.mailService.sendResetPasswordEmail(user.email, resetLink);
    
        return 'Password reset link has been sent to your email';
      }
    
      //reset password
      async resetPassword(token: string, newPassword: string): Promise<string> {     
        const user = await this.userModel.findOne({
          resetToken: token,
          resetTokenExpiry: { $gt: new Date() },
        });

        if (!user) throw new BadRequestException('Invalid or expired token');
    
        const hashed = await bcrypt.hash(newPassword, 10);
        user.password = hashed;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();
    
        return 'Password reset successful';
      }
    

async findUserById(userId:string){
  const resut = await this.userModel.findOne({_id: new Types.ObjectId(userId)}) 
  return resut
}

}


