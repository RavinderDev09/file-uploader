  import { Module } from '@nestjs/common';
  import { FileSharingModule } from './file-sharing/file-sharing.module';
  import { MongooseModule } from '@nestjs/mongoose';
  import { ConfigModule, ConfigService } from '@nestjs/config';
  import { UsersModule } from './users/users.module';
  import { AuthModule } from './auth/auth.module';



  @Module({
    imports: [FileSharingModule,AuthModule,
      ConfigModule.forRoot({ isGlobal: true,   envFilePath: '.env' }),  // Ensure env variables are loaded
     
      MongooseModule.forRootAsync({
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => {
          return {
            // uri: configService.get<string>('MONGO_URI'),
            uri: process.env.MONGO_URI

          };
        },
        inject: [ConfigService],
      }), 
     ],
    providers: [],
  })
  export class AppModule {}
      