import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { MongooseModule } from '@nestjs/mongoose';
import { UploadService } from './file-sharing.service';
import { FileSchema,File } from './schema/file-sharing.schema';
import { FileController } from './file-sharing.controller';
import * as multer from 'multer';

@Module({
  imports:[
    MulterModule.register({
      storage: multer.memoryStorage(), // ✅ Needed for file.buffer
    }),
    MongooseModule.forFeature([{ name: File.name, schema: FileSchema }]),
    ],
  controllers: [FileController],
  providers: [UploadService],
})
export class FileSharingModule {}
