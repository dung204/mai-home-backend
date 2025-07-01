import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';

import { Public } from '@/modules/auth/decorators/public.decorator';

import { MinioStorageService } from './minio-storage.service';

@Controller('minio')
export class MinioStorageController {
  constructor(private readonly minioStorageService: MinioStorageService) {}

  @Public()
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload file to MinIO' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('fixed') fixed: boolean = false,
  ) {
    return this.minioStorageService.uploadFile(file, fixed);
  }

  @Public()
  @Get('file/:fileName')
  @ApiOperation({ summary: 'Get file URL from MinIO' })
  @ApiParam({ name: 'fileName', description: 'File name in MinIO' })
  @ApiQuery({
    name: 'fixed',
    required: false,
    type: Boolean,
    description: 'Get fixed URL',
  })
  async getFileUrl(@Param('fileName') fileName: string, @Query('fixed') fixed: boolean = false) {
    const url = await this.minioStorageService.getFileUrl(fileName, fixed);
    return { url, fileName };
  }

  @Public()
  @Delete('file/:fileName')
  @ApiOperation({ summary: 'Delete file from MinIO' })
  @ApiParam({ name: 'fileName', description: 'File name in MinIO' })
  async deleteFile(@Param('fileName') fileName: string) {
    await this.minioStorageService.deleteFile(fileName);
    return {
      success: true,
      message: 'File deleted successfully',
    };
  }

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Check MinIO health' })
  async checkHealth() {
    try {
      await this.minioStorageService.checkConnection();
      return {
        success: true,
        message: 'MinIO is healthy',
      };
    } catch (error: any) {
      return {
        success: false,
        message: `MinIO health check failed: ${error.message}`,
      };
    }
  }
}
