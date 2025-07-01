import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { ApiSuccessResponse } from '@/base/decorators';
import { CustomUploadedFiles } from '@/modules/media/decorators';
import { UploadFromUrlDto, UploadQueryDto, UploadSuccessDto } from '@/modules/media/dtos';
import { MediaService } from '@/modules/media/services';
import { MinioStorageService } from '@/modules/minio-storage/minio-storage.service';

@Controller('media')
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly minioStorageService: MinioStorageService,
  ) {}

  @ApiOperation({
    summary: 'Upload media files to Cloudinary',
    description:
      'By default, the uploaded images are in `webp` format, and uploaded videos are in `webm` format. However, they can be retrieved with different file format using Cloudinary API.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['files'],
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiSuccessResponse({
    description: 'Media is uploaded successfully',
    schema: UploadSuccessDto,
    status: HttpStatus.CREATED,
    isArray: false,
  })
  @ApiBadRequestResponse({
    description:
      'Bad Request due to one of the following reasons:\n- File type is neither `image/*` nor `video/*` nor `audio/*`\n- Image file size is larger than 10MB\n- Audio/Video file size is larger than 100MB\n- File is missing',
  })
  @UseInterceptors(FilesInterceptor('files'))
  @Post('upload')
  uploadFile(
    @CustomUploadedFiles() files: Express.Multer.File[],
    @Query() uploadQueryDto: UploadQueryDto,
  ) {
    return this.mediaService.uploadFile(files, uploadQueryDto.folder);
  }

  @ApiOperation({
    summary: 'Upload media files from URL',
    description:
      'By default, the uploaded images are in `webp` format, and uploaded videos are in `webm` format. However, they can be retrieved with different file format using Cloudinary API.',
  })
  @Post('/upload/url')
  async uploadFileFromUrl(@Body() uploadFromUrlDto: UploadFromUrlDto) {
    return this.mediaService.uploadFromUrl(
      uploadFromUrlDto.url,
      uploadFromUrlDto.fixed,
      uploadFromUrlDto.folder,
    );
  }

  @ApiOperation({
    summary: 'Delete media files',
  })
  @ApiNoContentResponse({
    description: 'Media is deleted successfully',
  })
  @ApiNotFoundResponse({
    description: 'Media is not found',
  })
  @Delete('delete/:fileName')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteFile(@Param('fileName') fileName: string) {
    return this.minioStorageService.deleteFile(fileName);
  }
}
