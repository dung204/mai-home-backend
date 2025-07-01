import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import sharp from 'sharp';

import { MinioStorageService } from '@/modules/minio-storage/minio-storage.service';

@Injectable()
export class MediaService {
  constructor(
    private readonly minioStorageService: MinioStorageService,
    private readonly httpService: HttpService,
  ) {}

  async uploadFile(files: Express.Multer.File[], folder?: string) {
    const result = await Promise.allSettled(
      files.map(async (file) => {
        switch (file.mimetype.split('/')[0]) {
          case 'image':
            if (!file.mimetype.includes('webp')) {
              file.buffer = await sharp(file.buffer).webp().toBuffer();
              file.mimetype = 'image/webp';
              file.originalname = file.originalname.replaceAll(/\.(.*)/g, '.webp');
            }
            break;
          case 'video':
          case 'audio':
          default:
            break;
        }

        return this.minioStorageService.uploadFile(file, true, folder);
      }),
    );

    const data = result.flatMap((file) => (file.status === 'fulfilled' ? file.value : []));
    const successCount = result.filter((file) => file.status === 'fulfilled').length;
    const failedCount = result.length - successCount;

    return {
      data,
      metadata: {
        successCount,
        failedCount,
      },
    };
  }

  async uploadFromUrl(url: string, fixedTime?: boolean, folder?: string) {
    const res = await this.httpService.axiosRef.get<Buffer>(url, {
      responseType: 'arraybuffer',
    });

    let buffer = res.data;
    let contentType: string | undefined = res.headers['content-type'];
    const contentLength: number = res.headers['content-length'];
    let fileName: string = '';

    switch (contentType?.split('/')[0]) {
      case 'image':
        if (contentType.split('/')[1] !== 'webp') {
          buffer = await sharp(buffer).webp().toBuffer();
          contentType = 'image/webp';
          fileName = 'image.webp';
        }
        break;
      case 'video':
        fileName = `video.${contentType.split('/')[1]}`;
        break;
      case 'audio':
        fileName = `audio.${contentType.split('/')[1]}`;
        break;
      default:
        throw new BadRequestException('The Content-Type of URL is not supported.');
    }

    return this.minioStorageService.uploadFromBuffer(
      buffer,
      fileName,
      contentLength,
      contentType,
      fixedTime,
      folder,
    );
  }
}
