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
  UploadedFiles,
  Query,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { UploadService } from './file-sharing.service';

@Controller('api/files')
export class FileController {
  constructor(private readonly fileService: UploadService) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFile(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('emailTo') emailTo: string,
  ) {
    const results = [];
    for (const file of files) {
      const result = await this.fileService.uploadFile(file, emailTo);
      results.push(result);
    }
    return { message: 'Files uploaded', files: results };
  }

  @Get('download/:uuid')
async download(@Param('uuid') uuid: string, @Res({ passthrough: false }) res: Response) {
  return this.fileService.downloadFile(uuid, res);
}

@Get('view/:uuid')
async viewOrDownloadFile(
  @Param('uuid') uuid: string,
  @Query('download') download: string,
  @Res() res: Response,
): Promise<void> {
  return this.fileService.viewOrDownloadFile(uuid, download,res);
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


}
