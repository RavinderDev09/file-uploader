import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { User, UserDocument } from './schema/user.schema';
import { CreateUserDto, LoginUserDto, SignupCompleteDto, UpdateUserDto } from './dto/user.dto';
import { Model, ObjectId, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { resourceLimits } from 'worker_threads';
import { EmailService } from 'src/email-service/email-service.service';
import { SignupOtpDto, VerifyOtpDto } from './dto/auth.dto';
import { USERVERIFIEDSTATUS } from './comman/comman';


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
        // if (userEmailOrPhone) {
        //   throw new InternalServerErrorException('Email already taken.');
        // }
        // const userExists = await this.userModel.findOne({
        //   name: data.name,
        // });
        // if (userExists) {
        //   throw new InternalServerErrorException('Username already taken.');
        // }
        const { password, confirmPassword } = data;
        if (password !== confirmPassword) {
          throw new InternalServerErrorException('Passwords do not match');
        }
    
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await this.userModel.findOneAndUpdate({
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
          userId:user.id
        };
      }



      //forgot and reset password methods
      async forgotPassword(email: string): Promise<string> {
        const user = await this.userModel.findOne({ email:email });
        console.log('email', user);
        
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


      //
      async signupOtp(signupDto: SignupOtpDto) {
        const user = await this.userModel.findOne({ email: signupDto.email });
        console.log('user', user);
        
        if (user && user.isVerified ===USERVERIFIEDSTATUS.compelete) {
          throw new BadRequestException('Email already verified.');
        }
      
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
        console.log('opt', otpExpires,otp);
        
      
        if (user) {
          await this.userModel.findOneAndUpdate(
            { email: signupDto.email },
            { otp, otpExpires },
            { new: true }
          );
        } else {
          await this.userModel.create({
            email: signupDto.email,
            otp,
            otpExpires,
            isVerified: false,
          });
        }
      
        // await this.mailService.sendOtp(signupDto.email, otp);
        return { message: 'OTP sent to email' };
      }
      
    
      async verifyOtp(dto: VerifyOtpDto) {
        console.log('verify Otp', dto);
        
        // Ensure email is provided and user exists
        const user = await this.userModel.findOne({ email: dto.email });
        if (!user || user.otp !== dto.otp || user.otpExpires < new Date()) {
          throw new UnauthorizedException('Invalid or expired OTP');
        }
      
        // If OTP is valid, mark the user as verified and clear OTP fields
        await this.userModel.findOneAndUpdate({ email: dto.email }, {
          otp: null,        // Clear OTP after successful verification
          otpExpires: null, // Clear OTP expiration
          isVerified: true, // Mark user as verified
        });
      
        return { message: 'Email verified successfully' };
      }
      

      async signupComplete(data: SignupCompleteDto): Promise<any> {
        const { email, name, password, age, mobileNumber } = data;
    
        // Find user by email (after OTP verification)
        const user = await this.userModel.findOne({ email });
    
        if (!user) {
          throw new InternalServerErrorException('User not found');
        }
    
        // Check if user is already verified
        if (user.isVerified== USERVERIFIEDSTATUS.compelete) {
          throw new InternalServerErrorException('User is already verified');
        }
    
        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);
    
        // Update the user’s record
        user.name = name;
        user.password = hashedPassword;
        user.age= age;
        user.mobileNumber = mobileNumber;
        user.isVerified = USERVERIFIEDSTATUS.compelete; // Mark user as verified after completing signup
    
        // Save updated user
        await user.save();
    
        return { message: 'Signup completed successfully. You can now login.' };
      }

      // users.service.ts
      async updateProfile(userId: string, filePath: string) {
        // Find and update or create new profile
        return this.userModel.findOneAndUpdate({ userId }, // Filter by userId
          { 
            $set: { 
              profilePicture: filePath 
            } 
          },
          { 
            new: true,
            upsert: true, // Create if doesn't exist
            strict: false // Temporarily disable strict mode if needed
          }
        ).exec();
      }


      async userFind(userId: string): Promise<User> {
        return this.userModel.findOne({id:userId}).exec();
      }

      async updateUser(data:UpdateUserDto):Promise<User>{
        // const result = await this.userModel.findOneAndUpdate({_id:data.id }, {$set:{name:data.name, bio:data.bio, age:data.age, mobileNumber:data.mobileNumber}}, {new:true}).exec()
        const result = await this.userModel.findOneAndUpdate({_id:data.id }, {$set:{...data}}, {new:true}).exec()
        return result
      }
  

      //.profile 
      async createProfile(fileId,user): Promise<any> {
        return this.userModel.findOneAndUpdate(
          { _id: user.sub },                        
          { $set: { profilePictureId: fileId } },       
          { new: true }).exec();

        }
      
}


