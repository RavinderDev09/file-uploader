import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';
import { Readable } from 'stream';

@Injectable()
export class GridFsService {
  private bucket: GridFSBucket;

  constructor(@InjectConnection() private readonly connection: Connection) {
    this.bucket = new GridFSBucket(this.connection.db, {
      bucketName: 'uploads',
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<{ fileId: ObjectId }> {
    try {
      const readableStream = Readable.from(file.buffer);
      const uploadStream = this.bucket.openUploadStream(file.originalname, {
        contentType: file.mimetype,
      });

      await new Promise<void>((resolve, reject) => {
        readableStream.pipe(uploadStream)
          .on('error', reject)
          .on('finish', () => resolve());
      });

      return { fileId: uploadStream.id as unknown as ObjectId }; // ✅ Fixed cast
    } catch (error) {
      throw new InternalServerErrorException('File upload failed');
    }
  }

  async findFileById(fileId: ObjectId) {
    const files = await this.bucket.find({ _id: fileId }).toArray();
    return files[0];
  }

  getFileStream(fileId: ObjectId) {
    return this.bucket.openDownloadStream(fileId);
  }

  async deleteFile(fileId: ObjectId) {
    try {
      await this.bucket.delete(fileId);
    } catch (err) {
      throw new InternalServerErrorException('Failed to delete file');
    }
  }
}
