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
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { UploadService } from './file-sharing.service';
import { AuthGuard } from '@nestjs/passport';
import { RequestWithUser } from 'src/users/comman/comman';
import { JwtAuthGuard } from 'src/auth/auth.guard';

@Controller('api/files')
export class FileController {
  constructor(private readonly fileService: UploadService) {}

  @Post('upload')
  // @UseGuards(JwtAuthGuard)
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFile(
    @UploadedFiles() files: Express.Multer.File[], @Req() req: RequestWithUser
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded.');
    }
    const results = [];
    for (const file of files) {
      const userId = req.user.userId;
            const result = await this.fileService.uploadFile(file, userId);
      results.push(result);
    }
    return { message: 'Files uploaded', files: results };
  }

  @Get('download/:uuid')
  @UseGuards(JwtAuthGuard)
async download(@Param('uuid') uuid: string, @Res({ passthrough: false }) res: Response) {
  return this.fileService.downloadFile(uuid, res);
}

@Get('view/:uuid')
// @UseGuards(JwtAuthGuard)
async viewOrDownloadFile(
  @Param('uuid') uuid: string,
  @Query('download') download: string,
  @Res() res: Response,
): Promise<void> {  
  return this.fileService.viewOrDownloadFile(uuid, download,res);
}

@Delete('delete/:uuid')
@UseGuards(JwtAuthGuard)
@HttpCode(204)
async deleteFile(@Param('uuid') uuid: string) {
  return this.fileService.deleteFile(uuid);
}



@Get('files')
@UseGuards(AuthGuard('jwt'))
async getUserFiles(@Req() req: RequestWithUser) {
  const userId = req.user.userId;
  const role = req.user.role;
      if (role === 'admin') {
    // Admin => return all files
    return this.fileService.listAllFiles(); // No filter
  }
  // Regular user => return only their files
  return this.fileService.listAllFiles(userId); // Filter by userId
}




}
