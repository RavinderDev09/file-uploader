import {
  Controller,
  Post,
  Get,
  Param,
  Res,
  UploadedFile,
  UseInterceptors,
  Body,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { UploadService } from './file-sharing.service';

@Controller('api/files')
export class FileController {
  constructor(private readonly fileService: UploadService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('emailTo') emailTo: string,
  ) {
    return this.fileService.uploadFile(file, emailTo);
  }

  @Get('download/:uuid')
async download(@Param('uuid') uuid: string, @Res({ passthrough: false }) res: Response) {
  return this.fileService.downloadFile(uuid, res);
}

  @Delete(':uuid')
  @HttpCode(204)
  async deleteFile(@Param('uuid') uuid: string) {
    return this.fileService.deleteFile(uuid);
  }

  @Get('files')
  async listFiles() {
    return this.fileService.listAllFiles();
  }

  @Get('images')
async getAllImagePreviews() {
  return this.fileService.getAllImageFiles();
}
}
