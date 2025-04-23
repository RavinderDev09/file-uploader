import { Module } from '@nestjs/common';
import { FileSharingModule } from './file-sharing/file-sharing.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';

@Module({
  imports: [FileSharingModule,
    ConfigModule.forRoot({ isGlobal: true }),  // Ensure env variables are loaded
        MongooseModule.forRoot("mongodb+srv://ravinder:ravi1234@cluster0.mcajp.mongodb.net"), UsersModule    ,  
  ],
})
export class AppModule {}
    