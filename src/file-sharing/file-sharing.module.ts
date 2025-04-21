import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { MongooseModule } from '@nestjs/mongoose';
import { UploadService } from './file-sharing.service';
import { FileSchema,File } from './schema/file-sharing.schema';
import { FileController } from './file-sharing.controller';

@Module({
  imports:[
    MulterModule.register({
      dest: './uploads',
    }),
    MongooseModule.forFeature([{ name: File.name, schema: FileSchema }]),
    ],
  controllers: [FileController],
  providers: [UploadService],
})
export class FileSharingModule {}
