import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { MediaController } from '@/modules/media/controllers';
import { MediaService } from '@/modules/media/services';

import { MinioStorageModule } from '../minio-storage/minio-storage.module';

@Module({
  imports: [MinioStorageModule, HttpModule],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
