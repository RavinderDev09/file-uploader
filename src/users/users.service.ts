import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { User, UserDocument } from './schema/user.schema';
import { CreateUserDto, LoginUserDto } from './dto/user.dto';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class UsersService {

    constructor(  @InjectModel(User.name)
    private readonly userModel: Model<User>,
// private readonly userModel: PaginateModel<User> &
//   SoftDeleteModel<UserDocument>,
  private readonly jwtService: JwtService

) {}

    async create(data: CreateUserDto): Promise<User> {
      console.log('dataCreateUser', data);
      
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
        console.log('loginData', loginUserDto);
        
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
        const payload = { email: user.email, sub: user._id };
        const accessToken = this.jwtService.sign(payload);
    
        // 4. Return token and user info (excluding password)
        const { password: _, ...userWithoutPassword } = user.toObject();
        console.log('userlogin');
        
        return {
          accessToken,
          user: userWithoutPassword,
        };
      }
    
}


