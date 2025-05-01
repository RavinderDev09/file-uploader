import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { MongooseModule } from '@nestjs/mongoose';
import { UploadService } from './file-sharing.service';
import { FileSchema,File } from './schema/file-sharing.schema';
import { FileController } from './file-sharing.controller';
import * as multer from 'multer';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports:[
    MulterModule.register({
      storage: multer.memoryStorage(), // ✅ Needed for file.buffer
    }),
    MongooseModule.forFeature([{ name: File.name, schema: FileSchema }]),UsersModule
    ],
  controllers: [FileController],
  providers: [UploadService,JwtAuthGuard, JwtService],
})
export class FileSharingModule {}
