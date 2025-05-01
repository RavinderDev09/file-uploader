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
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { UploadService } from './file-sharing.service';
import { AuthGuard } from '@nestjs/passport';
import { RequestWithUser } from 'src/users/comman/comman';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import mongoose, { Types } from 'mongoose';
import { equals } from 'class-validator';

@Controller('api/files')
export class FileController {
  constructor(private readonly fileService: UploadService) {}

  @Post('upload')
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

//   @Get('public/:uuid')
// async download(@Param('uuid') uuid: string, @Query('downlaod') download:string, @Res({ passthrough: false }) res: Response) {
//   // const download = "false"
//   return this.fileService.viewOrDownloadFile(uuid,download, res);
// }


// @Get('view/:uuid')
// @UseGuards(AuthGuard('jwt'))
// async viewOrDownloadFile(
//   @Param('uuid') uuid: string,
//   @Query('download') download: string,
//   @Res() res: Response,
//   @Req() req
// ): Promise<any> {  
  // const userId = new mongoose.Types.ObjectId(req.user.userId); 
  // const uiFind = await this.fileService.getFileByUuid(uuid)
  // if(req.user.role === 'admin'){
  //   return this.fileService.viewOrDownloadFile(uuid, download, res);
  // } else if (req.user.role === 'user' && userId.equals(uiFind.userId)) {
  //   return this.fileService.viewOrDownloadFile(uuid, download, res);
  // }
  // else{
  //   throw new ForbiddenException('You are not allowed to delete this file')
  // }

// }

@Get('view/:uuid')
async viewOrDownloadFile(
  @Param('uuid') uuid: string,
  @Query('download') download: string,
  @Res() res: Response,
  @Req() req
): Promise<any> {  
    return this.fileService.viewOrDownloadFile(uuid, download, res);
}


@Delete('delete/:uuid')
@UseGuards(AuthGuard('jwt'))
@HttpCode(204)
async deleteFile(@Param('uuid') uuid: string, @Req() req) {
  const userId = new mongoose.Types.ObjectId(req.user.userId); // JWT se user ID milta hai
  const file = await this.fileService.getFileByUuid(uuid);

  if (req.user.role ==='admin') {
    console.log('admin');
    return this.fileService.deleteFile(uuid);
  }else if (req.user.role=== 'user'&& userId.equals(file.userId) ) {
    console.log('user');
    return this.fileService.deleteFile(uuid);
  }
  else{
    throw new ForbiddenException('You are not allowed to delete this file')
  }
 
}




@Get('files')
@UseGuards(AuthGuard('jwt'))
async getUserFiles(@Req() req: RequestWithUser) {
  const userId = req.user.userId;
  const role = req.user.role;    
  
      if (role === 'admin') {
    // Admin => return all files
    return await this.fileService.listAllFiles(); // No filter
    
  }
  // Regular user => return only their files
  return this.fileService.listAllFiles(userId); // Filter by userId
}




}
