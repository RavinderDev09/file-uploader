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
  

  constructor(
    @InjectModel(File.name) private readonly fileModel: Model<File>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  private get gridFSBucket(): GridFSBucket {
    return new GridFSBucket(this.connection.db, {
      bucketName: 'uploads',
    });
  }

  
  async getFileByUuid(uuid: string): Promise<File> {
    const file = await this.fileModel.findOne({ uuid });
    if (!file) throw new BadRequestException('File not found');
    return file;
  }


  async uploadFile(file: Express.Multer.File, email:string): Promise<any> {
    console.log('email', email);
    
    return new Promise((resolve, reject) => {
      const { originalname, mimetype, buffer }= file;
      const uuid = uuidv4();
  
      const uploadStream = this.gridFSBucket.openUploadStream(originalname, {
        metadata: { uuid, mimetype },
        contentType: mimetype
      });
  
      uploadStream.end(buffer); // Stream ends and data written
  
      uploadStream.on('finish', async () => {
        console.log('abc');
        
        const savedFile = await this.fileModel.create({
          uuid,
          originalName: originalname,
          filename: uploadStream.id, // ✅ Use this
          size: buffer.length,
          contentType: mimetype,
        });
  
        resolve({ message: 'File uploaded', uuid });
      });
  
      uploadStream.on('error', (err) => {
        console.error('Upload error:', err);
        reject(err);
      });
    });
  }


  

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
      res.setHeader('Content-Disposition', 'inline');
      res.set({
        'Content-Type': fileDoc.contentType || 'application/octet-stream',
        // 'Content-Disposition':'inline',
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

    } catch (err) {
      console.error('Download error:', err);
      if (!res.headersSent) {
        res.status(500).send('Internal server error');
      }
    }
  }



async viewOrDownloadFile( uuid: string, download: string, res: Response,): Promise<void> {
  try {
    const fileDoc = await this.fileModel.findOne({ uuid });
    if (!fileDoc) throw new NotFoundException('File not found');

    if (fileDoc.expiresAt && fileDoc.expiresAt < new Date()) {
      throw new GoneException('Link has expired');
    }

    const fileObjectId = new mongoose.Types.ObjectId(fileDoc.filename);
    const downloadStream = this.gridFSBucket.openDownloadStream(fileObjectId);

    const contentType = fileDoc.contentType || 'application/octet-stream';
    const isDownload = download === 'true';

    res.setHeader('Content-Type', contentType);
    res.setHeader(
      'Content-Disposition',
      isDownload
        ? `attachment; filename="${encodeURIComponent(fileDoc.originalName)}"`
        : 'inline'
    );

    downloadStream
      .on('error', (err) => {
        console.error('File stream error:', err);
        if (!res.headersSent) res.status(500).send('Error streaming file');
      })
      .pipe(res);
  } catch (err) {
    console.error('View/Download error:', err);
    if (!res.headersSent) res.status(500).send('Internal Server Error');
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
      contentType:file.contentType  
    }));
  }


  

   getMimeType(filename) {
    const ext = path.extname(filename).toLowerCase();
    if (['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.pdf'
    ].includes(ext)) return 'image/' + ext.slice(1);
    if (ext === '.pdf') return 'application/pdf';
    return 'application/octet-stream';
  }

}
