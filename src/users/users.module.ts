import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { EmailServiceModule } from 'src/email-service/email.module';
import { EmailService } from 'src/email-service/email-service.service';


@Module({
  imports:[
    EmailServiceModule,
    MongooseModule.forFeature([{name:User.name, schema:UserSchema}]),
    PassportModule,
    JwtModule.register({
      secret: 'hello',
      signOptions: { expiresIn: '1d' },
    }),

  ],
  controllers: [UsersController],
  providers: [UsersService,EmailService],
})

export class UsersModule {}
