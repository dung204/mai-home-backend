import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import {
  TransformationOptions,
  UploadApiErrorResponse,
  UploadApiResponse,
  v2 as cloudinary,
} from 'cloudinary';
import { Readable } from 'stream';

import { DeleteMediaDto, GetMediaDto } from '@/modules/media/dtos';

@Injectable()
export class MediaService {
  async uploadFile(files: Express.Multer.File[], folder?: string) {
    const result = await Promise.allSettled(
      files.map(async (file) => {
        let transformation: TransformationOptions;

        switch (file.mimetype.split('/')[0]) {
          case 'image':
            transformation = { quality: 'auto', fetch_format: 'webp' };
            break;
          case 'video':
          case 'audio':
          default:
            transformation = { quality: 'auto' };
            break;
        }

        const [uploadResult, error] = await new Promise<
          [UploadApiResponse | null, UploadApiErrorResponse | null]
        >((resolve) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { transformation, resource_type: 'auto', folder },
            (error?: UploadApiErrorResponse, result?: UploadApiResponse) => {
              if (error) resolve([null, error]);
              resolve([result!, null]);
            },
          );

          Readable.from(file.buffer).pipe(uploadStream);
        });

        if (error !== null) {
          throw new HttpException(error.message, error.http_code);
        }

        return {
          originalName: file.originalname,
          name: uploadResult!.public_id,
          url: uploadResult!.secure_url,
        };
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

  async uploadFromUrl(url: string, folder?: string) {
    try {
      const result = await cloudinary.uploader.upload(url, {
        folder,
        resource_type: 'auto',
        transformation: {
          quality: 'auto',
          fetch_format: 'webp',
          width: 300,
          height: 300,
        },
      });
      return result;
    } catch (error: any) {
      throw new HttpException(error.message, error.http_code);
    }
  }

  async deleteFile({ name, folder }: DeleteMediaDto) {
    const fileName = !folder ? name : `${folder}/${name}`;

    const result = await cloudinary.api.delete_resources([!folder ? name : `${folder}/${name}`], {
      type: 'upload',
    });

    if (result.deleted_counts[fileName].original === 0) {
      throw new NotFoundException('Media is not found.');
    }
  }

  /**
   * Checks whether file has already existed in Cloudinary
   */
  async checkFileExists({ name, folder }: GetMediaDto) {
    const fileName = !folder ? name : `${folder}/${name}`;

    try {
      await cloudinary.api.resource(fileName);
    } catch (errRes: any) {
      const { error } = errRes;
      throw new HttpException(error.message, error.http_code);
    }

    return true;
  }
}
