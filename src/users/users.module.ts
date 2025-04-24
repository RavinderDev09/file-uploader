import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';


@Module({
  imports:[
    MongooseModule.forFeature([{name:User.name, schema:UserSchema}]),
    PassportModule,
    JwtModule.register({
      secret: 'hello@1234',
      signOptions: { expiresIn: '1d' },
    }),

  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
