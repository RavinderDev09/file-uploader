import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  GoneException,
} from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import mongoose, { Model, Connection, Types } from 'mongoose';
import { File } from './schema/file-sharing.schema';
import * as moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { GridFSBucket, ObjectId, UUID } from 'mongodb';
import * as mime from 'mime-types'; import { response, Response } from 'express';
import path from 'path';
import { MIMEType } from 'util';

@Injectable()
export class UploadService {
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
  private readonly logger = new Logger(UploadService.name);

  constructor(
    @InjectModel(File.name) private readonly fileModel: Model<File>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  private get gridFSBucket(): GridFSBucket {
    return new GridFSBucket(this.connection.db, {
      bucketName: 'uploads',
    });
  }

  async uploadFile(file: Express.Multer.File, emailTo: string): Promise<any> {
    try {
      console.log('file');
      
      const mimeType = mime.lookup(file.originalname);
      if (!this.ALLOWED_FILE_TYPES.includes(mimeType)) {
        throw new BadRequestException('Invalid file type');
      }

      if (file.size > this.MAX_FILE_SIZE) {
        throw new BadRequestException('File size exceeds limit');
      }

      const fileUuid = uuidv4();
      const expiresAt = moment().add(24, 'hours').toDate();

      const uploadStream = this.gridFSBucket.openUploadStream(file.originalname, {
        contentType: file.mimetype,
      });

      uploadStream.end(file.buffer);

      const newFile = new this.fileModel({
        uuid:fileUuid,
        originalName: file.originalname,
        filename: uploadStream.id.toString(),
        size: file.size,
        contentType: file.mimetype, // 👈 set contentType here
        expiresAt: expiresAt,
        emailTo,
        // emailFrom,
      });
      await newFile.save();
         console.log('saved file', `http://localhost:5000/api/files/download ${fileUuid}`);
         
         return {
          message: 'File uploaded successfully',
          downloadUrl: `/api/files/download/${fileUuid}`,
          fileUuid,
          fileName: file.originalname,   // ADD THIS
          fileSize: file.size,           // ADD THIS
        };
    } catch (error) {
      this.logger.error('Upload error', error.stack);
      throw new InternalServerErrorException('Upload failed');
    }
  }

  async getFileByUuid(uuid: string): Promise<File> {
    const file = await this.fileModel.findOne({ uuid });
    if (!file) throw new BadRequestException('File not found');
    return file;
  }


//   async downloadFile(uuid: string, res: Response): Promise<void> {
//     try {
//       const fileDoc = await this.fileModel.findOne({ uuid });
  
//       if (!fileDoc) {
//         throw new NotFoundException('File not found');
//       }
  
//       // Check expiry
//       const now = new Date();
//       if (fileDoc.expiresAt && fileDoc.expiresAt < now) {
//         throw new GoneException('Link has expired');
//       }
  
//       const fileObjectId = new mongoose.Types.ObjectId(fileDoc.filename); // stored ObjectId in filename
//       const downloadStream = this.gridFSBucket.openDownloadStream(fileObjectId);
  
//       // Set proper headers
//       res.set({
//         'Content-Type': fileDoc.contentType || 'application/octet-stream',
//         'Content-Disposition': `attachment; filename="${encodeURIComponent(fileDoc.originalName)}"`,
//         'Content-Length': fileDoc.size.toString(),
//       });
  
//       // Handle download stream
//       downloadStream
//         .on('error', (err) => {
//           console.error('Download stream error:', err);
//           if (!res.headersSent) {
//             res.status(500).send('Error downloading file');
//           }
//         })
//         .on('end', () => {
//           console.log('Download complete for:', fileDoc.originalName);
//         })        
//         .pipe(res); // 👈 Express response is a writable stream
// console.log('res',res);

//     } catch (err) {
//       console.error('Download error:', err);
//       if (!res.headersSent) {
//         res.status(500).send('Internal server error');
//       }
//     }
//   }


async downloadFile(uuid: string, res: Response): Promise<void> {
  try {
    const fileDoc = await this.fileModel.findOne({ uuid });

    if (!fileDoc) {
      throw new NotFoundException('File not found');
    }

    // Check expiry
    const now = new Date();
    if (fileDoc.expiresAt && fileDoc.expiresAt < now) {
      throw new GoneException('Link has expired');
    }

    const fileObjectId = new mongoose.Types.ObjectId(fileDoc.filename); // stored ObjectId in filename
    const downloadStream = this.gridFSBucket.openDownloadStream(fileObjectId);

    // Set proper headers
    res.set({
      'Content-Type': fileDoc.contentType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(fileDoc.originalName)}"`,
      'Content-Length': fileDoc.size.toString(),
    });

    // Handle download stream
    downloadStream
      .on('error', (err) => {
        console.error('Download stream error:', err);
        if (!res.headersSent) {
          res.status(500).send('Error downloading file');
        }
      })
      .on('end', () => {
        console.log('Download complete for:', fileDoc.originalName);
      })        
      .pipe(res); // 👈 Express response is a writable stream
      console.log('res',res.status);

  } catch (err) {
    console.error('Download error:', err);
    if (!res.headersSent) {
      res.status(500).send('Internal server error');
    }
  }
}




  async deleteFile(uuid: string): Promise<void> {
    const file = await this.getFileByUuid(uuid);
    const fileId = new Types.ObjectId(file.filename);

    await this.gridFSBucket.delete(fileId);
    await this.fileModel.deleteOne({ uuid });
  }

  async listAllFiles(): Promise<any[]> {
    const files = await this.fileModel.find();
    return files.map((file) => ({
      originalName: file.originalName,
      size: file.size,
      uuid: file.uuid,
      // createdAt: file.createdAt,
      downloadUrl: `/api/files/download/${file.uuid}`,
    }));
  }


  // file-sharing.service.ts
  async getAllImageFiles() {
    const files = await this.fileModel.find({
      mimetype: { $regex: '^image/' }
    });
  
    return files.map(file => ({
      name: file.originalName || file.filename,
      uuid: file.uuid,
      url: `/api/files/download/${file.uuid}`
    }));
  }

   getMimeType(filename) {
    const ext = path.extname(filename).toLowerCase();
    if (['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'].includes(ext)) return 'image/' + ext.slice(1);
    if (ext === '.pdf') return 'application/pdf';
    return 'application/octet-stream';
  }

}
